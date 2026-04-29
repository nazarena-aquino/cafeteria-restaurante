import { useEffect, useState } from 'react'
import { productApi } from '../../api'
import { Category } from '../../types'
import toast from 'react-hot-toast'
import styles from './AdminCategories.module.css'

const EMPTY = { name: '', description: '', image_url: '', sort_order: '0' }

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await productApi.getCategoriesAdmin()
      setCategories(res.data.data || [])
    } catch { toast.error('Error cargando categorías') }
    finally { setLoading(false) }
  }

  const openCreate = () => {
    setEditing(null); setForm(EMPTY); setShowForm(true)
  }

  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description || '', image_url: cat.image_url || '', sort_order: String(cat.sort_order) })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) { toast.error('El nombre es requerido'); return }
    setSaving(true)
    try {
      const data = { ...form, sort_order: Number(form.sort_order) || 0 }
      if (editing) {
        await productApi.updateCategory(editing.id, data)
        toast.success('Categoría actualizada')
      } else {
        await productApi.createCategory(data)
        toast.success('Categoría creada')
      }
      setShowForm(false); load()
    } catch { toast.error('Error guardando categoría') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Desactivar la categoría "${name}"?`)) return
    try {
      await productApi.deleteCategory(id)
      toast.success('Categoría desactivada'); load()
    } catch { toast.error('Error eliminando categoría') }
  }

  const toggleActive = async (cat: Category) => {
    try {
      await productApi.updateCategory(cat.id, { is_active: !cat.is_active })
      load()
    } catch { toast.error('Error actualizando categoría') }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Categorías</h1>
          <p>{categories.length} categorías</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nueva categoría</button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className={styles.grid}>
          {categories.map((cat) => (
            <div key={cat.id} className={`${styles.catCard} ${!cat.is_active ? styles.inactive : ''}`}>
              <div className={styles.catIcon}>
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} />
                ) : '🏷️'}
              </div>
              <div className={styles.catBody}>
                <h3>{cat.name}</h3>
                <p className={styles.catSlug}>/{cat.slug}</p>
                {cat.description && <p className={styles.catDesc}>{cat.description}</p>}
                <p className={styles.catOrder}>Orden: {cat.sort_order}</p>
              </div>
              <div className={styles.catActions}>
                <button
                  className={`badge ${cat.is_active ? styles.activeBadge : styles.inactiveBadge}`}
                  onClick={() => toggleActive(cat)}
                  title="Clic para cambiar"
                >
                  {cat.is_active ? '✓ Activa' : '✕ Inactiva'}
                </button>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(cat)}>✏️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id, cat.name)}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h2>{editing ? 'Editar categoría' : 'Nueva categoría'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Cafés" required />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Breve descripción..." />
              </div>
              <div className="form-group">
                <label className="form-label">URL de imagen</label>
                <input className="form-input" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label className="form-label">Orden de aparición</label>
                <input className="form-input" type="number" min="0" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
              <div className={styles.formActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
