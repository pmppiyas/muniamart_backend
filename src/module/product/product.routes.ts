import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest';
import { authGuard } from '../../middleware/authGuard';
import { multerUpload } from '../../config/multer.config';
import { createProductSchema, updateProductSchema } from './product.validation';
import { ProductController } from './product.controller';

const router = Router();

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);

router.post(
  '/',
  authGuard('ADMIN'),
  multerUpload.single('photo'),
  validateRequest(createProductSchema),
  ProductController.createProduct
);

router.patch(
  '/:id',
  authGuard('ADMIN'),
  multerUpload.single('photo'),
  validateRequest(updateProductSchema),
  ProductController.updateProduct
);

router.delete('/:id', authGuard('ADMIN'), ProductController.deleteProduct);

export const ProductRouter = router;
