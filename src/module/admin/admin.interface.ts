import { AdminRole, AdminStatus } from '@prisma/client';
import { AdminPermission } from '../auth/auth.interface';

export interface ICreateAdmin {
  name: string;
  email: string;
  password: string;
  role?: AdminRole;
  status?: AdminStatus;
  permissions?: AdminPermission[] | string[];
}

export interface IUpdateAdmin {
  name?: string;
  email?: string;
  password?: string;
  role?: AdminRole;
  status?: AdminStatus;
  permissions?: AdminPermission[] | string[];
}

export interface IAdminQuery {
  searchTerm?: string;
  role?: AdminRole;
  status?: AdminStatus;
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IAdminMetrics {
  totalAdmins: number;
  superAdmins: number;
  regularAdmins: number;
  activeAdmins: number;
  inactiveAdmins: number;
}
