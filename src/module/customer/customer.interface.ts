import { CustomerStatus } from '@prisma/client';

export interface IStatusWiseOrderCount {
  PENDING: number;
  PAID: number;
  CONFIRMED: number;
  DELIVERY_IN_PROGRESS: number;
  DELIVERED: number;
  CANCELED: number;
}

export interface ICustomerWithOrderStats {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  status: CustomerStatus;
  createdAt: Date;
  updatedAt: Date;
  orderCount: number;
  totalSpent: number;
  statusWiseOrderCount: IStatusWiseOrderCount;
}

export interface ICustomerQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  status?: string;
}

export interface ICustomerMetrics {
  totalCustomers: number;
  activeCount: number;
  inactiveCount: number;
  blockedCount: number;
  totalOrdersCount: number;
}
