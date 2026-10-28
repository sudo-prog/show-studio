import { CartItem, Product, CurrencyCode } from '../types/store';

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  freeShippingQualified: boolean;
  amountNeededForFreeShipping: number;
}

export const CURRENCY_RATES: Record<CurrencyCode, { symbol: string; rate: number; decimals: number }> = {
  USD: { symbol: '$', rate: 1.0, decimals: 2 },
  EUR: { symbol: '€', rate: 0.92, decimals: 2 },
  GBP: { symbol: '£', rate: 0.79, decimals: 2 },
  JPY: { symbol: '¥', rate: 155.0, decimals: 0 },
};

export function formatPrice(
  usdAmount: number,
  currency: CurrencyCode = 'USD',
  overrideSymbol?: string
): string {
  const meta = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const symbol = overrideSymbol || meta.symbol;
  const converted = usdAmount * meta.rate;

  if (meta.decimals === 0) {
    return `${symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${symbol}${converted.toFixed(meta.decimals)}`;
}

export function validateProductSelection(
  product: Product,
  selectedSize: string | null
): { valid: boolean; error?: string } {
  if (!selectedSize || selectedSize.trim() === '') {
    return { valid: false, error: 'Please select a size' };
  }
  if (!product.sizes.includes(selectedSize)) {
    return { valid: false, error: 'Selected size is not available' };
  }
  if (product.soldOutSizes.includes(selectedSize)) {
    return { valid: false, error: 'Selected size is sold out' };
  }
  return { valid: true };
}

export function addItemToCart(
  cart: CartItem[],
  product: Product,
  size: string
): CartItem[] {
  const cartItemId = `${product.id}__${size}`;
  const existingIndex = cart.findIndex((item) => item.cartItemId === cartItemId);

  // Default thumbnail from front view or outer view
  const thumbnail =
    product.views.front?.imageUrl ||
    product.views.outer?.imageUrl ||
    '';

  if (existingIndex >= 0) {
    return cart.map((item, idx) =>
      idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
    );
  }

  const newItem: CartItem = {
    cartItemId,
    productId: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    size,
    colorway: product.colorway,
    quantity: 1,
    thumbnail,
  };

  return [...cart, newItem];
}

export function updateItemQuantity(
  cart: CartItem[],
  cartItemId: string,
  delta: number
): CartItem[] {
  return cart
    .map((item) => {
      if (item.cartItemId === cartItemId) {
        const nextQty = item.quantity + delta;
        return nextQty > 0 ? { ...item, quantity: nextQty } : null;
      }
      return item;
    })
    .filter((item): item is CartItem => item !== null);
}

export function removeItemFromCart(cart: CartItem[], cartItemId: string): CartItem[] {
  return cart.filter((item) => item.cartItemId !== cartItemId);
}

export function calculateCartTotals(
  cart: CartItem[],
  freeShippingThreshold = 100,
  shippingFee = 10
): CartTotals {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingQualified = subtotal >= freeShippingThreshold || subtotal === 0;
  const shipping = subtotal === 0 ? 0 : freeShippingQualified ? 0 : shippingFee;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const tax = subtotal * 0.08; // estimated 8% tax
  const total = subtotal + shipping + tax;

  return {
    itemCount,
    subtotal,
    shipping,
    tax,
    total,
    freeShippingQualified,
    amountNeededForFreeShipping,
  };
}
