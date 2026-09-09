import catchAsync from '../../utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { OrderServices } from './order.services';
import { IJwtPayload } from '../auth/auth.interface';

const createOrder = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await OrderServices.createOrder(
      req.user as IJwtPayload | undefined,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Order created successfully',
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
      req.params.id as string,
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

const getAllOrders = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await OrderServices.getAllOrders(req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Orders retrieved successfully',
      meta: result.meta,
      data: result.data,
    });
  }
);

const updateOrder = catchAsync(async (req, res) => {
  const result = await OrderServices.updateOrder(
    req?.params?.id as string,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Order updated successfully',
    data: result,
  });
});

const deleteOrder = catchAsync(async (req, res) => {
  const result = await OrderServices.deleteOrder(req?.params?.id as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Order deleted successfully',
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getSingleOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
};
