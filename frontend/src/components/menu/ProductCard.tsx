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
      <div className={styles.imageWrap}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>☕</span>
          </div>
        )}
        {product.is_featured && (
          <span className={styles.featuredBadge}>⭐ Destacado</span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.info}>
          <h3 className={styles.name}>{product.name}</h3>
          {product.description && (
            <p className={styles.desc}>{product.description}</p>
          )}
          {product.preparation_time && (
            <p className={styles.time}>⏱ {product.preparation_time} min</p>
          )}
          {product.allergens && product.allergens.length > 0 && (
            <p className={styles.allergens}>
              ⚠️ {product.allergens.join(', ')}
            </p>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          <button
            onClick={handleAdd}
            disabled={!product.is_available}
            className={`btn btn-primary btn-sm ${styles.addBtn} ${added ? styles.added : ''}`}
          >
            {added ? '✓ Agregado' : '+ Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}
