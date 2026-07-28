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
