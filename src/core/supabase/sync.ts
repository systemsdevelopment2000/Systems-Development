import { supabase } from './client'
import type { ColeccionRecord } from '@/core/datos/tipos'
import { notificarError, notificarInfo } from '@/core/notificaciones'

/** Tablas de Supabase soportadas para sincronización en tiempo real. */
export const TABLAS_SYNC: ColeccionRecord[] = [
  'proyectos',
  'clientes',
  'actividades',
  'presupuestos',
  'asignaciones',
  'colaboradores',
]

/**
 * Convierte un objeto de la aplicación (camelCase) al formato de columnas en Supabase (snake_case).
 */
export function mapearA_DB(_coleccion: string, entidad: Record<string, unknown>): Record<string, unknown> {
  const res: Record<string, unknown> = {}

  for (const [clave, valor] of Object.entries(entidad)) {
    if (valor === undefined) continue

    // Mapeos específicos por colección
    if (clave === 'clienteId') res.cliente_id = valor
    else if (clave === 'proyectoId') res.proyecto_id = valor
    else if (clave === 'colaboradorId') res.colaborador_id = valor
    else if (clave === 'estadoId') res.estado_id = valor
    else if (clave === 'tagIds') res.tag_ids = valor
    else if (clave === 'tipoDesarrollo') res.tipo_desarrollo = valor
    else if (clave === 'responsablePrincipalId') res.responsable_principal_id = valor
    else if (clave === 'chatAbierto') res.chat_abierto = valor
    else if (clave === 'creadoEn') res.creado_en = valor
    else if (clave === 'creadorId') res.creador_id = valor
    else if (clave === 'requiereAprobacion') res.requiere_aprobacion = valor
    else if (clave === 'apruebaEn') res.aprueba_en = valor
    else if (clave === 'aprobadorId') res.aprobador_id = valor
    else if (clave === 'aprobadaPor') res.aprobada_por = valor
    else if (clave === 'aprobadaEn') res.aprobada_en = valor
    else if (clave === 'descuentoGlobal') res.descuento_global = valor
    else if (clave === 'validezDias') res.validez_dias = valor
    else if (clave === 'aceptadoEn') res.aceptado_en = valor
    else if (clave === 'esUsuario') res.es_usuario = valor
    else if (clave === 'rolSistema') res.rol_sistema = valor
    else {
      // Claves directas (id, nombre, titulo, estado, moneda, progreso, lineas, plan, etc.)
      res[clave] = valor
    }
  }

  return res
}

/**
 * Convierte una fila de Supabase (snake_case) al formato de la aplicación (camelCase).
 */
export function mapearDe_DB(_coleccion: string, fila: Record<string, unknown>): Record<string, unknown> {
  const res: Record<string, unknown> = {}

  for (const [clave, valor] of Object.entries(fila)) {
    if (clave === 'cliente_id') res.clienteId = valor
    else if (clave === 'proyecto_id') res.proyectoId = valor
    else if (clave === 'colaborador_id') res.colaboradorId = valor
    else if (clave === 'estado_id') res.estadoId = valor
    else if (clave === 'tag_ids') res.tagIds = valor
    else if (clave === 'tipo_desarrollo') res.tipoDesarrollo = valor
    else if (clave === 'responsable_principal_id') res.responsablePrincipalId = valor
    else if (clave === 'chat_abierto') res.chatAbierto = valor
    else if (clave === 'creado_en') res.creadoEn = valor
    else if (clave === 'creador_id') res.creadorId = valor
    else if (clave === 'requiere_aprobacion') res.requiereAprobacion = valor
    else if (clave === 'aprueba_en') res.apruebaEn = valor
    else if (clave === 'aprobador_id') res.aprobadorId = valor
    else if (clave === 'aprobada_por') res.aprobadaPor = valor
    else if (clave === 'aprobada_en') res.aprobadaEn = valor
    else if (clave === 'descuento_global') res.descuentoGlobal = Number(valor)
    else if (clave === 'validez_dias') res.validezDias = Number(valor)
    else if (clave === 'aceptado_en') res.aceptadoEn = valor
    else if (clave === 'es_usuario') res.esUsuario = valor
    else if (clave === 'rol_sistema') res.rolSistema = valor
    else {
      res[clave] = valor
    }
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
  try {
    const { data, error } = await clienteDb.from(coleccion).select('*')
    if (error) {
      console.warn(`[SupabaseSync] No se pudo consultar ${coleccion}:`, error.message)
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
    console.warn(`[SupabaseSync] Error de red al leer ${coleccion}:`, err)
    return null
  }
}

/**
 * Guarda o actualiza un registro en Supabase en segundo plano.
 * Si falla, no bloquea el estado local pero emite una notificación de advertencia/error.
 */
export async function guardarEnSupabase(
  coleccion: ColeccionRecord,
  entidad: { id: string },
): Promise<void> {
  if (!TABLAS_SYNC.includes(coleccion)) return

  try {
    const fila = mapearA_DB(coleccion, entidad as Record<string, unknown>)
    const { error } = await clienteDb.from(coleccion).upsert(fila)
    if (error) {
      console.error(`[SupabaseSync] Error al sincronizar ${coleccion} (${entidad.id}):`, error)
      notificarError(
        `Error al sincronizar ${coleccion}`,
        `No se pudo enviar a Supabase: ${error.message}`,
      )
    }
  } catch (err) {
    console.error(`[SupabaseSync] Excepción al guardar ${coleccion}:`, err)
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
  if (!TABLAS_SYNC.includes(coleccion)) return

  try {
    const { error } = await clienteDb.from(coleccion).delete().eq('id', id)
    if (error) {
      console.error(`[SupabaseSync] Error al eliminar ${coleccion} (${id}):`, error)
      notificarError(
        `Error al eliminar en Supabase`,
        `No se pudo eliminar en el servidor: ${error.message}`,
      )
    }
  } catch (err) {
    console.error(`[SupabaseSync] Excepción al eliminar ${coleccion}:`, err)
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

  for (const tabla of TABLAS_SYNC) {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tabla },
      (payload) => {
        const coleccion = tabla as ColeccionRecord

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
