import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderApi, configApi } from '../../api'
import { formatPrice, formatDate, orderStatusLabel, orderStatusColor, orderTypeLabel } from '../../utils/format'
import { Order, BusinessConfig } from '../../types'
import { socket } from '../../utils/socket';
import toast from 'react-hot-toast'
import styles from './AdminDashboard.module.css'

interface Stats {
  today: { orders: number; revenue: number }
  pending: number
  weekOrders: Array<{ created_at: string; total: number; status: string }>
  topProducts: Array<{ name: string; count: number }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [config, setConfig] = useState<BusinessConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  
    socket.on('nuevo_pedido', () => {
      load() // recargar stats cuando llega un pedido nuevo
      toast.success('🆕 Nuevo pedido recibido')
    })
  
    return () => {
      socket.off('nuevo_pedido')
    }
  }, [])

  const load = async () => {
    try {
      const [statsRes, ordersRes, configRes] = await Promise.all([
        orderApi.getStats(),
        orderApi.getAll({ limit: 5 }),
        configApi.get(),
      ])
      setStats(statsRes.data.data)
      setRecentOrders(ordersRes.data.data.orders || [])
      setConfig(configRes.data.data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const toggleOpen = async () => {
    try {
      await configApi.toggleOpen()
      await load()
      toast.success(config?.is_open ? 'Local cerrado' : 'Local abierto')
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Dashboard</h1>
          <p>Resumen de hoy y actividad reciente</p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={`btn ${config?.is_open ? 'btn-danger' : 'btn-primary'}`}
            onClick={toggleOpen}
          >
            {config?.is_open ? '🔴 Cerrar local' : '🟢 Abrir local'}
          </button>
          <Link to="/admin/orders" className="btn btn-secondary">
            Ver todos los pedidos
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div>
            <p className={styles.statLabel}>Pedidos hoy</p>
            <p className={styles.statValue}>{stats?.today.orders ?? 0}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div>
            <p className={styles.statLabel}>Recaudado hoy</p>
            <p className={styles.statValue}>{formatPrice(stats?.today.revenue ?? 0)}</p>
          </div>
        </div>
        <div className={`${styles.statCard} ${(stats?.pending ?? 0) > 0 ? styles.statAlert : ''}`}>
          <div className={styles.statIcon}>⏳</div>
          <div>
            <p className={styles.statLabel}>Pedidos activos</p>
            <p className={styles.statValue}>{stats?.pending ?? 0}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>{config?.is_open ? '🟢' : '🔴'}</div>
          <div>
            <p className={styles.statLabel}>Estado del local</p>
            <p className={styles.statValue}>{config?.is_open ? 'Abierto' : 'Cerrado'}</p>
          </div>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        {/* Recent orders */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Pedidos recientes</h2>
            <Link to="/admin/orders" className={styles.seeAll}>Ver todos →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📋</div>
              <p>Sin pedidos aún hoy</p>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {recentOrders.map((order) => (
                <div key={order.id} className={styles.orderRow}>
                  <div className={styles.orderInfo}>
                    <p className={styles.orderNum}>{order.order_number}</p>
                    <p className={styles.orderMeta}>
                      {orderTypeLabel[order.order_type]}
                      {order.customer_name && ` · ${order.customer_name}`}
                    </p>
                    <p className={styles.orderDate}>{formatDate(order.created_at)}</p>
                  </div>
                  <div className={styles.orderRight}>
                    <p className={styles.orderTotal}>{formatPrice(order.total)}</p>
                    <span
                      className="badge"
                      style={{
                        background: `${orderStatusColor[order.status]}22`,
                        color: orderStatusColor[order.status],
                        fontSize: '0.75rem',
                      }}
                    >
                      {orderStatusLabel[order.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Productos más pedidos</h2>
          </div>
          {(stats?.topProducts ?? []).length === 0 ? (
            <div className="empty-state">
              <div className="icon">☕</div>
              <p>Sin datos aún</p>
            </div>
          ) : (
            <div className={styles.topList}>
              {(stats?.topProducts ?? []).map((p, i) => (
                <div key={p.name} className={styles.topItem}>
                  <span className={styles.topRank}>#{i + 1}</span>
                  <span className={styles.topName}>{p.name}</span>
                  <span className={styles.topCount}>{p.count} unid.</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick links */}
          <div className={styles.quickLinks}>
            <h3>Accesos rápidos</h3>
            <div className={styles.quickGrid}>
              <Link to="/admin/orders" className={styles.quickCard}>
                <span>📋</span>
                <p>Gestionar pedidos</p>
              </Link>
              <Link to="/admin/products" className={styles.quickCard}>
                <span>☕</span>
                <p>Editar productos</p>
              </Link>
              <Link to="/admin/qr" className={styles.quickCard}>
                <span>📱</span>
                <p>Código QR</p>
              </Link>
              <Link to="/admin/config" className={styles.quickCard}>
                <span>⚙️</span>
                <p>Configuración</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
