import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Trash2 } from 'lucide-react'
import { Modal } from '@/core/ui'
import type { Actividad, Colaborador, EstadoActividad } from '@/core/datos'
import type { EntradaActividad } from '../../hooks/useProyectoDetalle'
import { ActividadCard } from './ActividadCard'
import { ActividadForm } from './ActividadForm'

const COLS: { id: EstadoActividad; titulo: string; color: string }[] = [
  { id: 'backlog', titulo: 'Backlog', color: '#646c84' },
  { id: 'por_hacer', titulo: 'Por hacer', color: '#b9b8ba' },
  { id: 'en_curso', titulo: 'En curso', color: '#05e4fd' },
  { id: 'revision', titulo: 'Revisión', color: '#8b5cf6' },
  { id: 'hecho', titulo: 'Hecho', color: '#22c55e' },
]

function Columna({
  col,
  actividades,
  colaboradores,
  onEditar,
}: {
  col: (typeof COLS)[number]
  actividades: Actividad[]
  colaboradores: Colaborador[]
  onEditar: (a: Actividad) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  return (
    <section className={'act-col' + (isOver ? ' is-over' : '')}>
      <header className="act-col__head">
        <span className="act-col__tit">
          <i style={{ background: col.color }} />
          {col.titulo}
        </span>
        <span className="act-col__n">{actividades.length}</span>
      </header>
      <div ref={setNodeRef} className="act-col__body">
        <SortableContext items={actividades.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {actividades.map((a) => (
            <ActividadCard
              key={a.id}
              actividad={a}
              colaboradores={colaboradores}
              onEditar={() => onEditar(a)}
            />
          ))}
        </SortableContext>
        {actividades.length === 0 && <p className="act-col__empty">—</p>}
      </div>
    </section>
  )
}

interface Props {
  actividades: Actividad[]
  colaboradores: Colaborador[]
  onGuardar: (d: EntradaActividad) => void
  onBorrar: (id: string) => void
  onMover: (id: string, estado: EstadoActividad) => void
}

export function TabActividades({ actividades, colaboradores, onGuardar, onBorrar, onMover }: Props) {
  const [activaId, setActivaId] = useState<string | null>(null)
  const [abierto, setAbierto] = useState(false)
  const [editando, setEditando] = useState<Actividad | undefined>(undefined)
  const [estadoNueva, setEstadoNueva] = useState<EstadoActividad>('backlog')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const esCol = (id: string) => COLS.some((c) => c.id === id)
  const estadoDe = (id: string): EstadoActividad | undefined =>
    esCol(id) ? (id as EstadoActividad) : actividades.find((a) => a.id === id)?.estado

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActivaId(null)
    if (!over) return
    const destino = estadoDe(String(over.id))
    if (destino) onMover(String(active.id), destino)
  }

  const activa = activaId ? actividades.find((a) => a.id === activaId) : null

  return (
    <div className="tab-sec">
      <button
        className="btn btn--primary btn--icono"
        onClick={() => {
          setEditando(undefined)
          setEstadoNueva('backlog')
          setAbierto(true)
        }}
      >
        <Plus size={16} /> Nueva actividad
      </button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => setActivaId(String(e.active.id))}
        onDragEnd={onDragEnd}
      >
        <div className="act-board">
          {COLS.map((col) => (
            <Columna
              key={col.id}
              col={col}
              actividades={actividades.filter((a) => a.estado === col.id)}
              colaboradores={colaboradores}
              onEditar={(a) => {
                setEditando(a)
                setAbierto(true)
              }}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activa ? <ActividadCard actividad={activa} colaboradores={colaboradores} overlay /> : null}
        </DragOverlay>
      </DndContext>

      <Modal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo={editando ? 'Editar actividad' : 'Nueva actividad'}
      >
        {editando && (
          <button
            className="btn btn--ghost btn--icono"
            style={{ marginBottom: 12 }}
            onClick={() => {
              onBorrar(editando.id)
              setAbierto(false)
            }}
          >
            <Trash2 size={14} /> Eliminar actividad
          </button>
        )}
        <ActividadForm
          inicial={editando}
          colaboradores={colaboradores}
          estadoInicial={estadoNueva}
          onGuardar={(d) => {
            onGuardar(d)
            setAbierto(false)
          }}
          onCancelar={() => setAbierto(false)}
        />
      </Modal>
    </div>
  )
}
