import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import router from './routes/routes';
import { globalErrorHandler } from './middleware/globalErrorHandler';
import passport from 'passport';
import './config/passport';

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) return callback(null, true);
      const allowed = [
        'http://localhost:3000',
        'http://localhost:5000',
        'https://muniamart.vercel.app',
      ];
      if (
        allowed.includes(requestOrigin) ||
        requestOrigin.endsWith('.vercel.app') ||
        requestOrigin.includes('192.168.')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(passport.initialize());

app.use(
  '/api/v1/payment/webhook/stripe',
  express.raw({ type: 'application/json' })
);

app.use(express.json());
app.set('trust proxy', 1);
app.use(compression());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.send('API is running');
});

app.use('/api/v1', router);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route Not Found',
  });
});

app.use(globalErrorHandler);

export default app;
