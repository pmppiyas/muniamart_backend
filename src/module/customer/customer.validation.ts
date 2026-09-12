import { z } from 'zod';

export const updateCustomerStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED'], {
      required_error: 'Status is required',
    }),
  }),
});

export const CustomerValidation = {
  updateCustomerStatusSchema,
};
