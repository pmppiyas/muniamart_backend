import { Router } from 'express';
import { authGuard } from '../../middleware/authGuard';
import { validateRequest } from '../../middleware/validateRequest';
import { Role } from '../auth/auth.interface';
import { AdminValidation } from './admin.validation';
import { AdminController } from './admin.controller';

const router = Router();

// All administrative management routes are strictly reserved for SUPER_ADMIN
router.get(
  '/permissions',
  authGuard(Role.SUPER_ADMIN),
  AdminController.getAvailablePermissions
);

router.post(
  '/',
  authGuard(Role.SUPER_ADMIN),
  validateRequest(AdminValidation.createAdminSchema),
  AdminController.createAdmin
);

router.get(
  '/',
  authGuard(Role.SUPER_ADMIN),
  AdminController.getAllAdmins
);

router.get(
  '/:id',
  authGuard(Role.SUPER_ADMIN),
  AdminController.getSingleAdmin
);

router.patch(
  '/:id',
  authGuard(Role.SUPER_ADMIN),
  validateRequest(AdminValidation.updateAdminSchema),
  AdminController.updateAdmin
);

router.delete(
  '/:id',
  authGuard(Role.SUPER_ADMIN),
  AdminController.deleteAdmin
);

export const AdminRoutes = router;
