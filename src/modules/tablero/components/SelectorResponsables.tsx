import { Check } from 'lucide-react'
import type { Colaborador } from '@/core/datos'
import { colorDe, iniciales } from '../lib/vista'

interface Props {
  colaboradores: Colaborador[]
  seleccion: string[]
  onCambio: (ids: string[]) => void
}

/** Selección múltiple de responsables (admite 0, 1 o N personas por tarea). */
export function SelectorResponsables({ colaboradores, seleccion, onCambio }: Props) {
  function alternar(id: string) {
    onCambio(seleccion.includes(id) ? seleccion.filter((x) => x !== id) : [...seleccion, id])
  }

  if (colaboradores.length === 0) {
    return <p className="field__hint">No hay colaboradores activos. Agrégalos en Colaboradores.</p>
  }

  return (
    <div className="resp-sel">
      {colaboradores.map((c) => {
        const on = seleccion.includes(c.id)
        return (
          <button
            key={c.id}
            type="button"
            className={'resp-chip' + (on ? ' is-on' : '')}
            onClick={() => alternar(c.id)}
            aria-pressed={on}
          >
            <span className="resp-chip__av" style={{ background: colorDe(c.id) }}>
              {iniciales(c.nombre)}
            </span>
            {c.nombre}
            {on && <Check size={13} className="resp-chip__ck" />}
          </button>
        )
      })}
    </div>
  )
}
