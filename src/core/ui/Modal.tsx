import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { reproducir } from '@/core/sonido'

interface Props {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  children: ReactNode
  ancho?: number
  cabeceraExtra?: ReactNode
  pie?: ReactNode
  cerrarAlClickFondo?: boolean
}

export function Modal({
  abierto,
  onCerrar,
  titulo,
  children,
  ancho = 580,
  cabeceraExtra,
  pie,
  cerrarAlClickFondo = false,
}: Props) {
  useEffect(() => {
    if (!abierto) return
    reproducir('abrir')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      reproducir('cerrar')
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div
      className="modal"
      role="presentation"
      onClick={(e) => {
        if (cerrarAlClickFondo && e.target === e.currentTarget) {
          onCerrar()
        }
      }}
    >
      <div
        className="modal__panel"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        style={{ maxWidth: ancho }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <header className="modal__head">
          <h2 className="modal__title">{titulo}</h2>
          <button type="button" className="modal__close" onClick={onCerrar} aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>
        {cabeceraExtra && <div className="modal__subhead">{cabeceraExtra}</div>}
        <div className="modal__body">{children}</div>
        {pie && <footer className="modal__foot">{pie}</footer>}
      </div>
    </div>
  )
}
