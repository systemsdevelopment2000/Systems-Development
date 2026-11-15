import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ListChecks, Link2, Image as ImageIcon } from 'lucide-react'
import type { Actividad, Colaborador } from '@/core/datos'

import { PALETA_CATEGORICA as PALETA } from '@/core/lib/colores'
function colorDe(id: string) {
  return PALETA[(id.charCodeAt(0) + (id.charCodeAt(1) || 0)) % PALETA.length]
}
function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

interface Props {
  actividad: Actividad
  colaboradores: Colaborador[]
  onEditar?: () => void
  overlay?: boolean
}

export function ActividadCard({ actividad, colaboradores, onEditar, overlay = false }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: actividad.id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const resp = actividad.responsables
    .map((id) => colaboradores.find((c) => c.id === id))
    .filter(Boolean) as Colaborador[]

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={
        `act-card prio-${actividad.prioridad}` +
        (isDragging ? ' is-dragging' : '') +
        (overlay ? ' is-overlay' : '')
      }
      {...attributes}
      {...listeners}
      onClick={onEditar}
    >
      <h5 className="act-card__tit">{actividad.titulo}</h5>
      {actividad.etiquetas.length > 0 && (
        <div className="act-tags">
          {actividad.etiquetas.map((t) => (
            <span key={t} className="act-tag">
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="act-card__foot">
        <div className="act-meta">
          {actividad.checklist && (
            <span className="act-check">
              <ListChecks size={12} /> {actividad.checklist.hechos}/{actividad.checklist.total}
            </span>
          )}
          {actividad.enlaces && actividad.enlaces.length > 0 && (
            <span className="act-check">
              <Link2 size={12} /> {actividad.enlaces.length}
            </span>
          )}
          {actividad.imagenes && actividad.imagenes.length > 0 && (
            <span className="act-check">
              <ImageIcon size={12} /> {actividad.imagenes.length}
            </span>
          )}
        </div>
        <div className="pr-resp">
          {resp.map((c) => (
            <span key={c.id} className="pr-mini" style={{ background: colorDe(c.id) }} title={c.nombre}>
              {c.fotoPerfil ? <img src={c.fotoPerfil} alt="" /> : iniciales(c.nombre)}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
