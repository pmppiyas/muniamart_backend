import catchAsync from '../../utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { AuthServices } from './auth.services';

const signUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthServices.signUp(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Signup successfull',
      data: result,
    });
  }
);

const signIn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthServices.signIn(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Credientials login successfully',
      data: result,
    });
  }
);

export const AuthController = {
  signUp,
  signIn,
};
