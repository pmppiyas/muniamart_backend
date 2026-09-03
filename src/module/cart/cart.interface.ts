export interface IAddToCartPayload {
  productId: string;
  quantity?: number;
  selectedVariants?: Record<string, string>;
}

export interface IUpdateCartItemPayload {
  quantity: number;
}
