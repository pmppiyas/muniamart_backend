import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest';
import { authGuard, permissionGuard } from '../../middleware/authGuard';
import { AdminPermission } from '../auth/auth.interface';
import { multerUpload } from '../../config/multer.config';
import {
  createCategorySchema,
  updateCategorySchema,
} from './category.validation';
import { CategoryController } from './category.controller';

const router = Router();

router.post(
  '/',
  authGuard('ADMIN'),
  permissionGuard(AdminPermission.MANAGE_CATEGORIES),
  multerUpload.single('image'),
  validateRequest(createCategorySchema),
  CategoryController.createCategory
);

router.get('/', CategoryController.getAllCategories);

router.get('/:id', CategoryController.getCategoryById);

router.patch(
  '/:id',
  authGuard('ADMIN'),
  permissionGuard(AdminPermission.MANAGE_CATEGORIES),
  multerUpload.single('image'),
  validateRequest(updateCategorySchema),
  CategoryController.updateCategory
);

router.patch(
  '/',
  authGuard('ADMIN'),
  permissionGuard(AdminPermission.MANAGE_CATEGORIES),
  multerUpload.single('image'),
  validateRequest(updateCategorySchema),
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  authGuard('ADMIN'),
  permissionGuard(AdminPermission.MANAGE_CATEGORIES),
  CategoryController.deleteCategory
);

export const CategoryRouter = router;
