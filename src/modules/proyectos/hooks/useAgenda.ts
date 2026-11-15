import { useMemo } from 'react'
import { useDatos, nuevoId, type Reunion } from '@/core/datos'
import type { NuevaReunion } from './useProyectoDetalle'

/** Reunión enriquecida con el proyecto al que pertenece. */
export interface ReunionAgenda extends Reunion {
  proyectoNombre: string
  clienteNombre?: string
}

/**
 * Vista global de reuniones: todas las de todos los proyectos, para agendar y
 * gestionar sin entrar proyecto por proyecto.
 */
export function useAgenda() {
  const { estado, upsert } = useDatos()

  const proyectos = useMemo(
    () => Object.values(estado.proyectos).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [estado.proyectos],
  )

  const colaboradores = useMemo(
    () =>
      Object.values(estado.colaboradores)
        .filter((c) => c.activo)
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [estado.colaboradores],
  )

  const reuniones: ReunionAgenda[] = useMemo(
    () =>
      Object.values(estado.reuniones).map((r) => {
        const p = estado.proyectos[r.proyectoId]
        return {
          ...r,
          proyectoNombre: p?.nombre ?? 'Proyecto eliminado',
          clienteNombre: p ? estado.clientes[p.clienteId]?.nombre : undefined,
        }
      }),
    [estado.reuniones, estado.proyectos, estado.clientes],
  )

  const ahora = Date.now()
  const programadas = reuniones
    .filter((r) => r.fechaProgramada && new Date(r.fechaProgramada).getTime() > ahora)
    .sort((a, b) => new Date(a.fechaProgramada!).getTime() - new Date(b.fechaProgramada!).getTime())
  const registradas = reuniones
    .filter((r) => !(r.fechaProgramada && new Date(r.fechaProgramada).getTime() > ahora))
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  function nombreColaborador(id?: string) {
    if (!id) return '—'
    return estado.colaboradores[id]?.nombre ?? 'Desconocido'
  }

  /** Contacto del cliente del proyecto (para añadirlo como participante). */
  function responsableCliente(proyectoId: string): string | undefined {
    const p = estado.proyectos[proyectoId]
    return p ? estado.clientes[p.clienteId]?.responsable?.nombre : undefined
  }

  function registrarHecho(proyectoId: string, descripcion: string, refId?: string) {
    upsert('hechos', {
      id: nuevoId(),
      proyectoId,
      tipo: 'reunion',
      descripcion,
      fecha: new Date().toISOString(),
      refId,
    })
  }

  function agregar(proyectoId: string, datos: NuevaReunion) {
    const id = nuevoId()
    upsert('reuniones', { id, proyectoId, fecha: new Date().toISOString(), ...datos })
    const prog = datos.fechaProgramada
      ? ` · agendada para ${new Date(datos.fechaProgramada).toLocaleString('es-VE', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}`
      : ''
    registrarHecho(
      proyectoId,
      `Reunión ${datos.fechaProgramada ? 'agendada' : 'registrada'}${
        datos.titulo ? `: ${datos.titulo}` : ''
      }${prog}`,
      id,
    )
  }

  function editar(id: string, datos: NuevaReunion, motivo: string) {
    const prev = estado.reuniones[id]
    if (!prev) return
    upsert('reuniones', { ...prev, ...datos })
    registrarHecho(
      prev.proyectoId,
      `Reunión editada${datos.titulo ? `: ${datos.titulo}` : ''}. Motivo: ${motivo}`,
      id,
    )
  }

  function tomar(id: string) {
    const prev = estado.reuniones[id]
    if (!prev) return
    upsert('reuniones', {
      ...prev,
      fechaProgramada: undefined,
      avisada: undefined,
      fecha: new Date().toISOString(),
    })
    registrarHecho(
      prev.proyectoId,
      `Reunión tomada antes de lo agendado${prev.titulo ? `: ${prev.titulo}` : ''}`,
      id,
    )
  }

  return {
    proyectos,
    colaboradores,
    reuniones,
    programadas,
    registradas,
    nombreColaborador,
    responsableCliente,
    agregar,
    editar,
    tomar,
  }
}
