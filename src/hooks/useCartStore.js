import { create } from 'zustand'

const CART_STORAGE_KEY = 'nike-store-bag'

const getInitialState = () => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export const useCartStore = create((set, get) => ({
  items: getInitialState(),
  
  addProduct: (product, section, size) => {
    const key = `${product.id}:${size}`
    set(state => {
      const existing = state.items.find(item => item.key === key)
      if (existing) {
        return {
          items: state.items.map(item => 
            item.key === key ? { ...item, qty: item.qty + 1 } : item
          ),
        }
      }
      return {
        items: [...state.items, {
          key, id: product.id, section, name: product.name, 
          price: product.price, size, qty: 1 
        }],
      }
    })
  },
  
  setQty: (key, qty) => {
    set(state => ({
      items: qty <= 0 
        ? state.items.filter(item => item.key !== key)
        : state.items.map(item => item.key === key ? { ...item, qty } : item),
    }))
  },
  
  removeItem: (key) => {
    set(state => ({ items: state.items.filter(item => item.key !== key) }))
  },
  
  clear: () => set({ items: [] }),
}))

// Persist to localStorage
useCartStore.subscribe(
  state => state.items,
  items => {
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)) } catch {}
  }
)

// Derived values
export const useCartTotal = () => {
  const items = useCartStore(state => state.items)
  const count = items.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0)
  return { count, subtotal }
}

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}
