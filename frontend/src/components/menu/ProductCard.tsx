import { useState } from 'react'
import { Product } from '../../types'
import { useCartStore } from '../../store/cartStore'
import { formatPrice } from '../../utils/format'
import toast from 'react-hot-toast'
import styles from './ProductCard.module.css'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const handleAdd = () => {
    addItem({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
    })
    setAdded(true)
    toast.success(`${product.name} agregado al carrito`)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className={styles.card}>
      {/* Image */}
      <div className={styles.imageWrap}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>☕</div>
        )}
        {product.is_featured && (
          <span className={styles.featuredBadge}>Premium</span>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.nameRow}>
          <h3 className={styles.name}>{product.name}</h3>
          <span className={styles.price}>{formatPrice(product.price)}</span>
        </div>

        {product.description && (
          <p className={styles.desc}>{product.description}</p>
        )}

        {(product.preparation_time || (product.allergens && product.allergens.length > 0)) && (
          <div className={styles.meta}>
            {product.preparation_time && (
              <span className={styles.time}>⏱ {product.preparation_time} min</span>
            )}
            {product.allergens && product.allergens.length > 0 && (
              <span className={styles.allergens}>⚠️ {product.allergens.join(', ')}</span>
            )}
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={!product.is_available}
          className={`${styles.addBtn} ${added ? styles.added : ''}`}
        >
          {!product.is_available ? 'No disponible' : added ? '✓ Agregado' : 'Agregar'}
        </button>
      </div>
    </div>
  )
}
