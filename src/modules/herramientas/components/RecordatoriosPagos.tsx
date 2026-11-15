import '../styles/herramientas.css'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, X, Wrench } from 'lucide-react'
import { useHerramientas } from '../hooks/useHerramientas'

const CERRADO_KEY = 'sd-recordatorio-pagos-cerrado'
const NOTIF_KEY = 'sd-recordatorio-pagos-notif'

function leer(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1'
  } catch {
    return false
  }
}
function marcar(key: string) {
  try {
    sessionStorage.setItem(key, '1')
  } catch {
    /* almacenamiento no disponible */
  }
}

/**
 * Aviso global de pagos de herramientas por vencer o vencidas. Se monta una vez
 * en el layout privado: muestra un recordatorio flotante (descartable por sesión)
 * y, si el usuario concedió permiso, una notificación del sistema.
 */
export function RecordatoriosPagos() {
  const { herramientas } = useHerramientas()
  const nav = useNavigate()
  const [cerrado, setCerrado] = useState(() => leer(CERRADO_KEY))

  const pendientes = useMemo(
    () =>
      herramientas.filter(
        (h) => h.activa && (h.estadoPago === 'por_vencer' || h.estadoPago === 'vencida'),
      ),
    [herramientas],
  )

  useEffect(() => {
    if (pendientes.length === 0) return
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    if (leer(NOTIF_KEY)) return
    const vencidas = pendientes.filter((h) => h.estadoPago === 'vencida').length
    new Notification('Pagos de herramientas', {
      body:
        `${pendientes.length} por atender` +
        (vencidas ? ` · ${vencidas} vencida(s)` : '') +
        `: ${pendientes.slice(0, 3).map((h) => h.nombre).join(', ')}`,
    })
    marcar(NOTIF_KEY)
  }, [pendientes])

  // Auto-descartar para no estorbar la interacción con el contenido.
  useEffect(() => {
    if (cerrado || pendientes.length === 0) return
    const t = setTimeout(() => {
      setCerrado(true)
      marcar(CERRADO_KEY)
    }, 12000)
    return () => clearTimeout(t)
  }, [cerrado, pendientes.length])

  if (cerrado || pendientes.length === 0) return null

  function cerrar() {
    setCerrado(true)
    marcar(CERRADO_KEY)
  }

  function irAHerramientas() {
    cerrar()
    nav('/herramientas')
  }

  return (
    <aside className="record" role="alert" aria-label="Recordatorio de pagos">
      <div className="record__head">
        <span className="record__ic">
          <AlertTriangle size={15} />
        </span>
        <strong>Pagos por vencer</strong>
        <button className="record__x" onClick={cerrar} aria-label="Descartar">
          <X size={15} />
        </button>
      </div>
      <ul className="record__lista">
        {pendientes.slice(0, 5).map((h) => (
          <li key={h.id}>
            <span className="record__nom">{h.nombre}</span>
            <span className={'record__badge record__badge--' + h.estadoPago}>
              {h.estadoPago === 'vencida'
                ? `Vencida ${Math.abs(h.dias ?? 0)}d`
                : h.dias === 0
                  ? 'Vence hoy'
                  : `En ${h.dias}d`}
            </span>
          </li>
        ))}
      </ul>
      {pendientes.length > 5 && (
        <p className="record__mas">y {pendientes.length - 5} más…</p>
      )}
      <button className="record__ver" onClick={irAHerramientas}>
        <Wrench size={13} /> Ver herramientas
      </button>
    </aside>
  )
}
