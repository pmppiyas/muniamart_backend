import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '../module/auth/auth.interface';

export const createUserToken = (user: { id: string; email: string; role: Role | string }) => {
  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    env.JWT.ACCESS_TOKEN,
    env.JWT.ACCESS_EXPIRED
  );

  const refreshToken = generateToken(
    jwtPayload,
    env.JWT.REFRESH_SECRET,
    env.JWT.REFRESH_EXPIRED
  );
  return {
    accessToken,
    refreshToken,
  };
};

export const generateToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: string | number = '1d'
): string => {
  const token = jwt.sign(payload, secret, {
    expiresIn,
    algorithm: 'HS256',
  } as SignOptions);

  return token;
};

export const verifyToken = (token: string, secret: string) => {
  const verifiedToken = jwt.verify(token, secret);
  return verifiedToken;
};
