import Stripe from 'stripe';
import { env } from './env';

export const stripe = new Stripe(env.stripe.secretKey, {
  apiVersion: '2026-06-24.dahlia',
});
