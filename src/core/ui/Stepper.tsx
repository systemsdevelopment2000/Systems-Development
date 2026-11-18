import './stepper.css'
import { Check, Layers, ListOrdered } from 'lucide-react'

export interface PasoDef {
  id: string | number
  titulo: string
  descripcion?: string
}

interface StepperProps {
  pasos: PasoDef[]
  pasoActual: number
  maxPasoAlcanzado?: number
  onPasoClick?: (paso: number) => void
  verTodo?: boolean
  onToggleVerTodo?: (verTodo: boolean) => void
}

export function Stepper({
  pasos,
  pasoActual,
  onPasoClick,
  verTodo = false,
  onToggleVerTodo,
}: StepperProps) {
  const sePuedeNavegar = Boolean(onPasoClick)

  return (
    <div className="stepper-contenedor">
      {onToggleVerTodo && (
        <div className="stepper__modo-barra">
          <span className="stepper__modo-tit">
            {verTodo ? 'Vista completa (todos los datos)' : `Paso ${pasoActual + 1} de ${pasos.length}`}
          </span>
          <div className="stepper__tabs-modo" role="tablist" aria-label="Modo de visualización">
            <button
              type="button"
              role="tab"
              aria-selected={verTodo}
              className={'stepper__tab-btn' + (verTodo ? ' is-active' : '')}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleVerTodo(true)
              }}
              title="Mostrar todos los campos a la vez para editar libremente"
            >
              <Layers size={13} /> Mostrar todos los datos
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!verTodo}
              className={'stepper__tab-btn' + (!verTodo ? ' is-active' : '')}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleVerTodo(false)
              }}
              title="Guiar por pasos ordenados"
            >
              <ListOrdered size={13} /> Paso a paso
            </button>
          </div>
        </div>
      )}

      {verTodo ? (
        <div className="stepper__pills-rapidas" aria-label="Secciones del formulario">
          {pasos.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              className="stepper__pill-btn"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                const el = document.getElementById(`seccion-paso-${p.id}`)
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                onPasoClick?.(idx)
              }}
            >
              <span className="stepper__pill-num">{idx + 1}</span>
              <span>{p.titulo.replace(/^\d+\.\s*/, '')}</span>
            </button>
          ))}
        </div>
      ) : (
        <nav className="stepper" aria-label="Progreso del formulario">
          {pasos.map((p, idx) => {
            const esActivo = idx === pasoActual
            const esCompletado = idx < pasoActual

            return (
              <div key={p.id} style={{ display: 'contents' }}>
                <button
                  type="button"
                  className={
                    'stepper__item' +
                    (esActivo ? ' stepper__item--activo' : '') +
                    (esCompletado ? ' stepper__item--completado' : '')
                  }
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (sePuedeNavegar) onPasoClick?.(idx)
                  }}
                  disabled={!sePuedeNavegar}
                  aria-current={esActivo ? 'step' : undefined}
                >
                  <span className="stepper__num">
                    {esCompletado ? <Check size={14} strokeWidth={2.5} /> : idx + 1}
                  </span>
                  <div className="stepper__info">
                    <span className="stepper__tit">{p.titulo}</span>
                    {p.descripcion && <span className="stepper__sub">{p.descripcion}</span>}
                  </div>
                </button>
                {idx < pasos.length - 1 && (
                  <div
                    className={
                      'stepper__linea' +
                      (idx < pasoActual ? ' stepper__linea--completada' : '')
                    }
                    aria-hidden="true"
                  />
                )}
              </div>
            )
          })}
        </nav>
      )}
    </div>
  )
}


