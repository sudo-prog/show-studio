import React from 'react';
import { X, MousePointer, Smartphone, Eye, Sparkles } from './icons';
import { useStore } from '../../context/StoreContext';

export const HowToExploreModal: React.FC = () => {
  const { isInfoModalOpen, setIsInfoModalOpen } = useStore();

  if (!isInfoModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
      <div
        onClick={() => setIsInfoModalOpen(false)}
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
      />

      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto pointer-events-auto p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Eye className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-stone-900">How to Explore the Virtual Store</h2>
          </div>
          <button
            onClick={() => setIsInfoModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
              <MousePointer className="w-4 h-4 text-stone-700" />
              <span>Desktop Navigation</span>
            </div>
            <ul className="space-y-1.5 text-stone-600 pl-6 list-disc">
              <li>
                <strong>Look around:</strong> Click and drag anywhere in the room to rotate 360°.
              </li>
              <li>
                <strong>Clothing Rack:</strong> Hover your cursor over garments; they smoothly turn to face you while neighbours glide aside.
              </li>
              <li>
                <strong>Glide to Wall:</strong> Click department buttons in the bottom pill bar (Clothing, Caps, Bags, Shoes).
              </li>
              <li>
                <strong>Inspect Product:</strong> Click any product to open it, drag horizontally to spin 360°, and choose your size.
              </li>
              <li>
                <strong>Return to Overview:</strong> Press <kbd className="px-1.5 py-0.5 rounded bg-stone-200 font-mono text-[10px]">Esc</kbd> or double-click the room.
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
              <Smartphone className="w-4 h-4 text-stone-700" />
              <span>Mobile & Touch Gestures</span>
            </div>
            <ul className="space-y-1.5 text-stone-600 pl-6 list-disc">
              <li>
                <strong>Swipe to look:</strong> One-finger swipe rotates the camera around the showroom.
              </li>
              <li>
                <strong>Slide display:</strong> Swipe horizontally inside a section to pan along shelves and rails.
              </li>
              <li>
                <strong>Pinch-to-zoom:</strong> Use two fingers to zoom in for closer fabric and material inspection.
              </li>
              <li>
                <strong>Two-tap inspect:</strong> First tap turns the product to face you; second tap opens the focus card.
              </li>
            </ul>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Merchant Customizer:</strong> Click the <em>Merchant Studio</em> badge at top-left to customize brand names, themes, currencies, and products in real time!
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsInfoModalOpen(false)}
          className="mt-6 w-full py-3 rounded-2xl bg-stone-950 text-white font-bold text-xs hover:bg-stone-900 transition-all cursor-pointer shadow-md"
        >
          Got it, let's explore!
        </button>
      </div>
    </div>
  );
};
