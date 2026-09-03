import { Router } from 'express';
import { authGuard } from '../../middleware/authGuard';
import { validateRequest } from '../../middleware/validateRequest';
import { addToCartSchema, updateCartItemSchema } from './cart.validation';
import { CartController } from './cart.controller';

const router = Router();

router.get('/', authGuard('CUSTOMER'), CartController.getCart);

router.post(
  '/',
  authGuard('CUSTOMER'),
  validateRequest(addToCartSchema),
  CartController.addToCart
);

router.patch(
  '/:id',
  authGuard('CUSTOMER'),
  validateRequest(updateCartItemSchema),
  CartController.updateCartItemQuantity
);

router.delete('/:id', authGuard('CUSTOMER'), CartController.removeCartItem);

router.delete('/', authGuard('CUSTOMER'), CartController.clearCart);

export const CartRoutes = router;
