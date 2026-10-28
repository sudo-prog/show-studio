import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Check, AlertCircle } from './icons';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { formatPrice, validateProductSelection } from '../../utils/cartLogic';

export const ProductModal: React.FC = () => {
  const { selectedProduct, closeProduct, stepProduct, brandSettings } = useStore();
  const { addToCart, isProductInCart } = useCart();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0); // in radians
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartAngle = useRef(0);
  const [justAdded, setJustAdded] = useState(false);

  // Reset size selection when product changes
  useEffect(() => {
    if (selectedProduct) {
      setSelectedSize(null);
      setSizeError(null);
      setCurrentAngle(0);
      setJustAdded(false);
    }
  }, [selectedProduct?.id]);

  const views = selectedProduct?.views;
  const isShoe = selectedProduct?.category === 'shoes';

  // Available angle views for thumbnail selector (unconditional hook call)
  const availableViews = useMemo(() => {
    if (!selectedProduct || !views) return [];
    if (isShoe) {
      return [
        { id: 'outer', label: 'Side', angle: 0, img: views.outer?.imageUrl || views.side.imageUrl },
        { id: 'toe', label: 'Toe', angle: Math.PI / 2, img: views.toe?.imageUrl || views.front.imageUrl },
        { id: 'inner', label: 'Inner', angle: Math.PI, img: views.inner?.imageUrl || views.side.imageUrl },
        { id: 'heel', label: 'Heel', angle: (3 * Math.PI) / 2, img: views.heel?.imageUrl || views.back.imageUrl },
      ];
    }
    return [
      { id: 'front', label: 'Front', angle: 0, img: views.front.imageUrl },
      { id: 'side', label: 'Side', angle: Math.PI / 2, img: views.side.imageUrl },
      { id: 'back', label: 'Back', angle: Math.PI, img: views.back.imageUrl },
    ];
  }, [selectedProduct, isShoe, views]);

  // Determine current active display image from angle (unconditional hook call)
  const activeImage = useMemo(() => {
    if (!selectedProduct || !views) return { url: '', flipX: false };
    let a = currentAngle % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    const quarter = Math.PI / 2;
    const sector = Math.floor((a + quarter / 2) / quarter) % 4;

    if (isShoe) {
      if (sector === 0) return { url: views.outer?.imageUrl || views.side.imageUrl, flipX: false };
      if (sector === 1) return { url: views.toe?.imageUrl || views.front.imageUrl, flipX: false };
      if (sector === 2) return { url: views.inner?.imageUrl || views.side.imageUrl, flipX: false };
      return { url: views.heel?.imageUrl || views.back.imageUrl, flipX: false };
    }

    if (sector === 0) return { url: views.front.imageUrl, flipX: false };
    if (sector === 1) return { url: views.side.imageUrl, flipX: false };
    if (sector === 2) return { url: views.back.imageUrl, flipX: false };
    return { url: views.side.imageUrl, flipX: true };
  }, [currentAngle, isShoe, selectedProduct, views]);

  // Early return AFTER all hooks are called
  if (!selectedProduct) return null;

  // Handle drag to turn product 360°
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartAngle.current = currentAngle;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX.current;
    setCurrentAngle(dragStartAngle.current + dx * 0.012);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Add to cart handler with validation & shake
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    const validation = validateProductSelection(selectedProduct, selectedSize);
    if (!validation.valid) {
      setSizeError(validation.error || 'Please select a size');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      return;
    }

    setSizeError(null);
    const rect = e.currentTarget.getBoundingClientRect();
    const sourceCoords = {
      x: rect.left + rect.width / 2,
      y: rect.top,
    };

    const added = addToCart(selectedProduct, selectedSize!, sourceCoords);
    if (added) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2400);
    }
  };

  const isInCart = selectedSize ? isProductInCart(selectedProduct.id, selectedSize) : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 md:p-10 select-none">
      {/* 93%-opaque wall-colored backdrop (Build Prompt 6) */}
      <div
        onClick={closeProduct}
        className="absolute inset-0 bg-stone-100/90 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Main modal container */}
      <div className="relative z-10 w-full h-full max-w-6xl max-h-[92vh] flex flex-col md:flex-row items-center justify-between p-4 sm:p-8 overflow-hidden pointer-events-auto">
        {/* Close Button top-right */}
        <button
          onClick={closeProduct}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-stone-900/10 hover:bg-stone-900/20 text-stone-700 transition-all cursor-pointer"
          aria-label="Close product view"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ----------------- LEFT AREA: 3D Product & Interactive Turn Stage ----------------- */}
        <div className="relative flex-1 w-full h-[52vh] md:h-full flex flex-col md:flex-row items-center justify-center">
          {/* View Thumbnails (Left side on desktop, top strip on mobile) */}
          <div className="absolute top-2 left-2 md:static md:mr-6 flex flex-row md:flex-col gap-2 z-20">
            {availableViews.map((v) => {
              const isCurrent = Math.abs(currentAngle - v.angle) % (Math.PI * 2) < 0.35;
              return (
                <button
                  key={v.id}
                  onClick={() => setCurrentAngle(v.angle)}
                  className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl p-1 bg-white/70 hover:bg-white border transition-all cursor-pointer flex items-center justify-center overflow-hidden shadow-sm ${
                    isCurrent ? 'border-stone-900 ring-2 ring-stone-900/20 scale-105' : 'border-stone-200/80'
                  }`}
                  title={`View ${v.label}`}
                >
                  <img
                    src={v.img}
                    alt={v.label}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </button>
              );
            })}
          </div>

          {/* Interactive Turn Stage */}
          <div
            className="relative w-full max-w-md h-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Outline-circle Carousel Arrows (Build Prompt 6) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                stepProduct('prev');
              }}
              className="absolute left-2 sm:left-4 z-20 p-2.5 rounded-full border border-stone-300 hover:border-stone-800 bg-white/60 hover:bg-white text-stone-800 transition-all shadow-sm active:scale-95 cursor-pointer"
              aria-label="Previous product"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                stepProduct('next');
              }}
              className="absolute right-2 sm:right-4 z-20 p-2.5 rounded-full border border-stone-300 hover:border-stone-800 bg-white/60 hover:bg-white text-stone-800 transition-all shadow-sm active:scale-95 cursor-pointer"
              aria-label="Next product"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Product Image Presentation */}
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center transition-transform duration-150">
              <img
                src={activeImage.url}
                alt={selectedProduct.name}
                style={{ transform: activeImage.flipX ? 'scaleX(-1)' : 'none' }}
                className="max-w-full max-h-full object-contain drop-shadow-2xl select-none pointer-events-none transition-all duration-200"
              />
            </div>

            {/* 360 Drag Hint */}
            <div className="absolute bottom-2 text-[10px] uppercase tracking-widest text-stone-400 font-semibold pointer-events-none">
              Drag to turn 360°
            </div>
          </div>
        </div>

        {/* ----------------- RIGHT AREA: Frosted Product Card (Build Prompt 6 & 8) ----------------- */}
        <div className="w-full md:w-[380px] shrink-0 bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col justify-between max-h-[46vh] md:max-h-full overflow-y-auto">
          <div>
            {/* Category & Stock */}
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              <span>{selectedProduct.category}</span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                In Stock
              </span>
            </div>

            {/* Title & Subname */}
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight leading-snug">
              {selectedProduct.name}
            </h2>
            {selectedProduct.subname && (
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {selectedProduct.subname}
              </p>
            )}

            {/* Price & Colourway */}
            <div className="flex items-baseline justify-between mt-3 pb-3 border-b border-stone-200/70">
              <span className="text-2xl sm:text-3xl font-extrabold text-stone-950">
                {formatPrice(selectedProduct.price, brandSettings.currency, brandSettings.currencySymbol)}
              </span>
              <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
                {selectedProduct.colorway}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-stone-600 leading-relaxed mt-3 line-clamp-3">
              {selectedProduct.description}
            </p>

            {/* Size Selector */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-stone-800">Select Size</span>
                <span className="text-[11px] text-stone-400">Standard fit</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {selectedProduct.sizes.map((size) => {
                  const isSoldOut = selectedProduct.soldOutSizes.includes(size);
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      disabled={isSoldOut}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(null);
                      }}
                      className={`h-10 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center border ${
                        isSoldOut
                          ? 'border-stone-200 bg-stone-100/60 text-stone-300 line-through cursor-not-allowed'
                          : isSelected
                          ? 'border-stone-950 bg-stone-950 text-white shadow-md'
                          : 'border-stone-200/80 bg-white hover:border-stone-400 text-stone-800'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {/* Validation Error Message */}
              {sizeError && (
                <div
                  className={`flex items-center gap-1.5 text-xs text-red-600 font-semibold mt-2 ${
                    isShaking ? 'animate-shake' : ''
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{sizeError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="mt-6 pt-3">
            <button
              onClick={handleAddToCart}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer shadow-lg ${
                justAdded || isInCart
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-stone-950 hover:bg-stone-900 text-white'
              }`}
            >
              {justAdded || isInCart ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Added to cart ✓</span>
                </>
              ) : (
                <span>Add to Cart</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
