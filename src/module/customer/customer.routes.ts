import { Router } from 'express';
import { authGuard } from '../../middleware/authGuard';
import { CustomerController } from './customer.controller';
import { Role } from '../auth/auth.interface';
import { validateRequest } from '../../middleware/validateRequest';
import { CustomerValidation } from './customer.validation';

const router = Router();

router.get('/me', authGuard(), CustomerController.getMyProfile);
router.patch('/me', authGuard('CUSTOMER'), CustomerController.updateMyProfile);

router.get('/', authGuard(Role.ADMIN), CustomerController.getAllCustomers);
router.get('/:id', authGuard(Role.ADMIN), CustomerController.getSingleCustomer);
router.patch(
  '/:id/status',
  authGuard(Role.ADMIN),
  validateRequest(CustomerValidation.updateCustomerStatusSchema),
  CustomerController.updateCustomerStatus
);

export const CustomerRoutes = router;
