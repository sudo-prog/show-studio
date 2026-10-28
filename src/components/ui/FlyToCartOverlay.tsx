import React, { useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';

export const FlyToCartOverlay: React.FC = () => {
  const { flyingItem, setFlyingItem } = useCart();
  const flyingElRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!flyingItem || !flyingElRef.current) return;

    // Cart icon target position on top-right
    const cartBtn = document.getElementById('cart-button');
    let targetX = window.innerWidth - 60;
    let targetY = 32;

    if (cartBtn) {
      const rect = cartBtn.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;
    }

    const startX = flyingItem.startX;
    const startY = flyingItem.startY;
    const deltaX = targetX - startX;
    const deltaY = targetY - startY;

    const el = flyingElRef.current;

    // Cubic-bezier arc animation (~850ms as per PDF spec)
    const animation = el.animate(
      [
        {
          transform: `translate(${startX}px, ${startY}px) scale(1) rotate(0deg)`,
          opacity: 1,
        },
        {
          transform: `translate(${startX + deltaX * 0.45}px, ${Math.min(startY, targetY) - 60}px) scale(0.65) rotate(12deg)`,
          opacity: 0.9,
          offset: 0.5,
        },
        {
          transform: `translate(${targetX}px, ${targetY}px) scale(0.2) rotate(24deg)`,
          opacity: 0.3,
        },
      ],
      {
        duration: 850,
        easing: 'cubic-bezier(0.45, 0, 0.25, 1)',
        fill: 'forwards',
      }
    );

    animation.onfinish = () => {
      setFlyingItem(null);
    };

    return () => {
      animation.cancel();
    };
  }, [flyingItem, setFlyingItem]);

  if (!flyingItem) return null;

  return (
    <div
      ref={flyingElRef}
      className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2 w-24 h-24"
      style={{ left: 0, top: 0 }}
    >
      <img
        src={flyingItem.thumbnail}
        alt="Flying to cart"
        className="w-full h-full object-contain drop-shadow-xl"
      />
    </div>
  );
};
