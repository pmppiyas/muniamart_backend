import { ProductStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { getCache, setCache, deleteCache } from '../../config/redis';
import { ICreateProduct, IUpdateProduct } from './product.interface';
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

const getAllProducts = async () => {
  const cached = await getCache<object[]>(CACHE_KEYS.ALL_PRODUCTS);
  if (cached) {
    return cached;
  }

  const products = await prisma.product.findMany({
    where: { status: ProductStatus.ACTIVE },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });

  await setCache(CACHE_KEYS.ALL_PRODUCTS, products, CACHE_TTL);

  return products;
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
