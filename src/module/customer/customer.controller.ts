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
    const result = await CustomerServices.updateMyProfile(user.userId, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);

export const CustomerController = {
  getMyProfile,
  updateMyProfile,
};
