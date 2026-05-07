import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { orderApi } from '../api'
import { Order } from '../types'
import { formatPrice, formatDate, orderStatusLabel, orderStatusColor, orderTypeLabel } from '../utils/format'
import styles from './OrderStatusPage.module.css'

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered']
const FINAL_STATUSES = ['ready', 'delivered', 'cancelled']

export default function OrderStatusPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const paymentResult = searchParams.get('payment')

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const savedOrder = localStorage.getItem('vora_last_order')
  const effectiveOrderNumber = orderNumber || savedOrder || ''

  const fetchOrder = async () => {
    if (!effectiveOrderNumber) {
      setNotFound(true)
      setLoading(false)
      return
    }
    try {
      const res = await orderApi.track(effectiveOrderNumber)
      const fetchedOrder = res.data.data
      setOrder(fetchedOrder)

      // Limpiar localStorage si el pedido llegó a estado final
      if (FINAL_STATUSES.includes(fetchedOrder.status)) {
        localStorage.removeItem('vora_last_order')
        localStorage.removeItem('vora_last_order_time')
      }
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Si no hay orderNumber en URL pero hay en localStorage, redirigir
    if (!orderNumber && savedOrder) {
      navigate(`/order-status/${savedOrder}`, { replace: true })
      return
    }

    // Si no hay nada, mostrar not found
    if (!effectiveOrderNumber) {
      setNotFound(true)
      setLoading(false)
      return
    }

    fetchOrder()
    const interval = setInterval(fetchOrder, 15000)
    return () => clearInterval(interval)
  }, [effectiveOrderNumber])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-center">
          <div className="spinner" />
        </div>
      </>
    )
  }

  if (notFound || !order) {
    return (
      <>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.center}>
            <div className={styles.icon}>😕</div>
            <h2>No hay pedidos activos</h2>
            <p>Cuando hagas un pedido podés seguirlo desde acá</p>
            <Link to="/menu" className="btn btn-primary">Ver Menú</Link>
          </div>
        </main>
      </>
    )
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">

          {paymentResult === 'success' && (
            <div className={styles.bannerSuccess}>
              🎉 ¡Pago realizado exitosamente! Tu pedido está confirmado.
            </div>
          )}
          {paymentResult === 'failure' && (
            <div className={styles.bannerError}>
              ❌ El pago no pudo procesarse. Podés intentarlo nuevamente o pagar en efectivo.
            </div>
          )}
          {paymentResult === 'pending' && (
            <div className={styles.bannerWarning}>
              ⏳ Tu pago está siendo procesado. Te avisaremos cuando se confirme.
            </div>
          )}

          <div className={styles.layout}>
            <div className={styles.statusCard}>
              <div className={styles.orderHeader}>
                <div>
                  <p className={styles.orderLabel}>Pedido</p>
                  <h1 className={styles.orderNumber}>{order.order_number}</h1>
                </div>
                <span
                  className={`badge ${styles.statusBadge}`}
                  style={{ background: `${orderStatusColor[order.status]}22`, color: orderStatusColor[order.status] }}
                >
                  {orderStatusLabel[order.status] || order.status}
                </span>
              </div>

              <p className={styles.orderDate}>
                📅 {formatDate(order.created_at)}
              </p>
              <p className={styles.orderType}>
                {orderTypeLabel[order.order_type]}
                {order.order_type === 'dine_in' && order.table_number && ` — Mesa ${order.table_number}`}
                {order.order_type === 'delivery' && order.delivery_address && (
                  <span className={styles.address}> {order.delivery_address}</span>
                )}
              </p>

              {!isCancelled && (
                <div className={styles.progressWrap}>
                  {STATUS_STEPS.slice(0, -1).map((status, idx) => (
                    <div key={status} className={styles.progressItem}>
                      <div
                        className={`${styles.progressDot} ${
                          idx <= currentStepIndex ? styles.dotDone : ''
                        } ${idx === currentStepIndex ? styles.dotCurrent : ''}`}
                      >
                        {idx < currentStepIndex ? '✓' : idx + 1}
                      </div>
                      <div className={styles.progressLabel}>{orderStatusLabel[status]}</div>
                      {idx < STATUS_STEPS.length - 2 && (
                        <div className={`${styles.progressLine} ${idx < currentStepIndex ? styles.lineDone : ''}`} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isCancelled && (
                <div className={styles.cancelledBox}>
                  ❌ Este pedido fue cancelado
                </div>
              )}

              <div className={styles.paymentRow}>
                <span>💳 Pago:</span>
                <span className={`badge payment-${order.payment_status}`}>
                  {order.payment_method === 'mercadopago' ? 'MercadoPago' : 'Efectivo'} —{' '}
                  {order.payment_status === 'paid' ? '✓ Pagado' :
                   order.payment_status === 'pending' ? 'Pendiente' :
                   order.payment_status === 'failed' ? 'Fallido' : 'Reembolsado'}
                </span>
              </div>
            </div>

            <div className={styles.detailCard}>
              <h2>Detalle del pedido</h2>

              <div className={styles.itemsList}>
                {(order.order_items || []).map((item) => (
                  <div key={item.id} className={styles.detailItem}>
                    <div className={styles.detailItemLeft}>
                      <span className={styles.qty}>{item.quantity}×</span>
                      <div>
                        <p className={styles.itemName}>{item.product_name}</p>
                        {item.notes && <p className={styles.itemNotes}>📝 {item.notes}</p>}
                      </div>
                    </div>
                    <span className={styles.itemSubtotal}>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.totalRow}>
                <span>Total</span>
                <span className={styles.totalAmt}>{formatPrice(order.total)}</span>
              </div>

              {order.order_type === 'delivery' && (
                <p className={styles.deliveryNote}>
                  🚚 El costo de envío se coordina por separado con el local
                </p>
              )}

              {order.notes && (
                <div className={styles.notes}>
                  <strong>Notas:</strong> {order.notes}
                </div>
              )}

              <div className={styles.actions}>
                <button className="btn btn-secondary btn-sm" onClick={fetchOrder}>
                  🔄 Actualizar estado
                </button>
                <Link to="/menu" className="btn btn-primary btn-sm">
                  + Nuevo pedido
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}