import { ProductStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { getCache, setCache, deleteCache } from '../../config/redis';
import { ICreateProduct, IUpdateProduct, IProductQueryParams } from './product.interface';
import { CACHE_KEYS, CACHE_TTL } from '../../utils/redisKey';

const createProduct = async (payload: ICreateProduct) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });
  if (!category) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
  }

  const skuExists = await prisma.product.findUnique({
    where: { sku: payload.sku },
  });
  if (skuExists) {
    throw new AppError(StatusCodes.CONFLICT, 'SKU already exists');
  }

  const product = await prisma.product.create({
    data: {
      name: payload.name,
      sku: payload.sku,
      description: payload.description,
      price: payload.price,
      photoUrl: payload.photoUrl,
      stock: payload.stock,
      categoryId: payload.categoryId,
      status: ProductStatus.ACTIVE,
    },
    include: { category: true },
  });

  await deleteCache(CACHE_KEYS.ALL_PRODUCTS);

  return product;
};

const getAllProducts = async (query: IProductQueryParams = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || 15);
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.search && query.search.trim() !== '') {
    const searchTerm = query.search.trim();
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { sku: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  if (query.categoryId && query.categoryId !== 'ALL') {
    where.categoryId = query.categoryId;
  }

  if (query.status === 'ALL') {
  } else if (query.status === 'INACTIVE') {
    where.status = ProductStatus.INACTIVE;
  } else if (query.status === 'ACTIVE') {
    where.status = ProductStatus.ACTIVE;
  } else {
    where.status = ProductStatus.ACTIVE;
  }

  if (query.stockStatus === 'IN_STOCK') {
    where.stock = { gt: 5 };
  } else if (query.stockStatus === 'LOW_STOCK') {
    where.stock = { gt: 0, lte: 5 };
  } else if (query.stockStatus === 'OUT_OF_STOCK') {
    where.stock = { equals: 0 };
  }

  const sortBy = (query.sortBy as string) || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  const orderBy = { [sortBy]: sortOrder };

  const total = await prisma.product.count({ where });
  const totalPage = Math.ceil(total / limit);

  const products = await prisma.product.findMany({
    where,
    skip,
    take: limit,
    orderBy,
    include: { category: true },
  });

  return {
    products,
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
  };
};

const getProductById = async (id: string) => {
  const cacheKey = CACHE_KEYS.PRODUCT(id);

  const cached = await getCache<object>(cacheKey);
  if (cached) {
    return cached;
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  await setCache(cacheKey, product, CACHE_TTL);

  return product;
};

const updateProduct = async (id: string, payload: IUpdateProduct) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });
    if (!category) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
    }
  }
  const { categoryId, status, ...rest } = payload;

  const updateData: any = { ...rest };

  if (status) {
    updateData.status = status as ProductStatus;
  }

  const updated = await prisma.product.update({
    where: { id },
    data: updateData,
    include: { category: true },
  });

  await deleteCache(CACHE_KEYS.PRODUCT(id), CACHE_KEYS.ALL_PRODUCTS);

  return updated;
};

const deleteProduct = async (id: string) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  await prisma.product.delete({ where: { id } });

  await deleteCache(CACHE_KEYS.PRODUCT(id), CACHE_KEYS.ALL_PRODUCTS);

  return null;
};

export const ProductServices = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
