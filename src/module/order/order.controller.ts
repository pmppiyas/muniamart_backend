import catchAsync from '../../utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { OrderServices } from './order.services';
import { IJwtPayload } from '../auth/auth.interface';

const createOrder = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await OrderServices.createOrder(
      req.user as IJwtPayload,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Category created successfully',
      data: result,
    });
  }
);

const getMyOrders = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await OrderServices.getMyOrders(req.user as IJwtPayload);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Orders retrieved successfully',
      data: result,
    });
  }
);

const getSingleOrder = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await OrderServices.getSingleOrder(
      req.params.id,
      req.user as IJwtPayload
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Order retrieved successfully',
      data: result,
    });
  }
);

const updateOrderStatus = catchAsync(async (req, res) => {
  const result = await OrderServices.updateOrderStatus(
    req?.params?.id as string,
    req.body.status,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Order status updated successfully',
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getMyOrders,
  getSingleOrder,
  updateOrderStatus,
};
