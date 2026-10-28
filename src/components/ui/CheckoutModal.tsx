import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, CheckCircle, ShieldCheck, CreditCard, Truck } from './icons';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../utils/cartLogic';

export const CheckoutModal: React.FC = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, cart, totals, clearCart } = useCart();
  const { brandSettings } = useStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [email, setEmail] = useState('collector@atelier.studio');
  const [fullName, setFullName] = useState('Alex Mercer');
  const [address, setAddress] = useState('452 Mercer St, Suite 4B');
  const [city, setCity] = useState('New York');
  const [postal, setPostal] = useState('10013');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');

  if (!isCheckoutOpen) return null;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedOrder = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderNumber(generatedOrder);
      setIsSubmitting(false);
      setOrderComplete(true);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      clearCart();
    }, 1200);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderComplete(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
      />

      <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto pointer-events-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-stone-900">
              {orderComplete ? 'Order Confirmation' : `${brandSettings.brandName} Express Checkout`}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderComplete ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-stone-900">Thank you for your order!</h3>
              <p className="text-xs text-stone-500 mt-1">
                Order confirmation and tracking details sent to <strong className="text-stone-800">{email}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-1.5 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-stone-500">Order ID:</span>
                <span className="font-mono font-bold text-stone-900">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Total Paid:</span>
                <span className="font-bold text-stone-900">
                  {formatPrice(totals.total, brandSettings.currency, brandSettings.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Shipping To:</span>
                <span className="font-medium text-stone-800">{address}, {city}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="mt-6 w-full py-3.5 rounded-2xl bg-stone-950 text-white font-bold text-xs hover:bg-stone-900 transition-all cursor-pointer shadow-md"
            >
              Continue Browsing Showroom
            </button>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="p-6 sm:p-8 space-y-5">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-stone-600" />
                <span className="text-stone-600">
                  {totals.itemCount} items · Express Dispatch
                </span>
              </div>
              <span className="font-extrabold text-stone-950 text-sm">
                {formatPrice(totals.total, brandSettings.currency, brandSettings.currencySymbol)}
              </span>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Shipping Address
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-stone-900 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-stone-900 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street Address"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-stone-900 focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    value={postal}
                    onChange={(e) => setPostal(e.target.value)}
                    placeholder="ZIP / Postal Code"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-stone-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                Payment Simulation
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-stone-900 focus:outline-none font-mono"
                />
                <CreditCard className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <span className="absolute right-3.5 top-2.5 text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-600 font-semibold">
                  TEST MODE
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-stone-950 hover:bg-stone-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>
                  Authorize & Place Order · {formatPrice(totals.total, brandSettings.currency, brandSettings.currencySymbol)}
                </span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
