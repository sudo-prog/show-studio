import { useCartStore, useCartTotal, formatPrice } from '../hooks/useCartStore'

export default function CartDrawer() {
  const { items, setQty, removeItem, clear } = useCartStore()
  const { count, subtotal } = useCartTotal()
  
  if (count === 0) return null
  
  return (
    <div className="cart-scrim">
      <div className="cart-drawer">
        <h3>Shopping Bag</h3>
        <div className="cart-items">
          {items.map(item => (
            <div key={item.key} className="cart-item">
              <span>{item.name}</span>
              <span>{item.size}</span>
              <input 
                type="number" 
                min="1" 
                value={item.qty}
                onChange={(e) => setQty(item.key, parseInt(e.target.value))}
              />
              <span>{formatPrice(item.price * item.qty)}</span>
              <button onClick={() => removeItem(item.key)}>×</button>
            </div>
          ))}
        </div>
        <div className="cart-footer">
          <div>Subtotal: {formatPrice(subtotal)}</div>
          <button className="checkout-button">Checkout</button>
        </div>
      </div>
    </div>
  )
}
