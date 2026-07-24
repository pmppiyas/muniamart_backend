import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().cuid('Invalid product ID'),
        quantity: z
          .number()
          .int('Quantity must be an integer')
          .positive('Quantity must be greater than 0'),
      })
    )
    .min(1, 'Order must contain at least one product'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PAID',
    'DELIVERY_IN_PROGRESS',
    'DELIVERED',
    'CANCELED',
  ]),
});
