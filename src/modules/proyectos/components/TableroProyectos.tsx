import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Modal, useConfirmar } from '@/core/ui'
import { useProyectos, type ProyectoEnriquecido } from '../hooks/useProyectos'
import { ColumnaEstado } from './ColumnaEstado'
import { ProyectoCard } from './ProyectoCard'
import { ProyectoForm } from './ProyectoForm'

export function TableroProyectos() {
  const {
    proyectos,
    estadosCatalogo,
    clientes,
    colaboradores,
    tagsCatalogo,
    estadoInicialId,
    guardar,
    borrar,
    cambiarEstado,
    crearTag,
  } = useProyectos()
  const confirmar = useConfirmar()

  const navegar = useNavigate()
  const [activaId, setActivaId] = useState<string | null>(null)
  const [abierto, setAbierto] = useState(false)
  const [editando, setEditando] = useState<ProyectoEnriquecido | undefined>(undefined)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const esColumna = (id: string) => estadosCatalogo.some((e) => e.id === id)
  const estadoDe = (id: string) =>
    esColumna(id) ? id : proyectos.find((p) => p.id === id)?.estadoId

  function onDragStart(e: DragStartEvent) {
    setActivaId(String(e.active.id))
  }
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActivaId(null)
    if (!over) return
    const destino = estadoDe(String(over.id))
    if (!destino) return
    const p = proyectos.find((x) => x.id === active.id)
    if (!p || p.estadoId === destino) return
    const r = cambiarEstado(String(active.id), destino)
    if (!r.ok && r.motivo) window.alert(r.motivo)
  }

  function nuevo() {
    setEditando(undefined)
    setAbierto(true)
  }
  function editar(p: ProyectoEnriquecido) {
    setEditando(p)
    setAbierto(true)
  }
  async function onBorrar(p: ProyectoEnriquecido) {
    const ok = await confirmar({
      titulo: `¿Eliminar el proyecto "${p.nombre}"?`,
      mensaje: 'Se eliminará junto con su tablero, reuniones, chat e historial.',
      textoConfirmar: 'Eliminar',
      peligro: true,
    })
    if (ok) borrar(p.id)
  }

  const activa = activaId ? proyectos.find((p) => p.id === activaId) : null

  return (
    <>
      <div className="pr-top">
        <div>
          <h1 className="page__title">Proyectos</h1>
          <p className="page__subtitle">
            {proyectos.length} {proyectos.length === 1 ? 'proyecto' : 'proyectos'} · arrastra una
            tarjeta para cambiar de estado
          </p>
        </div>
        <button className="btn btn--primary btn--icono" onClick={nuevo}>
          <Plus size={16} /> Nuevo proyecto
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="pr-board">
          {estadosCatalogo.map((est) => (
            <ColumnaEstado
              key={est.id}
              estado={est}
              proyectos={proyectos.filter((p) => p.estadoId === est.id)}
              onAbrir={(p) => navegar(`/proyectos/${p.id}`)}
              onEditar={editar}
              onBorrar={onBorrar}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activa ? (
            <ProyectoCard proyecto={activa} onEditar={() => {}} onBorrar={() => {}} overlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      <Modal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo={editando ? 'Editar proyecto' : 'Nuevo proyecto'}
        ancho={640}
      >
        <ProyectoForm
          inicial={editando}
          clientes={clientes}
          estados={estadosCatalogo}
          tags={tagsCatalogo}
          colaboradores={colaboradores}
          estadoInicialId={estadoInicialId}
          onCrearTag={crearTag}
          onGuardar={(datos) => {
            guardar(datos)
            setAbierto(false)
          }}
          onCancelar={() => setAbierto(false)}
        />
      </Modal>
    </>
  )
}
