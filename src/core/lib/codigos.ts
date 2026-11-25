/**
 * Códigos correlativos del sistema: `PREFIJO-AÑO-NNNN` (p. ej. `PRY-2026-0007`).
 * Sirven para nombrar, buscar y referenciar entidades en documentos y reportes.
 */

export const PREFIJOS = {
  proyectos: 'PRY',
  clientes: 'CLI',
  colaboradores: 'COL',
  actividades: 'TAR',
  reuniones: 'REU',
  herramientas: 'HER',
  presupuestos: 'PRE',
  pagos: 'PAG',
  candidatos: 'CAN',
  metodologias: 'MET',
  propuesta: 'PRO',
  contrato: 'CTR',
} as const

export type ClaveCodigo = keyof typeof PREFIJOS

/** Siguiente código libre para un prefijo, mirando los ya usados en el año. */
export function siguienteCodigo(prefijo: string, usados: Iterable<string | undefined>): string {
  const anio = new Date().getFullYear()
  const patron = new RegExp(`^${prefijo}-${anio}-(\\d+)$`)
  let max = 0
  for (const c of usados) {
    const m = c ? patron.exec(c) : null
    if (m) max = Math.max(max, Number(m[1]))
  }
  return `${prefijo}-${anio}-${String(max + 1).padStart(4, '0')}`
}

/** Código de un documento derivado de un proyecto (propuesta/contrato). */
export function codigoDocumento(tipo: 'propuesta' | 'contrato', codigoProyecto?: string): string {
  const base = codigoProyecto ?? `${new Date().getFullYear()}`
  return `${PREFIJOS[tipo]}-${base.replace(/^[A-Z]+-/, '')}`
}

interface ConCodigo {
  id: string
  codigo?: string
}

/**
 * Migración suave: asigna código a los registros que aún no lo tienen, sin
 * tocar los que ya lo traen ni perder datos del usuario.
 */
export function asignarCodigosFaltantes<T extends ConCodigo>(
  coleccion: Record<string, T>,
  prefijo: string,
): Record<string, T> {
  const items = Object.values(coleccion)
  if (items.every((i) => i.codigo)) return coleccion

  const usados = items.map((i) => i.codigo)
  const salida: Record<string, T> = {}
  // Orden estable para que el correlativo siga el orden de creación.
  const ordenados = [...items].sort((a, b) => a.id.localeCompare(b.id))
  for (const item of ordenados) {
    if (item.codigo) {
      salida[item.id] = item
      continue
    }
    const codigo = siguienteCodigo(prefijo, usados)
    usados.push(codigo)
    salida[item.id] = { ...item, codigo }
  }
  return salida
}
