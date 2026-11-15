import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Pencil, Trash2 } from 'lucide-react'
import type { Colaborador } from '@/core/datos'
import type { ProyectoEnriquecido } from '../hooks/useProyectos'

interface Props {
  proyecto: ProyectoEnriquecido
  onAbrir?: () => void
  onEditar: () => void
  onBorrar: () => void
  overlay?: boolean
}

import { PALETA_CATEGORICA as PALETA } from '@/core/lib/colores'

function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}
function colorDe(c: Colaborador) {
  const n = c.id.charCodeAt(0) + (c.id.charCodeAt(1) || 0)
  return PALETA[n % PALETA.length]
}

export function ProyectoCard({ proyecto, onAbrir, onEditar, onBorrar, overlay = false }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: proyecto.id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const visibles = proyecto.responsables.slice(0, 3)
  const extra = proyecto.responsables.length - visibles.length

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={'pr-card' + (isDragging ? ' is-dragging' : '') + (overlay ? ' is-overlay' : '')}
      {...attributes}
      {...listeners}
      onClick={onAbrir}
    >
      <div className="pr-card__top">
        <h4 className="pr-card__nombre">{proyecto.nombre}</h4>
        <div className="pr-card__acc">
          <button
            className="icono-btn"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onEditar()
            }}
            aria-label="Editar proyecto"
          >
            <Pencil size={14} />
          </button>
          <button
            className="icono-btn icono-btn--peligro"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onBorrar()
            }}
            aria-label="Eliminar proyecto"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {proyecto.cliente && <span className="pr-card__cliente">{proyecto.cliente.nombre}</span>}

      {proyecto.tags.length > 0 && (
        <div className="pr-tags">
          {proyecto.tags.map((t) => (
            <span key={t.id} className="pr-tag">
              <i style={{ background: t.color }} />
              {t.nombre}
            </span>
          ))}
        </div>
      )}

      <div className="pr-prog">
        <span style={{ width: `${proyecto.progreso}%` }} />
      </div>

      <div className="pr-card__foot">
        <span className="pr-prog-lbl">{proyecto.progreso}%</span>
        <div className="pr-resp">
          {visibles.map((c) => (
            <span
              key={c.id}
              className="pr-mini"
              style={{ background: colorDe(c) }}
              title={c.nombre}
            >
              {c.fotoPerfil ? <img src={c.fotoPerfil} alt="" /> : iniciales(c.nombre)}
            </span>
          ))}
          {extra > 0 && (
            <span className="pr-mini pr-mini--mas" title={`+${extra} más`}>
              +{extra}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
