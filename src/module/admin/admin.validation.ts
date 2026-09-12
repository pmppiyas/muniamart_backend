import { z } from 'zod';
import { AdminRole, AdminStatus } from '@prisma/client';

const createAdminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]).default(AdminRole.ADMIN),
  status: z.enum([AdminStatus.ACTIVE, AdminStatus.INACTIVE]).default(AdminStatus.ACTIVE),
  permissions: z.array(z.string()).default([]),
});

const updateAdminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]).optional(),
  status: z.enum([AdminStatus.ACTIVE, AdminStatus.INACTIVE]).optional(),
  permissions: z.array(z.string()).optional(),
});

export const AdminValidation = {
  createAdminSchema,
  updateAdminSchema,
};
