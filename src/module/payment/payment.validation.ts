import { z } from 'zod';

export const createPaymentSchema = z.object({
  orderId: z.string().cuid('Invalid order ID'),

  provider: z.enum(['STRIPE', 'BKASH']),
});

export const verifyPaymentSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
});
