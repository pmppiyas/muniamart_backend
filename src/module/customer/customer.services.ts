import { CustomerStatus, Prisma } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { StatusCodes } from 'http-status-codes';
import {
  ICustomerQuery,
  ICustomerWithOrderStats,
  IStatusWiseOrderCount,
} from './customer.interface';

interface IUpdateProfilePayload {
  name?: string;
  phone?: string;
  photoUrl?: string;
}

const getMyProfile = async (userId: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id: userId },
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

  if (customer) {
    return customer;
  }

  const admin = await prisma.admin.findUnique({
    where: { id: userId },
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

  if (admin) {
    return admin;
  }

  throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
};

const updateMyProfile = async (
  customerId: string,
  payload: IUpdateProfilePayload
) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Customer not found');
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id: customerId },
    data: {
      name: payload.name ?? customer.name,
      phone: payload.phone ?? customer.phone,
      photoUrl: payload.photoUrl ?? customer.photoUrl,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      photoUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedCustomer;
};

const getAllCustomers = async (query: ICustomerQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || 10);
  const skip = (page - 1) * limit;

  const whereConditions: Prisma.CustomerWhereInput = {};

  if (query.search && query.search.trim()) {
    const s = query.search.trim();
    whereConditions.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { email: { contains: s, mode: 'insensitive' } },
      { phone: { contains: s, mode: 'insensitive' } },
    ];
  }

  if (query.status && query.status !== 'ALL') {
    whereConditions.status = query.status as CustomerStatus;
  }

  const [customers, total, totalCustomers, activeCount, inactiveCount, blockedCount, totalOrdersCount] =
    await Promise.all([
      prisma.customer.findMany({
        where: whereConditions,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          photoUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
      prisma.customer.count({ where: whereConditions }),
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'ACTIVE' } }),
      prisma.customer.count({ where: { status: 'INACTIVE' } }),
      prisma.customer.count({ where: { status: 'BLOCKED' } }),
      prisma.order.count(),
    ]);

  const customerIds = customers.map((c) => c.id);

  const statsMap = new Map<
    string,
    {
      totalSpent: number;
      byStatus: Record<string, number>;
    }
  >();

  customerIds.forEach((id) => {
    statsMap.set(id, {
      totalSpent: 0,
      byStatus: {
        PENDING: 0,
        PAID: 0,
        CONFIRMED: 0,
        DELIVERY_IN_PROGRESS: 0,
        DELIVERED: 0,
        CANCELED: 0,
      },
    });
  });

  if (customerIds.length > 0) {
    const orderStats = await prisma.order.groupBy({
      by: ['customerId', 'status'],
      where: {
        customerId: { in: customerIds },
      },
      _count: {
        _all: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

    for (const stat of orderStats) {
      if (!stat.customerId) continue;
      const entry = statsMap.get(stat.customerId);
      if (entry) {
        const count = stat._count._all;
        entry.byStatus[stat.status] = (entry.byStatus[stat.status] || 0) + count;
        if (stat.status !== 'CANCELED') {
          entry.totalSpent += Number(stat._sum.totalAmount || 0);
        }
      }
    }
  }

  const formattedCustomers: ICustomerWithOrderStats[] = customers.map((c) => {
    const stats = statsMap.get(c.id);
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      photoUrl: c.photoUrl,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      orderCount: c._count.orders,
      totalSpent: stats?.totalSpent || 0,
      statusWiseOrderCount: {
        PENDING: stats?.byStatus.PENDING || 0,
        PAID: stats?.byStatus.PAID || 0,
        CONFIRMED: stats?.byStatus.CONFIRMED || 0,
        DELIVERY_IN_PROGRESS: stats?.byStatus.DELIVERY_IN_PROGRESS || 0,
        DELIVERED: stats?.byStatus.DELIVERED || 0,
        CANCELED: stats?.byStatus.CANCELED || 0,
      },
    };
  });

  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
      metrics: {
        totalCustomers,
        activeCount,
        inactiveCount,
        blockedCount,
        totalOrdersCount,
      },
    },
    data: formattedCustomers,
  };
};

const getSingleCustomer = async (customerId: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      photoUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      addresses: {
        orderBy: { createdAt: 'desc' },
      },
      orders: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  photoUrl: true,
                  price: true,
                },
              },
            },
          },
          payments: true,
          address: true,
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  if (!customer) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Customer not found');
  }

  const orderStats = await prisma.order.groupBy({
    by: ['status'],
    where: { customerId },
    _count: { _all: true },
    _sum: { totalAmount: true },
  });

  const statusWiseOrderCount: IStatusWiseOrderCount = {
    PENDING: 0,
    PAID: 0,
    CONFIRMED: 0,
    DELIVERY_IN_PROGRESS: 0,
    DELIVERED: 0,
    CANCELED: 0,
  };

  let totalSpent = 0;
  for (const stat of orderStats) {
    statusWiseOrderCount[stat.status as keyof IStatusWiseOrderCount] =
      stat._count._all;
    if (stat.status !== 'CANCELED') {
      totalSpent += Number(stat._sum.totalAmount || 0);
    }
  }

  return {
    ...customer,
    orderCount: customer._count.orders,
    totalSpent,
    statusWiseOrderCount,
  };
};

const updateCustomerStatus = async (
  customerId: string,
  status: CustomerStatus
) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Customer not found');
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id: customerId },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      photoUrl: true,
      status: true,
      updatedAt: true,
    },
  });

  return updatedCustomer;
};

export const CustomerServices = {
  getMyProfile,
  updateMyProfile,
  getAllCustomers,
  getSingleCustomer,
  updateCustomerStatus,
};
