import { Router } from 'express';
import { authGuard } from '../../middleware/authGuard';
import { validateRequest } from '../../middleware/validateRequest';
import { addToWishlistSchema } from './wishlist.validation';
import { WishlistController } from './wishlist.controller';

const router = Router();

router.get('/', authGuard('CUSTOMER'), WishlistController.getWishlist);

router.post(
  '/',
  authGuard('CUSTOMER'),
  validateRequest(addToWishlistSchema),
  WishlistController.addToWishlist
);

router.post(
  '/toggle',
  authGuard('CUSTOMER'),
  validateRequest(addToWishlistSchema),
  WishlistController.toggleWishlist
);

router.delete('/:productId', authGuard('CUSTOMER'), WishlistController.removeFromWishlist);

router.delete('/', authGuard('CUSTOMER'), WishlistController.clearWishlist);

export const WishlistRoutes = router;
