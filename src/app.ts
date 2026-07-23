import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import router from './routes/routes';

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:3000'],
    credentials: true,
  })
);

app.use(express.json());
app.set('trust proxy', 1);
app.use(compression());
app.use(express.urlencoded({ extended: true }));

// Default route for testing
app.get('/', (_req, res) => {
  res.send('API is running');
});

app.use('/api/v1', router);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route Not Found',
  });
});

export default app;
