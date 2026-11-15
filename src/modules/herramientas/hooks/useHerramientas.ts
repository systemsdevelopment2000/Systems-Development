import { useMemo } from 'react'
import { useDatos, nuevoId, type Herramienta } from '@/core/datos'

export type EntradaHerramienta = Omit<Herramienta, 'id' | 'creadoEn'> & { id?: string }

export type EstadoPago = 'sin_fecha' | 'normal' | 'por_vencer' | 'vencida'

export interface HerramientaVista extends Herramienta {
  clienteNombre?: string
  proyectoNombre?: string
  /** Cuántos clientes la comparten (0 si es propia de SD). */
  cuantosClientes: number
  /** Lo que le toca a cada cliente; 0 si el costo lo asume SD. */
  precioPorCliente?: number
  dias: number | null
  estadoPago: EstadoPago
}

/** Días hasta la fecha (negativo si ya pasó). */
export function diasHasta(fecha?: string): number | null {
  if (!fecha) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const d = new Date(fecha + 'T00:00:00')
  return Math.round((d.getTime() - hoy.getTime()) / 86400000)
}

function clasificar(dias: number | null): EstadoPago {
  if (dias === null) return 'sin_fecha'
  if (dias < 0) return 'vencida'
  if (dias <= 7) return 'por_vencer'
  return 'normal'
}

export function useHerramientas() {
  const { estado, upsert, eliminar } = useDatos()

  const herramientas: HerramientaVista[] = useMemo(() => {
    return Object.values(estado.herramientas)
      .map((h) => {
        const dias = diasHasta(h.proximoPago)
        return {
          ...h,
          // Puede estar compartida por varios clientes: se muestran todos, y
          // el costo por cliente se divide si así se pactó.
          clienteNombre: nombresDe(
            h.clienteIds ?? (h.clienteId ? [h.clienteId] : []),
            estado.clientes,
          ),
          proyectoNombre: nombresDe(
            h.proyectoIds ?? (h.proyectoId ? [h.proyectoId] : []),
            estado.proyectos,
          ),
          cuantosClientes: (h.clienteIds ?? (h.clienteId ? [h.clienteId] : [])).length,
          precioPorCliente: precioRepartido(h),
          dias,
          estadoPago: clasificar(dias),
        }
      })
      .sort((a, b) => (a.dias ?? 99999) - (b.dias ?? 99999))
  }, [estado.herramientas, estado.clientes, estado.proyectos])

  const clientes = useMemo(
    () => Object.values(estado.clientes).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [estado.clientes],
  )
  const proyectos = useMemo(
    () => Object.values(estado.proyectos).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [estado.proyectos],
  )

  function guardar(datos: EntradaHerramienta): Herramienta {
    const hoy = new Date().toISOString().slice(0, 10)
    const h: Herramienta = {
      ...datos,
      id: datos.id ?? nuevoId(),
      creadoEn: datos.id ? (estado.herramientas[datos.id]?.creadoEn ?? hoy) : hoy,
    }
    upsert('herramientas', h)
    return h
  }

  function borrar(id: string) {
    eliminar('herramientas', id)
  }

  /**
   * Registra el pago: adelanta `proximoPago` un ciclo (repitiendo si venía
   * vencida, hasta quedar en el futuro) y guarda la fecha del pago.
   */
  function marcarPagada(id: string) {
    const h = estado.herramientas[id]
    if (!h) return
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const d = h.proximoPago ? new Date(h.proximoPago + 'T00:00:00') : new Date(hoy)
    do {
      if (h.ciclo === 'mensual') d.setMonth(d.getMonth() + 1)
      else d.setFullYear(d.getFullYear() + 1)
    } while (d <= hoy)

    upsert('herramientas', {
      ...h,
      proximoPago: d.toISOString().slice(0, 10),
      ultimoPago: hoy.toISOString().slice(0, 10),
    })
  }

  return { herramientas, clientes, proyectos, guardar, borrar, marcarPagada }
}

/** Nombres separados por coma, o `undefined` si no hay ninguno. */
function nombresDe(ids: string[], coleccion: Record<string, { nombre: string }>): string | undefined {
  const nombres = ids.map((id) => coleccion[id]?.nombre).filter(Boolean)
  return nombres.length ? nombres.join(', ') : undefined
}

/**
 * Lo que le toca a cada cliente cuando la herramienta se comparte.
 * `solo_sd` significa que el costo no se traslada: devuelve 0.
 */
function precioRepartido(h: {
  precio?: number
  reparto?: 'partes_iguales' | 'solo_sd'
  clienteIds?: string[]
  clienteId?: string
}): number | undefined {
  if (h.precio == null) return undefined
  if (h.reparto === 'solo_sd') return 0
  const n = (h.clienteIds ?? (h.clienteId ? [h.clienteId] : [])).length
  if (n <= 1) return h.precio
  return Math.round((h.precio / n) * 100) / 100
}
