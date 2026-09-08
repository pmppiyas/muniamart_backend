import prisma from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { StatusCodes } from 'http-status-codes';
import { IAddToCartPayload } from './cart.interface';

const resolveValidCustomerId = async (customerId: string): Promise<string> => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (customer) return customer.id;

  const admin = await prisma.admin.findUnique({
    where: { id: customerId },
  });
  if (admin) {
    let adminCustomer = await prisma.customer.findUnique({
      where: { email: admin.email },
    });
    if (!adminCustomer) {
      adminCustomer = await prisma.customer.create({
        data: {
          name: admin.name,
          email: admin.email,
          password: admin.password,
          status: 'ACTIVE',
        },
      });
    }
    return adminCustomer.id;
  }
  return customerId;
};

const getOrCreateCart = async (customerId: string) => {
  const targetCustomerId = await resolveValidCustomerId(customerId);

  let cart = await prisma.cart.findUnique({
    where: { customerId: targetCustomerId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { customerId: targetCustomerId },
    });
  }

  return cart;
};

const getCart = async (customerId: string) => {
  const targetCustomerId = await resolveValidCustomerId(customerId);

  const cart = await prisma.cart.findUnique({
    where: { customerId: targetCustomerId },
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
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!cart) {
    const newCart = await getOrCreateCart(targetCustomerId);

    return {
      id: newCart.id,
      items: [],
      totalQuantity: 0,
      subtotal: 0,
    };
  }

  const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  return {
    id: cart.id,
    items: cart.items,
    totalQuantity,
    subtotal: Number(subtotal.toFixed(2)),
  };
};

const addToCart = async (customerId: string, payload: IAddToCartPayload) => {
  const product = await prisma.product.findUnique({
    where: { id: payload.productId },
  });

  if (!product) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Product not found');
  }

  if (product.status !== 'ACTIVE') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Product is inactive');
  }

  const cart = await getOrCreateCart(customerId);
  const quantityToAdd = payload.quantity || 1;

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: payload.productId,
    },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantityToAdd;
    if (newQuantity > product.stock) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Cannot add more. Available stock is ${product.stock}`
      );
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: newQuantity,
        selectedVariants: payload.selectedVariants || existingItem.selectedVariants || undefined,
      },
    });
  } else {
    if (quantityToAdd > product.stock) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Requested quantity exceeds available stock (${product.stock})`
      );
    }

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: payload.productId,
        quantity: quantityToAdd,
        selectedVariants: payload.selectedVariants || undefined,
      },
    });
  }

  return await getCart(customerId);
};

const updateCartItemQuantity = async (
  customerId: string,
  cartItemId: string,
  quantity: number
) => {
  const targetCustomerId = await resolveValidCustomerId(customerId);
  const cart = await prisma.cart.findUnique({
    where: { customerId: targetCustomerId },
  });

  if (!cart) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Cart not found');
  }

  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cartId: cart.id,
    },
    include: { product: true },
  });

  if (!cartItem) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Cart item not found');
  }

  if (quantity > cartItem.product.stock) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Requested quantity exceeds available stock (${cartItem.product.stock})`
    );
  }

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  return await getCart(targetCustomerId);
};

const removeCartItem = async (customerId: string, cartItemId: string) => {
  const targetCustomerId = await resolveValidCustomerId(customerId);
  const cart = await prisma.cart.findUnique({
    where: { customerId: targetCustomerId },
  });

  if (!cart) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Cart not found');
  }

  await prisma.cartItem.deleteMany({
    where: {
      id: cartItemId,
      cartId: cart.id,
    },
  });

  return await getCart(targetCustomerId);
};

const clearCart = async (customerId: string) => {
  const targetCustomerId = await resolveValidCustomerId(customerId);
  const cart = await prisma.cart.findUnique({
    where: { customerId: targetCustomerId },
  });

  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  return { message: 'Cart cleared successfully' };
};

export const CartServices = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
