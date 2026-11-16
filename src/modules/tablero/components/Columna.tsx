import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import type { Actividad, Colaborador, Proyecto } from '@/core/datos'
import type { ColumnaDef } from '../columnas'
import { TarjetaTarea } from './TarjetaTarea'

interface Props {
  columna: ColumnaDef
  tareas: Actividad[]
  proyectos: Record<string, Proyecto>
  colaboradores: Record<string, Colaborador>
  onAbrir: (id: string) => void
  onAnadir: (estado: ColumnaDef['id']) => void
}

export function Columna({ columna, tareas, proyectos, colaboradores, onAbrir, onAnadir }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: columna.id })

  return (
    <section className={'kb-col' + (isOver ? ' is-over' : '')}>
      <header className="kb-col__head">
        <span className="kb-col__title">
          <i className="kb-col__dot" style={{ background: columna.acento, color: columna.acento }} />
          {columna.titulo}
        </span>
        <span className="kb-col__count">{tareas.length}</span>
      </header>

      <div ref={setNodeRef} className="kb-col__body">
        <SortableContext items={tareas.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tareas.map((t) => (
            <TarjetaTarea
              key={t.id}
              tarea={t}
              proyecto={t.proyectoId ? proyectos[t.proyectoId] : undefined}
              responsables={t.responsables.map((id) => colaboradores[id]).filter(Boolean)}
              creador={t.creadorId ? colaboradores[t.creadorId]?.nombre : undefined}
              onAbrir={onAbrir}
            />
          ))}
        </SortableContext>

        {tareas.length === 0 && <p className="kb-col__empty">Suelta una tarea aquí</p>}

        <button className="kb-add" type="button" onClick={() => onAnadir(columna.id)}>
          <Plus size={14} strokeWidth={2} /> Añadir tarea
        </button>
      </div>
    </section>
  )
}
