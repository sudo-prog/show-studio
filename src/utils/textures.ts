/**
 * Texture manifest and path-resolution utilities.
 *
 * All 120 product textures live under src/assets/textures/{categoryDir}/{productId}/{view}.webp
 * and are copied to /public/ at build time by Vite so they are served at:
 *   /{categoryDir}/{productId}/{view}.webp
 *
 * The categoryDir differs from the Product.category enum:
 *   clothing -> garments
 *   shoes    -> shoes
 *   caps     -> caps
 *   bags     -> bags
 */

import { ProductCategory } from '../types/store';

/** Maps Product.category to the on-disk / served directory name. */
export const TEXTURE_CATEGORY_DIR: Record<ProductCategory, string> = {
  clothing: 'garments',
  shoes: 'shoes',
  caps: 'caps',
  bags: 'bags',
};

/** Base public path for all product textures. */
export const TEXTURE_BASE_PATH = '';

/**
 * Resolve the public URL for a product texture view.
 *
 * @param category  Product category ('clothing' | 'shoes' | 'caps' | 'bags')
 * @param productId Product id, e.g. 'swoosh-white'
 * @param view      View name without extension, e.g. 'front', 'outer', 'inner', 'toe', 'heel'
 * @returns         URL like '/garments/swoosh-white/front.webp'
 */
export function getTextureUrl(
  category: ProductCategory,
  productId: string,
  view: string,
): string {
  const dir = TEXTURE_CATEGORY_DIR[category] ?? category;
  // For shoes, certain view keys map to different on-disk filenames
  if (category === 'shoes' && SHOE_VIEW_FILES[view]) {
    return `/${dir}/${productId}/${SHOE_VIEW_FILES[view]}.webp`;
  }
  return `/${dir}/${productId}/${view}.webp`;
}

/**
 * View name mapping for shoe textures.
 * On disk shoes use: front.webp, back.webp, left.webp, right.webp
 * The Product views map:  outer->right, inner->left, toe->front, heel->back
 */
export const SHOE_VIEW_FILES: Record<string, string> = {
  front: 'front',
  back: 'back',
  outer: 'right',
  inner: 'left',
  toe: 'front',
  heel: 'back',
};
