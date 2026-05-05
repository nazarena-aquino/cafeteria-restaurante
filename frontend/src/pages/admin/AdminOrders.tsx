import { useEffect, useState } from 'react'
import { orderApi } from '../../api'
import { Order, OrderStatus } from '../../types'
import { formatPrice, formatDate, orderStatusLabel, orderStatusColor, orderTypeLabel, paymentStatusLabel } from '../../utils/format'
import { socket } from '../../utils/socket';
import toast from 'react-hot-toast'
import styles from './AdminOrders.module.css'

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [page, setPage] = useState(1)
  const LIMIT = 20

  useEffect(() => {
    load()
  
    // Escuchar eventos en tiempo real
    socket.on('nuevo_pedido', (pedido) => {
      setOrders((prev) => [pedido, ...prev])
      toast.success(`🆕 Nuevo pedido: ${pedido.order_number}`)
    })
  
    socket.on('pedido_actualizado', (pedidoActualizado) => {
      setOrders((prev) =>
        prev.map((o) => o.id === pedidoActualizado.id ? { ...o, ...pedidoActualizado } : o)
      )
    })
  
    return () => {
      socket.off('nuevo_pedido')
      socket.off('pedido_actualizado')
    }
  }, [filterStatus, filterType, page])

  const load = async () => {
    try {
      const params: Record<string, unknown> = { page, limit: LIMIT }
      if (filterStatus) params.status = filterStatus
      if (filterType) params.order_type = filterType
      const res = await orderApi.getAll(params)
      setOrders(res.data.data.orders || [])
      setTotal(res.data.data.total || 0)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await orderApi.updateStatus(orderId, status)
      toast.success(`Estado actualizado: ${orderStatusLabel[status]}`)
      load()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: status as OrderStatus } : null)
      }
    } catch {
      toast.error('Error al actualizar estado')
    }
  }

  const confirmCashPayment = async (orderId: string) => {
    try {
      const { paymentApi } = await import('../../api')
      await paymentApi.confirmCash(orderId)
      toast.success('Pago en efectivo confirmado')
      load()
    } catch {
      toast.error('Error al confirmar pago')
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Gestión de Pedidos</h1>
          <p>{total} pedido{total !== 1 ? 's' : ''} en total</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}>
          🔄 Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
        >
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{orderStatusLabel[s]}</option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
        >
          <option value="">Todos los tipos</option>
          <option value="dine_in">En el local</option>
          <option value="takeaway">Para llevar</option>
          <option value="delivery">Envío</option>
        </select>
      </div>

      <div className={styles.layout}>
        {/* List */}
        <div className={styles.list}>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📋</div>
              <p>No hay pedidos con ese filtro</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className={`${styles.orderCard} ${selectedOrder?.id === order.id ? styles.selected : ''}`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className={styles.cardTop}>
                  <span className={styles.orderNum}>{order.order_number}</span>
                  <span
                    className="badge"
                    style={{
                      background: `${orderStatusColor[order.status]}22`,
                      color: orderStatusColor[order.status],
                      fontSize: '0.72rem',
                    }}
                  >
                    {orderStatusLabel[order.status]}
                  </span>
                </div>
                <div className={styles.cardMeta}>
                  <span>{orderTypeLabel[order.order_type]}</span>
                  {order.table_number && <span>Mesa {order.table_number}</span>}
                  {order.customer_name && <span>· {order.customer_name}</span>}
                </div>
                <div className={styles.cardBottom}>
                  <span className={styles.cardTime}>{formatDate(order.created_at)}</span>
                  <span className={styles.cardTotal}>{formatPrice(order.total)}</span>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Anterior
              </button>
              <span>{page} / {totalPages}</span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className={styles.detail}>
          {!selectedOrder ? (
            <div className="empty-state">
              <div className="icon">👆</div>
              <p>Seleccioná un pedido para ver el detalle</p>
            </div>
          ) : (
            <div className={styles.detailContent}>
              <div className={styles.detailHeader}>
                <h2>{selectedOrder.order_number}</h2>
                <button
                  className={styles.closeBtn}
                  onClick={() => setSelectedOrder(null)}
                >✕</button>
              </div>

              <div className={styles.detailMeta}>
                <div className={styles.metaRow}>
                  <span>Tipo</span>
                  <strong>{orderTypeLabel[selectedOrder.order_type]}</strong>
                </div>
                {selectedOrder.table_number && (
                  <div className={styles.metaRow}>
                    <span>Mesa</span>
                    <strong>{selectedOrder.table_number}</strong>
                  </div>
                )}
                {selectedOrder.delivery_address && (
                  <div className={styles.metaRow}>
                    <span>Dirección</span>
                    <strong>{selectedOrder.delivery_address}</strong>
                  </div>
                )}
                {selectedOrder.delivery_notes && (
                  <div className={styles.metaRow}>
                    <span>Ref. entrega</span>
                    <strong>{selectedOrder.delivery_notes}</strong>
                  </div>
                )}
                {selectedOrder.customer_name && (
                  <div className={styles.metaRow}>
                    <span>Cliente</span>
                    <strong>{selectedOrder.customer_name}</strong>
                  </div>
                )}
                {selectedOrder.customer_phone && (
                  <div className={styles.metaRow}>
                    <span>Teléfono</span>
                    <a href={`tel:${selectedOrder.customer_phone}`}>
                      <strong>{selectedOrder.customer_phone}</strong>
                    </a>
                  </div>
                )}
                <div className={styles.metaRow}>
                  <span>Fecha</span>
                  <strong>{formatDate(selectedOrder.created_at)}</strong>
                </div>
                <div className={styles.metaRow}>
                  <span>Pago</span>
                  <strong>
                    {selectedOrder.payment_method === 'mercadopago' ? '💳 MercadoPago' : '💵 Efectivo'}
                    {' — '}
                    <span className={`badge payment-${selectedOrder.payment_status}`} style={{ fontSize: '0.72rem' }}>
                      {paymentStatusLabel[selectedOrder.payment_status]}
                    </span>
                  </strong>
                </div>
                {selectedOrder.notes && (
                  <div className={styles.metaRow}>
                    <span>Notas</span>
                    <strong>{selectedOrder.notes}</strong>
                  </div>
                )}
              </div>

              {/* Items */}
              <h3 className={styles.itemsTitle}>Productos</h3>
              <div className={styles.itemsList}>
                {(selectedOrder.order_items || []).map((item) => (
                  <div key={item.id} className={styles.itemRow}>
                    <span className={styles.itemQty}>{item.quantity}×</span>
                    <div className={styles.itemInfo}>
                      <p>{item.product_name}</p>
                      {item.notes && <small>📝 {item.notes}</small>}
                    </div>
                    <span className={styles.itemPrice}>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.totalRow}>
                <span>Total</span>
                <strong>{formatPrice(selectedOrder.total)}</strong>
              </div>

              {/* Actions */}
              <h3 className={styles.actionsTitle}>Cambiar estado</h3>
              <div className={styles.statusBtns}>
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    className={`btn btn-sm ${selectedOrder.status === s ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => updateStatus(selectedOrder.id, s)}
                    disabled={selectedOrder.status === s}
                    style={{
                      borderColor: orderStatusColor[s],
                      color: selectedOrder.status === s ? 'white' : orderStatusColor[s],
                      background: selectedOrder.status === s ? orderStatusColor[s] : 'transparent',
                    }}
                  >
                    {orderStatusLabel[s]}
                  </button>
                ))}
              </div>

              {/* Confirm cash */}
              {selectedOrder.payment_method === 'cash' && selectedOrder.payment_status === 'pending' && (
                <button
                  className="btn btn-gold"
                  style={{ width: '100%', marginTop: '1rem' }}
                  onClick={() => confirmCashPayment(selectedOrder.id)}
                >
                  💵 Confirmar pago en efectivo
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
