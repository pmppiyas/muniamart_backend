import prisma from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { StatusCodes } from 'http-status-codes';

interface IUpdateProfilePayload {
  name?: string;
  phone?: string;
  photoUrl?: string;
}

const getMyProfile = async (customerId: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      photoUrl: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  if (!customer) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Customer not found');
  }

  return customer;
};

const updateMyProfile = async (
  customerId: string,
  payload: IUpdateProfilePayload
) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Customer not found');
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id: customerId },
    data: {
      name: payload.name ?? customer.name,
      phone: payload.phone ?? customer.phone,
      photoUrl: payload.photoUrl ?? customer.photoUrl,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      photoUrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedCustomer;
};

export const CustomerServices = {
  getMyProfile,
  updateMyProfile,
};
