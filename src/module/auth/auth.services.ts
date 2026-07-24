import bcrypt from 'bcrypt';
import { ILoginPayload, ISignUp } from './auth.interface';
import prisma from '../../config/prisma';
import { Role, UserStatus } from '@prisma/client';
import { env } from '../../config/env';
import { AppError } from '../../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { jwtTokenGen } from '../../utils/jwtToken';

const signUp = async (payload: ISignUp) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (isUserExist) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(env.SALT_NUMBER)
  );

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      photoUrl: payload.photoUrl,
      role: Role.USER,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      name: true,
      email: true,
      photoUrl: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return user;
};

const signIn = async (payload: ILoginPayload) => {
  const user = await prisma.user.findFirst({
    where: {
      email: payload.email,
      status: 'ACTIVE',
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not exist by this gmail.');
  }

  const isCorrectPass = await bcrypt.compare(payload.password, user.password);
  if (!isCorrectPass) {
    throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'This password is wrong');
  }

  const { accessToken, refreshToken } = await jwtTokenGen({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const AuthServices = {
  signUp,
  signIn,
};
