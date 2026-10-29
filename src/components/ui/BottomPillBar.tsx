import React from 'react';
import { Info, Compass, Shirt, Footprints, Briefcase, GraduationCap } from './icons';
import { useStore } from '../../context/StoreContext';
import { SectionId } from '../../types/store';

export const BottomPillBar: React.FC = () => {
  const { activeSection, setActiveSection, setIsInfoModalOpen } = useStore();

  // Order matches original Nike Virtual Store: Store / Clothing / Caps / Bags / Shoes
  const navItems: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'store', label: 'Store', icon: Compass },
    { id: 'clothing', label: 'Clothing', icon: Shirt },
    { id: 'caps', label: 'Caps', icon: GraduationCap },
    { id: 'bags', label: 'Bags', icon: Briefcase },
    { id: 'shoes', label: 'Shoes', icon: Footprints },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] pointer-events-auto">
      <nav
        aria-label="Department navigation"
        className="flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full bg-white/80 hover:bg-white text-stone-400 shadow-sm backdrop-blur-xl border border-stone-200/60 transition-all"
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-stone-900 text-white shadow font-semibold'
                  : 'hover:text-stone-900 hover:bg-stone-100/60 text-stone-500'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-stone-600'}`} />
              <span className="text-[11px] sm:text-xs">{item.label}</span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-[1px] h-4 bg-stone-300/60 mx-1" />

        {/* Info button (i) */}
        <button
          onClick={() => setIsInfoModalOpen(true)}
          className="p-2 rounded-full hover:bg-stone-100/60 text-stone-500 hover:text-stone-800 transition-all cursor-pointer"
          aria-label="How to explore virtual store"
          title="How to explore"
        >
          <Info className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};
