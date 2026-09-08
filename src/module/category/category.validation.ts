import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  parentId: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const updateCategorySchema = z.object({
  categoryId: z.string().optional(),
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .optional(),
  parentId: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  MODE: z.enum(['EDIT', 'MOVE']).optional(),
});
