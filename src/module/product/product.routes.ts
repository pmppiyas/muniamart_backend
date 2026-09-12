import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest';
import { authGuard, permissionGuard } from '../../middleware/authGuard';
import { AdminPermission } from '../auth/auth.interface';
import { multerUpload } from '../../config/multer.config';
import { createProductSchema, updateProductSchema } from './product.validation';
import { ProductController } from './product.controller';

const router = Router();

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);

router.post(
  '/',
  authGuard('ADMIN'),
  permissionGuard(AdminPermission.MANAGE_PRODUCTS),
  multerUpload.single('photo'),
  validateRequest(createProductSchema),
  ProductController.createProduct
);

router.patch(
  '/:id',
  authGuard('ADMIN'),
  permissionGuard(AdminPermission.MANAGE_PRODUCTS),
  multerUpload.single('photo'),
  validateRequest(updateProductSchema),
  ProductController.updateProduct
);

router.delete(
  '/:id',
  authGuard('ADMIN'),
  permissionGuard(AdminPermission.MANAGE_PRODUCTS),
  ProductController.deleteProduct
);

export const ProductRouter = router;
