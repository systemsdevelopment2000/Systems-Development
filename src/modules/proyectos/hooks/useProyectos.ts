import { useMemo } from 'react'
import {
  useDatos,
  nuevoId,
  type CategoriaProyecto,
  type Cliente,
  type Colaborador,
  type ModuloProyecto,
  type EstadoProyecto,
  type Proyecto,
  type Tag,
  type TipoDesarrollo,
} from '@/core/datos'
import { PALETA_CATEGORICA } from '@/core/lib/colores'
import { notificar } from '@/core/notificaciones'

export interface EntradaProyecto {
  id?: string
  nombre: string
  clienteId: string
  descripcion?: string
  estadoId: string
  tagIds: string[]
  fechas?: { inicio?: string; entregaEstim?: string; cierre?: string }
  medioPago?: string
  notas?: string
  progreso: number
  /** Colaboradores responsables; el primero es el responsable principal. */
  responsables: string[]
  /** Naturaleza del proyecto (desarrollo, charla, curso…). */
  categoria?: CategoriaProyecto
  /** Clase de desarrollo, solo si la categoría es `desarrollo`. */
  tipoDesarrollo?: TipoDesarrollo
  /** Alcance por módulos (base del costeo). */
  modulos?: ModuloProyecto[]
}

export interface ProyectoEnriquecido extends Proyecto {
  cliente?: Cliente
  estado?: EstadoProyecto
  tags: Tag[]
  responsables: Colaborador[]
}

export function useProyectos() {
  const { estado, upsert, eliminar } = useDatos()

  const estadosCatalogo = useMemo(
    () => [...estado.estadosProyecto].sort((a, b) => a.orden - b.orden),
    [estado.estadosProyecto],
  )
  const clientes = useMemo(
    () => Object.values(estado.clientes).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [estado.clientes],
  )
  const colaboradores = useMemo(
    () =>
      Object.values(estado.colaboradores)
        .filter((c) => c.activo)
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [estado.colaboradores],
  )
  const tagsCatalogo = useMemo(() => Object.values(estado.tags), [estado.tags])

  function responsablesActivos(proyectoId: string) {
    return Object.values(estado.asignaciones).filter(
      (a) => a.proyectoId === proyectoId && a.estado === 'activa',
    )
  }

  const proyectos: ProyectoEnriquecido[] = useMemo(() => {
    return Object.values(estado.proyectos).map((p) => ({
      ...p,
      cliente: estado.clientes[p.clienteId],
      estado: estado.estadosProyecto.find((e) => e.id === p.estadoId),
      tags: p.tagIds.map((id) => estado.tags[id]).filter(Boolean) as Tag[],
      responsables: Object.values(estado.asignaciones)
        .filter((a) => a.proyectoId === p.id && a.estado === 'activa')
        .map((a) => estado.colaboradores[a.colaboradorId])
        .filter(Boolean) as Colaborador[],
    }))
  }, [estado])

  const estadoInicialId = estadosCatalogo[0]?.id

  function guardar(datos: EntradaProyecto): Proyecto {
    const hoy = new Date().toISOString().slice(0, 10)
    const id = datos.id ?? nuevoId()
    const existente = datos.id ? estado.proyectos[datos.id] : undefined

    const proyecto: Proyecto = {
      id,
      nombre: datos.nombre,
      clienteId: datos.clienteId,
      descripcion: datos.descripcion,
      estadoId: datos.estadoId,
      tagIds: datos.tagIds,
      responsablePrincipalId: datos.responsables[0],
      progreso: datos.progreso,
      fechas: datos.fechas,
      medioPago: datos.medioPago,
      notas: datos.notas,
      categoria: datos.categoria,
      tipoDesarrollo: datos.tipoDesarrollo,
      modulos: datos.modulos,
      codigo: existente?.codigo,
      chatAbierto: existente?.chatAbierto ?? true,
      creadoEn: existente?.creadoEn ?? hoy,
    }
    upsert('proyectos', proyecto)

    // Sincroniza asignaciones activas con la lista de responsables.
    const activas = responsablesActivos(id)
    datos.responsables.forEach((colId, idx) => {
      const ya = activas.find((a) => a.colaboradorId === colId)
      if (!ya) {
        upsert('asignaciones', {
          id: nuevoId(),
          proyectoId: id,
          colaboradorId: colId,
          rol: idx === 0 ? 'responsable' : 'colaborador',
          estado: 'activa',
          desde: hoy,
        })
      } else if (idx === 0 && ya.rol !== 'responsable') {
        upsert('asignaciones', { ...ya, rol: 'responsable' })
      }
    })
    activas.forEach((a) => {
      if (!datos.responsables.includes(a.colaboradorId)) {
        upsert('asignaciones', { ...a, estado: 'rescindida', hasta: hoy })
      }
    })

    if (!existente) {
      upsert('hechos', {
        id: nuevoId(),
        proyectoId: id,
        tipo: 'creacion',
        descripcion: `Proyecto "${proyecto.nombre}" creado`,
        fecha: new Date().toISOString(),
      })
      void notificar('Nuevo proyecto', `${proyecto.nombre} fue creado`)
    }

    return proyecto
  }

  function borrar(id: string) {
    responsablesActivos(id).forEach((a) => eliminar('asignaciones', a.id))
    Object.values(estado.asignaciones)
      .filter((a) => a.proyectoId === id)
      .forEach((a) => eliminar('asignaciones', a.id))
    eliminar('proyectos', id)
  }

  /** Crea un tag nuevo en el catálogo (para tags editables). */
  function crearTag(nombre: string): Tag {
    const tag: Tag = {
      id: nuevoId(),
      nombre: nombre.trim(),
      color: PALETA_CATEGORICA[Object.keys(estado.tags).length % PALETA_CATEGORICA.length],
    }
    upsert('tags', tag)
    return tag
  }

  /** Cambia el estado. Regla: exige ≥1 responsable activo. */
  function cambiarEstado(proyectoId: string, nuevoEstadoId: string): { ok: boolean; motivo?: string } {
    const p = estado.proyectos[proyectoId]
    if (!p) return { ok: false }
    if (responsablesActivos(proyectoId).length === 0) {
      return { ok: false, motivo: 'Asigna un responsable antes de cambiar el estado del proyecto.' }
    }
    upsert('proyectos', { ...p, estadoId: nuevoEstadoId })
    const nombreEstado =
      estado.estadosProyecto.find((e) => e.id === nuevoEstadoId)?.nombre ?? nuevoEstadoId
    upsert('hechos', {
      id: nuevoId(),
      proyectoId,
      tipo: 'estado',
      descripcion: `Estado → ${nombreEstado}`,
      fecha: new Date().toISOString(),
    })
    void notificar(p.nombre, `Estado → ${nombreEstado}`)
    return { ok: true }
  }

  return {
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
  }
}
