import { useEffect, useState } from 'react'
import { configApi, authApi } from '../../api'
import { BusinessConfig } from '../../types'
import toast from 'react-hot-toast'
import styles from './AdminConfig.module.css'

const DAYS: Array<{ key: string; label: string }> = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
]

export default function AdminConfig() {
  const [config, setConfig] = useState<BusinessConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' })
  const [savingPwd, setSavingPwd] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'security'>('general')

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await configApi.get()
      setConfig(res.data.data)
    } catch { toast.error('Error cargando configuración') }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    try {
      await configApi.update({
        business_name: config.business_name,
        address: config.address,
        phone: config.phone,
        email: config.email,
        logo_url: config.logo_url,
        opening_hours: config.opening_hours,
        is_open: config.is_open,
        delivery_available: config.delivery_available,
        takeaway_available: config.takeaway_available,
        dine_in_available: config.dine_in_available,
      })
      toast.success('Configuración guardada')
    } catch { toast.error('Error guardando configuración') }
    finally { setSaving(false) }
  }

  const setField = (field: keyof BusinessConfig, value: unknown) => {
    setConfig((prev) => prev ? { ...prev, [field]: value } : prev)
  }

  const setHour = (day: string, key: 'open' | 'close' | 'is_open', value: string | boolean) => {
    setConfig((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        opening_hours: {
          ...prev.opening_hours,
          [day]: { ...prev.opening_hours[day], [key]: value },
        },
      }
    })
  }

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pwdForm.current || !pwdForm.next) { toast.error('Completá los campos'); return }
    if (pwdForm.next !== pwdForm.confirm) { toast.error('Las contraseñas no coinciden'); return }
    if (pwdForm.next.length < 8) { toast.error('La nueva contraseña debe tener al menos 8 caracteres'); return }
    setSavingPwd(true)
    try {
      await authApi.changePassword(pwdForm.current, pwdForm.next)
      toast.success('Contraseña cambiada correctamente')
      setPwdForm({ current: '', next: '', confirm: '' })
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error cambiando contraseña')
    } finally { setSavingPwd(false) }
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>
  if (!config) return <p>Error cargando configuración</p>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Configuración</h1>
        <p>Administrá los datos y horarios del local</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {(['general', 'hours', 'security'] as const).map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'general' ? '🏪 General' : tab === 'hours' ? '🕐 Horarios' : '🔒 Seguridad'}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className={styles.section}>
          <div className={styles.formGrid}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Nombre del negocio</label>
              <input className="form-input" value={config.business_name} onChange={(e) => setField('business_name', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Dirección</label>
              <input className="form-input" value={config.address} onChange={(e) => setField('address', e.target.value)} placeholder="Av. Principal 123, Ciudad" />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono / WhatsApp</label>
              <input className="form-input" value={config.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+54 9 11 1234-5678" />
            </div>
            <div className="form-group">
              <label className="form-label">Email de contacto</label>
              <input className="form-input" type="email" value={config.email} onChange={(e) => setField('email', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">URL del logo</label>
              <input className="form-input" value={config.logo_url || ''} onChange={(e) => setField('logo_url', e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className={styles.togglesSection}>
            <h3>Servicios disponibles</h3>
            <div className={styles.toggleGrid}>
              {[
                { field: 'dine_in_available', label: '🍽️ Consumo en el local', desc: 'Pedidos en mesa' },
                { field: 'takeaway_available', label: '🛍️ Para llevar', desc: 'Retiro en local' },
                { field: 'delivery_available', label: '🚚 Envío a domicilio', desc: 'Delivery disponible' },
              ].map(({ field, label, desc }) => (
                <label key={field} className={styles.toggleCard}>
                  <div>
                    <p className={styles.toggleLabel}>{label}</p>
                    <p className={styles.toggleDesc}>{desc}</p>
                  </div>
                  <div
                    className={`${styles.toggle} ${config[field as keyof BusinessConfig] ? styles.toggleOn : ''}`}
                    onClick={() => setField(field as keyof BusinessConfig, !config[field as keyof BusinessConfig])}
                  >
                    <div className={styles.toggleThumb} />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : '💾 Guardar cambios'}
          </button>
        </div>
      )}

      {activeTab === 'hours' && (
        <div className={styles.section}>
          <p className={styles.hoursNote}>
            Configurá los horarios de apertura de tu local. Los clientes verán si estás abierto al visitar la página.
          </p>
          <div className={styles.hoursGrid}>
            {DAYS.map(({ key, label }) => {
              const h = config.opening_hours?.[key] || { open: '09:00', close: '23:00', is_open: true }
              return (
                <div key={key} className={`${styles.dayRow} ${!h.is_open ? styles.dayClosed : ''}`}>
                  <label className={styles.dayToggle}>
                    <input
                      type="checkbox"
                      checked={h.is_open}
                      onChange={(e) => setHour(key, 'is_open', e.target.checked)}
                    />
                    <span className={styles.dayLabel}>{label}</span>
                  </label>
                  <div className={styles.dayTimes}>
                    <input
                      type="time"
                      className="form-input"
                      value={h.open}
                      onChange={(e) => setHour(key, 'open', e.target.value)}
                      disabled={!h.is_open}
                    />
                    <span>—</span>
                    <input
                      type="time"
                      className="form-input"
                      value={h.close}
                      onChange={(e) => setHour(key, 'close', e.target.value)}
                      disabled={!h.is_open}
                    />
                  </div>
                  {!h.is_open && <span className={styles.closedTag}>Cerrado</span>}
                </div>
              )
            })}
          </div>

          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : '💾 Guardar horarios'}
          </button>
        </div>
      )}

      {activeTab === 'security' && (
        <div className={styles.section}>
          <h2>Cambiar contraseña</h2>
          <p className={styles.secNote}>
            Usá una contraseña segura de al menos 8 caracteres con letras y números.
          </p>
          <form className={styles.pwdForm} onSubmit={handleChangePwd}>
            <div className="form-group">
              <label className="form-label">Contraseña actual</label>
              <input
                type="password"
                className="form-input"
                value={pwdForm.current}
                onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nueva contraseña</label>
              <input
                type="password"
                className="form-input"
                value={pwdForm.next}
                onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar nueva contraseña</label>
              <input
                type="password"
                className="form-input"
                value={pwdForm.confirm}
                onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                placeholder="Repetí la nueva contraseña"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingPwd}>
              {savingPwd ? 'Cambiando...' : '🔐 Cambiar contraseña'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
