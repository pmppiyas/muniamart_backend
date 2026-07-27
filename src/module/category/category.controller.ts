import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CategoryServices } from './category.services';

const createCategory = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await CategoryServices.createCategory(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Category created successfully',
      data: result,
    });
  }
);

const getAllCategories = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const categories = await CategoryServices.getAllCategories();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Categories retrieved successfully',
      data: categories,
    });
  }
);

const updateCategory = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await CategoryServices.updateCategory(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Category updated successfully',
      data: result,
    });
  }
);

const deleteCategory = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    await CategoryServices.deleteCategory(req.params.id as string);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Category deleted successfully',
      data: null,
    });
  }
);

export const CategoryController = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
