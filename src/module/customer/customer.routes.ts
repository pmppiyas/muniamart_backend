import { Router } from 'express';
import { authGuard, permissionGuard } from '../../middleware/authGuard';
import { CustomerController } from './customer.controller';
import { AdminPermission, Role } from '../auth/auth.interface';
import { validateRequest } from '../../middleware/validateRequest';
import { CustomerValidation } from './customer.validation';

const router = Router();

router.get('/me', authGuard(), CustomerController.getMyProfile);
router.patch('/me', authGuard('CUSTOMER'), CustomerController.updateMyProfile);

router.get(
  '/',
  authGuard(Role.ADMIN),
  permissionGuard(AdminPermission.MANAGE_CUSTOMERS),
  CustomerController.getAllCustomers
);

router.get(
  '/:id',
  authGuard(Role.ADMIN),
  permissionGuard(AdminPermission.MANAGE_CUSTOMERS),
  CustomerController.getSingleCustomer
);

router.patch(
  '/:id/status',
  authGuard(Role.ADMIN),
  permissionGuard(AdminPermission.MANAGE_CUSTOMERS),
  validateRequest(CustomerValidation.updateCustomerStatusSchema),
  CustomerController.updateCustomerStatus
);

export const CustomerRoutes = router;
