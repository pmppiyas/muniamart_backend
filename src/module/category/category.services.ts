import prisma from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { ICreateCategory } from './category.interface';
import { generateSlug } from '../../utils/createSlug';
import { buildCategoryTree } from '../../utils/buildCategoryTree';

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

  return category;
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany();

  const categoryTree = buildCategoryTree(categories);

  return categoryTree;
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

  return null;
};

export const CategoryServices = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
