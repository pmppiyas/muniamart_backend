import prisma from '../config/prisma';

export const resolveCustomer = async (user: {
  userId: string;
  email?: string;
  role?: string;
}) => {
  let customer = await prisma.customer.findUnique({
    where: { id: user.userId },
  });

  if (customer) {
    return customer;
  }

  const emailToLookup = user.email;
  if (emailToLookup) {
    customer = await prisma.customer.findUnique({
      where: { email: emailToLookup },
    });
    if (customer) {
      return customer;
    }
  }

  const admin = await prisma.admin.findUnique({
    where: { id: user.userId },
  });

  const emailToUse = user.email || admin?.email;
  if (emailToUse) {
    customer = await prisma.customer.findUnique({
      where: { email: emailToUse },
    });
    if (customer) {
      return customer;
    }
  }

  if (admin || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    customer = await prisma.customer.create({
      data: {
        name: admin?.name || 'Admin User',
        email: emailToUse || `${user.userId}@admin.internal`,
        password: admin?.password || 'admin_placeholder_password',
        status: 'ACTIVE',
      },
    });
    return customer;
  }

  return null;
};
