import './hoja.css'
import { FileText, SquarePen } from 'lucide-react'
import type { ReactNode, RefObject } from 'react'

/**
 * Alterna entre la interfaz de trabajo y la hoja tal como se imprime.
 *
 * No es "mostrar u ocultar la hoja al final": son dos vistas del mismo
 * contenido y solo se ve una. Antes la hoja se renderizaba siempre debajo del
 * formulario y había que bajar media página para volver a la interfaz.
 */
export function ConmutadorHoja({
  visible,
  onCambio,
  etiquetaEditor = 'Editar',
  etiquetaHoja = 'Hoja',
}: {
  visible: boolean
  onCambio: (v: boolean) => void
  etiquetaEditor?: string
  etiquetaHoja?: string
}) {
  return (
    <div className="hoja-sw" role="group" aria-label="Vista">
      <button
        type="button"
        className={visible ? '' : 'is-on'}
        onClick={() => onCambio(false)}
        aria-pressed={!visible}
      >
        <SquarePen size={14} /> {etiquetaEditor}
      </button>
      <button
        type="button"
        className={visible ? 'is-on' : ''}
        onClick={() => onCambio(true)}
        aria-pressed={visible}
        title="Ver el documento como se imprime"
      >
        <FileText size={14} /> {etiquetaHoja}
      </button>
    </div>
  )
}

/**
 * Contenedor de la hoja. Cuando no está visible se saca de la pantalla en vez
 * de desmontarla, porque el PDF se genera rasterizando este mismo nodo: si no
 * existe o no tiene caja, no hay nada que convertir.
 */
export function Hoja({
  visible,
  innerRef,
  children,
}: {
  visible: boolean
  innerRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}) {
  return (
    <div
      ref={innerRef}
      className={'hoja-panel' + (visible ? '' : ' is-oculta')}
      aria-hidden={!visible}
    >
      {children}
    </div>
  )
}

/* HMR: fuerza a los servidores en marcha a releer este módulo. */
