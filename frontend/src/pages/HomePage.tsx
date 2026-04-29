import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { productApi, configApi } from '../api'
import { Product, BusinessConfig } from '../types'
import { formatPrice } from '../utils/format'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'
import styles from './HomePage.module.css'

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [config, setConfig] = useState<BusinessConfig | null>(null)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, configRes] = await Promise.all([
          productApi.getAll(),
          configApi.get(),
        ])
        const all: Product[] = productsRes.data.data || []
        setFeatured(all.filter((p) => p.is_featured).slice(0, 6))
        setConfig(configRes.data.data)
      } catch {
        // silently fail
      }
    }
    load()
  }, [])

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <p className={styles.heroEyebrow}>Bienvenido a</p>
              <h1 className={styles.heroTitle}>
                {config?.business_name || 'Mi Cafetería & Bar'}
              </h1>
              <p className={styles.heroSubtitle}>
                Café de especialidad, gastronomía artesanal y el mejor ambiente de la ciudad.
                Pedí desde tu mesa, para llevar o con envío.
              </p>
              <div className={styles.heroBtns}>
                <Link to="/menu" className="btn btn-primary btn-lg">
                  Ver Menú Completo
                </Link>
                <Link to="/menu" className="btn btn-secondary btn-lg">
                  Hacer un Pedido
                </Link>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.coffeeArt}>☕</div>
              <div className={styles.floatingBadge}>
                <span>🚚</span>
                <div>
                  <strong>Envío disponible</strong>
                  <small>Coordinar con el local</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modos de pedido */}
        <section className={styles.modes}>
          <div className="container">
            <h2 className={styles.sectionTitle}>¿Cómo querés tu pedido?</h2>
            <div className={styles.modesGrid}>
              {config?.dine_in_available !== false && (
                <div className={styles.modeCard}>
                  <span className={styles.modeIcon}>🍽️</span>
                  <h3>En el local</h3>
                  <p>Elegí tu mesa y pedí desde acá. Te lo llevamos cuando esté listo.</p>
                </div>
              )}
              {config?.takeaway_available !== false && (
                <div className={styles.modeCard}>
                  <span className={styles.modeIcon}>🛍️</span>
                  <h3>Para llevar</h3>
                  <p>Hacé tu pedido, pagá online o en efectivo y pasá a retirarlo.</p>
                </div>
              )}
              {config?.delivery_available !== false && (
                <div className={styles.modeCard}>
                  <span className={styles.modeIcon}>🚚</span>
                  <h3>Envío a domicilio</h3>
                  <p>Ingresá tu dirección al pedir. El costo de envío se coordina con el local.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Pagos */}
        <section className={styles.payments}>
          <div className="container">
            <div className={styles.paymentsInner}>
              <div>
                <h3>Pagá como quieras</h3>
                <p>Aceptamos efectivo y pagos digitales seguros</p>
              </div>
              <div className={styles.paymentBadges}>
                <div className={styles.payBadge}>
                  <span>💳</span>
                  <strong>Mercado Pago</strong>
                </div>
                <div className={styles.payBadge}>
                  <span>💵</span>
                  <strong>Efectivo</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Destacados */}
        {featured.length > 0 && (
          <section className={styles.featured}>
            <div className="container">
              <h2 className={styles.sectionTitle}>⭐ Nuestros favoritos</h2>
              <div className={styles.featuredGrid}>
                {featured.map((product) => (
                  <div key={product.id} className={styles.featuredCard}>
                    <div className={styles.featuredImage}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        <div className={styles.featuredPlaceholder}>☕</div>
                      )}
                    </div>
                    <div className={styles.featuredInfo}>
                      <h3>{product.name}</h3>
                      {product.description && <p>{product.description}</p>}
                      <div className={styles.featuredFooter}>
                        <span className={styles.featuredPrice}>{formatPrice(product.price)}</span>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            addItem({
                              product_id: product.id,
                              product_name: product.name,
                              price: product.price,
                            })
                            toast.success(`${product.name} agregado`)
                          }}
                        >
                          + Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link to="/menu" className="btn btn-secondary">Ver carta completa →</Link>
              </div>
            </div>
          </section>
        )}

        {/* Info del local */}
        {config && (
          <section className={styles.info}>
            <div className="container">
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <span>📍</span>
                  <div>
                    <strong>Dónde estamos</strong>
                    <p>{config.address || 'Consultar dirección'}</p>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <span>📞</span>
                  <div>
                    <strong>Contacto</strong>
                    <p>{config.phone || 'Ver redes sociales'}</p>
                  </div>
                </div>
                <div className={styles.infoCard}>
                  <span>{config.is_open ? '🟢' : '🔴'}</span>
                  <div>
                    <strong>Estado actual</strong>
                    <p>{config.is_open ? 'Abierto ahora' : 'Cerrado por el momento'}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <div className="container">
          <p>☕ {config?.business_name || 'Mi Cafetería'} — Hecho con amor</p>
          <Link to="/admin" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
            Admin
          </Link>
        </div>
      </footer>
    </>
  )
}
