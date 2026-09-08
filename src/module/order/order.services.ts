import { ICreateOrderRequest } from './order.interface';
import { IJwtPayload, Role } from '../auth/auth.interface';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/appError';
import httpStatus from 'http-status-codes';
import { OrderStatus } from '@prisma/client';
import { resolveCustomer } from '../../utils/resolveCustomer';

const generateOrderId = async (tx: any): Promise<string> => {
  const latestOrder = await tx.order.findFirst({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
    },
  });

  let nextSeq = 100000;

  if (latestOrder?.id) {
    const match = latestOrder.id.match(/\d+/);
    if (match && match[0]) {
      const num = parseInt(match[0], 10);
      if (!isNaN(num) && num >= 100000) {
        nextSeq = num + 1;
      }
    }
  }

  let orderId = String(nextSeq);
  let existing = await tx.order.findUnique({
    where: { id: orderId },
    select: { id: true },
  });

  while (existing) {
    nextSeq++;
    orderId = String(nextSeq);
    existing = await tx.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });
  }

  return orderId;
};

const createOrder = async (user: IJwtPayload, data: ICreateOrderRequest) => {
  const customer = await resolveCustomer(user);
  if (!customer) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Customer profile not found. Please log in with a customer account.'
    );
  }

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
    const orderId = await generateOrderId(tx);

    const createdOrder = await tx.order.create({
      data: {
        id: orderId,
        customerId: customer.id,
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

    const addr = data.shippingAddress || data.address;
    if (addr) {
      await tx.address.create({
        data: {
          orderId: createdOrder.id,
          customerId: customer.id,
          fullName: addr.fullName,
          phone: addr.phone,
          email: addr.email || customer.email || null,
          streetAddress: addr.streetAddress,
          apartment: addr.apartment || null,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          deliveryNotes: addr.deliveryNotes || null,
          deliveryMethod: addr.deliveryMethod || 'standard',
          paymentMethod: addr.paymentMethod || 'cod',
        },
      });
    }

    // Automatically clear cart items for this customer upon order placement
    const userCart = await tx.cart.findUnique({
      where: { customerId: customer.id },
    });
    if (userCart) {
      await tx.cartItem.deleteMany({
        where: { cartId: userCart.id },
      });
    }

    const finalOrder = await tx.order.findUnique({
      where: { id: createdOrder.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    return finalOrder || createdOrder;
  });

  return order;
};

const getMyOrders = async (user: IJwtPayload) => {
  const customer = await resolveCustomer(user);
  const customerId = customer ? customer.id : user.userId;

  const orders = await prisma.order.findMany({
    where: {
      customerId,
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
              photoUrl: true,
            },
          },
        },
      },
      address: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return orders;
};

const getSingleOrder = async (orderId: string, user: IJwtPayload) => {
  const isPrivileged =
    user.role === Role.ADMIN ||
    (user.role as any) === 'SUPER_ADMIN' ||
    (user as any).role === 'ADMIN' ||
    (user as any).role === 'SUPER_ADMIN';

  let customerId = user.userId;
  if (!isPrivileged) {
    const customer = await resolveCustomer(user);
    if (customer) {
      customerId = customer.id;
    }
  }

  const whereCondition = isPrivileged
    ? { id: orderId }
    : {
        id: orderId,
        customerId,
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
              photoUrl: true,
            },
          },
        },
      },
      address: true,
      payments: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
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

  const isPrivileged =
    user.role === Role.ADMIN ||
    (user.role as any) === 'SUPER_ADMIN' ||
    (user as any).role === 'ADMIN' ||
    (user as any).role === 'SUPER_ADMIN';

  if (!isPrivileged) {
    const customer = await resolveCustomer(user);
    const customerId = customer ? customer.id : user.userId;

    if (order.customerId !== customerId) {
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
