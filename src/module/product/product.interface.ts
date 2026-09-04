export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface IProduct {
  id: string;
  name: string;
  sku: string;
  description?: string;
  photoUrl?: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stock: number;
  status: ProductStatus;
  brand?: string;
  rating?: number;
  reviewsCount?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  features?: string[];
  specifications?: any;
  variants?: any;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateProduct {
  name: string;
  sku: string;
  description?: string;
  photoUrl?: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stock: number;
  brand?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  features?: string[];
  specifications?: any;
  variants?: any;
  categoryId: string;
}

export interface IUpdateProduct {
  name?: string;
  description?: string;
  photoUrl?: string;
  images?: string[];
  price?: number;
  originalPrice?: number;
  discountPercent?: number;
  stock?: number;
  brand?: string;
  rating?: number;
  reviewsCount?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  features?: string[];
  specifications?: any;
  variants?: any;
  categoryId?: string;
  status?: string;
}
