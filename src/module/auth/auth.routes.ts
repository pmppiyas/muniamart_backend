import { Router } from 'express';
import { multerUpload } from '../../config/multer.config';
import { validateRequest } from '../../middleware/validateRequest';
import { authGuard } from '../../middleware/authGuard';
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

router.get('/me', authGuard(), AuthController.getMe);

router.post('/logout', AuthController.logout);

export const AuthRouter = router;
