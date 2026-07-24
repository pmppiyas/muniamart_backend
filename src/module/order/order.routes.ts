import { Router } from 'express';
import { OrderController } from './order.controller';
import { authGuard } from '../../middleware/authGuard';
import { Role } from '../auth/auth.interface';
import { validateRequest } from '../../middleware/validateRequest';
import { createOrderSchema, updateOrderStatusSchema } from './order.validation';

const router = Router();

router.post(
  '/',
  authGuard(...Object.values(Role)),
  validateRequest(createOrderSchema),
  OrderController.createOrder
);

router.get(
  '/my',
  authGuard(...Object.values(Role)),
  OrderController.getMyOrders
);

router.patch(
  '/:id/status',
  authGuard(...Object.values(Role)),
  validateRequest(updateOrderStatusSchema),
  OrderController.updateOrderStatus
);

router.get(
  '/:id',
  authGuard(...Object.values(Role)),
  OrderController.getSingleOrder
);

export const OrderRoutes = router;
