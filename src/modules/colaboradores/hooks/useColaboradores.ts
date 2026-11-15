import { useMemo } from 'react'
import { useDatos, nuevoId, type Colaborador } from '@/core/datos'

export type EntradaColaborador = Omit<Colaborador, 'id' | 'creadoEn'> & { id?: string }

export interface EstadisticasColaborador {
  calificacion: number | null
  proyectosActivos: number
  proyectosTotales: number
  rescindidas: number
}

export function useColaboradores() {
  const { estado, upsert, eliminar } = useDatos()

  const colaboradores = useMemo(
    () => Object.values(estado.colaboradores).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [estado.colaboradores],
  )

  function guardar(datos: EntradaColaborador): Colaborador {
    const hoy = new Date().toISOString().slice(0, 10)
    const c: Colaborador = {
      ...datos,
      id: datos.id ?? nuevoId(),
      creadoEn: datos.id ? (estado.colaboradores[datos.id]?.creadoEn ?? hoy) : hoy,
    }
    upsert('colaboradores', c)
    return c
  }

  function borrar(id: string) {
    eliminar('colaboradores', id)
  }

  function estadisticas(colaboradorId: string): EstadisticasColaborador {
    const asigs = Object.values(estado.asignaciones).filter((a) => a.colaboradorId === colaboradorId)
    const activas = asigs.filter((a) => a.estado === 'activa')
    const rescindidas = asigs.filter((a) => a.estado === 'rescindida').length
    const proyectosTotales = new Set(asigs.map((a) => a.proyectoId)).size
    const proyectosActivos = new Set(activas.map((a) => a.proyectoId)).size
    const evs = Object.values(estado.evalColaborador).filter((e) => e.colaboradorId === colaboradorId)
    const calificacion = evs.length
      ? Math.round(evs.reduce((s, e) => s + e.porcentaje, 0) / evs.length)
      : null
    return { calificacion, proyectosActivos, proyectosTotales, rescindidas }
  }

  return { colaboradores, guardar, borrar, estadisticas }
}
