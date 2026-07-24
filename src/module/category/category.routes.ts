import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest';
import { authGuard } from '../../middleware/authGuard';
import {
  createCategorySchema,
  updateCategorySchema,
} from './category.validation';
import { CategoryController } from './category.controller';

const router = Router();

router.post(
  '/',
  authGuard('ADMIN'),
  validateRequest(createCategorySchema),
  CategoryController.createCategory
);

router.get('/', CategoryController.getAllCategories);

router.patch(
  '/',
  authGuard('ADMIN'),
  validateRequest(updateCategorySchema),
  CategoryController.updateCategory
);

router.delete('/:id', authGuard('ADMIN'), CategoryController.deleteCategory);

export const CategoryRouter = router;
