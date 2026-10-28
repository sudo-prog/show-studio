import React, { useState } from 'react';
import { X, Sliders, Palette, Tag, Check, RotateCcw, Edit2, Store } from './icons';
import { useStore } from '../../context/StoreContext';
import { THEME_PRESETS } from '../../data/merchantPresets';
import { CurrencyCode, Product } from '../../types/store';
import { formatPrice } from '../../utils/cartLogic';

export const MerchantStudioModal: React.FC = () => {
  const {
    isCustomizerOpen,
    setIsCustomizerOpen,
    brandSettings,
    setBrandSettings,
    applyThemePreset,
    inventory,
    updateProduct,
    resetInventory,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'brand' | 'themes' | 'inventory'>('brand');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isCustomizerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden select-none">
      <div
        onClick={() => setIsCustomizerOpen(false)}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
      />

      <div className="relative z-10 w-full max-w-xl h-full bg-stone-50 shadow-2xl flex flex-col border-l border-stone-200 overflow-hidden pointer-events-auto">
        <div className="p-6 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-stone-900 text-white">
              <Sliders className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Merchant Customization Studio</h2>
              <p className="text-xs text-stone-500">Configure brand identity, store aesthetics & inventory</p>
            </div>
          </div>
          <button
            onClick={() => setIsCustomizerOpen(false)}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-stone-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('brand')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'brand'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Brand & Currency</span>
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'themes'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Showroom Palette</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Inventory Manager</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'brand' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Store Brand Name
                </label>
                <input
                  type="text"
                  value={brandSettings.brandName}
                  onChange={(e) => setBrandSettings({ ...brandSettings, brandName: e.target.value })}
                  placeholder="e.g. ATELIER, KURA, MONOLITH"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold focus:ring-2 focus:ring-stone-900 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Brand Slogan / Subtitle
                </label>
                <input
                  type="text"
                  value={brandSettings.slogan}
                  onChange={(e) => setBrandSettings({ ...brandSettings, slogan: e.target.value })}
                  placeholder="e.g. Curated Architectural Apparel & Footwear"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Brand Typography Style
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'modern-sans', label: 'Modern Sans', sample: 'ATELIER' },
                    { id: 'editorial-serif', label: 'Editorial Serif', sample: 'Atelier' },
                    { id: 'technical-mono', label: 'Technical Mono', sample: 'ATL-01' },
                  ].map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setBrandSettings({ ...brandSettings, logoStyle: font.id as any })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        brandSettings.logoStyle === font.id
                          ? 'border-stone-950 bg-stone-950 text-white shadow-md'
                          : 'border-stone-200 bg-white hover:border-stone-400 text-stone-800'
                      }`}
                    >
                      <div className="text-[10px] opacity-75">{font.label}</div>
                      <div
                        className={`text-sm font-bold mt-1 ${
                          font.id === 'editorial-serif'
                            ? 'font-serif italic'
                            : font.id === 'technical-mono'
                            ? 'font-mono'
                            : 'font-sans'
                        }`}
                      >
                        {font.sample}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Store Currency
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['USD', 'EUR', 'GBP', 'JPY'] as CurrencyCode[]).map((cur) => (
                    <button
                      key={cur}
                      onClick={() => setBrandSettings({ ...brandSettings, currency: cur })}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        brandSettings.currency === cur
                          ? 'border-stone-950 bg-stone-950 text-white'
                          : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300'
                      }`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'themes' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Aesthetic Showroom Presets
                </label>
                <div className="space-y-2.5">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = brandSettings.themeId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => applyThemePreset(preset.id)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-stone-950 bg-white shadow-md ring-2 ring-stone-950/20'
                            : 'border-stone-200/90 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-stone-900">{preset.name}</div>
                          <div className="text-[11px] text-stone-500 mt-0.5">{preset.settings.slogan}</div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                            style={{ backgroundColor: preset.settings.wallColor }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                            style={{ backgroundColor: preset.settings.woodColor }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                            style={{ backgroundColor: preset.settings.accentColor }}
                          />
                          {isSelected && <Check className="w-4 h-4 text-stone-900 ml-1.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-stone-900 focus:outline-none bg-white"
                />
                <button
                  onClick={resetInventory}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {editingProduct && (
                <div className="p-4 rounded-2xl bg-white border-2 border-stone-900 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Edit2 className="w-3.5 h-3.5" /> Edit Product: {editingProduct.id}
                    </span>
                    <button onClick={() => setEditingProduct(null)}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-stone-500 uppercase">Product Title</label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, name: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase">Base Price (USD)</label>
                      <input
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs mt-0.5"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase">Colorway</label>
                      <input
                        type="text"
                        value={editingProduct.colorway}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, colorway: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs mt-0.5"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      updateProduct(editingProduct);
                      setEditingProduct(null);
                    }}
                    className="w-full py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {inventory
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.category.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((product) => (
                    <div
                      key={product.id}
                      className="p-3 rounded-xl bg-white border border-stone-200/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={product.views.front?.imageUrl || product.views.outer?.imageUrl}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-stone-900">{product.name}</div>
                          <div className="text-[11px] text-stone-500">
                            {product.category} · {formatPrice(product.price, brandSettings.currency, brandSettings.currencySymbol)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setEditingProduct(product)}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>All merchant edits update the 3D showroom live</span>
          <button
            onClick={() => setIsCustomizerOpen(false)}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
