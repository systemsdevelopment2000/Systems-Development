export type RolUsuario = 'admin' | 'operador' | 'lectura'

export interface Usuario {
  id: string
  email: string
  nombre: string | null
  rol: RolUsuario
  creado_en: string
}
