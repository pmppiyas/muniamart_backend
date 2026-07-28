import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { IJwtPayload } from '../auth/auth.interface';
import { PaymentServices } from './payment.services';
import { IbKashCallback } from './payment.interface';

const createPayment = catchAsync(async (req, res) => {
  const result = await PaymentServices.createPayment(
    req.user as IJwtPayload,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Payment initiated successfully',
    data: result,
  });
});

const stripeWebhook = catchAsync(async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;

  const result = await PaymentServices.handleStripeWebhook(
    req.body as Buffer,
    signature
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Webhook processed successfully',
    data: result,
  });
});

const bkashCallback = catchAsync(async (req, res) => {
  const result = await PaymentServices.handleBkashCallback(
    req.query as unknown as IbKashCallback
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'bKash callback processed successfully',
    data: result,
  });
});

export const PaymentController = {
  createPayment,
  stripeWebhook,
  bkashCallback,
};
