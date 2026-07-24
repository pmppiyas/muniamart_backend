import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  parentId: z.string().optional(),
});

export const updateCategorySchema = z.object({
  categoryId: z.string().cuid(),
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .optional(),
  parentId: z.string().nullable().optional(),
});
