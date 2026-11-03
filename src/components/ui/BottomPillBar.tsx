import React from 'react';
import { useStore } from '../../context/StoreContext';
import { SectionId } from '../../types/store';

export const BottomPillBar: React.FC = () => {
  const { activeSection, setActiveSection, setIsInfoModalOpen } = useStore();

  // Order matches original Nike Virtual Store: Store / Clothing / Caps / Bags / Shoes
  const navItems: { id: SectionId; label: string }[] = [
  { id: 'store', label: 'Store' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'caps', label: 'Caps' },
  { id: 'bags', label: 'Bags' },
  { id: 'shoes', label: 'Shoes' },
];

  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 pointer-events-none flex justify-center px-3">
      <nav
        aria-label="Department navigation"
        className="pointer-events-auto flex items-center gap-1 px-1 py-1 rounded-full whitespace-nowrap bg-white/70 hover:bg-white text-stone-400 shadow-sm backdrop-blur-xl border border-stone-200/60 transition-all"
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`relative flex items-center justify-center px-2 py-1 rounded-full text-[13px] font-medium leading-none transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-stone-900 text-white shadow font-semibold'
                  : 'hover:text-stone-900 hover:bg-stone-100/60 text-stone-500'
              }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-4 bg-stone-300/60 mx-2" />

        {/* Info button (i) */}
        <button
          onClick={() => setIsInfoModalOpen(true)}
          className="w-[30px] h-[30px] text-[13px] font-medium italic rounded-full hover:bg-stone-100/60 text-stone-500 hover:text-stone-800 transition-all cursor-pointer"
          aria-label="How to explore virtual store"
          title="How to explore"
        >
          i
        </button>
      </nav>
    </div>
  );
};
