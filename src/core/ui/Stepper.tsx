import './stepper.css'
import { Check } from 'lucide-react'

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
}

export function Stepper({
  pasos,
  pasoActual,
  maxPasoAlcanzado = pasoActual,
  onPasoClick,
}: StepperProps) {
  return (
    <nav className="stepper" aria-label="Progreso del formulario">
      {pasos.map((p, idx) => {
        const esActivo = idx === pasoActual
        const esCompletado = idx < pasoActual
        const sePuedeNavegar = onPasoClick && idx <= maxPasoAlcanzado

        return (
          <div key={p.id} style={{ display: 'contents' }}>
            <button
              type="button"
              className={
                'stepper__item' +
                (esActivo ? ' stepper__item--activo' : '') +
                (esCompletado ? ' stepper__item--completado' : '')
              }
              onClick={() => sePuedeNavegar && onPasoClick?.(idx)}
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
  )
}

