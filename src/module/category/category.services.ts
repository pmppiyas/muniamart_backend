import prisma from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { ICreateCategory } from './category.interface';
import { generateSlug } from '../../utils/createSlug';
import { buildCategoryTree } from '../../utils/buildCategoryTree';
import { getCache, setCache, deleteCache } from '../../config/redis';
import { CACHE_KEYS, CACHE_TTL } from '../../utils/redisKey';

const createCategory = async (payload: ICreateCategory) => {
  const slug = await generateSlug(payload.name);

  if (payload.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: payload.parentId },
    });
    if (!parent) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Parent category not found');
    }
  }

  const category = await prisma.category.create({
    data: {
      name: payload.name,
      slug,
      parentId: payload.parentId ?? null,
    },
    include: { parent: true, children: true },
  });

  await deleteCache(CACHE_KEYS.ALL_CATEGORIES);

  return category;
};

const getAllCategories = async () => {
  const cached = await getCache<object[]>(CACHE_KEYS.ALL_CATEGORIES);
  if (cached) {
    return cached;
  }

  const categories = await prisma.category.findMany();

  const categoryTree = buildCategoryTree(categories);

  await setCache(CACHE_KEYS.ALL_CATEGORIES, categoryTree, CACHE_TTL);

  return categoryTree;
};

const getCategoryById = async (id: string) => {
  const cacheKey = CACHE_KEYS.CATEGORY(id);

  const cached = await getCache<object>(cacheKey);
  if (cached) {
    return cached;
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: { parent: true, children: true },
  });

  if (!category) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
  }

  await setCache(cacheKey, category, CACHE_TTL);

  return category;
};

const updateCategory = async (payload: {
  name: string;
  categoryId?: string;
  parentId?: string;
  MODE: 'EDIT' | 'MOVE';
}) => {
  const { name, categoryId, parentId, MODE } = payload;

  const existing = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { children: true },
  });

  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
  }

  if (MODE === 'EDIT') {
    const category = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
      },
    });

    await deleteCache(
      CACHE_KEYS.CATEGORY(categoryId!),
      CACHE_KEYS.ALL_CATEGORIES
    );

    return category;
  }

  if (MODE === 'MOVE') {
    const category = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        parentId,
      },
    });

    await deleteCache(
      CACHE_KEYS.CATEGORY(categoryId!),
      CACHE_KEYS.ALL_CATEGORIES
    );

    return category;
  }
};

const deleteCategory = async (id: string) => {
  const existing = await prisma.category.findUnique({
    where: { id },
    include: { children: true },
  });

  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
  }

  await prisma.category.delete({ where: { id } });

  await deleteCache(CACHE_KEYS.CATEGORY(id), CACHE_KEYS.ALL_CATEGORIES);

  return null;
};

export const CategoryServices = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
