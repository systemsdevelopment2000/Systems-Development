/** Tipos compartidos y neutrales de dominio (sin lógica de negocio). */

export type ID = string

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
