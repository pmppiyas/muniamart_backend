import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env').toString() });

export const env = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV as string,
  DATABASE_URL: process.env.DATABASE_URL as string,

  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUD_NAME as string,
    API_KEY: process.env.API_KEY as string,
    API_SECRET: process.env.API_SECRET as string,
  },

  SALT_NUMBER: process.env.SALT_NUMBER as string,

  JWT: {
    ACCESS_TOKEN: process.env.ACCESS_TOKEN as string,
    ACCESS_EXPIRED: process.env.ACCESS_EXPIRED as string,
    REFRESH_SECRET: process.env.REFRESH_SECRET as string,
    REFRESH_EXPIRED: process.env.REFRESH_EXPIRED as string,
  },
};
