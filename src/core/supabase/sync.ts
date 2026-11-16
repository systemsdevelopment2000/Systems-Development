import { supabase } from './client'
import type { ColeccionRecord } from '@/core/datos/tipos'
import { notificarError, notificarInfo } from '@/core/notificaciones'

/**
 * Mapeo de nombre de colección del store local a nombre real de la tabla en Supabase.
 */
export const MAPA_COLECCION_A_TABLA: Record<string, string> = {
  proyectos: 'proyectos',
  clientes: 'clientes',
  actividades: 'actividades',
  presupuestos: 'presupuestos',
  asignaciones: 'asignaciones',
  colaboradores: 'colaboradores',
  reuniones: 'reuniones',
  mensajes: 'mensajes_chat',
  pagos: 'pagos',
  tasas: 'tasas_cambio',
  tags: 'tags',
  herramientas: 'herramientas',
  candidatos: 'candidatos',
  plantillasEntrevista: 'plantillas_entrevista',
  evalColaborador: 'evaluaciones_colaborador',
  evalCliente: 'evaluaciones_cliente',
  hechos: 'hechos',
  auditoria: 'auditoria',
}

export const TABLAS_SYNC: ColeccionRecord[] = [
  'proyectos',
  'clientes',
  'actividades',
  'presupuestos',
  'asignaciones',
  'colaboradores',
  'reuniones',
  'mensajes',
  'pagos',
  'tasas',
  'tags',
  'herramientas',
]

/** Convierte camelCase a snake_case */
export function aSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letra) => `_${letra.toLowerCase()}`)
}

/** Convierte snake_case a camelCase */
export function aCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letra) => letra.toUpperCase())
}

/**
 * Convierte un objeto de la aplicación (camelCase) al formato de columnas en Supabase (snake_case).
 */
export function mapearA_DB(coleccion: string, entidad: Record<string, unknown>): Record<string, unknown> {
  const res: Record<string, unknown> = {}

  for (const [clave, valor] of Object.entries(entidad)) {
    if (valor === undefined) continue

    const claveSnake = aSnakeCase(clave)
    res[claveSnake] = valor
  }

  // Ajustes y tolerancias por colección para cumplir con el esquema SQL
  if (coleccion === 'actividades') {
    // Permitir que proyecto_id sea nulo o vacío
    if (!res.proyecto_id) res.proyecto_id = null
    if (!res.creador_id) res.creador_id = null
    if (!res.aprobador_id) res.aprobador_id = null
    if (!res.aprobada_por) res.aprobada_por = null
    if (!res.aprueba_en) res.aprueba_en = null
    if (!res.vence) res.vence = null
    if (!res.instrucciones) res.instrucciones = null
    if (!res.modulo) res.modulo = null
    if (!res.responsables) res.responsables = []
    if (!res.etiquetas) res.etiquetas = []
  } else if (coleccion === 'proyectos') {
    if (!res.cliente_id) res.cliente_id = null
    if (!res.responsable_principal_id) res.responsable_principal_id = null
    if (!res.modulos) res.modulos = []
    if (!res.tag_ids) res.tag_ids = []
  } else if (coleccion === 'presupuestos') {
    // La tabla SQL incluye campos legacy requeridos
    if (!res.items) res.items = res.lineas ?? []
    if (res.subtotal === undefined) res.subtotal = 0
    if (res.indirectos === undefined) res.indirectos = 0
    if (res.margen === undefined) res.margen = 0
    if (res.subtotal_con_margen === undefined) res.subtotal_con_margen = 0
    if (res.descuento === undefined) res.descuento = res.descuento_global ?? 0
    if (res.total === undefined) res.total = 0
    if (!res.cliente_id) res.cliente_id = null
    if (!res.proyecto_id) res.proyecto_id = null
  } else if (coleccion === 'clientes') {
    if (!res.tipo_documento) res.tipo_documento = 'rif'
    if (!res.documento) res.documento = ''
    if (!res.contacto) res.contacto = {}
  } else if (coleccion === 'colaboradores') {
    if (!res.contacto) res.contacto = {}
  }

  return res
}

/**
 * Convierte una fila de Supabase (snake_case) al formato de la aplicación (camelCase).
 */
