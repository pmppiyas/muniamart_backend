import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { AdminRole, AdminStatus, Prisma } from '@prisma/client';
import prisma from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../utils/appError';
import {
  ICreateAdmin,
  IUpdateAdmin,
  IAdminQuery,
  IAdminMetrics,
} from './admin.interface';

const ADMIN_SELECT_FIELDS = {
  id: true,
  name: true,
  email: true,
  photoUrl: true,
  role: true,
  status: true,
  permissions: true,
  createdAt: true,
  updatedAt: true,
};

const createAdmin = async (payload: ICreateAdmin) => {
  const normalizedEmail = payload.email.toLowerCase().trim();

  const isExistingAdmin = await prisma.admin.findUnique({
    where: { email: normalizedEmail },
  });

  if (isExistingAdmin) {
    throw new AppError(
      StatusCodes.CONFLICT,
      'An administrator with this email already exists'
    );
  }

  const isExistingCustomer = await prisma.customer.findUnique({
    where: { email: normalizedEmail },
  });

  if (isExistingCustomer) {
    throw new AppError(
      StatusCodes.CONFLICT,
      'A customer account already exists with this email address'
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(env.SALT_NUMBER || 8)
  );

  const newAdmin = await prisma.admin.create({
    data: {
      name: payload.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: payload.role || AdminRole.ADMIN,
      status: payload.status || AdminStatus.ACTIVE,
      permissions: payload.permissions || [],
    },
    select: ADMIN_SELECT_FIELDS,
  });

  return newAdmin;
};

const getAllAdmins = async (query: IAdminQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const whereConditions: Prisma.AdminWhereInput = {};

  if (query.searchTerm) {
    const search = query.searchTerm.trim();
    whereConditions.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (query.role) {
    whereConditions.role = query.role;
  }

  if (query.status) {
    whereConditions.status = query.status;
  }

  const [rawAdmins, totalCount, globalMetrics] = await Promise.all([
    prisma.admin.findMany({
      where: whereConditions,
      select: ADMIN_SELECT_FIELDS,
      orderBy: [
        { role: 'asc' },
        { createdAt: 'asc' },
      ],
    }),
    prisma.admin.count({ where: whereConditions }),
    prisma.admin.groupBy({
      by: ['role', 'status'],
      _count: {
        _all: true,
      },
    }),
  ]);

  // Ensure SUPER_ADMIN is strictly on top, and first Super Admin (earliest createdAt) is strictly #1
  const sortedAdmins = [...rawAdmins].sort((a, b) => {
    if (a.role === AdminRole.SUPER_ADMIN && b.role !== AdminRole.SUPER_ADMIN) return -1;
    if (a.role !== AdminRole.SUPER_ADMIN && b.role === AdminRole.SUPER_ADMIN) return 1;

    if (a.role === AdminRole.SUPER_ADMIN && b.role === AdminRole.SUPER_ADMIN) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const admins = sortedAdmins.slice(skip, skip + limit);

  let totalAdmins = 0;
  let superAdmins = 0;
  let regularAdmins = 0;
  let activeAdmins = 0;
  let inactiveAdmins = 0;

  for (const group of globalMetrics) {
    const count = group._count._all;
    totalAdmins += count;

    if (group.role === AdminRole.SUPER_ADMIN) {
      superAdmins += count;
    } else {
      regularAdmins += count;
    }

    if (group.status === AdminStatus.ACTIVE) {
      activeAdmins += count;
    } else {
      inactiveAdmins += count;
    }
  }

  const metrics: IAdminMetrics = {
    totalAdmins,
    superAdmins,
    regularAdmins,
    activeAdmins,
    inactiveAdmins,
  };

  const totalPage = Math.ceil(totalCount / limit);

  return {
    admins,
    metrics,
    meta: {
      page,
      limit,
      total: totalCount,
      totalPage,
    },
  };
};

const getSingleAdmin = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: { id },
    select: ADMIN_SELECT_FIELDS,
  });

  if (!admin) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Administrator not found');
  }

  return admin;
};

const updateAdmin = async (
  id: string,
  payload: IUpdateAdmin,
  currentUserId: string
) => {
  const existingAdmin = await prisma.admin.findUnique({
    where: { id },
  });

  if (!existingAdmin) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Administrator not found');
  }

  if (id === currentUserId) {
    if (payload.status === AdminStatus.INACTIVE) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'You cannot deactivate your own administrative account'
      );
    }

    if (
      payload.role === AdminRole.ADMIN &&
      existingAdmin.role === AdminRole.SUPER_ADMIN
    ) {
      const superAdminCount = await prisma.admin.count({
        where: {
          role: AdminRole.SUPER_ADMIN,
          status: AdminStatus.ACTIVE,
          id: { not: id },
        },
      });

      if (superAdminCount === 0) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          'Cannot demote yourself: system requires at least one active Super Admin'
        );
      }
    }
  }

  const updateData: Prisma.AdminUpdateInput = {};

  if (payload.name) {
    updateData.name = payload.name.trim();
  }

  if (payload.email) {
    const normalizedEmail = payload.email.toLowerCase().trim();
    if (normalizedEmail !== existingAdmin.email) {
      const emailTaken = await prisma.admin.findUnique({
        where: { email: normalizedEmail },
      });
      if (emailTaken) {
        throw new AppError(
          StatusCodes.CONFLICT,
          'An administrator with this email already exists'
        );
      }
      updateData.email = normalizedEmail;
    }
  }

  if (payload.password && payload.password.trim().length >= 6) {
    updateData.password = await bcrypt.hash(
      payload.password.trim(),
      Number(env.SALT_NUMBER || 8)
    );
  }

  if (payload.role) {
    updateData.role = payload.role;
  }

  if (payload.status) {
    updateData.status = payload.status;
  }

  if (payload.permissions !== undefined) {
    updateData.permissions = payload.permissions;
  }

  const updatedAdmin = await prisma.admin.update({
    where: { id },
    data: updateData,
    select: ADMIN_SELECT_FIELDS,
  });

  return updatedAdmin;
};

const deleteAdmin = async (id: string, currentUserId: string) => {
  const existingAdmin = await prisma.admin.findUnique({
    where: { id },
  });

  if (!existingAdmin) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Administrator not found');
  }

  if (id === currentUserId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'You cannot delete your own administrative account'
    );
  }

  // If deleting a SUPER_ADMIN, ensure another active SUPER_ADMIN remains
  if (existingAdmin.role === AdminRole.SUPER_ADMIN) {
    const remainingSuperAdmins = await prisma.admin.count({
      where: {
        role: AdminRole.SUPER_ADMIN,
        status: AdminStatus.ACTIVE,
        id: { not: id },
      },
    });

    if (remainingSuperAdmins === 0) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Cannot delete the last active Super Admin account'
      );
    }
  }

  const deleted = await prisma.admin.delete({
    where: { id },
    select: ADMIN_SELECT_FIELDS,
  });

  return deleted;
};

export const AdminServices = {
  createAdmin,
  getAllAdmins,
  getSingleAdmin,
  updateAdmin,
  deleteAdmin,
};
