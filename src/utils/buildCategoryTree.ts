import { ICategory } from '../module/category/category.interface';

export const buildCategoryTree = (
  categories: any[],
  parentId: string | null = null
): any[] => {
  const categoryList: any[] = [];

  const filteredCategories =
    parentId === null
      ? categories.filter((cat) => cat.parentId == null)
      : categories.filter((cat) => String(cat.parentId) === String(parentId));

  for (const cat of filteredCategories) {
    categoryList.push({
      ...cat,
      children: buildCategoryTree(categories, String(cat.id)),
    });
  }

  return categoryList;
};
