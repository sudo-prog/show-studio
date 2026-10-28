import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from './icons';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../utils/cartLogic';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    totals,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    setIsCheckoutOpen,
  } = useCart();
  const { brandSettings } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Dim backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          aria-label="Shopping Cart Drawer"
          className="w-screen max-w-md bg-stone-50 shadow-2xl flex flex-col border-l border-stone-200"
        >
          {/* Header */}
          <div className="p-6 bg-white border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-900" />
              <h2 className="text-lg font-bold text-stone-900">Your Bag</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                {totals.itemCount}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-100 text-xs text-amber-900">
            {totals.freeShippingQualified ? (
              <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                🎉 Congratulations! You have unlocked Free Express Shipping!
              </span>
            ) : (
              <span>
                Add{' '}
                <strong className="font-bold">
                  {formatPrice(totals.amountNeededForFreeShipping, brandSettings.currency, brandSettings.currencySymbol)}
                </strong>{' '}
                more to receive <strong className="font-bold">Free Shipping</strong>!
              </span>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-stone-400">
                <ShoppingBag className="w-12 h-12 mb-3 stroke-1" />
                <p className="text-base font-semibold text-stone-700">Your shopping bag is empty</p>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  Explore the 3D showroom to discover handcrafted outerwear, footwear, caps, and gear.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-all cursor-pointer"
                >
                  Start Exploring
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex gap-4 p-4 rounded-2xl bg-white border border-stone-200/80 shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl bg-stone-100 p-2 flex items-center justify-center shrink-0">
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-stone-900 leading-snug">
                          {item.name}
                        </h3>
                        <span className="text-xs font-bold text-stone-950">
                          {formatPrice(item.price * item.quantity, brandSettings.currency, brandSettings.currencySymbol)}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                        Size: <span className="text-stone-800 font-semibold">{item.size}</span> · {item.colorway}
                      </p>
                    </div>

                    {/* Stepper & Remove */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="p-1 hover:bg-stone-200/60 rounded-l-lg transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="p-1 hover:bg-stone-200/60 rounded-r-lg transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Totals & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-stone-200 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">
                    {formatPrice(totals.subtotal, brandSettings.currency, brandSettings.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-stone-900">
                    {totals.shipping === 0
                      ? 'FREE'
                      : formatPrice(totals.shipping, brandSettings.currency, brandSettings.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-stone-900">
                    {formatPrice(totals.tax, brandSettings.currency, brandSettings.currencySymbol)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-stone-950 pt-2 border-t border-stone-100">
                  <span>Total</span>
                  <span>
                    {formatPrice(totals.total, brandSettings.currency, brandSettings.currencySymbol)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3.5 rounded-2xl bg-stone-950 hover:bg-stone-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer mt-2"
              >
                <span>Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
