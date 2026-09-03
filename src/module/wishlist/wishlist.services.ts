import prisma from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { StatusCodes } from 'http-status-codes';

const getOrCreateWishlist = async (customerId: string) => {
  let wishlist = await prisma.wishlist.findUnique({
    where: { customerId },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { customerId },
    });
  }

  return wishlist;
};

const getWishlist = async (customerId: string) => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { customerId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              stock: true,
              photoUrl: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!wishlist) {
    const newWishlist = await prisma.wishlist.create({
      data: { customerId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return {
      id: newWishlist.id,
      items: [],
      totalCount: 0,
    };
  }

  return {
    id: wishlist.id,
    items: wishlist.items,
    totalCount: wishlist.items.length,
  };
};

const addToWishlist = async (customerId: string, productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  const wishlist = await getOrCreateWishlist(customerId);

  const existingItem = await prisma.wishlistItem.findFirst({
    where: {
      wishlistId: wishlist.id,
      productId,
    },
  });

  if (!existingItem) {
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });
  }

  return await getWishlist(customerId);
};

const toggleWishlist = async (customerId: string, productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  const wishlist = await getOrCreateWishlist(customerId);

  const existingItem = await prisma.wishlistItem.findFirst({
    where: {
      wishlistId: wishlist.id,
      productId,
    },
  });

  let action: 'added' | 'removed' = 'added';

  if (existingItem) {
    await prisma.wishlistItem.delete({
      where: { id: existingItem.id },
    });
    action = 'removed';
  } else {
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });
    action = 'added';
  }

  const updatedWishlist = await getWishlist(customerId);
  return {
    action,
    wishlist: updatedWishlist,
  };
};

const removeFromWishlist = async (customerId: string, productId: string) => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { customerId },
  });

  if (!wishlist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Wishlist not found');
  }

  await prisma.wishlistItem.deleteMany({
    where: {
      wishlistId: wishlist.id,
      productId,
    },
  });

  return await getWishlist(customerId);
};

const clearWishlist = async (customerId: string) => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { customerId },
  });

  if (wishlist) {
    await prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id },
    });
  }

  return { message: 'Wishlist cleared successfully' };
};

export const WishlistServices = {
  getWishlist,
  addToWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist,
};
