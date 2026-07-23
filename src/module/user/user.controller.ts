import catchAsync from '../../utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import { UserServices } from './user.services';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';

const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.signUp(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Signup successfull',
      data: result,
    });
  }
);

export const UserController = {
  signUp,
};
