import { stripe } from '../../config/stripe';
import { IPaymentStrategy } from './payment.strategy';

export class StripePayment implements IPaymentStrategy {
  async createPayment(orderId: string, amount: number) {
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: {
        orderId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  async verifyPayment(transactionId: string) {
    return await stripe.paymentIntents.retrieve(transactionId);
  }
}
