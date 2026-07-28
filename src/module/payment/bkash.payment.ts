import axios from 'axios';
import { IPaymentStrategy } from './payment.strategy';
import { env } from '../../config/env';
import { PaymentStatus } from '@prisma/client';

export class BkashPayment implements IPaymentStrategy {
  verifySignature(payload: { paymentID: string; status: PaymentStatus; signature: string; }, signature: string) {
    throw new Error('Method not implemented.');
  }
  private baseUrl = env.bkash.baseUrl;

  private async getToken() {
    const response = await axios.post(
      `${this.baseUrl}/tokenized/checkout/token/grant`,

      {
        app_key: env.bkash.appKey,
        app_secret: env.bkash.appSecret,
      },

      {
        headers: {
          username: env.bkash.username,
          password: env.bkash.password,
        },
      }
    );

    return response.data.id_token;
  }

  async createPayment(orderId: string, amount: number) {
    const token = await this.getToken();

    const response = await axios.post(
      `${this.baseUrl}/tokenized/checkout/create`,

      {
        mode: '0011',
        payerReference: orderId,
        callbackURL: env.bkash.callbackUrl,
        amount: amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: orderId,
      },

      {
        headers: {
          Authorization: token,
          'X-APP-Key': env.bkash.appKey,
        },
      }
    );

    return {
      id: response.data.paymentID,
      client_secret: response.data.bkashURL,
      ...response.data,
    };
  }

  async verifyPayment(transactionId: string) {
    const token = await this.getToken();

    const response = await axios.post(
      `${this.baseUrl}/tokenized/checkout/payment/status`,

      {
        paymentID: transactionId,
      },

      {
        headers: {
          Authorization: token,
          'X-APP-Key': env.bkash.appKey,
        },
      }
    );

    return response.data;
  }

  async executePayment(paymentId: string) {
    const token = await this.getToken();

    const response = await axios.post(
      `${this.baseUrl}/tokenized/checkout/execute`,

      {
        paymentID: paymentId,
      },

      {
        headers: {
          Authorization: token,
          'X-APP-Key': env.bkash.appKey,
        },
      }
    );

    return response.data;
  }
}