export function mapearDe_DB(_coleccion: string, fila: Record<string, unknown>): Record<string, unknown> {
  const res: Record<string, unknown> = {}

  for (const [clave, valor] of Object.entries(fila)) {
    const claveCamel = aCamelCase(clave)
    res[claveCamel] = valor
  }

  return res
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clienteDb = supabase as any

/**
 * Carga registros iniciales desde Supabase para poblar el estado local.
 */
export async function cargarColeccionDesdeSupabase(
  coleccion: ColeccionRecord,
): Promise<Record<string, unknown> | null> {
  const tabla = MAPA_COLECCION_A_TABLA[coleccion] ?? coleccion
  try {
    const { data, error } = await clienteDb.from(tabla).select('*')
    if (error) {
      console.warn(`[SupabaseSync] No se pudo consultar ${tabla}:`, error.message)
      return null
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return {}
    }

    const mapa: Record<string, unknown> = {}
    for (const fila of data) {
      const ent = mapearDe_DB(coleccion, fila as Record<string, unknown>)
      if (ent.id && typeof ent.id === 'string') {
        mapa[ent.id] = ent
      }
    }
    return mapa
  } catch (err) {
    console.warn(`[SupabaseSync] Error de red al leer ${tabla}:`, err)
    return null
  }
}

/**
 * Guarda o actualiza un registro en Supabase en segundo plano.
 * Si falla, no bloquea el estado local pero emite una notificación de error visible.
 */
export async function guardarEnSupabase(
  coleccion: ColeccionRecord,
  entidad: { id: string },
): Promise<void> {
  const tabla = MAPA_COLECCION_A_TABLA[coleccion]
  if (!tabla) return

  try {
    const fila = mapearA_DB(coleccion, entidad as Record<string, unknown>)
    const { error } = await clienteDb.from(tabla).upsert(fila)
    if (error) {
      console.error(`[SupabaseSync] Error al sincronizar ${tabla} (${entidad.id}):`, error)
      notificarError(
        `Error al sincronizar ${coleccion}`,
        `No se pudo enviar a Supabase: ${error.message}`,
      )
    }
  } catch (err) {
    console.error(`[SupabaseSync] Excepción al guardar ${tabla}:`, err)
    notificarError(
      `Fallo de conexión con Supabase`,
      err instanceof Error ? err.message : 'Error inesperado de red',
    )
  }
}

/**
 * Elimina un registro de Supabase.
 */
export async function eliminarDeSupabase(
  coleccion: ColeccionRecord,
  id: string,
): Promise<void> {
  const tabla = MAPA_COLECCION_A_TABLA[coleccion]
  if (!tabla) return

  try {
    const { error } = await clienteDb.from(tabla).delete().eq('id', id)
    if (error) {
      console.error(`[SupabaseSync] Error al eliminar ${tabla} (${id}):`, error)
      notificarError(
        `Error al eliminar en Supabase`,
        `No se pudo eliminar en el servidor: ${error.message}`,
      )
    }
  } catch (err) {
    console.error(`[SupabaseSync] Excepción al eliminar ${tabla}:`, err)
  }
}

/**
 * Suscribe a eventos Realtime de Supabase para las tablas operativas.
 */
export function suscribirRealtime(
  onUpsert: (coleccion: ColeccionRecord, entidad: Record<string, unknown>) => void,
  onDelete: (coleccion: ColeccionRecord, id: string) => void,
) {
  const channel = supabase.channel('sd-realtime-global')

  for (const coleccion of TABLAS_SYNC) {
    const tabla = MAPA_COLECCION_A_TABLA[coleccion]
    if (!tabla) continue

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tabla },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const entidad = mapearDe_DB(coleccion, payload.new as Record<string, unknown>)
          if (entidad.id) {
            onUpsert(coleccion, entidad)
            if (coleccion === 'proyectos') {
              const nombre = (entidad.nombre as string) || 'Proyecto'
              notificarInfo(
                'Proyecto sincronizado (Realtime)',
                `${nombre} ha sido ${payload.eventType === 'INSERT' ? 'creado' : 'actualizado'} en el servidor.`,
              )
            } else if (coleccion === 'actividades') {
              const titulo = (entidad.titulo as string) || 'Tarea'
              notificarInfo(
                'Tarea sincronizada (Realtime)',
                `"${titulo}" actualizada en el tablero.`,
              )
            }
          }
        } else if (payload.eventType === 'DELETE') {
          const id = payload.old?.id as string | undefined
          if (id) {
            onDelete(coleccion, id)
          }
        }
      },
    )
  }

  channel.subscribe((status, err) => {
    if (status === 'SUBSCRIBED') {
      console.log('[Realtime] Conectado exitosamente al canal en tiempo real de Supabase.')
    } else if (err) {
      console.warn('[Realtime] Estado del canal:', status, err.message)
    }
  })

  return () => {
    supabase.removeChannel(channel)
  }
}
