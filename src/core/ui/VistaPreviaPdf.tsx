import './vistaPreviaPdf.css'
import { useEffect, useRef } from 'react'
import { X, Printer, Download, ExternalLink } from 'lucide-react'
import { Button } from './Button'

interface Props {
  url: string
  nombre: string
  onDescargar: () => void
  onCerrar: () => void
}

/** Vista previa del PDF antes de descargar, con opción de imprimir. */
export function VistaPreviaPdf({ url, nombre, onDescargar, onCerrar }: Props) {
  const marco = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onCerrar])

  function imprimir() {
    const ventana = marco.current?.contentWindow
    try {
      if (ventana) {
        ventana.focus()
        ventana.print()
        return
      }
    } catch {
      /* algunos visores de PDF bloquean print() desde el iframe */
    }
    // Respaldo: abrir en una pestaña y dejar que el visor del navegador imprima.
    window.open(url, '_blank', 'noopener')
  }

  function abrirNuevaVentana() {
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div className="pdfv" role="presentation" onMouseDown={onCerrar}>
      <div
        className="pdfv__panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Vista previa de ${nombre}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="pdfv__head">
          <h2 className="pdfv__tit">Vista previa · {nombre}.pdf</h2>
          <button className="modal__close" onClick={onCerrar} aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>

        <iframe ref={marco} className="pdfv__frame" src={url} title={`Vista previa de ${nombre}`} />

        <footer className="pdfv__pie">
          <span className="field__hint">Revisa el documento antes de descargarlo.</span>
          <div className="pdfv__acc">
            <Button type="button" variant="ghost" onClick={abrirNuevaVentana} title="Abrir en pestaña completa">
              <ExternalLink size={15} /> Abrir
            </Button>
            <Button type="button" variant="ghost" onClick={imprimir}>
              <Printer size={15} /> Imprimir
            </Button>
            <Button type="button" onClick={onDescargar}>
              <Download size={15} /> Descargar
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}

