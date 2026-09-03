import bcrypt from 'bcrypt';
import { ISignUp } from './auth.interface';
import prisma from '../../config/prisma';
import { AdminRole, AdminStatus, CustomerStatus } from '@prisma/client';
import { env } from '../../config/env';

const signUp = async (payload: ISignUp) => {
  const isCustomerExist = await prisma.customer.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (isCustomerExist) {
    throw new Error('Customer already exists');
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(env.SALT_NUMBER)
  );

  const customer = await prisma.customer.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
      photoUrl: payload.photoUrl,
      status: CustomerStatus.ACTIVE,
      cart: {
        create: {},
      },
      wishlist: {
        create: {},
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      photoUrl: true,
      status: true,
      createdAt: true,
    },
  });

  return customer;
};

export const adminSeed = async () => {
  const existingAdmin = await prisma.admin.findUnique({
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

  await prisma.admin.create({
    data: {
      name: 'System Admin',
      email: env.SEED.ADMIN_EMAIL,
      password: hashedPassword,
      role: AdminRole.ADMIN,
      status: AdminStatus.ACTIVE,
    },
  });

  console.log('✅ Admin seeded successfully');
};

export const AuthServices = {
  signUp,
};
