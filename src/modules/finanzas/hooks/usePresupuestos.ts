import { useMemo } from 'react'
import { useDatos, nuevoId, type Presupuesto } from '@/core/datos'
import { presupuestoVacio } from '../lib/presupuesto'

export function usePresupuestos() {
  const { estado, upsert, eliminar } = useDatos()

  const presupuestos = useMemo(
    () =>
      Object.values(estado.presupuestos).sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      ),
    [estado.presupuestos],
  )

  const clientes = useMemo(
    () => Object.values(estado.clientes).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [estado.clientes],
  )
  const proyectos = useMemo(
    () => Object.values(estado.proyectos).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [estado.proyectos],
  )

  function crear(
    moneda?: string,
    opciones?: { tipo?: Presupuesto['tipo']; proyectoId?: string; clienteId?: string; titulo?: string },
  ): Presupuesto {
    const p: Presupuesto = { ...presupuestoVacio(moneda, opciones), id: nuevoId() }
    upsert('presupuestos', p)
    return p
  }

  function guardar(p: Presupuesto) {
    upsert('presupuestos', p)
  }

  function borrar(id: string) {
    eliminar('presupuestos', id)
  }

  /** Cambia el estado; al aceptar, sella la fecha para el contrato. */
  function cambiarEstado(p: Presupuesto, nuevo: Presupuesto['estado']) {
    upsert('presupuestos', {
      ...p,
      estado: nuevo,
      aceptadoEn: nuevo === 'aceptado' ? new Date().toISOString() : undefined,
    })
  }

  /** Presupuesto aceptado de un proyecto (el que manda sobre el contrato). */
  function aceptadoDe(proyectoId: string): Presupuesto | undefined {
    return presupuestos.find((p) => p.proyectoId === proyectoId && p.estado === 'aceptado')
  }

  /** Todos los presupuestos de un proyecto, del más reciente al más viejo. */
  function deProyecto(proyectoId: string): Presupuesto[] {
    return presupuestos.filter((p) => p.proyectoId === proyectoId)
  }

  return {
    presupuestos,
    clientes,
    proyectos,
    crear,
    guardar,
    borrar,
    cambiarEstado,
    aceptadoDe,
    deProyecto,
  }
}
