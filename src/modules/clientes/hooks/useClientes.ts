import { useMemo } from 'react'
import { useDatos, nuevoId, type Cliente } from '@/core/datos'

/** Datos del formulario de cliente (sin campos derivados/gestionados). */
export type EntradaCliente = Omit<Cliente, 'id' | 'creadoEn'> & { id?: string }

export function useClientes() {
  const { estado, upsert, eliminar } = useDatos()

  const clientes = useMemo(
    () => Object.values(estado.clientes).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [estado.clientes],
  )

  function guardar(datos: EntradaCliente): Cliente {
    const hoy = new Date().toISOString().slice(0, 10)
    const cliente: Cliente = {
      ...datos,
      id: datos.id ?? nuevoId(),
      creadoEn: datos.id ? (estado.clientes[datos.id]?.creadoEn ?? hoy) : hoy,
    }
    upsert('clientes', cliente)
    return cliente
  }

  function borrar(id: string) {
    eliminar('clientes', id)
  }

  /** Ponderación derivada (promedio de evaluaciones del cliente), o null si no hay. */
  function ponderacion(clienteId: string): number | null {
    const evs = Object.values(estado.evalCliente).filter((e) => e.clienteId === clienteId)
    if (evs.length === 0) return null
    const prom =
      evs.reduce(
        (s, e) =>
          s + (e.amigabilidad + e.puntualidadPago + e.estabilidadAlcance + e.comunicacion) / 4,
        0,
      ) / evs.length
    return Math.round(prom)
  }

  function proyectosDe(clienteId: string): number {
    return Object.values(estado.proyectos).filter((p) => p.clienteId === clienteId).length
  }

  /** Lista de proyectos del cliente (para la ficha de detalle). */
  function listaProyectos(clienteId: string) {
    return Object.values(estado.proyectos)
      .filter((p) => p.clienteId === clienteId)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }

  return { clientes, guardar, borrar, ponderacion, proyectosDe, listaProyectos }
}
