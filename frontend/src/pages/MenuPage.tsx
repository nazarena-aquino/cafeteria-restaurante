import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import ProductCard from '../components/menu/ProductCard'
import { productApi } from '../api'
import { Product, Category } from '../types'
import styles from './MenuPage.module.css'

export default function MenuPage() {
  const [searchParams] = useSearchParams()
  const tableNumber = searchParams.get('table')

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          productApi.getAll(),
          productApi.getCategories(),
        ])
        setProducts(pRes.data.data || [])
        setCategories(cRes.data.data || [])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'all' || p.category_id === activeCategory
    const matchSearch = search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // Agrupar por categoría
  const grouped = categories
    .filter((c) => c.is_active)
    .map((cat) => ({
      category: cat,
      products: filtered.filter((p) => p.category_id === cat.id),
    }))
    .filter((g) => g.products.length > 0)

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {tableNumber && (
          <div className={styles.tableBanner}>
            🍽️ Estás en la <strong>Mesa {tableNumber}</strong> — Tu pedido se confirmará en el local
          </div>
        )}

        <div className={styles.header}>
          <div className="container">
            <h1>Nuestra Carta</h1>
            <p>Elegí tus favoritos y armá tu pedido</p>
          </div>
        </div>

        <div className="container">
          {/* Search */}
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Buscar en el menú..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category filter */}
          <div className={styles.categoryFilter}>
            <button
              className={`${styles.catBtn} ${activeCategory === 'all' ? styles.active : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.catBtn} ${activeCategory === cat.id ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Products */}
          {loading ? (
            <div className="loading-center">
              <div className="spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="icon">☕</div>
              <p>No encontramos productos con ese criterio</p>
            </div>
          ) : activeCategory === 'all' ? (
            grouped.map(({ category, products: catProducts }) => (
              <section key={category.id} className={styles.categorySection} id={category.slug}>
                <h2 className={styles.categoryTitle}>{category.name}</h2>
                {category.description && (
                  <p className={styles.categoryDesc}>{category.description}</p>
                )}
                <div className={styles.grid}>
                  {catProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className={styles.grid}>
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
