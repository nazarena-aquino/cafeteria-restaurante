import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import styles from './AdminLayout.module.css'

const NAV_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/orders', label: 'Pedidos', icon: '📋', end: false },
  { to: '/admin/products', label: 'Productos', icon: '☕', end: false },
  { to: '/admin/categories', label: 'Categorías', icon: '🏷️', end: false },
  { to: '/admin/qr', label: 'Código QR', icon: '📱', end: false },
  { to: '/admin/config', label: 'Configuración', icon: '⚙️', end: false },
]

export default function AdminLayout() {
  const { admin, logout, checkAuth } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.logo}>☕</span>
          <div>
            <p className={styles.logoTitle}>Panel Admin</p>
            <p className={styles.logoSub}>Cafetería & Bar</p>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminInfo}>
            <span className={styles.adminAvatar}>
              {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
            <div>
              <p className={styles.adminName}>{admin?.name || 'Admin'}</p>
              <p className={styles.adminRole}>{admin?.role || 'admin'}</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Cerrar sesión">
            🚪
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
