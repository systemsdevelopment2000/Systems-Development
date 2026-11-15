import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  MessageSquare,
  ListChecks,
  CalendarDays,
  Paperclip,
  Link2,
  Lock,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import type { Actividad, Colaborador, Proyecto } from '@/core/datos'
import { PRIO_LABEL, colorDe, fechaCorta } from '../lib/vista'
import { AvatarEquipo } from './AvatarEquipo'

interface Props {
  tarea: Actividad
  proyecto?: Proyecto
  responsables: Colaborador[]
  /** Nombre de quien creó/asignó la tarea. */
  creador?: string
  onAbrir?: (id: string) => void
  overlay?: boolean
}

export function TarjetaTarea({
  tarea,
  proyecto,
  responsables,
  creador,
  onAbrir,
  overlay = false,
}: Props) {
  const pendiente = !!tarea.requiereAprobacion && !tarea.aprobadaPor
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tarea.id,
  })

  const style = { transform: CSS.Transform.toString(transform), transition }
  const classes =
    `kb-card prio-${tarea.prioridad}` +
    (isDragging ? ' is-dragging' : '') +
    (overlay ? ' is-overlay' : '')

  const nEnlaces = tarea.enlaces?.length ?? 0
  const nImagenes = tarea.imagenes?.length ?? 0

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={classes}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!isDragging) onAbrir?.(tarea.id)
      }}
    >
      <div className="kb-card__top">
        {proyecto && (
          <span className="kb-proj">
            <i style={{ background: colorDe(proyecto.id) }} />
            {proyecto.nombre}
          </span>
        )}
        <span className={`kb-prio kb-prio--${tarea.prioridad}`}>{PRIO_LABEL[tarea.prioridad]}</span>
      </div>

      <h4 className="kb-card__title">{tarea.titulo}</h4>

      {tarea.requiereAprobacion && (
        <span className={'kb-aprob' + (pendiente ? '' : ' kb-aprob--ok')}>
          {pendiente ? <Lock size={11} /> : <ShieldCheck size={11} />}
          {pendiente ? 'Requiere aprobación' : 'Aprobada'}
        </span>
      )}

      {tarea.etiquetas.length > 0 && (
        <div className="kb-tags">
          {tarea.etiquetas.map((t) => (
            <span key={t} className="kb-tag">
              {t}
            </span>
          ))}
        </div>
      )}

      {tarea.checklist && tarea.checklist.total > 0 && (
        <div
          className="kb-progress"
          title={`${tarea.checklist.hechos} de ${tarea.checklist.total} completados`}
        >
          <span
            style={{ width: `${Math.round((tarea.checklist.hechos / tarea.checklist.total) * 100)}%` }}
          />
        </div>
      )}

      <div className="kb-card__foot">
        <div className="kb-meta">
          {tarea.checklist && (
            <span className="kb-meta__item" title="Checklist">
              <ListChecks size={13} strokeWidth={1.75} />
              {tarea.checklist.hechos}/{tarea.checklist.total}
            </span>
          )}
          {tarea.comentarios ? (
            <span className="kb-meta__item" title="Comentarios">
              <MessageSquare size={13} strokeWidth={1.75} />
              {tarea.comentarios}
            </span>
          ) : null}
          {nEnlaces > 0 && (
            <span className="kb-meta__item" title="Enlaces">
              <Link2 size={13} strokeWidth={1.75} />
              {nEnlaces}
            </span>
          )}
          {nImagenes > 0 && (
            <span className="kb-meta__item" title="Imágenes">
              <Paperclip size={13} strokeWidth={1.75} />
              {nImagenes}
            </span>
          )}
          {tarea.vence && (
            <span className="kb-meta__item" title="Vence">
              <CalendarDays size={13} strokeWidth={1.75} />
              {fechaCorta(tarea.vence)}
            </span>
          )}
        </div>
        <div className="kb-avatars">
          {responsables.map((m) => (
            <AvatarEquipo key={m.id} persona={m} size={24} />
          ))}
        </div>
      </div>

      {creador && (
        <span className="kb-creador" title={`Asignada por ${creador}`}>
          <UserRound size={11} /> Asignada por {creador}
        </span>
      )}
    </article>
  )
}
