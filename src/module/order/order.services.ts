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

const createOrder = async (
  user: IJwtPayload | undefined,
  data: ICreateOrderRequest
) => {
  let customer: any = null;
  if (user) {
    customer = await resolveCustomer(user);
  }

  const addr = data.shippingAddress || data.address;

  if (!customer && addr?.email) {
    customer = await prisma.customer.findUnique({
      where: { email: addr.email },
    });
  }

  const customerId = customer ? customer.id : null;

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
        customerId,
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

    if (addr) {
      await tx.address.create({
        data: {
          orderId: createdOrder.id,
          customerId,
          fullName: addr.fullName,
          phone: addr.phone,
          email: addr.email || customer?.email || null,
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

    if (customerId) {
      const userCart = await tx.cart.findUnique({
        where: { customerId },
      });
      if (userCart) {
        await tx.cartItem.deleteMany({
          where: { cartId: userCart.id },
        });
      }
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
    orderBy: [
      {
        createdAt: 'desc',
      },
      {
        id: 'desc',
      },
    ],
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

const getAllOrders = async (query: Record<string, any>) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || 15);
  const skip = (page - 1) * limit;

  const { search, status, startDate, endDate } = query;

  const whereConditions: any = {};

  if (status && status !== 'ALL') {
    whereConditions.status = status;
  }

  if (search && String(search).trim()) {
    const s = String(search).trim();
    whereConditions.OR = [
      { id: { contains: s, mode: 'insensitive' } },
      { customer: { name: { contains: s, mode: 'insensitive' } } },
      { customer: { email: { contains: s, mode: 'insensitive' } } },
      { customer: { phone: { contains: s, mode: 'insensitive' } } },
      { address: { fullName: { contains: s, mode: 'insensitive' } } },
      { address: { email: { contains: s, mode: 'insensitive' } } },
      { address: { phone: { contains: s, mode: 'insensitive' } } },
      { address: { city: { contains: s, mode: 'insensitive' } } },
      { address: { streetAddress: { contains: s, mode: 'insensitive' } } },
    ];
  }

  if (startDate || endDate) {
    whereConditions.createdAt = {};
    if (startDate) {
      whereConditions.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereConditions.createdAt.lte = end;
    }
  }

  const [orders, total, pendingCount, confirmedCount, inProgressCount, deliveredCount, canceledCount] =
    await Promise.all([
      prisma.order.findMany({
        where: whereConditions,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              photoUrl: true,
            },
          },
          address: true,
          payments: true,
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
        },
        orderBy: [
          { createdAt: 'desc' },
          { id: 'desc' },
        ],
      }),
      prisma.order.count({ where: whereConditions }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'CONFIRMED' } }),
      prisma.order.count({ where: { status: 'DELIVERY_IN_PROGRESS' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELED' } }),
    ]);

  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
      metrics: {
        total,
        pending: pendingCount,
        confirmed: confirmedCount,
        inProgress: inProgressCount,
        delivered: deliveredCount,
        canceled: canceledCount,
      },
    },
    data: orders,
  };
};

const updateOrder = async (orderId: string, payload: any) => {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: { address: true },
  });

  if (!existingOrder) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  const { status, shippingAddress, address } = payload;
  const addrData = shippingAddress || address;

  const result = await prisma.$transaction(async (tx) => {
    if (status) {
      await tx.order.update({
        where: { id: orderId },
        data: { status },
      });
    }

    if (addrData) {
      if (existingOrder.address) {
        await tx.address.update({
          where: { orderId },
          data: {
            fullName: addrData.fullName,
            phone: addrData.phone,
            email: addrData.email !== undefined ? addrData.email : existingOrder.address.email,
            streetAddress: addrData.streetAddress,
            apartment: addrData.apartment !== undefined ? addrData.apartment : existingOrder.address.apartment,
            city: addrData.city,
            state: addrData.state,
            postalCode: addrData.postalCode,
            deliveryNotes: addrData.deliveryNotes !== undefined ? addrData.deliveryNotes : existingOrder.address.deliveryNotes,
            deliveryMethod: addrData.deliveryMethod !== undefined ? addrData.deliveryMethod : existingOrder.address.deliveryMethod,
            paymentMethod: addrData.paymentMethod !== undefined ? addrData.paymentMethod : existingOrder.address.paymentMethod,
          },
        });
      } else {
        await tx.address.create({
          data: {
            orderId,
            customerId: existingOrder.customerId,
            fullName: addrData.fullName || '',
            phone: addrData.phone || '',
            email: addrData.email || null,
            streetAddress: addrData.streetAddress || '',
            apartment: addrData.apartment || null,
            city: addrData.city || '',
            state: addrData.state || '',
            postalCode: addrData.postalCode || '',
            deliveryNotes: addrData.deliveryNotes || null,
            deliveryMethod: addrData.deliveryMethod || 'standard',
            paymentMethod: addrData.paymentMethod || 'cod',
          },
        });
      }
    }

    return await tx.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            photoUrl: true,
          },
        },
        address: true,
        payments: true,
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
      },
    });
  });

  return result;
};

const deleteOrder = async (orderId: string) => {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  await prisma.order.delete({
    where: { id: orderId },
  });

  return { message: 'Order deleted successfully' };
};

export const OrderServices = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getSingleOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
};
