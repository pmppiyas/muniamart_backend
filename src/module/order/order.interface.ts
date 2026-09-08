import { OrderStatus } from '@prisma/client';

export interface IOrder {
  id: string;

  customerId: string;

  totalAmount: number;

  status: OrderStatus;

  items: IOrderItem[];

  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  id: number;

  orderId: string;
  productId: string;

  quantity: number;
  price: number;
  subtotal: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  email?: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  deliveryNotes?: string;
  deliveryMethod?: string;
  paymentMethod?: string;
}

export interface ICreateOrderItem {
  productId: string;
  quantity: number;
}

export interface ICreateOrder {
  customerId: string;
  items: ICreateOrderItem[];
  shippingAddress?: IShippingAddress;
  address?: IShippingAddress;
}

export interface IOrderResponse {
  id: string;
  totalAmount: number;
  status: OrderStatus;

  items: {
    productId: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];

  createdAt: Date;
}

export interface ICreateOrderRequest {
  items: ICreateOrderItem[];
  shippingAddress?: IShippingAddress;
  address?: IShippingAddress;
}
