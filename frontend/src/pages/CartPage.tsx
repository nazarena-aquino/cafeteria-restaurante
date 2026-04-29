import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useCartStore } from '../store/cartStore'
import { formatPrice } from '../utils/format'
import styles from './CartPage.module.css'

export default function CartPage() {
  const { items, removeItem, updateQuantity, updateNotes, clearCart, getTotal } = useCartStore()
  const total = getTotal()

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className={styles.main}>
          <div className="container">
            <div className={styles.emptyCart}>
              <div className={styles.emptyIcon}>🛒</div>
              <h2>Tu carrito está vacío</h2>
              <p>Explorá nuestra carta y agregá tus favoritos</p>
              <Link to="/menu" className="btn btn-primary btn-lg">
                Ver Menú
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.layout}>
            {/* Items */}
            <div className={styles.items}>
              <div className={styles.itemsHeader}>
                <h1>Tu Carrito</h1>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    if (confirm('¿Vaciar el carrito?')) clearCart()
                  }}
                >
                  🗑 Vaciar
                </button>
              </div>

              {items.map((item) => (
                <div key={item.product_id} className={styles.item}>
                  <div className={styles.itemMain}>
                    <div className={styles.itemEmoji}>☕</div>
                    <div className={styles.itemInfo}>
                      <h3>{item.product_name}</h3>
                      <p className={styles.unitPrice}>{formatPrice(item.price)} c/u</p>
                      <input
                        type="text"
                        placeholder="Notas (sin azúcar, etc.)"
                        value={item.notes || ''}
                        onChange={(e) => updateNotes(item.product_id, e.target.value)}
                        className={styles.notesInput}
                      />
                    </div>
                    <div className={styles.itemRight}>
                      <span className={styles.itemSubtotal}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <div className={styles.qtyControl}>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className={styles.qtyBtn}
                        >
                          −
                        </button>
                        <span className={styles.qty}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className={styles.qtyBtn}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.product_id)}
                        title="Quitar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <Link to="/menu" className={styles.keepBrowsing}>
                ← Seguir viendo el menú
              </Link>
            </div>

            {/* Summary */}
            <div className={styles.summary}>
              <div className={styles.summaryCard}>
                <h2>Resumen</h2>

                <div className={styles.summaryLines}>
                  {items.map((item) => (
                    <div key={item.product_id} className={styles.summaryLine}>
                      <span>{item.quantity}× {item.product_name}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.divider} />

                <div className={styles.total}>
                  <span>Total</span>
                  <span className={styles.totalAmount}>{formatPrice(total)}</span>
                </div>

                <div className={styles.shippingNote}>
                  <span>🚚</span>
                  <p>
                    El costo de envío (si aplica) se coordina directamente con el local según
                    la distancia.
                  </p>
                </div>

                <Link to="/checkout" className={`btn btn-primary btn-lg ${styles.checkoutBtn}`}>
                  Ir a confirmar pedido →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
