import { create } from 'zustand'

export const useProductHover = create((set) => ({
  hoveredProduct: null,
  selectedProduct: null,
  setHoveredProduct: (product) => set({ hoveredProduct: product }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  clearHovered: () => set({ hoveredProduct: null }),
  clearSelected: () => set({ selectedProduct: null }),
}))
