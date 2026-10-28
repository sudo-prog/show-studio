import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPrice,
  validateProductSelection,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  calculateCartTotals,
} from './cartLogic';
import { Product, CartItem } from '../types/store';

const mockProduct: Product = {
  id: 'test-garment',
  category: 'clothing',
  name: 'Minimal Puffer Jacket',
  price: 120,
  colorway: 'Burnt Orange',
  description: 'Technical insulated down jacket.',
  sizes: ['S', 'M', 'L', 'XL'],
  soldOutSizes: ['XL'],
  productType: 'garment',
  inStock: true,
  views: {
    front: { size: [0.63, 0.72], anchor: [0.5, 0.01], imageUrl: '/sample.png' },
    side: { size: [0.21, 0.74], anchor: [0.59, 0.01], imageUrl: '/sample-side.png' },
    back: { size: [0.62, 0.7], anchor: [0.5, 0.01], imageUrl: '/sample-back.png' },
  },
};

test('formatPrice formats amounts in different currencies', () => {
  assert.equal(formatPrice(100, 'USD'), '$100.00');
  assert.equal(formatPrice(100, 'EUR'), '€92.00');
  assert.equal(formatPrice(100, 'JPY'), '¥15,500');
});

test('validateProductSelection rejects empty or sold out sizes', () => {
  assert.equal(validateProductSelection(mockProduct, null).valid, false);
  assert.equal(validateProductSelection(mockProduct, '').valid, false);
  assert.equal(validateProductSelection(mockProduct, 'XL').valid, false);
  assert.equal(validateProductSelection(mockProduct, 'XXL').valid, false);
  assert.equal(validateProductSelection(mockProduct, 'M').valid, true);
});

test('addItemToCart adds new item or increments existing', () => {
  let cart: CartItem[] = [];
  cart = addItemToCart(cart, mockProduct, 'M');
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 1);
  assert.equal(cart[0].size, 'M');

  cart = addItemToCart(cart, mockProduct, 'M');
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 2);

  cart = addItemToCart(cart, mockProduct, 'S');
  assert.equal(cart.length, 2);
});

test('updateItemQuantity adjusts quantity or removes when reaching 0', () => {
  let cart: CartItem[] = [
    {
      cartItemId: 'test-garment__M',
      productId: 'test-garment',
      name: 'Minimal Puffer Jacket',
      category: 'clothing',
      price: 120,
      size: 'M',
      colorway: 'Burnt Orange',
      quantity: 2,
      thumbnail: '/sample.png',
    },
  ];

  cart = updateItemQuantity(cart, 'test-garment__M', 1);
  assert.equal(cart[0].quantity, 3);

  cart = updateItemQuantity(cart, 'test-garment__M', -2);
  assert.equal(cart[0].quantity, 1);

  cart = updateItemQuantity(cart, 'test-garment__M', -1);
  assert.equal(cart.length, 0);
});

test('removeItemFromCart removes specific line item', () => {
  const cart: CartItem[] = [
    {
      cartItemId: 'item-1',
      productId: 'p1',
      name: 'Product 1',
      category: 'clothing',
      price: 50,
      size: 'M',
      colorway: 'Black',
      quantity: 1,
      thumbnail: '',
    },
    {
      cartItemId: 'item-2',
      productId: 'p2',
      name: 'Product 2',
      category: 'shoes',
      price: 90,
      size: '10',
      colorway: 'White',
      quantity: 1,
      thumbnail: '',
    },
  ];

  const updated = removeItemFromCart(cart, 'item-1');
  assert.equal(updated.length, 1);
  assert.equal(updated[0].cartItemId, 'item-2');
});

test('calculateCartTotals computes subtotal, free shipping logic, and tax', () => {
  const cart: CartItem[] = [
    {
      cartItemId: 'item-1',
      productId: 'p1',
      name: 'Shirt',
      category: 'clothing',
      price: 40,
      size: 'M',
      colorway: 'Blue',
      quantity: 2,
      thumbnail: '',
    },
  ];

  const totals1 = calculateCartTotals(cart, 100, 10);
  assert.equal(totals1.itemCount, 2);
  assert.equal(totals1.subtotal, 80);
  assert.equal(totals1.shipping, 10);
  assert.equal(totals1.freeShippingQualified, false);
  assert.equal(totals1.amountNeededForFreeShipping, 20);

  const cart2: CartItem[] = [
    ...cart,
    {
      cartItemId: 'item-2',
      productId: 'p2',
      name: 'Cap',
      category: 'caps',
      price: 35,
      size: 'One Size',
      colorway: 'Black',
      quantity: 1,
      thumbnail: '',
    },
  ];
  const totals2 = calculateCartTotals(cart2, 100, 10);
  assert.equal(totals2.subtotal, 115);
  assert.equal(totals2.shipping, 0);
  assert.equal(totals2.freeShippingQualified, true);
});
