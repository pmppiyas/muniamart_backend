import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { WishlistServices } from './wishlist.services';
import { IJwtPayload } from '../auth/auth.interface';

const getWishlist = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as IJwtPayload;
    const result = await WishlistServices.getWishlist(user.userId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Wishlist retrieved successfully',
      data: result,
    });
  }
);

const addToWishlist = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as IJwtPayload;
    const result = await WishlistServices.addToWishlist(
      user.userId,
      req.body.productId
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Item added to wishlist successfully',
      data: result,
    });
  }
);

const toggleWishlist = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as IJwtPayload;
    const result = await WishlistServices.toggleWishlist(
      user.userId,
      req.body.productId
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: `Item ${result.action} successfully`,
      data: result.wishlist,
    });
  }
);

const removeFromWishlist = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as IJwtPayload;
    const result = await WishlistServices.removeFromWishlist(
      user.userId,
      req.params.productId as string
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Item removed from wishlist successfully',
      data: result,
    });
  }
);

const clearWishlist = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as IJwtPayload;
    const result = await WishlistServices.clearWishlist(user.userId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Wishlist cleared successfully',
      data: result,
    });
  }
);

export const WishlistController = {
  getWishlist,
  addToWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
};
