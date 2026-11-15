import type { ModuloProyecto, ParametrosFinanzas } from '@/core/datos'
export { money } from '@/core/lib/dinero'

export const FINANZAS_POR_DEFECTO: ParametrosFinanzas = {
  tarifaHora: 12,
  moneda: 'USD',
  margen: 35,
  indirectos: 10,
  descuento: 0,
}

export interface LineaCosteo {
  id: string
  nombre: string
  clase: ModuloProyecto['clase']
  horas: number
  costo: number
}

export interface Costeo {
  lineas: LineaCosteo[]
  horasEstandar: number
  horasAdicionales: number
  horas: number
  /** Costo directo: horas × tarifa. */
  costoDirecto: number
  /** Gastos indirectos imputados. */
  indirectos: number
  /** Costo total absorbido por el proyecto. */
  costoTotal: number
  /** Margen de contribución aplicado. */
  margen: number
  /** Precio antes de descuento. */
  precioLista: number
  descuento: number
  /** Precio final a cobrar. */
  precio: number
  /** Utilidad estimada (precio − costo total). */
  utilidad: number
  /** Rentabilidad sobre el precio (%). */
  rentabilidad: number
  moneda: string
}

function redondear(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Costeo de un proyecto a partir de su alcance.
 * Horas → costo directo → + indirectos → costo total → + margen → precio.
 */
export function calcularPresupuesto(
  modulos: ModuloProyecto[] | undefined,
  p: ParametrosFinanzas,
): Costeo {
  const incluidos = (modulos ?? []).filter((m) => m.incluido)

  const lineas: LineaCosteo[] = incluidos.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    clase: m.clase,
    horas: m.horas,
    costo: redondear(m.horas * p.tarifaHora),
  }))

  const horasEstandar = incluidos
    .filter((m) => m.clase === 'estandar')
    .reduce((s, m) => s + m.horas, 0)
  const horasAdicionales = incluidos
    .filter((m) => m.clase === 'adicional')
    .reduce((s, m) => s + m.horas, 0)
  const horas = horasEstandar + horasAdicionales

  const costoDirecto = redondear(horas * p.tarifaHora)
  const indirectos = redondear(costoDirecto * (p.indirectos / 100))
  const costoTotal = redondear(costoDirecto + indirectos)
  const margen = redondear(costoTotal * (p.margen / 100))
  const precioLista = redondear(costoTotal + margen)
  const descuento = redondear(precioLista * (p.descuento / 100))
  const precio = redondear(precioLista - descuento)
  const utilidad = redondear(precio - costoTotal)
  const rentabilidad = precio > 0 ? redondear((utilidad / precio) * 100) : 0

  return {
    lineas,
    horasEstandar,
    horasAdicionales,
    horas,
    costoDirecto,
    indirectos,
    costoTotal,
    margen,
    precioLista,
    descuento,
    precio,
    utilidad,
    rentabilidad,
    moneda: p.moneda,
  }
}

