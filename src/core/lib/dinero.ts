import type { LineaPresupuesto, Presupuesto } from '@/core/datos'

/** Formato monetario estable (no depende del locale del equipo). */
export function money(n: number, moneda: string): string {
  return `${n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${moneda}`
}

function r2(n: number): number {
  return Math.round(n * 100) / 100
}

/** Importe de una línea: cantidad × precio, menos su descuento propio. */
export function importeLinea(l: LineaPresupuesto): number {
  const bruto = l.cantidad * l.precioUnitario
  return r2(bruto - bruto * ((l.descuento ?? 0) / 100))
}

export interface TotalesPresupuesto {
  grupos: { nombre: string; lineas: LineaPresupuesto[]; subtotal: number }[]
  subtotal: number
  descuentoGlobal: number
  baseImponible: number
  impuesto: number
  total: number
  moneda: string
}

/** Totaliza el presupuesto agrupando por sección, con descuento e impuesto. */
export function totalizar(p: Presupuesto): TotalesPresupuesto {
  const orden: string[] = []
  const mapa = new Map<string, LineaPresupuesto[]>()

  for (const l of p.lineas) {
    const g = l.grupo?.trim() || 'General'
    if (!mapa.has(g)) {
      mapa.set(g, [])
      orden.push(g)
    }
    mapa.get(g)!.push(l)
  }

  const grupos = orden.map((nombre) => {
    const lineas = mapa.get(nombre) ?? []
    return { nombre, lineas, subtotal: r2(lineas.reduce((s, l) => s + importeLinea(l), 0)) }
  })

  const subtotal = r2(grupos.reduce((s, g) => s + g.subtotal, 0))
  const descuentoGlobal = r2(subtotal * (p.descuentoGlobal / 100))
  const baseImponible = r2(subtotal - descuentoGlobal)
  const impuesto = r2(baseImponible * (p.impuesto / 100))
  const total = r2(baseImponible + impuesto)

  return { grupos, subtotal, descuentoGlobal, baseImponible, impuesto, total, moneda: p.moneda }
}
