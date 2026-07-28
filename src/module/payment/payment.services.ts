import { OrderStatus, PaymentProvider, PaymentStatus } from '@prisma/client';
import { IPaymentStrategy } from './payment.strategy';
import { StripePayment } from './stripe.payment';
import { AppError } from '../../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { IJwtPayload } from '../auth/auth.interface';
import { IbKashCallback, ICreatePaymentRequest } from './payment.interface';
import prisma from '../../config/prisma';
import Stripe from 'stripe';
import { stripe } from '../../config/stripe';
import { env } from '../../config/env';
import { BkashPayment } from './bkash.payment';

const getPaymentStrategy = (provider: PaymentProvider): IPaymentStrategy => {
  switch (provider) {
    case PaymentProvider.STRIPE:
      return new StripePayment();

    case PaymentProvider.BKASH:
      return new BkashPayment();

    default:
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Unsupported payment provider'
      );
  }
};

const createPayment = async (
  user: IJwtPayload,
  payload: ICreatePaymentRequest
) => {
  const order = await prisma.order.findFirst({
    where: {
      id: payload.orderId,
      userId: user.userId,
    },
  });

  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Payment can only be initiated for pending orders'
    );
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      orderId: order.id,
      status: {
        in: ['SUCCESS'],
      },
    },
  });

  if (existingPayment) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Payment already exists for this order'
    );
  }

  const strategy = getPaymentStrategy(payload.provider);

  const paymentIntent = await strategy.createPayment(
    order.id,
    Number(order.totalAmount)
  );

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: payload.provider,
      transactionId: paymentIntent.id,
      status: PaymentStatus.PENDING,
      rawResponse: paymentIntent,
    },
  });

  return {
    paymentId: payment.id,
    clientSecret: paymentIntent.client_secret,
    transactionId: payment.transactionId,
  };
};

const handleStripeWebhook = async (payload: Buffer, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.stripe.webhookSecret
    );
  } catch (error) {
    throw new AppError(400, 'Invalid stripe webhook signature');
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const payment = await prisma.payment.findUnique({
        where: {
          transactionId: paymentIntent.id,
        },
      });

      if (!payment) {
        throw new AppError(404, 'Payment not found');
      }

      if (payment.status === PaymentStatus.SUCCESS) {
        return {
          message: 'Payment already processed',
        };
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: {
            id: payment.id,
          },

          data: {
            status: PaymentStatus.SUCCESS,
            rawResponse: event as any,
          },
        });

        await tx.order.update({
          where: {
            id: payment.orderId,
          },

          data: {
            status: OrderStatus.PAID,
          },
        });

        const orderItems = await tx.orderItem.findMany({
          where: {
            orderId: payment.orderId,
          },
        });

        for (const item of orderItems) {
          const product = await tx.product.findUnique({
            where: {
              id: item.productId,
            },

            select: {
              stock: true,
            },
          });

          if (!product || product.stock < item.quantity) {
            throw new AppError(400, 'Insufficient product stock');
          }

          await tx.product.update({
            where: {
              id: item.productId,
            },

            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      });

      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      await prisma.payment.updateMany({
        where: {
          transactionId: paymentIntent.id,
        },

        data: {
          status: PaymentStatus.FAILED,
          rawResponse: event as any,
        },
      });

      break;
    }

    default:
      console.log(`Unhandled stripe event: ${event.type}`);
  }

  return {
    received: true,
    event: event.type,
  };
};

const handleBkashCallback = async (payload: IbKashCallback) => {
  const { paymentID } = payload;

  if (!paymentID) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Payment ID missing');
  }

  const payment = await prisma.payment.findUnique({
    where: {
      transactionId: paymentID,
    },
  });

  if (!payment) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found');
  }

  if (payment.status === PaymentStatus.SUCCESS) {
    return {
      message: 'Payment already processed',
    };
  }

  const bkash = new BkashPayment();

  const executeResponse = await bkash.executePayment(paymentID);

  const verifyResponse = await bkash.verifyPayment(paymentID);

  if (verifyResponse.transactionStatus !== 'Completed') {
    await prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: PaymentStatus.FAILED,
        rawResponse: verifyResponse,
      },
    });

    return {
      message: 'Payment failed',
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: PaymentStatus.SUCCESS,
        rawResponse: {
          executeResponse,
          verifyResponse,
        },
      },
    });

    await tx.order.update({
      where: {
        id: payment.orderId,
      },

      data: {
        status: OrderStatus.PAID,
      },
    });

    const orderItems = await tx.orderItem.findMany({
      where: {
        orderId: payment.orderId,
      },
    });

    for (const item of orderItems) {
      const product = await tx.product.findUnique({
        where: {
          id: item.productId,
        },

        select: {
          stock: true,
        },
      });

      if (!product || product.stock < item.quantity) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          'Insufficient product stock'
        );
      }

      await tx.product.update({
        where: {
          id: item.productId,
        },

        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }
  });

  return {
    message: 'Payment successful',
    transactionId: paymentID,
  };
};

export const PaymentServices = {
  createPayment,
  handleStripeWebhook,
  handleBkashCallback,
};
