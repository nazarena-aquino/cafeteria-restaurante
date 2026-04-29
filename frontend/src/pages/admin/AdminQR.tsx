import { useEffect, useState } from 'react'
import { qrApi } from '../../api'
import toast from 'react-hot-toast'
import styles from './AdminQR.module.css'

export default function AdminQR() {
  const [qrData, setQrData] = useState<{ qr_data_url: string; menu_url: string } | null>(null)
  const [tableNumber, setTableNumber] = useState('')
  const [tableQr, setTableQr] = useState<{ qr_data_url: string; table_url: string; table_number: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingTable, setLoadingTable] = useState(false)

  useEffect(() => { loadMenuQR() }, [])

  const loadMenuQR = async () => {
    try {
      const res = await qrApi.getMenuQR()
      setQrData(res.data.data)
    } catch { toast.error('Error cargando QR') }
    finally { setLoading(false) }
  }

  const loadTableQR = async () => {
    if (!tableNumber.trim()) { toast.error('Ingresá un número de mesa'); return }
    setLoadingTable(true)
    try {
      const res = await qrApi.getTableQR(tableNumber.trim())
      setTableQr(res.data.data)
    } catch { toast.error('Error generando QR de mesa') }
    finally { setLoadingTable(false) }
  }

  const downloadQR = (dataUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    link.click()
  }

  const printQR = (dataUrl: string, title: string) => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; margin:0; font-family:sans-serif; }
            img { width:280px; height:280px; }
            h2 { color:#2C1810; font-size:1.4rem; margin-bottom:0.5rem; }
            p { color:#8B7B6B; font-size:0.85rem; }
          </style>
        </head>
        <body>
          <h2>☕ ${title}</h2>
          <img src="${dataUrl}" />
          <p>Escaneá para ver el menú</p>
        </body>
      </html>
    `)
    win.document.close()
    setTimeout(() => win.print(), 300)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Código QR del Menú</h1>
        <p>Generá y descargá los códigos QR para tus mesas y locales</p>
      </div>

      <div className={styles.grid}>
        {/* Menu QR */}
        <div className={styles.card}>
          <h2>🍽️ QR General del Menú</h2>
          <p className={styles.desc}>
            Mostrá este código en la entrada o en las mesas para que los clientes vean la carta completa.
          </p>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : qrData ? (
            <>
              <div className={styles.qrWrap}>
                <img src={qrData.qr_data_url} alt="QR Menu" className={styles.qrImage} />
              </div>
              <div className={styles.urlBox}>
                <span>🔗</span>
                <a href={qrData.menu_url} target="_blank" rel="noreferrer" className={styles.url}>
                  {qrData.menu_url}
                </a>
              </div>
              <div className={styles.qrActions}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => downloadQR(qrData.qr_data_url, 'menu-qr.png')}
                >
                  ⬇️ Descargar PNG
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => printQR(qrData.qr_data_url, 'Mi Cafetería — Menú')}
                >
                  🖨️ Imprimir
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Error generando QR</p>
              <button className="btn btn-secondary btn-sm" onClick={loadMenuQR}>Reintentar</button>
            </div>
          )}
        </div>

        {/* Table QR */}
        <div className={styles.card}>
          <h2>🪑 QR por Mesa</h2>
          <p className={styles.desc}>
            Generá un QR específico para cada mesa. Los clientes podrán ordenar indicando su mesa automáticamente.
          </p>

          <div className={styles.tableInput}>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: 1, 2, A, B, VIP..."
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadTableQR()}
            />
            <button
              className="btn btn-primary"
              onClick={loadTableQR}
              disabled={loadingTable}
            >
              {loadingTable ? '...' : 'Generar'}
            </button>
          </div>

          {tableQr && (
            <>
              <div className={styles.tableLabel}>Mesa {tableQr.table_number}</div>
              <div className={styles.qrWrap}>
                <img src={tableQr.qr_data_url} alt={`QR Mesa ${tableQr.table_number}`} className={styles.qrImage} />
              </div>
              <div className={styles.urlBox}>
                <span>🔗</span>
                <a href={tableQr.table_url} target="_blank" rel="noreferrer" className={styles.url}>
                  {tableQr.table_url}
                </a>
              </div>
              <div className={styles.qrActions}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => downloadQR(tableQr.qr_data_url, `mesa-${tableQr.table_number}-qr.png`)}
                >
                  ⬇️ Descargar
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => printQR(tableQr.qr_data_url, `Mesa ${tableQr.table_number}`)}
                >
                  🖨️ Imprimir
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className={styles.instructions}>
        <h3>📋 Instrucciones de uso</h3>
        <ul>
          <li>Imprimí el QR general y colocalo en la entrada o en la barra</li>
          <li>Generá un QR por mesa y colocalo en cada mesa en un soporte o laminado</li>
          <li>Los clientes escanean el QR, ven el menú, hacen su pedido y pagan desde su celular</li>
          <li>Para cambiar la URL del menú, actualizá la variable <code>PUBLIC_MENU_URL</code> en el <code>.env</code> del backend</li>
          <li>En producción, usá tu dominio real (ej: <code>https://micafeteria.com/menu</code>)</li>
        </ul>
      </div>
    </div>
  )
}
