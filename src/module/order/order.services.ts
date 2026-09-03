import { ICreateOrderRequest } from './order.interface';
import { IJwtPayload, Role } from '../auth/auth.interface';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/appError';
import httpStatus from 'http-status-codes';
import { OrderStatus } from '@prisma/client';

const createOrder = async (user: IJwtPayload, data: ICreateOrderRequest) => {
  const productIds = data.items.map((item) => item.productId);

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
      status: 'ACTIVE',
    },
  });

  if (products.length !== productIds.length) {
    throw new AppError(httpStatus.NOT_FOUND, 'One or more products not found');
  }

  let totalAmount = 0;

  const orderItems = data.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);

    if (!product) {
      throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
    }

    if (product.stock < item.quantity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `${product.name} is out of stock`
      );
    }

    const price = Number(product.price);
    const subtotal = price * item.quantity;

    totalAmount += subtotal;

    return {
      productId: product.id,
      quantity: item.quantity,
      price,
      subtotal,
    };
  });

  const order = await prisma.$transaction(async (tx) => {
    return await tx.order.create({
      data: {
        customerId: user.userId,
        totalAmount,
        status: 'PENDING',

        items: {
          create: orderItems,
        },
      },

      include: {
        items: true,
      },
    });
  });

  return order;
};

const getMyOrders = async (user: IJwtPayload) => {
  const orders = await prisma.order.findMany({
    where: {
      customerId: user.userId,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return orders;
};

const getSingleOrder = async (orderId: string, user: IJwtPayload) => {
  const whereCondition =
    user.role === Role.ADMIN
      ? { id: orderId }
      : {
          id: orderId,
          customerId: user.userId,
        };

  const order = await prisma.order.findFirst({
    where: whereCondition,
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              description: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  return order;
};

const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  user: IJwtPayload
) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  if (user.role !== Role.ADMIN) {
    if (order.customerId !== user.userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'You can update only your own order'
      );
    }

    if (
      status !== OrderStatus.CANCELED ||
      order.status !== OrderStatus.PENDING
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You can only cancel pending order'
      );
    }
  }

  const updatedOrder = await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status,
    },
  });

  return updatedOrder;
};

export const OrderServices = {
  createOrder,
  getMyOrders,
  getSingleOrder,
  updateOrderStatus,
};
