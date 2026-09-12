import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CustomerServices } from './customer.services';
import { IJwtPayload } from '../auth/auth.interface';

const getMyProfile = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as IJwtPayload;
    const result = await CustomerServices.getMyProfile(user.userId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile retrieved successfully',
      data: result,
    });
  }
);

const updateMyProfile = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user as IJwtPayload;
    const result = await CustomerServices.updateMyProfile(
      user.userId,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

const getAllCustomers = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await CustomerServices.getAllCustomers(req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Customers retrieved successfully',
      meta: result.meta,
      data: result.data,
    });
  }
);

const getSingleCustomer = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await CustomerServices.getSingleCustomer(
      req.params.id as string
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Customer retrieved successfully',
      data: result,
    });
  }
);

const updateCustomerStatus = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await CustomerServices.updateCustomerStatus(
      req.params.id as string,
      req.body.status
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Customer status updated successfully',
      data: result,
    });
  }
);

export const CustomerController = {
  getMyProfile,
  updateMyProfile,
  getAllCustomers,
  getSingleCustomer,
  updateCustomerStatus,
};
