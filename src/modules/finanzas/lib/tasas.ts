/**
 * Obtención de tasas de cambio desde una API pública.
 *
 * Nota honesta: al ser una app sin backend, la consulta sale del navegador y
 * depende de que la API permita CORS y esté disponible. Por eso cualquier fallo
 * se reporta con claridad y la carga manual queda siempre como respaldo.
 */

export interface RespuestaTasa {
  valor: number
  fecha: string
  fuente: string
}

const ENDPOINT = 'https://open.er-api.com/v6/latest'

interface CuerpoApi {
  result?: string
  time_last_update_utc?: string
  rates?: Record<string, number>
  'error-type'?: string
}

/** Consulta cuántas unidades de `destino` equivale 1 de `base`. */
export async function consultarTasa(base: string, destino: string): Promise<RespuestaTasa> {
  const b = base.trim().toUpperCase()
  const d = destino.trim().toUpperCase()

  let r: Response
  try {
    r = await fetch(`${ENDPOINT}/${encodeURIComponent(b)}`)
  } catch {
    throw new Error(
      'No se pudo contactar la API de tasas (sin conexión o bloqueada por CORS). Carga la tasa manualmente.',
    )
  }
  if (!r.ok) throw new Error(`La API respondió ${r.status}. Carga la tasa manualmente.`)

  const cuerpo = (await r.json()) as CuerpoApi
  if (cuerpo.result && cuerpo.result !== 'success') {
    throw new Error(`La API rechazó la consulta (${cuerpo['error-type'] ?? 'error'}).`)
  }

  const valor = cuerpo.rates?.[d]
  if (typeof valor !== 'number') {
    throw new Error(`La API no publica la tasa ${b}→${d}. Cárgala manualmente.`)
  }

  return {
    valor,
    fecha: cuerpo.time_last_update_utc
      ? new Date(cuerpo.time_last_update_utc).toISOString()
      : new Date().toISOString(),
    fuente: 'open.er-api.com',
  }
}

/** Convierte un monto usando la tasa (base→destino) y su inversa. */
export function convertir(monto: number, tasa: number, invertir: boolean): number {
  if (!tasa) return 0
  const r = invertir ? monto / tasa : monto * tasa
  return Math.round(r * 100) / 100
}
