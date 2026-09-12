import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyToken } from '../utils/jwtToken';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

import prisma from '../config/prisma';

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
        role?: string;
        permissions?: string[];
      };

      if (roles.length > 0) {
        const userRole = decoded.role || 'CUSTOMER';

        // If route specifically restricts to SUPER_ADMIN only
        if (roles.includes('SUPER_ADMIN') && !roles.includes('ADMIN')) {
          if (userRole !== 'SUPER_ADMIN') {
            return next(
              new AppError(
                StatusCodes.FORBIDDEN,
                'Only Super Admin is authorized to perform this action'
              )
            );
          }
        } else {
          const isPrivileged = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

          if (!isPrivileged && !roles.includes(userRole)) {
            return next(
              new AppError(
                StatusCodes.FORBIDDEN,
                'You do not have permission to perform this action'
              )
            );
          }
        }
      }

      (req as any).user = decoded;
      next();
    } catch {
      return next(
        new AppError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token')
      );
    }
  };

export const permissionGuard =
  (requiredPermission: string) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user as {
        userId: string;
        email: string;
        role?: string;
        permissions?: string[];
      };

      if (!user) {
        return next(
          new AppError(StatusCodes.UNAUTHORIZED, 'You are not logged in')
        );
      }

      // Super Admin inherently bypasses all permission checks
      if (user.role === 'SUPER_ADMIN') {
        return next();
      }

      // Must have administrative role
      if (user.role !== 'ADMIN') {
        return next(
          new AppError(
            StatusCodes.FORBIDDEN,
            'Administrative privileges required'
          )
        );
      }

      let permissions = user.permissions;
      if (!permissions) {
        const admin = await prisma.admin.findUnique({
          where: { id: user.userId },
          select: { permissions: true, status: true },
        });

        if (!admin || admin.status === 'INACTIVE') {
          return next(
            new AppError(
              StatusCodes.FORBIDDEN,
              'Admin account is inactive or not found'
            )
          );
        }
        permissions = admin.permissions || [];
      }

      if (!permissions.includes(requiredPermission)) {
        return next(
          new AppError(
            StatusCodes.FORBIDDEN,
            `Permission denied: '${requiredPermission}' is required for this action`
          )
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export const optionalAuthGuard = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken: string | undefined =
      req.cookies?.accessToken || req.cookies?.['access-token'];

    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : cookieToken;

    if (!token) {
      return next();
    }

    const decoded = verifyToken(token, env.JWT.ACCESS_TOKEN) as {
      userId: string;
      email: string;
      role?: string;
    };

    (req as any).user = decoded;
    next();
  } catch {
    next();
  }
};

