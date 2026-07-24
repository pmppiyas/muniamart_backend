import { ICategory } from '../module/category/category.interface';

export const buildCategoryTree = (
  categories: ICategory[],
  parentId: string | null = null
): ICategory[] => {
  const categoryList: any[] = [];

  const filteredCategories =
    parentId === null
      ? categories.filter((cat) => cat.parentId == null)
      : categories.filter((cat) => String(cat.parentId) === String(parentId));

  for (const cat of filteredCategories) {
    categoryList.push({
      _id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId,
      children: buildCategoryTree(categories, String(cat.id)),
    });
  }

  return categoryList;
};
