import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Modal, useConfirmar } from '@/core/ui'
import { reproducir } from '@/core/sonido'
import type { Actividad, EstadoActividad, Prioridad } from '@/core/datos'
import { COLUMNAS, ES_COLUMNA } from '../columnas'
import { useTablero } from '../hooks/useTablero'
import { BarraFiltros } from './BarraFiltros'
import { Columna } from './Columna'
import { TarjetaTarea } from './TarjetaTarea'
import { TareaForm } from './TareaForm'
import { TareaDetalle } from './TareaDetalle'

export function TableroKanban() {
  const { actividades, proyectos, colaboradores, guardar, guardarVarias, persistir, borrar } =
    useTablero()

  const [items, setItems] = useState<Actividad[]>(actividades)
  const [activaId, setActivaId] = useState<string | null>(null)
  const confirmar = useConfirmar()

  // Filtros
  const [proyecto, setProyecto] = useState('todos')
  const [prioridades, setPrioridades] = useState<Prioridad[]>([])
  const [respFiltro, setRespFiltro] = useState<string[]>([])

  // Modales
  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Actividad | undefined>(undefined)
  const [estadoNuevo, setEstadoNuevo] = useState<EstadoActividad>('backlog')
  const [detalleId, setDetalleId] = useState<string | null>(null)

  // Mantener la lista local en sync con el store (salvo mientras se arrastra).
  useEffect(() => {
    if (!activaId) setItems(actividades)
  }, [actividades, activaId])

  const proyectosMap = useMemo(() => Object.fromEntries(proyectos.map((p) => [p.id, p])), [proyectos])
  const colabMap = useMemo(
    () => Object.fromEntries(colaboradores.map((c) => [c.id, c])),
    [colaboradores],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function pasaFiltro(a: Actividad): boolean {
    if (proyecto === 'sin_proyecto') {
      if (a.proyectoId) return false
    } else if (proyecto !== 'todos' && a.proyectoId !== proyecto) {
      return false
    }
    if (prioridades.length && !prioridades.includes(a.prioridad)) return false
    if (respFiltro.length && !a.responsables.some((r) => respFiltro.includes(r))) return false
    return true
  }

  const visibles = items.filter(pasaFiltro)
  const porColumna = (col: EstadoActividad) =>
    visibles
      .filter((a) => a.estado === col)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

  const columnaDe = (id: string): EstadoActividad | undefined => {
    if (ES_COLUMNA(id)) return id
    return items.find((t) => t.id === id)?.estado
  }

  function handleDragStart(e: DragStartEvent) {
    setActivaId(String(e.active.id))
    reproducir('mover')
  }

  /**
   * La traba aplica en UNA fase, no en todas: la tarea llega libremente hasta
   * `apruebaEn` y no sale de ahí sin el visto bueno. Antes bloqueaba cualquier
   * movimiento, así que una tarea marcada no se podía ni empezar.
   */
  function bloqueada(t?: Actividad) {
    if (!t?.requiereAprobacion || t.aprobadaPor) return false
    return t.estado === (t.apruebaEn ?? 'revision')
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e
    if (!over) return
    if (bloqueada(items.find((t) => t.id === active.id))) return
    const activeCol = columnaDe(String(active.id))
    const overCol = columnaDe(String(over.id))
    if (!activeCol || !overCol || activeCol === overCol) return
    setItems((prev) => prev.map((t) => (t.id === active.id ? { ...t, estado: overCol } : t)))
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActivaId(null)
    reproducir('soltar')
    if (!over) return
    const overCol = columnaDe(String(over.id))
    if (!overCol) return

    setItems((prev) => {
      const enCol = prev.filter((t) => t.estado === overCol)
      const resto = prev.filter((t) => t.estado !== overCol)
      const desde = enCol.findIndex((t) => t.id === active.id)
      if (desde === -1) return prev
      const hasta = ES_COLUMNA(String(over.id))
        ? enCol.length - 1
        : enCol.findIndex((t) => t.id === over.id)
      const ordenada = arrayMove(enCol, desde, hasta < 0 ? enCol.length - 1 : hasta).map(
        (t, i) => ({ ...t, orden: i }),
      )
      persistir(ordenada) // upsert idempotente de la columna destino
      return [...resto, ...ordenada]
    })
  }

  const tareaActiva = activaId ? items.find((t) => t.id === activaId) : null
  const tareaDetalle = detalleId ? items.find((t) => t.id === detalleId) : null

  // --- Acciones de modales ---
  function abrirNueva(estado: EstadoActividad = 'backlog') {
    setEditando(undefined)
    setEstadoNuevo(estado)
    setFormAbierto(true)
  }
  function abrirEditar(t: Actividad) {
    setDetalleId(null)
    setEditando(t)
    setFormAbierto(true)
  }
  function onCrear(titulos: string[], base: Parameters<typeof guardarVarias>[1]) {
    guardarVarias(titulos, base)
    setFormAbierto(false)
  }
  function onEditar(datos: Parameters<typeof guardar>[0]) {
    guardar(datos)
    setFormAbierto(false)
  }
  /** Cambia el estado de una tarea sin abrir el formulario (desde el detalle). */
  function cambiarEstado(t: Actividad, estado: EstadoActividad) {
    if (t.estado === estado || bloqueada(t)) return
    const enDestino = items.filter((x) => x.estado === estado && x.id !== t.id)
    const orden = enDestino.reduce((max, x) => Math.max(max, x.orden ?? 0), -1) + 1
    guardar({ ...t, estado, orden })
    reproducir('soltar')
  }

  /** Da el visto bueno: libera el avance desde la fase trabada. */
  function aprobar(t: Actividad, aprobadorId: string) {
    guardar({
      ...t,
      aprobadaPor: t.aprobadorId ?? aprobadorId,
      aprobadaEn: new Date().toISOString(),
    })
    reproducir('exito')
  }

  async function onBorrar(id: string) {
    const t = items.find((x) => x.id === id)
    const ok = await confirmar({
      titulo: `¿Eliminar "${t?.titulo ?? 'esta tarea'}"?`,
      mensaje: 'La tarea se quitará del tablero y del proyecto.',
      textoConfirmar: 'Eliminar',
      peligro: true,
    })
    if (ok) {
      borrar(id)
      setDetalleId(null)
    }
  }

  return (
    <div className="kb-scope">
      <BarraFiltros
        proyectos={proyectos}
        colaboradores={colaboradores}
        seleccion={proyecto}
        onSeleccion={setProyecto}
        prioridades={prioridades}
        onPrioridades={setPrioridades}
        responsables={respFiltro}
        onResponsables={setRespFiltro}
        totalVisible={visibles.length}
        onNueva={() => abrirNueva('backlog')}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="kb-board">
          {COLUMNAS.map((col) => (
            <Columna
              key={col.id}
              columna={col}
              tareas={porColumna(col.id)}
              proyectos={proyectosMap}
              colaboradores={colabMap}
              onAbrir={setDetalleId}
              onAnadir={abrirNueva}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {tareaActiva ? (
            <TarjetaTarea
              tarea={tareaActiva}
              proyecto={tareaActiva.proyectoId ? proyectosMap[tareaActiva.proyectoId] : undefined}
              responsables={tareaActiva.responsables.map((id) => colabMap[id]).filter(Boolean)}
              overlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <Modal
        abierto={formAbierto}
        onCerrar={() => setFormAbierto(false)}
        titulo={editando ? 'Editar tarea' : 'Nueva tarea'}
        ancho={640}
      >
        <TareaForm
          inicial={editando}
          estadoInicial={estadoNuevo}
          proyectoInicialId={proyecto !== 'todos' && proyecto !== 'sin_proyecto' ? proyecto : undefined}
          proyectos={proyectos}
          colaboradores={colaboradores}
          onEditar={onEditar}
          onCrear={onCrear}
          onCancelar={() => setFormAbierto(false)}
        />
      </Modal>

      <Modal
        abierto={!!tareaDetalle}
        onCerrar={() => setDetalleId(null)}
        titulo="Detalle de tarea"
        ancho={620}
      >
        {tareaDetalle && (
          <TareaDetalle
            tarea={tareaDetalle}
            proyecto={tareaDetalle.proyectoId ? proyectosMap[tareaDetalle.proyectoId] : undefined}
            responsables={tareaDetalle.responsables.map((id) => colabMap[id]).filter(Boolean)}
            onEditar={() => abrirEditar(tareaDetalle)}
            onBorrar={() => onBorrar(tareaDetalle.id)}
            onEstado={(estado) => cambiarEstado(tareaDetalle, estado)}
            creador={tareaDetalle.creadorId ? colabMap[tareaDetalle.creadorId]?.nombre : undefined}
            aprobador={
              tareaDetalle.aprobadaPor ? colabMap[tareaDetalle.aprobadaPor]?.nombre : undefined
            }
            aprobadores={colaboradores}
            onAprobar={(id) => aprobar(tareaDetalle, id)}
          />
        )}
      </Modal>
    </div>
  )
}
