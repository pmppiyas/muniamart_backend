export interface ICategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  description?: string | null;
  children?: ICategory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCategory {
  name: string;
  parentId?: string;
  imageUrl?: string;
  icon?: string;
  description?: string;
}

export interface IUpdateCategory {
  name?: string;
  parentId?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  description?: string | null;
}

export interface ICategoryQuery {
  page?: number;
  limit?: number;
  search?: string;
}
