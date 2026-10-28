export type ProductCategory = 'clothing' | 'shoes' | 'bags' | 'caps';

export type SectionId = 'store' | 'clothing' | 'shoes' | 'bags' | 'caps';

export interface ProductViewManifest {
  size: [number, number]; // [width, height] in meters
  anchor: [number, number]; // [x, y] as fractions of image
  imageUrl: string;
}

export interface Product {
  id: string;
  category: ProductCategory;
  name: string;
  subname?: string;
  price: number;
  colorway: string;
  description: string;
  sizes: string[];
  soldOutSizes: string[];
  views: {
    front: ProductViewManifest;
    side: ProductViewManifest;
    back: ProductViewManifest;
    mirroredSide?: ProductViewManifest;
    outer?: ProductViewManifest;
    inner?: ProductViewManifest;
    toe?: ProductViewManifest;
    heel?: ProductViewManifest;
  };
  productType: 'garment' | 'shoe' | 'bag-crossbody' | 'bag-standing' | 'cap' | 'bucket-hat';
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  cartItemId: string; // productId + size
  productId: string;
  name: string;
  category: ProductCategory;
  price: number;
  size: string;
  colorway: string;
  quantity: number;
  thumbnail: string;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface BrandSettings {
  brandName: string;
  slogan: string;
  logoStyle: 'modern-sans' | 'editorial-serif' | 'technical-mono';
  themeId: string;
  wallColor: string;
  floorColor: string;
  accentColor: string;
  woodColor: string;
  currency: CurrencyCode;
  currencySymbol: string;
}

export interface SectionConfig {
  id: SectionId;
  label: string;
  origin: [number, number, number];
  rotationY: number; // radians
  fitWidth: number;
  fitHeight?: number;
  lookY: number;
  panWidth?: number;
  wallSign: string;
  description: string;
}
