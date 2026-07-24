export const CACHE_KEYS = {
  ALL_PRODUCTS: 'products:all',
  PRODUCT: (id: string) => `product:${id}`,
};

export const CACHE_TTL = 3600;
