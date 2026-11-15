import { useMemo } from 'react'
import { useDatos, nuevoId, type Actividad, type EstadoActividad } from '@/core/datos'

export type EntradaActividad = Omit<Actividad, 'id'> & { id?: string }

/** Campos compartidos al crear varias tareas de una sola vez. */
export type BaseActividad = Omit<Actividad, 'id' | 'titulo' | 'orden'>

export function useTablero() {
  const { estado, upsert, eliminar } = useDatos()

  const actividades = useMemo(
    () => Object.values(estado.actividades),
    [estado.actividades],
  )

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

  /** Siguiente orden libre en una columna. */
  function siguienteOrden(est: EstadoActividad): number {
    const enCol = actividades.filter((a) => a.estado === est)
    return enCol.reduce((max, a) => Math.max(max, a.orden ?? 0), -1) + 1
  }

  function guardar(datos: EntradaActividad): Actividad {
    const act: Actividad = {
      ...datos,
      id: datos.id ?? nuevoId(),
      orden: datos.orden ?? siguienteOrden(datos.estado),
    }
    upsert('actividades', act)
    return act
  }

  /** Crea N tareas (una por título) compartiendo los mismos campos base. */
  function guardarVarias(titulos: string[], base: BaseActividad): Actividad[] {
    let orden = siguienteOrden(base.estado)
    const creadas: Actividad[] = []
    for (const titulo of titulos) {
      const act: Actividad = { ...base, titulo, id: nuevoId(), orden: orden++ }
      upsert('actividades', act)
      creadas.push(act)
    }
    return creadas
  }

  /** Persiste cambios de columna/orden tras arrastrar. */
  function persistir(items: Actividad[]) {
    for (const a of items) upsert('actividades', a)
  }

  function borrar(id: string) {
    eliminar('actividades', id)
  }

  return {
    actividades,
    proyectos,
    colaboradores,
    tags: estado.tags,
    guardar,
    guardarVarias,
    persistir,
    borrar,
  }
}
