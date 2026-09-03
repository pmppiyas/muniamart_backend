import { Router } from 'express';
import { authGuard } from '../../middleware/authGuard';
import { CustomerController } from './customer.controller';

const router = Router();

router.get('/me', authGuard('CUSTOMER'), CustomerController.getMyProfile);
router.patch('/me', authGuard('CUSTOMER'), CustomerController.updateMyProfile);

export const CustomerRoutes = router;
