import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CartServices } from './cart.services';
import { IJwtPayload } from '../auth/auth.interface';

const getCart = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as IJwtPayload;
    const result = await CartServices.getCart(user.userId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Cart retrieved successfully',
      data: result,
    });
  }
);

const addToCart = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as IJwtPayload;
    const result = await CartServices.addToCart(user.userId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Item added to cart successfully',
      data: result,
    });
  }
);

const updateCartItemQuantity = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as IJwtPayload;
    const result = await CartServices.updateCartItemQuantity(
      user.userId,
      req.params.id as string,
      req.body.quantity
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Cart item updated successfully',
      data: result,
    });
  }
);

const removeCartItem = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as IJwtPayload;
    const result = await CartServices.removeCartItem(
      user.userId,
      req.params.id as string
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Cart item removed successfully',
      data: result,
    });
  }
);

const clearCart = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as IJwtPayload;
    const result = await CartServices.clearCart(user.userId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Cart cleared successfully',
      data: result,
    });
  }
);

export const CartController = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
