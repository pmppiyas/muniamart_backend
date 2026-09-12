import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authGuard, optionalAuthGuard, permissionGuard } from '../../middleware/authGuard';
import { validateRequest } from '../../middleware/validateRequest';
import { AdminPermission, Role } from '../auth/auth.interface';
import { createPaymentSchema } from './payment.validation';

const router = Router();

router.get(
  '/',
  authGuard(Role.ADMIN),
  permissionGuard(AdminPermission.MANAGE_PAYMENTS),
  PaymentController.getAllPayments
);
router.get(
  '/:id',
  authGuard(Role.ADMIN),
  permissionGuard(AdminPermission.MANAGE_PAYMENTS),
  PaymentController.getSinglePayment
);

router.post(
  '/',
  optionalAuthGuard,
  validateRequest(createPaymentSchema),
  PaymentController.createPayment
);

router.post('/webhook/stripe', PaymentController.stripeWebhook);

router.get('/callback/bkash', PaymentController.bkashCallback);

export const PaymentRoutes = router;
