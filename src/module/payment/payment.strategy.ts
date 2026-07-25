export interface IPaymentStrategy {
  createPayment(orderId: string, amount: number): Promise<any>;

  verifyPayment(transactionId: string): Promise<any>;
}
