import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authGuard, optionalAuthGuard } from '../../middleware/authGuard';
import { validateRequest } from '../../middleware/validateRequest';
import { Role } from '../auth/auth.interface';
import { createPaymentSchema } from './payment.validation';

const router = Router();

router.post(
  '/',
  optionalAuthGuard,
  validateRequest(createPaymentSchema),
  PaymentController.createPayment
);

router.post('/webhook/stripe', PaymentController.stripeWebhook);

router.get('/callback/bkash', PaymentController.bkashCallback);

export const PaymentRoutes = router;
