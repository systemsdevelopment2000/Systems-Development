import { useMemo } from 'react'
import { useDatos, nuevoId, type Pago, type Presupuesto } from '@/core/datos'
import { calcularCobranza, type EstadoCobranza } from '@/core/lib/cobranza'

export interface CuentaPorCobrar {
  presupuesto: Presupuesto
  cliente?: { id: string; nombre: string }
  proyecto?: { id: string; nombre: string }
  cobranza: EstadoCobranza
  pagos: Pago[]
}

/**
 * Cuentas por cobrar: solo los presupuestos aceptados generan deuda. Mientras
 * un presupuesto está en borrador o enviado es una oferta, no una acreencia.
 */
export function usePagos() {
  const { estado, upsert, eliminar } = useDatos()

  const pagos = useMemo(
    () =>
      Object.values(estado.pagos).sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      ),
    [estado.pagos],
  )

  const cuentas = useMemo<CuentaPorCobrar[]>(() => {
    const todos = Object.values(estado.pagos)
    return Object.values(estado.presupuestos)
      .filter((p) => p.estado === 'aceptado')
      .map((p) => {
        const cliente = p.clienteId ? estado.clientes[p.clienteId] : undefined
        const proyecto = p.proyectoId ? estado.proyectos[p.proyectoId] : undefined
        return {
          presupuesto: p,
          cliente: cliente && { id: cliente.id, nombre: cliente.nombre },
          proyecto: proyecto && { id: proyecto.id, nombre: proyecto.nombre },
          cobranza: calcularCobranza(p, todos),
          pagos: todos
            .filter((x) => x.presupuestoId === p.id)
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
        }
      })
      .sort((a, b) => b.cobranza.saldo - a.cobranza.saldo)
  }, [estado.presupuestos, estado.pagos, estado.clientes, estado.proyectos])

  /** Totales de la cartera, en la moneda de cada presupuesto (se agrupan). */
  const resumen = useMemo(() => {
    const porMoneda: Record<string, { total: number; cobrado: number; saldo: number; vencido: number }> = {}
    for (const c of cuentas) {
      const m = (porMoneda[c.cobranza.moneda] ??= { total: 0, cobrado: 0, saldo: 0, vencido: 0 })
      m.total += c.cobranza.total
      m.cobrado += c.cobranza.pagado
      m.saldo += c.cobranza.saldo
      m.vencido += c.cobranza.vencido
    }
    return porMoneda
  }, [cuentas])

  function registrar(p: Omit<Pago, 'id'>): Pago {
    const pago: Pago = { ...p, id: nuevoId() }
    upsert('pagos', pago)
    return pago
  }

  function anular(id: string) {
    eliminar('pagos', id)
  }

  /** Última tasa registrada para un par de monedas (la del día del pago). */
  function tasaDe(base: string, destino: string): number | undefined {
    const b = base.toUpperCase()
    const d = destino.toUpperCase()
    const encontradas = Object.values(estado.tasas)
      .filter((t) => t.base.toUpperCase() === b && t.destino.toUpperCase() === d)
      .sort((a, b2) => new Date(b2.fecha).getTime() - new Date(a.fecha).getTime())
    return encontradas[0]?.valor
  }

  return { pagos, cuentas, resumen, registrar, anular, tasaDe, metodosCobro: estado.empresa.metodosCobro ?? [] }
}
