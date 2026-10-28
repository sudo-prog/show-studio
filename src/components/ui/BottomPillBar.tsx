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
        className="flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full bg-stone-900/90 hover:bg-stone-900 backdrop-blur-xl shadow-2xl border border-stone-800/80 transition-all text-stone-300"
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
                  ? 'bg-white text-stone-950 shadow-md font-semibold scale-100'
                  : 'hover:text-white hover:bg-white/10 text-stone-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
              <span className="text-[11px] sm:text-xs">{item.label}</span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-[1px] h-4 bg-stone-700/80 mx-1" />

        {/* Info button (i) */}
        <button
          onClick={() => setIsInfoModalOpen(true)}
          className="p-2 rounded-full hover:bg-white/15 text-stone-300 hover:text-white transition-all cursor-pointer"
          aria-label="How to explore virtual store"
          title="How to explore"
        >
          <Info className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};
