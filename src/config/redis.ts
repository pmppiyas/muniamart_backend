import { createClient } from 'redis';
import { env } from './env';

const redisUrl =
  env.REDIS_URL?.includes('upstash.io') && env.REDIS_URL.startsWith('redis://')
    ? env.REDIS_URL.replace('redis://', 'rediss://')
    : env.REDIS_URL;

export const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        console.warn('⚠️ Redis: Reconnection aborted after 3 attempts.');
        return false;
      }
      return Math.min(retries * 500, 2000);
    },
  },
});

redisClient.on('connect', () => {
  console.log('✅ Redis socket connected');
});

redisClient.on('ready', () => {
  console.log('✅ Redis connected and ready');
});

redisClient.on('error', (err: any) => {
  console.error('❌ Redis Error:', err.message || err);
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error: any) {
    console.error('❌ Could not connect to Redis:', error.message || error);
    console.warn('⚠️ Server will continue running without Redis cache.');
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    if (!redisClient.isOpen) {
      return null;
    }
    const cachedData = await redisClient.get(key);

    if (!cachedData) {
      return null;
    }

    return JSON.parse(cachedData) as T;
  } catch (error) {
    console.error('Redis getCache error:', error);
    return null;
  }
};

export const setCache = async (
  key: string,
  data: unknown,
  expireTime: number = 3600
): Promise<void> => {
  try {
    if (!redisClient.isOpen) {
      return;
    }
    await redisClient.setEx(key, expireTime, JSON.stringify(data));
  } catch (error) {
    console.error('Redis setCache error:', error);
  }
};

export const deleteCache = async (...keys: string[]): Promise<void> => {
  try {
    if (!redisClient.isOpen || keys.length === 0) {
      return;
    }
    await redisClient.del(keys);
  } catch (error) {
    console.error('Redis deleteCache error:', error);
  }
};
