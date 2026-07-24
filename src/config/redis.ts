import { createClient } from 'redis';
import { env } from './env';

export const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Error:', err);
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  const cachedData = await redisClient.get(key);

  if (!cachedData) {
    return null;
  }

  return JSON.parse(cachedData) as T;
};

export const setCache = async (
  key: string,
  data: unknown,
  expireTime: number = 3600
): Promise<void> => {
  await redisClient.setEx(key, expireTime, JSON.stringify(data));
};

export const deleteCache = async (...keys: string[]): Promise<void> => {
  if (keys.length === 0) {
    return;
  }

  await redisClient.del(keys);
};
