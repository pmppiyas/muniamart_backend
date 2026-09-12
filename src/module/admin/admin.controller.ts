import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AdminServices } from './admin.services';
import { AdminPermission } from '../auth/auth.interface';

const PERMISSIONS_CATALOG = [
  {
    key: AdminPermission.MANAGE_PRODUCTS,
    name: 'Manage Products',
    module: 'Products',
    description: 'Create, edit, view, and delete products, inventory, and SKU data.',
  },
  {
    key: AdminPermission.MANAGE_CATEGORIES,
    name: 'Manage Categories',
    module: 'Categories',
    description: 'Create, edit, and delete product categories and subcategories.',
  },
  {
    key: AdminPermission.MANAGE_ORDERS,
    name: 'Manage Orders',
    module: 'Orders',
    description: 'View customer orders, update delivery status, and handle cancellations.',
  },
  {
    key: AdminPermission.MANAGE_CUSTOMERS,
    name: 'Manage Customers',
    module: 'Customers',
    description: 'View customer accounts, order history, and update status (Active/Blocked).',
  },
  {
    key: AdminPermission.MANAGE_PAYMENTS,
    name: 'Manage Payments',
    module: 'Finance',
    description: 'View Stripe and bKash transaction telemetry, revenue stats, and details.',
  },
];

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.createAdmin(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Administrator created successfully',
    data: result,
  });
});

const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getAllAdmins(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Administrators retrieved successfully',
    data: result.admins,
    meta: {
      ...result.meta,
      metrics: result.metrics,
    },
  });
});

const getSingleAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getSingleAdmin(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Administrator details retrieved successfully',
    data: result,
  });
});

const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = (req as any).user?.userId as string;
  const result = await AdminServices.updateAdmin(
    req.params.id as string,
    req.body,
    currentUserId
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Administrator updated successfully',
    data: result,
  });
});

const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const currentUserId = (req as any).user?.userId as string;
  const result = await AdminServices.deleteAdmin(
    req.params.id as string,
    currentUserId
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Administrator deleted successfully',
    data: result,
  });
});

const getAvailablePermissions = catchAsync(async (_req: Request, res: Response) => {
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Available system permissions retrieved successfully',
    data: PERMISSIONS_CATALOG,
  });
});

export const AdminController = {
  createAdmin,
  getAllAdmins,
  getSingleAdmin,
  updateAdmin,
  deleteAdmin,
  getAvailablePermissions,
};
