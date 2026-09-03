export interface ILoginPayload {
  email: string;
  password: string;
}

export enum Role {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
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
  role: Role;
}
