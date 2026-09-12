import { PaymentProvider, PaymentStatus } from '@prisma/client';

export interface ICreatePaymentRequest {
  orderId: string;
  provider: PaymentProvider;
}

export interface IPaymentResponse {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  transactionId: string;
  status: PaymentStatus;
  rawResponse?: object | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IbKashCallback {
  paymentID: string;
  status: PaymentStatus;
}

export interface IPaymentQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  provider?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface IPaymentMetrics {
  totalPayments: number;
  successfulCount: number;
  pendingCount: number;
  failedCount: number;
  totalRevenue: number;
  stripeRevenue: number;
  bkashRevenue: number;
}
