import { BrandSettings } from '../types/store';

export interface ThemePreset {
  id: string;
  name: string;
  settings: BrandSettings;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'nike-original',
    name: 'Nike Virtual Store (Original)',
    settings: {
      brandName: 'NIKE',
      slogan: 'Virtual Store',
      logoStyle: 'modern-sans',
      themeId: 'nike-original',
      wallColor: '#e4e2dc',
      floorColor: '#e9e6e0',
      accentColor: '#111111',
      woodColor: '#c5a072',
      currency: 'USD',
      currencySymbol: '$',
    },
  },
  {
    id: 'atelier-beige',
    name: 'Atelier Minimal (Warm Beige)',
    settings: {
      brandName: 'ATELIER',
      slogan: 'Curated Architectural Apparel & Footwear',
      logoStyle: 'modern-sans',
      themeId: 'atelier-beige',
      wallColor: '#e4e2dc',
      floorColor: '#e8e5de',
      accentColor: '#c2410c',
      woodColor: '#c5a072',
      currency: 'USD',
      currencySymbol: '$',
    },
  },
  {
    id: 'kura-scandi',
    name: 'Kura Scandi (Birch & Stone)',
    settings: {
      brandName: 'KURA GOODS',
      slogan: 'Nordic Daily Essentials & Objects',
      logoStyle: 'editorial-serif',
      themeId: 'kura-scandi',
      wallColor: '#ebe9e4',
      floorColor: '#f1eee9',
      accentColor: '#0f766e',
      woodColor: '#d6b88d',
      currency: 'EUR',
      currencySymbol: '€',
    },
  },
  {
    id: 'monolith-noir',
    name: 'Monolith (Sleek Noir)',
    settings: {
      brandName: 'MONOLITH 01',
      slogan: 'Technical Streetwear & Gear',
      logoStyle: 'technical-mono',
      themeId: 'monolith-noir',
      wallColor: '#2b2a2e',
      floorColor: '#1d1c1f',
      accentColor: '#f97316',
      woodColor: '#5c4838',
      currency: 'USD',
      currencySymbol: '$',
    },
  },
];

export const DEFAULT_BRAND_SETTINGS: BrandSettings = THEME_PRESETS[0].settings;
