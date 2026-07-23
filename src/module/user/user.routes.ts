import { Router } from 'express';
import { UserController } from './user.controller';
import { multerUpload } from '../../config/multer.config';
import { validateRequest } from '../../middleware/validateRequest';
import { registerSchema } from './user.validation';

const router = Router();

router.post(
  '/signup',
  multerUpload.single('photo'),
  validateRequest(registerSchema),
  UserController.signUp
);

export const UserRouter = router;
