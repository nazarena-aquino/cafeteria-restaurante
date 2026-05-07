import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useCartStore } from '../store/cartStore'
import { orderApi, paymentApi } from '../api'
import { OrderType, PaymentMethod } from '../types'
import { formatPrice } from '../utils/format'
import toast from 'react-hot-toast'
import styles from './CheckoutPage.module.css'

// Configuración base para las alertas de VORA
const toastConfig = {
  style: {
    background: '#2c434e',
    color: '#fff',
    fontFamily: "'Work Sans', sans-serif",
    borderRadius: '9999px',
    fontSize: '0.9rem',
  }
};

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, getTotal, clearCart } = useCartStore()
  const total = getTotal()

  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)

  const [orderType, setOrderType] = useState<OrderType>('dine_in')
  const [tableNumber, setTableNumber] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [orderNotes, setOrderNotes] = useState('')

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const table = params.get('table')
    if (table) {
      setOrderType('dine_in')
      setTableNumber(table)
    }
  }, [])

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '3rem' }}>🛒</p>
            <p>Tu carrito está vacío</p>
            <Link to="/menu" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Ver Menú
            </Link>
          </div>
        </main>
      </>
    )
  }

  const validateStep1 = () => {
    if (orderType === 'dine_in' && !tableNumber.trim()) {
      toast.error('Ingresá el número de mesa', {
        ...toastConfig,
        iconTheme: { primary: '#ff4b4b', secondary: '#fff' }
      })
      return false
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      toast.error('Ingresá la dirección de entrega', {
        ...toastConfig,
        iconTheme: { primary: '#ff4b4b', secondary: '#fff' }
      })
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateStep1()) return
  
    setLoading(true)
    try {
      const orderData = {
        customer_name: customerName || undefined,
        customer_phone: customerPhone || undefined,
        customer_email: customerEmail || undefined,
        order_type: orderType,
        table_number: orderType === 'dine_in' ? tableNumber : undefined,
        delivery_address: orderType === 'delivery' ? deliveryAddress : undefined,
        delivery_notes: orderType === 'delivery' ? deliveryNotes : undefined,
        items: items.map((i) => ({
          product_id: i.product_id,
          product_name: i.product_name,
          price: i.price,
          quantity: i.quantity,
          notes: i.notes,
        })),
        payment_method: paymentMethod,
        notes: orderNotes || undefined,
      }
  
      const res = await orderApi.create(orderData)
      const order = res.data.data
  
      // ← NUEVO: guardar en localStorage
      localStorage.setItem('vora_last_order', order.order_number)
      localStorage.setItem('vora_last_order_time', new Date().toISOString())
  
      if (paymentMethod === 'mercadopago') {
        const prefRes = await paymentApi.createPreference(order.id)
        const { init_point, sandbox_init_point } = prefRes.data.data
  
        clearCart()
        toast.success('Redirigiendo a MercadoPago...', {
          ...toastConfig,
          iconTheme: { primary: '#d5a341', secondary: '#fff' }
        })
  
        const mpUrl = import.meta.env.DEV ? sandbox_init_point : init_point
        setTimeout(() => {
          window.location.href = mpUrl
        }, 800)
      } else {
        clearCart()
        toast.success('¡Pedido recibido! Pagá al retirar o cuando llegue.', {
          ...toastConfig,
          iconTheme: { primary: '#d5a341', secondary: '#fff' }
        })
        navigate(`/order-status/${order.order_number}`)
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Error al procesar el pedido'
      toast.error(msg, {
        ...toastConfig,
        iconTheme: { primary: '#ff4b4b', secondary: '#fff' }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.layout}>
            <div className={styles.form}>
              <h1 className={styles.title}>Confirmar Pedido</h1>

              <div className={styles.steps}>
                <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>
                  <span>1</span> Tipo de pedido
                </div>
                <div className={styles.stepLine} />
                <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>
                  <span>2</span> Datos y pago
                </div>
              </div>

              {step === 1 && (
                <div className={styles.stepContent}>
                  <h2>¿Cómo querés recibir tu pedido?</h2>
                  <div className={styles.orderTypes}>
                    {[
                      { value: 'dine_in', icon: '🍽️', label: 'En el local', desc: 'Consumo en mesa' },
                      { value: 'takeaway', icon: '🛍️', label: 'Para llevar', desc: 'Retirás en el local' },
                      { value: 'delivery', icon: '🚚', label: 'Envío a domicilio', desc: 'El costo se coordina con el local' },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`${styles.orderTypeCard} ${orderType === opt.value ? styles.selected : ''}`}
                      >
                        <input
                          type="radio"
                          name="orderType"
                          value={opt.value}
                          checked={orderType === opt.value}
                          onChange={() => setOrderType(opt.value as OrderType)}
                          hidden
                        />
                        <span className={styles.orderTypeIcon}>{opt.icon}</span>
                        <div>
                          <strong>{opt.label}</strong>
                          <small>{opt.desc}</small>
                        </div>
                        {orderType === opt.value && <span className={styles.checkMark}>✓</span>}
                      </label>
                    ))}
                  </div>

                  {orderType === 'dine_in' && (
                    <div className="form-group">
                      <label className="form-label">Número de mesa *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Ej: 1"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                      />
                    </div>
                  )}

                  {orderType === 'delivery' && (
                    <>
                      <div className={styles.deliveryInfo}>
                        <span>ℹ️</span>
                        <p>
                          El costo de envío <strong>no está incluido</strong> en el precio.
                        </p>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Dirección de entrega *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Calle, número, piso/depto, barrio"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Referencia / notas de entrega</label>
                        <textarea
                          className="form-textarea"
                          placeholder="Ej: Timbre 3, portón azul..."
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => {
                      if (validateStep1()) setStep(2)
                    }}
                    style={{ width: '100%', marginTop: '1rem' }}
                  >
                    Continuar →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className={styles.stepContent}>
                  <button className={styles.backBtn} onClick={() => setStep(1)}>← Volver</button>
                  <h2>Tus datos (opcional)</h2>
                  <div className={styles.fieldsRow}>
                    <div className="form-group">
                      <label className="form-label">Nombre</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Tu nombre"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="+54 9 370 ..."
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <h2 style={{ marginTop: '1.5rem' }}>Método de pago</h2>
                  <div className={styles.paymentMethods}>
                    <label className={`${styles.payCard} ${paymentMethod === 'mercadopago' ? styles.selected : ''}`}>
                      <input type="radio" name="payment" value="mercadopago" checked={paymentMethod === 'mercadopago'} onChange={() => setPaymentMethod('mercadopago')} hidden />
                      <span style={{ fontSize: '1.75rem' }}>💳</span>
                      <div><strong>MercadoPago</strong><small>Tarjeta, QR, saldo digital</small></div>
                      {paymentMethod === 'mercadopago' && <span className={styles.checkMark}>✓</span>}
                    </label>

                    <label className={`${styles.payCard} ${paymentMethod === 'cash' ? styles.selected : ''}`}>
                      <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} hidden />
                      <span style={{ fontSize: '1.75rem' }}>💵</span>
                      <div><strong>Efectivo</strong><small>Pagás al retirar</small></div>
                      {paymentMethod === 'cash' && <span className={styles.checkMark}>✓</span>}
                    </label>
                  </div>

                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ width: '100%', marginTop: '1.5rem' }}
                  >
                    {loading ? 'Procesando...' : 'Confirmar pedido'}
                  </button>
                </div>
              )}
            </div>

            <div className={styles.sidebar}>
              <div className={styles.summaryBox}>
                <h2>Tu pedido</h2>
                <div className={styles.orderItems}>
                  {items.map((item) => (
                    <div key={item.product_id} className={styles.orderItem}>
                      <span className={styles.itemQty}>{item.quantity}×</span>
                      <span className={styles.itemName}>{item.product_name}</span>
                      <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.summaryGrandTotal}>
                  <span>Total a pagar</span>
                  <span className={styles.grandTotalAmt}>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}