import { Link, useLocation } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import styles from './Navbar.module.css'

export default function Navbar() {
  const location = useLocation()
  const itemCount = useCartStore((s) => s.getItemCount())

  return (
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
  )
}
