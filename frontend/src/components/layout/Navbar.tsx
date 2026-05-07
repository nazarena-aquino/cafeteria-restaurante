import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCartStore } from '../../store/cartStore'
import styles from './Navbar.module.css'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const itemCount = useCartStore((s) => s.getItemCount())
  const [activeOrder, setActiveOrder] = useState<string | null>(null)

  useEffect(() => {
    const checkOrder = () => {
      const savedOrder = localStorage.getItem('vora_last_order')
      setActiveOrder(savedOrder)
    }
    checkOrder()
    // Revisar cada vez que cambia la ruta
    window.addEventListener('storage', checkOrder)
    return () => window.removeEventListener('storage', checkOrder)
  }, [location.pathname])

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logoText}>VORA</Link>

          <div className={styles.links}>
            <Link
              to="/"
              className={`${styles.link} ${location.pathname === '/' ? styles.active : ''}`}
            >
              Inicio
            </Link>
            <Link
              to="/menu"
              className={`${styles.link} ${location.pathname === '/menu' ? styles.active : ''}`}
            >
              Menú
            </Link>
          </div>

          <Link to="/cart" className={styles.cartBtn}>
            <span className={`material-symbols-outlined ${styles.cartIcon}`}>shopping_cart</span>
            {itemCount > 0 && (
              <span className={styles.badge}>{itemCount}</span>
            )}
          </Link>
        </div>
      </nav>

      {/* Banner pedido activo */}
      {activeOrder && !location.pathname.startsWith('/order-status') && (
        <div className={styles.orderBanner}>
          <span>📦 Tenés un pedido en curso</span>
          <button
            className={styles.orderBannerBtn}
            onClick={() => navigate(`/order-status/${activeOrder}`)}
          >
            Ver estado →
          </button>
        </div>
      )}
    </>
  )
}