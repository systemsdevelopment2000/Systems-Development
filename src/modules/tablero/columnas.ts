import type { EstadoActividad } from '@/core/datos'

export interface ColumnaDef {
  id: EstadoActividad
  titulo: string
  acento: string
}

/** Columnas fijas del flujo de trabajo del tablero. */
export const COLUMNAS: ColumnaDef[] = [
  { id: 'backlog', titulo: 'Backlog', acento: '#646c84' },
  { id: 'por_hacer', titulo: 'Por hacer', acento: '#b9b8ba' },
  { id: 'en_curso', titulo: 'En curso', acento: '#05e4fd' },
  { id: 'revision', titulo: 'Revisión', acento: '#8b5cf6' },
  { id: 'hecho', titulo: 'Hecho', acento: '#22c55e' },
]

export const ES_COLUMNA = (id: string): id is EstadoActividad =>
  COLUMNAS.some((c) => c.id === id)
