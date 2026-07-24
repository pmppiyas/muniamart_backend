import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProductServices } from './product.services';

const createProduct = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await ProductServices.createProduct(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'Product created successfully',
      data: result,
    });
  }
);

const getAllProducts = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const result = await ProductServices.getAllProducts();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Products retrieved successfully',
      data: result,
      meta: { total: (result as unknown[]).length },
    });
  }
);

const getProductById = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await ProductServices.getProductById(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Product retrieved successfully',
      data: result,
    });
  }
);

const updateProduct = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await ProductServices.updateProduct(req.params.id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Product updated successfully',
      data: result,
    });
  }
);

const deleteProduct = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    await ProductServices.deleteProduct(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Product deleted successfully',
      data: null,
    });
  }
);

export const ProductController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
