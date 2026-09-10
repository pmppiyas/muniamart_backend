import bcrypt from 'bcrypt';
import { ISignUp } from './auth.interface';
import prisma from '../../config/prisma';
import { AdminRole, AdminStatus, CustomerStatus } from '@prisma/client';
import { env } from '../../config/env';

const signUp = async (payload: ISignUp) => {
  const isCustomerExist = await prisma.customer.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (isCustomerExist) {
    throw new Error('Customer already exists');
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(env.SALT_NUMBER)
  );

  const customer = await prisma.customer.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
      photoUrl: payload.photoUrl,
      status: CustomerStatus.ACTIVE,
      cart: {
        create: {},
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      photoUrl: true,
      status: true,
      createdAt: true,
    },
  });

  return customer;
};

export const adminSeed = async () => {
  try {
    const superAdminEmail = 'princemahmudpiyas@gmail.com';
    const existingSuperAdmin = await prisma.admin.findUnique({
      where: {
        email: superAdminEmail,
      },
    });

    if (existingSuperAdmin) {
      if (existingSuperAdmin.role !== AdminRole.SUPER_ADMIN) {
        await prisma.admin.update({
          where: { email: superAdminEmail },
          data: { role: AdminRole.SUPER_ADMIN, status: AdminStatus.ACTIVE },
        });
        console.log('✅ Updated princemahmudpiyas@gmail.com to SUPER_ADMIN');
      }
    } else {
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: superAdminEmail },
      });

      const superAdminPassword = existingCustomer?.password
        ? existingCustomer.password
        : await bcrypt.hash('12345678', Number(env.SALT_NUMBER || 8));

      await prisma.admin.create({
        data: {
          name: existingCustomer?.name || 'Prince Mahmud Piyas',
          email: superAdminEmail,
          password: superAdminPassword,
          role: AdminRole.SUPER_ADMIN,
          status: AdminStatus.ACTIVE,
        },
      });
      console.log('✅ Super Admin (princemahmudpiyas@gmail.com) seeded successfully');
    }

    if (env.SEED?.ADMIN_EMAIL && env.SEED?.ADMIN_PASS) {
      const existingAdmin = await prisma.admin.findUnique({
        where: {
          email: env.SEED.ADMIN_EMAIL,
        },
      });

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(
          env.SEED.ADMIN_PASS,
          Number(env.SALT_NUMBER || 8)
        );

        await prisma.admin.create({
          data: {
            name: 'System Admin',
            email: env.SEED.ADMIN_EMAIL,
            password: hashedPassword,
            role: AdminRole.ADMIN,
            status: AdminStatus.ACTIVE,
          },
        });
        console.log('✅ Admin seeded successfully');
      }
    }
  } catch (error: any) {
    console.warn('⚠️ Admin seed warning:', error.message || error);
  }
};

const getMe = async (userPayload: { userId: string; email: string; role?: string }) => {
  if (userPayload.role === 'ADMIN' || userPayload.role === 'SUPER_ADMIN') {
    const admin = await prisma.admin.findUnique({
      where: { id: userPayload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        photoUrl: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return admin;
  }

  const customer = await prisma.customer.findUnique({
    where: { id: userPayload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      photoUrl: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  return customer;
};

export const AuthServices = {
  signUp,
  getMe,
};
