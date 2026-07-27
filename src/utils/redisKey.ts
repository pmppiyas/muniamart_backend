export const CACHE_KEYS = {
  ALL_PRODUCTS: 'products:all',
  PRODUCT: (id: string) => `product:${id}`,

  ALL_CATEGORIES: 'categories:all',
  CATEGORY: (id: string) => `category:${id}`,
};

export const CACHE_TTL = 3600;
