import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SectionId, Product, BrandSettings, ProductCategory } from '../types/store';
import { ALL_PRODUCTS } from '../data/catalog';
import { DEFAULT_BRAND_SETTINGS, THEME_PRESETS } from '../data/merchantPresets';

interface StoreContextType {
  activeSection: SectionId;
  setActiveSection: (section: SectionId) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  openProduct: (product: Product) => void;
  closeProduct: () => void;
  stepProduct: (direction: 'next' | 'prev') => void;
  brandSettings: BrandSettings;
  setBrandSettings: React.Dispatch<React.SetStateAction<BrandSettings>>;
  applyThemePreset: (presetId: string) => void;
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (open: boolean) => void;
  isInfoModalOpen: boolean;
  setIsInfoModalOpen: (open: boolean) => void;
  inventory: Product[];
  updateProduct: (updated: Product) => void;
  resetInventory: () => void;
  touchInteractionHintShown: boolean;
  setTouchInteractionHintShown: (shown: boolean) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const BRAND_STORAGE_KEY = 'virtual_store_brand_v1';
const INVENTORY_STORAGE_KEY = 'virtual_store_inventory_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<SectionId>('clothing');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [touchInteractionHintShown, setTouchInteractionHintShown] = useState(false);

  const [brandSettings, setBrandSettings] = useState<BrandSettings>(() => {
    try {
      const saved = localStorage.getItem(BRAND_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_BRAND_SETTINGS;
    } catch {
      return DEFAULT_BRAND_SETTINGS;
    }
  });

  const [inventory, setInventory] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(INVENTORY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ALL_PRODUCTS;
    } catch {
      return ALL_PRODUCTS;
    }
  });

  // Sync brand settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brandSettings));
      const splashLogo = document.getElementById('splash-brand-name');
      if (splashLogo) {
        splashLogo.textContent = brandSettings.brandName;
      }
    } catch (e) {
      console.warn(e);
    }
  }, [brandSettings]);

  // Sync inventory
  useEffect(() => {
    try {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
    } catch (e) {
      console.warn(e);
    }
  }, [inventory]);

  // Remove splash screen once app mounted
  useEffect(() => {
    const splash = document.getElementById('splash');
    if (splash) {
      setTimeout(() => {
        splash.classList.add('done');
      }, 350);
    }
  }, []);

  const openProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const closeProduct = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const stepProduct = useCallback(
    (direction: 'next' | 'prev') => {
      if (!selectedProduct) return;
      const categoryProducts = inventory.filter((p) => p.category === selectedProduct.category);
      if (categoryProducts.length <= 1) return;

      const currentIndex = categoryProducts.findIndex((p) => p.id === selectedProduct.id);
      let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex >= categoryProducts.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = categoryProducts.length - 1;

      setSelectedProduct(categoryProducts[nextIndex]);
    },
    [selectedProduct, inventory]
  );

  const applyThemePreset = useCallback((presetId: string) => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setBrandSettings(preset.settings);
    }
  }, []);

  const updateProduct = useCallback((updated: Product) => {
    setInventory((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedProduct((current) => (current?.id === updated.id ? updated : current));
  }, []);

  const resetInventory = useCallback(() => {
    setInventory(ALL_PRODUCTS);
  }, []);

  // Keyboard shortcut: Esc returns to overview or closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedProduct) {
          closeProduct();
        } else if (activeSection !== 'store') {
          setActiveSection('store');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct, activeSection, closeProduct]);

  return (
    <StoreContext.Provider
      value={{
        activeSection,
        setActiveSection,
        selectedProduct,
        setSelectedProduct,
        openProduct,
        closeProduct,
        stepProduct,
        brandSettings,
        setBrandSettings,
        applyThemePreset,
        isCustomizerOpen,
        setIsCustomizerOpen,
        isInfoModalOpen,
        setIsInfoModalOpen,
        inventory,
        updateProduct,
        resetInventory,
        touchInteractionHintShown,
        setTouchInteractionHintShown,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
