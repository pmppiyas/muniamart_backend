import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authGuard } from '../../middleware/authGuard';
import { validateRequest } from '../../middleware/validateRequest';
import { Role } from '../auth/auth.interface';
import { createPaymentSchema } from './payment.validation';

const router = Router();

router.post(
  '/',
  authGuard(...Object.values(Role)),
  validateRequest(createPaymentSchema),
  PaymentController.createPayment
);

router.post('/webhook/stripe', PaymentController.stripeWebhook);

router.post('/callback/bkash', PaymentController.bkashCallback);

export const PaymentRoutes = router;
