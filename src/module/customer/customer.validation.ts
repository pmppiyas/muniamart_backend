import { z } from 'zod';

export const updateCustomerStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED']),
});

export const CustomerValidation = {
  updateCustomerStatusSchema,
};
