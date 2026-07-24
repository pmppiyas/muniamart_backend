import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  description: z.string().optional(),
  photoUrl: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  categoryId: z.string().cuid(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  photoUrl: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().cuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
