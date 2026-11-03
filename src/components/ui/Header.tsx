import React from 'react';
import { Store } from './icons';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';

export const Header: React.FC = () => {
  const { brandSettings, setActiveSection, selectedProduct } = useStore();
  const { totals, isCartBouncing, setIsCartOpen } = useCart();

  const isNike = brandSettings.brandName.toUpperCase() === 'NIKE';

  const getLogoFontClass = () => {
    switch (brandSettings.logoStyle) {
      case 'editorial-serif':
        return 'font-serif italic font-bold tracking-tight';
      case 'technical-mono':
        return 'font-mono uppercase font-black tracking-widest';
      case 'modern-sans':
      default:
        return 'font-sans font-black italic tracking-tighter uppercase';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between pointer-events-none transition-all">
      {/* Left: Close button when product is open */}
      {selectedProduct ? (
        <button
          onClick={() => setActiveSection('store')}
          title="Return to 360° Showroom Overview"
          aria-label="Close product view"
          className="text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
        >
          Close
        </button>
      ) : (
        <div className="hidden">
          <button
            onClick={() => setActiveSection('store')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 hover:bg-white text-stone-800 text-xs font-medium shadow-sm backdrop-blur-md border border-stone-200/60 transition-all active:scale-95 cursor-pointer"
            title="Return to 360° Showroom Overview"
          >
            <Store className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">360° Overview</span>
          </button>
        </div>
      )}

      {/* Center: Brand Wordmark (Iconic Nike lockup matching virtualstore.bildyard.com or custom merchant) */}
      <div className="absolute left-1/2 -translate-x-1/2 top-3 sm:top-4 flex flex-col items-center pointer-events-auto text-center">
        <button
          onClick={() => setActiveSection('store')}
          className="group flex flex-col items-center transition-transform hover:scale-[1.02] cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className={`text-xl sm:text-2xl text-stone-950 font-black tracking-tight ${getLogoFontClass()}`}>
              {brandSettings.brandName}
            </span>
            {isNike && (
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 sm:w-7 sm:h-7 -mt-1 text-stone-950 fill-current">
                <path d="M24 7.8L6.442 15.276c-1.456.616-2.679.925-3.668.925-1.12 0-1.933-.392-2.437-1.177-.317-.504-.41-1.143-.28-1.918.13-.775.476-1.6 1.036-2.478.467-.71 1.232-1.643 2.297-2.8a6.122 6.122 0 0 0-.784 1.848c-.28 1.195-.028 2.072.756 2.632.373.261.886.392 1.54.392.522 0 1.11-.084 1.764-.252L24 7.8z" />
              </svg>
            )}
          </div>
          <div className="text-[9px] sm:text-[10px] tracking-[0.32em] uppercase text-stone-500 font-semibold mt-1">
            {brandSettings.slogan || 'Virtual Store'}
          </div>
        </button>
      </div>

      {/* Right: Cart Button with Count Badge */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          id="cart-button"
          onClick={() => setIsCartOpen(true)}
          className="relative p-2.5 sm:p-3 rounded-full bg-white/80 hover:bg-white text-stone-900 shadow-sm hover:shadow-md backdrop-blur-md border border-stone-200/60 transition-all active:scale-90 cursor-pointer"
          aria-label={`Cart, ${totals.itemCount} items`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 text-stone-800 fill-none">
            <path d="M13 7.5h11l-.9 13.2a1.3 1.3 0 0 1-1.3 1.2h-2.3M16 7.5V6a2.5 2.5 0 1 1 5 0v1.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3.5 11h14l-1 13.3a1.4 1.4 0 0 1-1.4 1.3H5.9a1.4 1.4 0 0 1-1.4-1.3L3.5 11z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {totals.itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
              {totals.itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
