import axios from 'axios';
import { env } from './env';

export const bkashClient = axios.create({
  baseURL: env.bkash.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});
