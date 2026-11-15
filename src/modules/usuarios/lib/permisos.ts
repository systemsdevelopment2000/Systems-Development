import type { NivelModulo, PermisoModulo, Permisos, RolSistema } from '@/core/datos'

/** Nivel mínimo en el que una acción queda incluida. */
export type NivelAccion = 'ver' | 'editar' | 'admin'

export interface AccionDef {
  id: string
  label: string
  nivel: NivelAccion
}
export interface ModuloDef {
  id: string
  label: string
  acciones: AccionDef[]
}

/** Catálogo de módulos y sus acciones granuladas (vista avanzada). */
export const CATALOGO_PERMISOS: ModuloDef[] = [
  {
    id: 'tablero',
    label: 'Tablero',
    acciones: [
      { id: 'ver', label: 'Ver tablero', nivel: 'ver' },
      { id: 'crear', label: 'Crear tareas', nivel: 'editar' },
      { id: 'mover', label: 'Mover / reordenar', nivel: 'editar' },
    ],
  },
  {
    id: 'proyectos',
    label: 'Proyectos',
    acciones: [
      { id: 'ver', label: 'Ver proyectos', nivel: 'ver' },
      { id: 'crear', label: 'Crear', nivel: 'editar' },
      { id: 'editar', label: 'Editar', nivel: 'editar' },
      { id: 'asignar', label: 'Asignar equipo', nivel: 'editar' },
      { id: 'chat', label: 'Chat interno', nivel: 'ver' },
      { id: 'documentos', label: 'Generar documentos', nivel: 'editar' },
      { id: 'eliminar', label: 'Eliminar', nivel: 'admin' },
    ],
  },
  {
    id: 'clientes',
    label: 'Clientes',
    acciones: [
      { id: 'ver', label: 'Ver', nivel: 'ver' },
      { id: 'crear', label: 'Crear', nivel: 'editar' },
      { id: 'editar', label: 'Editar', nivel: 'editar' },
      { id: 'calificar', label: 'Calificar', nivel: 'editar' },
      { id: 'eliminar', label: 'Eliminar', nivel: 'admin' },
    ],
  },
  {
    id: 'colaboradores',
    label: 'Colaboradores',
    acciones: [
      { id: 'ver', label: 'Ver', nivel: 'ver' },
      { id: 'crear', label: 'Crear', nivel: 'editar' },
      { id: 'editar', label: 'Editar', nivel: 'editar' },
      { id: 'calificar', label: 'Calificar', nivel: 'editar' },
      { id: 'eliminar', label: 'Eliminar', nivel: 'admin' },
    ],
  },
  {
    id: 'herramientas',
    label: 'Herramientas',
    acciones: [
      { id: 'ver', label: 'Ver', nivel: 'ver' },
      { id: 'crear', label: 'Crear', nivel: 'editar' },
      { id: 'editar', label: 'Editar', nivel: 'editar' },
      { id: 'credenciales', label: 'Ver credenciales', nivel: 'admin' },
      { id: 'eliminar', label: 'Eliminar', nivel: 'admin' },
    ],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    acciones: [
      { id: 'ver', label: 'Ver', nivel: 'ver' },
      { id: 'exportar', label: 'Exportar (PDF/Excel)', nivel: 'ver' },
    ],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    acciones: [{ id: 'ver', label: 'Ver', nivel: 'ver' }],
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    acciones: [
      { id: 'ver', label: 'Ver', nivel: 'ver' },
      { id: 'gestionar', label: 'Gestionar accesos y permisos', nivel: 'admin' },
    ],
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    acciones: [
      { id: 'ver', label: 'Ver', nivel: 'ver' },
      { id: 'editar', label: 'Editar', nivel: 'admin' },
    ],
  },
]

const ORDEN: NivelModulo[] = ['ninguno', 'ver', 'editar', 'admin']

export const NIVELES: { valor: NivelModulo; label: string }[] = [
  { valor: 'ninguno', label: 'Ninguno' },
  { valor: 'ver', label: 'Ver' },
  { valor: 'editar', label: 'Editar' },
  { valor: 'admin', label: 'Total' },
]

/** ¿El nivel del módulo cubre una acción de nivel dado? */
export function nivelCubre(nivelModulo: NivelModulo, nivelAccion: NivelAccion): boolean {
  if (nivelModulo === 'ninguno') return false
  return ORDEN.indexOf(nivelModulo) >= ORDEN.indexOf(nivelAccion)
}

/** Valor efectivo de una acción: override avanzado si existe, si no el derivado del nivel. */
export function accionActiva(pm: PermisoModulo | undefined, accion: AccionDef): boolean {
  if (!pm) return false
  if (pm.acciones && accion.id in pm.acciones) return pm.acciones[accion.id]
  return nivelCubre(pm.nivel, accion.nivel)
}

/** ¿El módulo tiene overrides que difieren del nivel sencillo? */
export function esPersonalizado(pm: PermisoModulo | undefined, modulo: ModuloDef): boolean {
  if (!pm?.acciones) return false
  return modulo.acciones.some(
    (a) => a.id in pm.acciones! && pm.acciones![a.id] !== nivelCubre(pm.nivel, a.nivel),
  )
}

/** Permisos por defecto a partir del rol de sistema (preset). */
export function permisosPorRol(rol: RolSistema): Permisos {
  const base: Record<RolSistema, NivelModulo> = {
    admin: 'admin',
    editor: 'editar',
    lectura: 'ver',
  }
  const out: Permisos = {}
  for (const m of CATALOGO_PERMISOS) {
    let nivel: NivelModulo = base[rol]
    if (m.id === 'usuarios' && rol !== 'admin') nivel = 'ninguno'
    if (m.id === 'configuracion' && rol !== 'admin') nivel = rol === 'editor' ? 'ver' : 'ninguno'
    out[m.id] = { nivel }
  }
  return out
}
