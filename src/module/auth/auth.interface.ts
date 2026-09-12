export interface ILoginPayload {
  email: string;
  password: string;
}

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
}

export enum AdminPermission {
  MANAGE_PRODUCTS = 'MANAGE_PRODUCTS',
  MANAGE_CATEGORIES = 'MANAGE_CATEGORIES',
  MANAGE_ORDERS = 'MANAGE_ORDERS',
  MANAGE_CUSTOMERS = 'MANAGE_CUSTOMERS',
  MANAGE_PAYMENTS = 'MANAGE_PAYMENTS',
  MANAGE_ADMINS = 'MANAGE_ADMINS',
}

export interface ICustomer {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string | null;
  photoUrl?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdmin {
  id: string;
  name: string;
  email: string;
  password?: string;
  photoUrl?: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISignUp {
  name: string;
  email: string;
  password: string;
  phone?: string;
  photoUrl?: string;
}

export interface IJwtPayload {
  userId: string;
  email: string;
  role: Role | string;
  permissions?: string[];
}
