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
      imageUrl: payload.imageUrl ?? null,
      icon: payload.icon ?? null,
      description: payload.description ?? null,
    },
    include: {
      parent: true,
      children: true,
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
  });

  await deleteCache(CACHE_KEYS.ALL_CATEGORIES);

  return category;
};

const getAllCategories = async () => {
  const cached = await getCache<object[]>(CACHE_KEYS.ALL_CATEGORIES);
  if (cached) {
    return cached;
  }

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

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
    include: {
      parent: true,
      children: true,
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
  });

  if (!category) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
  }

  await setCache(cacheKey, category, CACHE_TTL);

  return category;
};

const updateCategory = async (
  idOrPayload: any,
  data?: any
) => {
  let categoryId: string;
  let updateFields: any;

  if (typeof idOrPayload === 'string') {
    categoryId = idOrPayload;
    updateFields = data || {};
  } else {
    categoryId = idOrPayload.id || idOrPayload.categoryId;
    updateFields = { ...idOrPayload };
    delete updateFields.id;
    delete updateFields.categoryId;
  }

  if (!categoryId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Category ID is required');
  }

  const existing = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
  }

  const updateData: any = {};

  if (
    updateFields.name &&
    updateFields.name.trim() !== '' &&
    updateFields.name.trim() !== existing.name
  ) {
    updateData.name = updateFields.name.trim();
    updateData.slug = await generateSlug(updateFields.name.trim());
  }

  if ('parentId' in updateFields) {
    const pId =
      updateFields.parentId === '' ||
      updateFields.parentId === 'null' ||
      updateFields.parentId === null
        ? null
        : updateFields.parentId;

    if (pId) {
      if (pId === categoryId) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          'A category cannot be its own parent'
        );
      }
      const parent = await prisma.category.findUnique({
        where: { id: pId },
      });
      if (!parent) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Parent category not found');
      }
    }
    updateData.parentId = pId;
  }

  if (updateFields.description !== undefined) {
    updateData.description = updateFields.description;
  }
  if (updateFields.imageUrl !== undefined) {
    updateData.imageUrl = updateFields.imageUrl;
  }
  if (updateFields.icon !== undefined) {
    updateData.icon = updateFields.icon;
  }

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: updateData,
    include: {
      parent: true,
      children: true,
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
  });

  await deleteCache(
    CACHE_KEYS.CATEGORY(categoryId),
    CACHE_KEYS.ALL_CATEGORIES
  );

  return category;
};

const deleteCategory = async (id: string) => {
  const existing = await prisma.category.findUnique({
    where: { id },
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
