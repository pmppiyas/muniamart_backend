import catchAsync from '../../utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { AuthServices } from './auth.services';
import passport from 'passport';
import { AppError } from '../../utils/appError';
import httpStatus from 'http-status-codes';
import { createUserToken } from '../../utils/jwtToken';
import { clearAuthCookies, setAuthCookie } from '../../utils/cookies';

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
    passport.authenticate('local', async (err: any, user: any, info: any) => {
      if (err) {
        return next(new AppError(httpStatus.METHOD_FAILURE, err));
      }

      if (!user) {
        return next(new AppError(httpStatus.NOT_FOUND, info.message));
      }

      const userToken = createUserToken(user);

      setAuthCookie(res, userToken);

      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'User Login Successfully',
        data: {
          accessToken: userToken.accessToken,
          refreshToken: userToken.refreshToken,
        },
      });
    })(req, res, next);
  }
);

const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    clearAuthCookies(res);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Logout successfully',
      data: null,
    });
  }
);

export const AuthController = {
  signUp,
  signIn,
  logout,
};
