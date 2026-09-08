import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(2, 'SKU must be at least 2 characters'),
  description: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  price: z.preprocess(
    (val) => (val !== undefined && val !== null ? Number(val) : val),
    z.number().positive('Price must be positive')
  ),
  stock: z.preprocess(
    (val) => (val !== undefined && val !== null ? Number(val) : val),
    z.number().int().min(0, 'Stock must be 0 or greater')
  ),
  categoryId: z.string().min(1, 'Category is required'),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  price: z.preprocess(
    (val) =>
      val !== undefined && val !== null && val !== '' ? Number(val) : undefined,
    z.number().positive().optional()
  ),
  stock: z.preprocess(
    (val) =>
      val !== undefined && val !== null && val !== '' ? Number(val) : undefined,
    z.number().int().min(0).optional()
  ),
  categoryId: z.string().min(1).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
