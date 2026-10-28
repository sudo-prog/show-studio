import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product } from '../types/store';
import {
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  calculateCartTotals,
  CartTotals,
} from '../utils/cartLogic';

interface FlyingAnimationData {
  id: string;
  thumbnail: string;
  startX: number;
  startY: number;
}

interface CartContextType {
  cart: CartItem[];
  totals: CartTotals;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  addToCart: (product: Product, size: string, sourceCoords?: { x: number; y: number }) => boolean;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  flyingItem: FlyingAnimationData | null;
  setFlyingItem: (data: FlyingAnimationData | null) => void;
  isCartBouncing: boolean;
  isProductInCart: (productId: string, size?: string) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'virtual_store_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [flyingItem, setFlyingItem] = useState<FlyingAnimationData | null>(null);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const totals = calculateCartTotals(cart);

  const addToCart = useCallback(
    (product: Product, size: string, sourceCoords?: { x: number; y: number }): boolean => {
      if (!size) return false;

      const thumbnail =
        product.views.front?.imageUrl ||
        product.views.outer?.imageUrl ||
        '';

      if (sourceCoords) {
        setFlyingItem({
          id: `${product.id}-${Date.now()}`,
          thumbnail,
          startX: sourceCoords.x,
          startY: sourceCoords.y,
        });

        setTimeout(() => {
          setIsCartBouncing(true);
          setTimeout(() => setIsCartBouncing(false), 500);
        }, 750);
      }

      setCart((prev) => addItemToCart(prev, product, size));
      return true;
    },
    []
  );

  const updateQuantity = useCallback((cartItemId: string, delta: number) => {
    setCart((prev) => updateItemQuantity(prev, cartItemId, delta));
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setCart((prev) => removeItemFromCart(prev, cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const isProductInCart = useCallback(
    (productId: string, size?: string): boolean => {
      if (size) {
        return cart.some((i) => i.productId === productId && i.size === size);
      }
      return cart.some((i) => i.productId === productId);
    },
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        totals,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        flyingItem,
        setFlyingItem,
        isCartBouncing,
        isProductInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
