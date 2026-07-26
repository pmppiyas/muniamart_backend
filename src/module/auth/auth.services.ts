import bcrypt from 'bcrypt';
import { ILoginPayload, ISignUp } from './auth.interface';
import prisma from '../../config/prisma';
import { Role, UserStatus } from '@prisma/client';
import { env } from '../../config/env';

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

export const adminSeed = async () => {
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: env.SEED.ADMIN_EMAIL,
    },
  });

  if (existingAdmin) {
    console.log('✅ Admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(
    env.SEED.ADMIN_PASS,
    Number(env.SALT_NUMBER)
  );

  await prisma.user.create({
    data: {
      name: 'System Admin',
      email: env.SEED.ADMIN_EMAIL,
      password: hashedPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('✅ Admin seeded successfully');
};

export const AuthServices = {
  signUp,
};
