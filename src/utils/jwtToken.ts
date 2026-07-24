import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export const jwtTokenGen = async (payload: {
  id: string;
  email: string;
  role: string;
}) => {
  const accessToken = jwt.sign(
    { id: payload.id, email: payload.email, role: payload.role },
    env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: '5h',
    }
  ) as SignOptions;

  const refreshToken = jwt.sign(
    { email: payload.email, role: payload.role },
    env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: '30d',
    }
  );

  return {
    accessToken,
    refreshToken,
  };
};
