import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

export type TipoToast = 'error' | 'exito' | 'advertencia' | 'info'

export interface ItemToast {
  id: string
  tipo: TipoToast
  titulo: string
  detalle?: string
  duracionMs?: number
}

interface ToastContextType {
  toasts: ItemToast[]
  mostrarToast: (toast: Omit<ItemToast, 'id'>) => string
  quitarToast: (id: string) => void
  error: (titulo: string, detalle?: string) => void
  exito: (titulo: string, detalle?: string) => void
  advertencia: (titulo: string, detalle?: string) => void
  info: (titulo: string, detalle?: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

/**
 * Funciones globales para disparar notificaciones desde cualquier lugar
 * (incluso fuera de componentes React, por ejemplo en llamadas de persistencia o fetch).
 */
export function notificarError(titulo: string, detalle?: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sd:toast', {
        detail: { tipo: 'error', titulo, detalle, duracionMs: 7000 },
      }),
    )
  }
}

export function notificarExito(titulo: string, detalle?: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sd:toast', {
        detail: { tipo: 'exito', titulo, detalle, duracionMs: 4000 },
      }),
    )
  }
}

export function notificarAdvertencia(titulo: string, detalle?: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sd:toast', {
        detail: { tipo: 'advertencia', titulo, detalle, duracionMs: 5000 },
      }),
    )
  }
}

export function notificarInfo(titulo: string, detalle?: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sd:toast', {
        detail: { tipo: 'info', titulo, detalle, duracionMs: 4000 },
      }),
    )
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ItemToast[]>([])

  const quitarToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const mostrarToast = useCallback(
    (item: Omit<ItemToast, 'id'>) => {
      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : 'toast_' + Math.random().toString(36).slice(2, 9)
      const nuevo: ItemToast = { ...item, id }

      setToasts((prev) => [...prev.slice(-4), nuevo])

      const duracion = item.duracionMs ?? (item.tipo === 'error' ? 7000 : 4500)
      if (duracion > 0) {
        setTimeout(() => {
          quitarToast(id)
        }, duracion)
      }

      return id
    },
    [quitarToast],
  )

  const error = useCallback(
    (titulo: string, detalle?: string) => mostrarToast({ tipo: 'error', titulo, detalle }),
    [mostrarToast],
  )
  const exito = useCallback(
    (titulo: string, detalle?: string) => mostrarToast({ tipo: 'exito', titulo, detalle }),
    [mostrarToast],
  )
  const advertencia = useCallback(
    (titulo: string, detalle?: string) => mostrarToast({ tipo: 'advertencia', titulo, detalle }),
    [mostrarToast],
  )
  const info = useCallback(
    (titulo: string, detalle?: string) => mostrarToast({ tipo: 'info', titulo, detalle }),
    [mostrarToast],
  )

  // Escuchar eventos globales disparados con `window.dispatchEvent`
  useEffect(() => {
    const handleCustomToast = (e: Event) => {
      const ce = e as CustomEvent<Omit<ItemToast, 'id'>>
      if (ce.detail) {
        mostrarToast(ce.detail)
      }
    }

    // Atrapador de errores silenciosos no manejados en JavaScript
    const handleError = (e: ErrorEvent) => {
      // Ignorar errores triviales de extensiones de navegador
      if (e.filename && (e.filename.includes('chrome-extension://') || e.filename.includes('moz-extension://'))) {
        return
      }
      mostrarToast({
        tipo: 'error',
        titulo: 'Error en la aplicación',
        detalle: e.message || 'Se produjo un error no controlado en tiempo de ejecución.',
      })
    }

    // Atrapador de promesas rechazadas sin catch
    const handleRejection = (e: PromiseRejectionEvent) => {
      const razon = e.reason
      const msg =
        razon instanceof Error
          ? razon.message
          : typeof razon === 'string'
            ? razon
            : typeof razon?.message === 'string'
              ? razon.message
              : 'Error en una operación asíncrona.'

      // Ignorar cancelaciones intencionales de fetch o navigation abort
      if (msg.includes('AbortError') || msg.includes('canceled')) return

      mostrarToast({
        tipo: 'error',
        titulo: 'Fallo de operación asíncrona',
        detalle: msg,
      })
    }

    window.addEventListener('sd:toast', handleCustomToast)
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('sd:toast', handleCustomToast)
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [mostrarToast])

  return (
    <ToastContext.Provider
      value={{ toasts, mostrarToast, quitarToast, error, exito, advertencia, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onCerrar={quitarToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de un ToastProvider')
  }
  return ctx
}

function ToastContainer({
  toasts,
  onCerrar,
}: {
  toasts: ItemToast[]
  onCerrar: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <aside
      className="sd-toast-container"
      aria-live="polite"
      aria-label="Notificaciones del sistema"
    >
      {toasts.map((t) => {
        const Icono =
          t.tipo === 'error'
            ? AlertCircle
            : t.tipo === 'advertencia'
              ? AlertTriangle
              : t.tipo === 'exito'
                ? CheckCircle2
                : Info

        return (
          <div
            key={t.id}
            className={`sd-toast sd-toast--${t.tipo}`}
            role={t.tipo === 'error' ? 'alert' : 'status'}
          >
            <div className="sd-toast__icon">
              <Icono size={18} strokeWidth={2.2} />
            </div>
            <div className="sd-toast__body">
              <strong className="sd-toast__title">{t.titulo}</strong>
              {t.detalle && <p className="sd-toast__desc">{t.detalle}</p>}
            </div>
            <button
              type="button"
              className="sd-toast__close"
              onClick={() => onCerrar(t.id)}
              aria-label="Cerrar notificación"
            >
              <X size={15} />
            </button>
          </div>
        )
      })}
    </aside>
  )
}
