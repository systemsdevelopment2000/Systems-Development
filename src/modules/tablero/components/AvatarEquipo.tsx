import type { Colaborador } from '@/core/datos'
import { colorDe, iniciales } from '../lib/vista'

type Persona = Pick<Colaborador, 'id' | 'nombre' | 'rol'>

export function AvatarEquipo({ persona, size = 24 }: { persona: Persona; size?: number }) {
  return (
    <span
      className="kb-avatar"
      title={persona.rol ? `${persona.nombre} · ${persona.rol}` : persona.nombre}
      style={{ width: size, height: size, background: colorDe(persona.id) }}
    >
      {iniciales(persona.nombre)}
    </span>
  )
}
