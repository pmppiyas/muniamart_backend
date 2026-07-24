import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyToken } from '../utils/jwtToken';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

export const authGuard =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const cookieToken: string | undefined =
        req.cookies?.accessToken || req.cookies?.['access-token'];

      const token =
        authHeader && authHeader.startsWith('Bearer ')
          ? authHeader.split(' ')[1]
          : cookieToken;

      if (!token) {
        return next(
          new AppError(StatusCodes.UNAUTHORIZED, 'You are not logged in')
        );
      }

      const decoded = verifyToken(token, env.JWT.ACCESS_TOKEN) as {
        userId: string;
        email: string;
        role: string;
      };

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return next(
          new AppError(
            StatusCodes.FORBIDDEN,
            'You do not have permission to perform this action'
          )
        );
      }

      (req as any).user = decoded;
      next();
    } catch {
      return next(
        new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token')
      );
    }
  };
