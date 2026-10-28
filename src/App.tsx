/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { StoreCanvas } from './components/3d/StoreCanvas';
import { Header } from './components/ui/Header';
import { BottomPillBar } from './components/ui/BottomPillBar';
import { ProductModal } from './components/ui/ProductModal';
import { CartDrawer } from './components/ui/CartDrawer';
import { CheckoutModal } from './components/ui/CheckoutModal';
import { MerchantStudioModal } from './components/ui/MerchantStudioModal';
import { HowToExploreModal } from './components/ui/HowToExploreModal';
import { FlyToCartOverlay } from './components/ui/FlyToCartOverlay';

const VirtualStoreApp: React.FC = () => {
  const { brandSettings } = useStore();

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none"
      style={{ backgroundColor: brandSettings.floorColor || '#e8e5de' }}
    >
      {/* 3D Scene Viewport */}
      <StoreCanvas />

      {/* Persistent HTML Overlay */}
      <Header />
      <BottomPillBar />

      {/* Interactive Modals and Drawers */}
      <ProductModal />
      <CartDrawer />
      <CheckoutModal />
      <MerchantStudioModal />
      <HowToExploreModal />
      <FlyToCartOverlay />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <CartProvider>
        <VirtualStoreApp />
      </CartProvider>
    </StoreProvider>
  );
}
