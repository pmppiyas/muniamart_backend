import dotenv from 'dotenv';
import http, { Server } from 'http';
import app from './app';
import { connectRedis } from './config/redis';
import { adminSeed } from './module/auth/auth.services';

dotenv.config();

let server: Server | null = null;

async function startServer() {
  try {
    await connectRedis();
    await adminSeed();
    server = http.createServer(app);
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });

    handleProcessEvents();
  } catch (error) {
    console.error('❌ Error during server startup:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string) {
  console.warn(`🔄 Received ${signal}, shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log('✅ HTTP server closed.');

      try {
        console.log('Server shutdown complete.');
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
      }

      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

function handleProcessEvents() {
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    console.error('💥 Unhandled Rejection:', reason);
    gracefulShutdown('unhandledRejection');
  });
}

// Only start standalone HTTP server when not running in Vercel Serverless environment
if (!process.env.VERCEL) {
  startServer();
}

export default app;
