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
  price: number;
  stock: number;
  status: ProductStatus;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateProduct {
  name: string;
  sku: string;
  description?: string;
  photoUrl?: string;
  price: number;
  stock: number;
  categoryId: string;
}

export interface IUpdateProduct {
  name?: string;
  description?: string;
  photoUrl?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  status?: string;
}
