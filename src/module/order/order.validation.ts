import { z } from 'zod';

export const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  streetAddress: z.string().min(1, 'Street address is required'),
  apartment: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Division is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  deliveryNotes: z.string().optional(),
  deliveryMethod: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Invalid product ID'),
        quantity: z
          .number()
          .int('Quantity must be an integer')
          .positive('Quantity must be greater than 0'),
      })
    )
    .min(1, 'Order must contain at least one product'),
  shippingAddress: addressSchema.optional(),
  address: addressSchema.optional(),
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
