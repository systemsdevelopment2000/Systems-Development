import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { EstadoProyecto } from '@/core/datos'
import type { ProyectoEnriquecido } from '../hooks/useProyectos'
import { ProyectoCard } from './ProyectoCard'

interface Props {
  estado: EstadoProyecto
  proyectos: ProyectoEnriquecido[]
  onAbrir: (p: ProyectoEnriquecido) => void
  onEditar: (p: ProyectoEnriquecido) => void
  onBorrar: (p: ProyectoEnriquecido) => void
}

export function ColumnaEstado({ estado, proyectos, onAbrir, onEditar, onBorrar }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: estado.id })

  return (
    <section className={'pr-col' + (isOver ? ' is-over' : '')}>
      <header className="pr-col__head">
        <span className="pr-col__title">
          <i className="pr-col__dot" style={{ background: estado.color, color: estado.color }} />
          {estado.nombre}
        </span>
        <span className="pr-col__count">{proyectos.length}</span>
      </header>
      <div ref={setNodeRef} className="pr-col__body">
        <SortableContext items={proyectos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {proyectos.map((p) => (
            <ProyectoCard
              key={p.id}
              proyecto={p}
              onAbrir={() => onAbrir(p)}
              onEditar={() => onEditar(p)}
              onBorrar={() => onBorrar(p)}
            />
          ))}
        </SortableContext>
        {proyectos.length === 0 && <p className="pr-col__empty">—</p>}
      </div>
    </section>
  )
}
