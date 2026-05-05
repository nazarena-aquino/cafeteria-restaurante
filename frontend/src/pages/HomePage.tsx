import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productApi, configApi } from '../api'
import { Product, BusinessConfig } from '../types'
import { formatPrice } from '../utils/format'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'
import Navbar from '../components/layout//Navbar'
import styles from './HomePage.module.css'

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [config, setConfig] = useState<BusinessConfig | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, configRes] = await Promise.all([
          productApi.getAll(),
          configApi.get(),
        ])
        const all: Product[] = productsRes.data.data || []
        setFeatured(all.filter((p) => p.is_featured))
        setConfig(configRes.data.data)
      } catch {
        // silently fail
      }
    }
    load()
  }, [])

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Hero Section */}
      <header className={styles.hero}>
        <div className={styles.heroBackground}>
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxSjPvk_q4yD-njtVjYigEDWisMrDq-LbrtavTGkBXd0ua0gTj8LZNZ_HKxS5QzNcrRorBpvsrRKmFvXNNLmEzlZfN-FVSogt1YSi1iS_wAqYJ8p8KiXdgpzVv8SS7zkgQDHR6td9PoY5sNZddZWkKgmXwB9mQiuqHFqzglMtOLonPsJiZK1FsdoMe8CCO_xWDCNPkB-AZr8qq9ovGj8W5JaIsaaGjPTcNw6Je1ct4HHJ0VLGY83yGLSd7-UvpCMuoXNChNxnPM7P3" 
            alt="Artisanal breakfast" 
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay}></div>
        </div>
        <div className={styles.heroContent}>
          <span className={styles.heroLabel}>CAFÉ • HELADOS • RESTO BAR</span>
          <h1 className={styles.heroTitle}>Devora el momento con nosotros</h1>
          <p className={styles.heroDescription}>
          Arrancá la mañana con un buen café y un mbeju calentito, pasá por un helado a la tarde o vení a disfrutar la noche con nosotros. Tu nuevo lugar de encuentro en Paraguay 355.
          </p>
          <div className={styles.heroButtons}>
            <Link to="/menu" className={styles.primaryButton}>Ver Menú</Link>
            <a href="#about" className={styles.secondaryButton}>Nuestra historia</a>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className={styles.aboutSection}>
        <div className={styles.aboutContent}>
          <div className={styles.aboutText}>
            <h2 className={styles.aboutTitle}>Tradición y sabor en cada detalle.</h2>
            <p className={styles.aboutParagraph}>
            Vora nació con la idea de crear un espacio donde cada momento del día tenga su propio sabor. Desde el aroma de un café recién hecho acompañado de un mbeju calentito, hasta la frescura de nuestros helados artesanales y las opciones de nuestro resto bar para cerrar la jornada.
            </p>
            <p className={styles.aboutParagraph}>
            Cuidamos cada ingrediente para ofrecerte una experiencia única. Vení a disfrutar de un ambiente diseñado para relajarse, compartir y sentirte como en casa, justo en el corazón de la ciudad.
            </p>
            <a href="https://www.google.com/maps/place/Paraguay+355,+P3600+Formosa/@-26.1903399,-58.1836839,15z/data=!3m1!4b1!4m6!3m5!1s0x945ca6753d76bd71:0x7d1555e31986f358!8m2!3d-26.1903411!4d-58.1652299!16s%2Fg%2F11jzwmg591?entry=ttu&g_ep=EgoyMDI2MDUwMi4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className={styles.discoverLink}>
              <span>Veni a conocernos</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <div className={styles.aboutImages}>
            <div className={styles.aboutImageWrapper}>
              <img 
                src="public/img/cafe-medialunas.png" 
                alt="Interior Detail" 
                className={`${styles.aboutImage} ${styles.grayscale}`}
              />
            </div>
            <div className={`${styles.aboutImageWrapper} ${styles.offsetImage}`}>
              <img 
                src="public/img/cafe-dona.png" 
                alt="Coffee prep" 
                className={styles.aboutImage}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featured.length > 0 && (
        <section className={styles.productsSection}>
          <div className={styles.productsContainer}>

            {/* Flechas de navegación */}
            {featured.length > 3 && (
              <div className={styles.productsHeader}>
                <div className={styles.productsHeaderText}>
                  <span className={styles.productsLabel}>NUESTROS FAVORITOS</span>
                </div>
                <div className={styles.productsNav}>
                  <button
                    className={styles.navArrow}
                    onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={currentIndex === 0}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className={styles.navArrow}
                    onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, featured.length - 3))}
                    disabled={currentIndex >= featured.length - 3}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className={styles.productsGrid}>
              {featured.slice(currentIndex, currentIndex + 3).map((product, index) => (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.productImageWrapper}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className={styles.productImage}
                      />
                    ) : (
                      <div className={styles.productPlaceholder}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
                          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
                          <line x1="6" x2="6" y1="2" y2="4"/>
                          <line x1="10" x2="10" y1="2" y2="4"/>
                          <line x1="14" x2="14" y1="2" y2="4"/>
                        </svg>
                      </div>
                    )}
                    {index === 0 && currentIndex === 0 && (
                      <span className={styles.premiumBadge}>Premium</span>
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <div className={styles.productHeader}>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <span className={styles.productPrice}>{formatPrice(product.price)}</span>
                    </div>
                    <p className={styles.productDescription}>
                      {product.description || 'Artisanal quality crafted with passion.'}
                    </p>
                    <button
                      className={styles.quickAddButton}
                      onClick={() => {
                        addItem({
                          product_id: product.id,
                          product_name: product.name,
                          price: product.price,
                        })
                        toast.success(`${product.name} agregado`)
                      }}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBackground}>
          <img 
            src="public/img/local.png" 
            alt="Background Atmosphere" 
            className={styles.ctaImage}
          />
          <div className={styles.ctaOverlay}></div>
        </div>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Saboreá cada momento.</h2>
          <p className={styles.ctaDescription}>
          Explorá nuestra propuesta gastronómica: cafetería de especialidad, opciones dulces y saladas, y el inconfundible sabor de nuestros helados.
          </p>
          <Link to="/menu" className={styles.ctaButton}>CONOCER EL MENÚ</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>VORA</div>
            <p className={styles.footerTagline}>CAFÉ • HELADOS • RESTO BAR</p>
          </div>
          <div className={styles.footerLinks}>
            <a href="https://www.google.com/maps/place/Paraguay+355,+P3600+Formosa/@-26.1903399,-58.1836839,15z/data=!3m1!4b1!4m6!3m5!1s0x945ca6753d76bd71:0x7d1555e31986f358!8m2!3d-26.1903411!4d-58.1652299!16s%2Fg%2F11jzwmg591?entry=ttu&g_ep=EgoyMDI2MDUwMi4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Ubicación</a>
            <a href="https://www.instagram.com/vora.fsa/" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Instagram</a>
            <a href="https://wa.me/5493624218238" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>WhatsApp</a>
          </div>
          <div className={styles.footerCopyright}>
            <p>&copy; {new Date().getFullYear()} VORA. / Calidad y tradición.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}