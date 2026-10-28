import { useCartStore, useCartTotal, formatPrice } from '../hooks/useCartStore'

export default function BottomBar() {
  const { count, subtotal } = useCartTotal()
  
  return (
    <div className="bottom-bar">
      <div className="hover-label">Hover to view product</div>
      <button className="cart-button">
        <span className="cart-count">{count}</span>
        <span className="cart-label">Cart</span>
        <span className="cart-price">{formatPrice(subtotal)}</span>
      </button>
    </div>
  )
}
