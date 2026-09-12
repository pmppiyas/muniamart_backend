import { Router } from 'express';
import { OrderController } from './order.controller';
import { authGuard, optionalAuthGuard, permissionGuard } from '../../middleware/authGuard';
import { AdminPermission, Role } from '../auth/auth.interface';
import { validateRequest } from '../../middleware/validateRequest';
import { createOrderSchema, updateOrderStatusSchema } from './order.validation';

const router = Router();

router.get(
  '/',
  authGuard(Role.ADMIN),
  permissionGuard(AdminPermission.MANAGE_ORDERS),
  OrderController.getAllOrders
);

router.post(
  '/',
  optionalAuthGuard,
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

router.patch(
  '/:id',
  authGuard(Role.ADMIN),
  permissionGuard(AdminPermission.MANAGE_ORDERS),
  OrderController.updateOrder
);

router.delete(
  '/:id',
  authGuard(Role.ADMIN),
  permissionGuard(AdminPermission.MANAGE_ORDERS),
  OrderController.deleteOrder
);

export const OrderRoutes = router;
