import { Router } from 'express';
import { multerUpload } from '../../config/multer.config';
import { validateRequest } from '../../middleware/validateRequest';
import { signInSchema, signUpSchema } from './auth.validation';
import { AuthController } from './auth.controller';

const router = Router();

router.post(
  '/signup',
  multerUpload.single('photo'),
  validateRequest(signUpSchema),
  AuthController.signUp
);

router.post(
  '/signin',
  multerUpload.none(),
  validateRequest(signInSchema),
  AuthController.signIn
);

export const AuthRouter = router;
