import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productApi, configApi } from '../api'
import { Product } from '../types'
import { formatPrice } from '../utils/format'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import styles from './HomePage.module.css'

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes] = await Promise.all([
          productApi.getAll(),
          configApi.get(),
        ])
        const all: Product[] = productsRes.data.data || []
        setFeatured(all.filter((p) => p.is_featured))
      } catch {
        // silently fail
      }
    }
    load()
  }, [])

  const maxIndex = Math.max(0, featured.length - 3)

  return (
    <div className={styles.page}>
      <Navbar />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBm7JBgQ7-fnRxU7_sUpXrlXUm1d79dLDuG8I3z_vTpUxNTlNP09m2ozqYr-HSfzcLT32C0jfiCu-j8HfNIEgH61YmlPL44-ju_OKdsuSsCJG38mfC14a5C5iA7hscx27OI4JqoGOMvHdnxvLBIuTN-GMxVC5nvXot7-PDbyMY-AYZCpkPPj8tXFY92Q6khxgm6KZHuByQQtZfjIRZ1kmVLkZbk3PXSMzu09ESrzospV-q4VnFc8NcMihDVzBvzfAUOeqWqt0o1Eg"
            alt="VORA — experiencia gastronómica"
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>Devora el momento con nosotros</h1>
            <p className={styles.heroDescription}>
              Desde el primer café de la mañana hasta el brindis de medianoche,
              transformamos sabores tradicionales en experiencias contemporáneas.
            </p>
            <div className={styles.heroButtons}>
              <Link to="/menu" className={styles.primaryButton}>Ver Menú</Link>
              <a href="#about" className={styles.secondaryButton}>Nuestra Historia</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tradition Section ── */}
      <section id="about" className={styles.aboutSection}>
        <div className={styles.aboutGrid}>
          {/* Text */}
          <div className={styles.aboutText}>
            <div className={styles.aboutTextBox}>
              <h2 className={styles.aboutTitle}>Tradición y sabor en cada detalle</h2>
              <p className={styles.aboutParagraph}>
                Nuestra cocina es un puente entre el pasado y el presente. Seleccionamos
                ingredientes locales para honrar las recetas que han definido nuestra
                historia, elevándolas con técnicas modernas y una presentación impecable.
              </p>
              <a
                href="https://www.google.com/maps/place/Paraguay+355,+P3600+Formosa/@-26.1903399,-58.1836839,15z"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.discoverLink}
              >
                <span>Veni a conocernos</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </a>
            </div>
          </div>

          {/* Images */}
          <div className={styles.aboutImages}>
            <div className={styles.aboutImageMain}>
              <img
                src="https://clnfokibaydtkepvcoys.supabase.co/storage/v1/object/public/product-images/cafe-medialunas.png"
                alt="Interior de VORA"
                className={styles.aboutImage}
              />
            </div>
            <div className={styles.aboutImageStack}>
              <div className={styles.aboutImageSmall}>
                <img
                  src="https://clnfokibaydtkepvcoys.supabase.co/storage/v1/object/public/product-images/cafe-dona.png"
                  alt="Detalle de café"
                  className={styles.aboutImage}
                />
              </div>
              <div className={styles.aboutImageSmall}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZ2wRuNVE4GbP0QX5-9E_k1BSL2kl4029OhDXXxPE16GCRwcVB_tv1KHQ3XmtSD0FCZOLwVkEwI-Fcq8AsEvTVqP5VmS3wQENvO_oUMKsawoafUVabaJkrJ1iZ4XMis-tSoxuL7rNvAZ_HfBGTPnEuJzcOQHrLvcYR6G4z1ZTFA4Fk608-KCpPusfTaCy2dMxbhYYFiJBl5wa-ikn4ngrulhVvtkpg391eW0UMguC2WDQIADbLlChk_tPi94Y6sUBxwaT8KleV9g"
                  alt="Gastronomía VORA"
                  className={styles.aboutImage}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className={styles.productsSection}>
        <div className={styles.productsContainer}>
          <div className={styles.productsHeader}>
            <h2 className={styles.productsTitle}>Nuestros Favoritos</h2>
            {featured.length > 3 && (
              <div className={styles.productsNav}>
                <button
                  className={styles.navArrow}
                  onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={currentIndex === 0}
                  aria-label="Anterior"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  className={styles.navArrow}
                  onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))}
                  disabled={currentIndex >= maxIndex}
                  aria-label="Siguiente"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </div>

          {featured.length > 0 ? (
            <div className={styles.productsGrid}>
              {featured.slice(currentIndex, currentIndex + 3).map((product) => (
                <div key={product.id} className={styles.productCard}>
                  {/* Image */}
                  <div className={styles.productImageWrapper}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className={styles.productImage}
                      />
                    ) : (
                      <div className={styles.productPlaceholder}>☕</div>
                    )}
                    {product.is_featured && (
                      <span className={styles.productBadge}>Premium</span>
                    )}
                  </div>

                  {/* Body */}
                  <div className={styles.productInfo}>
                    <div className={styles.productNameRow}>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <span className={styles.productPrice}>{formatPrice(product.price)}</span>
                    </div>
                    {product.description && (
                      <p className={styles.productDesc}>{product.description}</p>
                    )}
                    <button
                      className={styles.addButton}
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
          ) : (
            <div className={styles.productsEmpty}>
              <Link to="/menu" className={styles.primaryButton}>Ver todo el menú</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBackground}>
          <img
            src="https://clnfokibaydtkepvcoys.supabase.co/storage/v1/object/public/product-images/local.png"
            alt="VORA Restaurante"
            className={styles.ctaImage}
          />
          <div className={styles.ctaOverlay} />
        </div>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Saboreá cada momento</h2>
          <Link to="/menu" className={styles.ctaButton}>Conocer el menú</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footerWrapper}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>VORA</div>
            <p className={styles.footerTagline}>
              © {new Date().getFullYear()} VORA. Tradición y Sabor Gastronómico.
            </p>
          </div>

          <div className={styles.footerLinks}>
            <a
              href="https://www.google.com/maps/place/Paraguay+355,+P3600+Formosa/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              Ubicación
            </a>
            <a
              href="https://wa.me/5493624218238"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              Contacto
            </a>
            <a
              href="https://www.instagram.com/vora.fsa/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              Instagram
            </a>
          </div>

          <div className={styles.footerSocial}>
            <a
              href="https://www.instagram.com/vora.fsa/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <span className={`material-symbols-outlined ${styles.socialIcon}`}>photo_camera</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
