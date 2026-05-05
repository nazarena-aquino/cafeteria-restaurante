import { useEffect, useState, useRef } from 'react'
import { productApi } from '../../api'
import { Product, Category } from '../../types'
import { formatPrice } from '../../utils/format'
import toast from 'react-hot-toast'
import styles from './AdminProducts.module.css'

const EMPTY_FORM = {
  name: '', description: '', price: '', category_id: '',
  image_url: '', is_available: true, is_featured: false,
  preparation_time: '', sort_order: '0', allergens: '',
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState('')
  const [search, setSearch] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        productApi.getAllAdmin(),
        productApi.getCategoriesAdmin(),
      ])
      setProducts(pRes.data.data || [])
      setCategories(cRes.data.data || [])
    } catch {
      toast.error('Error cargando productos')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview('')
    setShowForm(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      category_id: product.category_id,
      image_url: product.image_url || '',
      is_available: product.is_available,
      is_featured: product.is_featured,
      preparation_time: product.preparation_time ? String(product.preparation_time) : '',
      sort_order: String(product.sort_order),
      allergens: (product.allergens || []).join(', '),
    })
    setImageFile(null)
    setImagePreview(product.image_url || '')
    setShowForm(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes')
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar 5MB')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    // Limpiar URL manual si seleccionan archivo
    setForm((prev) => ({ ...prev, image_url: '' }))
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, image_url: e.target.value })
    // Limpiar archivo si escriben URL
    if (e.target.value) {
      setImageFile(null)
      setImagePreview(e.target.value)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.category_id) {
      toast.error('Nombre, precio y categoría son requeridos')
      return
    }
    setSaving(true)
    try {
      let finalImageUrl = form.image_url

      // Si hay archivo seleccionado, subirlo primero
      if (imageFile) {
        setUploadingImage(true)
        try {
          const uploadRes = await productApi.uploadImage(imageFile)
          finalImageUrl = uploadRes.data.data.url
          toast.success('Imagen subida correctamente')
        } catch {
          toast.error('Error subiendo la imagen')
          setSaving(false)
          setUploadingImage(false)
          return
        } finally {
          setUploadingImage(false)
        }
      }

      const data = {
        ...form,
        image_url: finalImageUrl || null,
        price: Number(form.price),
        sort_order: Number(form.sort_order) || 0,
        preparation_time: form.preparation_time ? Number(form.preparation_time) : null,
        allergens: form.allergens ? form.allergens.split(',').map((a) => a.trim()).filter(Boolean) : [],
      }

      if (editing) {
        await productApi.update(editing.id, data)
        toast.success('Producto actualizado')
      } else {
        await productApi.create(data)
        toast.success('Producto creado')
      }
      setShowForm(false)
      load()
    } catch {
      toast.error('Error guardando producto')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await productApi.toggle(id)
      load()
    } catch {
      toast.error('Error cambiando disponibilidad')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Deshabilitar "${name}"?`)) return
    try {
      await productApi.delete(id)
      toast.success('Producto deshabilitado')
      load()
    } catch {
      toast.error('Error eliminando producto')
    }
  }

  const filtered = products.filter((p) => {
    const matchCat = !filterCat || p.category_id === filterCat
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Productos</h1>
          <p>{products.length} producto{products.length !== 1 ? 's' : ''} en total</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nuevo producto
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar producto..."
          className="form-input"
          style={{ maxWidth: 240 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ width: 'auto' }}
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Destacado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className={!p.is_available ? styles.unavailableRow : ''}>
                  <td>
                    <div className={styles.productCell}>
                      <div className={styles.productThumb}>
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} />
                        ) : '☕'}
                      </div>
                      <div>
                        <p className={styles.productName}>{p.name}</p>
                        {p.description && (
                          <p className={styles.productDesc}>{p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.catTag}>
                      {(p as any).categories?.name || '—'}
                    </span>
                  </td>
                  <td>
                    <span className={styles.price}>{formatPrice(p.price)}</span>
                  </td>
                  <td>
                    <button
                      className={`badge ${p.is_available ? styles.available : styles.unavailable}`}
                      onClick={() => handleToggle(p.id)}
                      title="Clic para cambiar"
                    >
                      {p.is_available ? '✓ Disponible' : '✕ No disponible'}
                    </button>
                  </td>
                  <td>
                    {p.is_featured ? <span className={styles.featured}>⭐</span> : <span className={styles.noFeatured}>—</span>}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>
                        ✏️ Editar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="icon">☕</div>
              <p>No hay productos con ese filtro</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button className={styles.modalClose} onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form className={styles.modalForm} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Nombre *</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej: Cappuccino"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Categoría *</label>
                  <select
                    className="form-select"
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Precio (ARS) *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="1500"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-textarea"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Breve descripción del producto..."
                  />
                </div>

                {/* SECCIÓN DE IMAGEN */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Imagen del producto</label>

                  {/* Preview */}
                  {imagePreview && (
                    <div className={styles.imagePreview}>
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        className={styles.removeImage}
                        onClick={() => {
                          setImagePreview('')
                          setImageFile(null)
                          setForm((prev) => ({ ...prev, image_url: '' }))
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                      >
                        ✕ Quitar imagen
                      </button>
                    </div>
                  )}

                  {/* Subir archivo */}
                  <div className={styles.imageUploadArea}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const file = e.dataTransfer.files?.[0]
                      if (file) {
                        const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>
                        handleImageChange(fakeEvent)
                      }
                    }}
                  >
                    <span>📁</span>
                    <p>Clic para seleccionar o arrastrá una imagen aquí</p>
                    <small>JPG, PNG, WEBP — máx. 5MB</small>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />

                  {/* Separador */}
                  <div className={styles.orDivider}>
                    <span>o pegá una URL</span>
                  </div>

                  {/* URL manual */}
                  <input
                    className="form-input"
                    value={form.image_url}
                    onChange={handleUrlChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tiempo de preparación (min)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={form.preparation_time}
                    onChange={(e) => setForm({ ...form, preparation_time: e.target.value })}
                    placeholder="5"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Orden</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Alérgenos (separados por coma)</label>
                  <input
                    className="form-input"
                    value={form.allergens}
                    onChange={(e) => setForm({ ...form, allergens: e.target.value })}
                    placeholder="gluten, lácteos, huevo..."
                  />
                </div>

                <div className={styles.checkboxGroup}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={form.is_available}
                      onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                    />
                    <span>Disponible</span>
                  </label>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    />
                    <span>⭐ Destacado en inicio</span>
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {uploadingImage ? '⬆️ Subiendo imagen...' : saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}