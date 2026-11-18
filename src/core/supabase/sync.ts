import { supabase } from './client'
import type { ColeccionRecord, DatosEmpresa, EstadoProyecto } from '@/core/datos/tipos'
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
  'candidatos',
  'plantillasEntrevista',
  'evalColaborador',
  'evalCliente',
  'hechos',
  'auditoria',
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
  } else if (coleccion === 'pagos') {
    if (!res.presupuesto_id) res.presupuesto_id = null
    if (!res.proyecto_id) res.proyecto_id = null
    if (!res.cliente_id) res.cliente_id = null
    if (!res.cuota_id) res.cuota_id = null
    if (res.monto === undefined) res.monto = 0
  } else if (coleccion === 'reuniones') {
    if (!res.proyecto_id) res.proyecto_id = null
    if (!res.participantes) res.participantes = []
    if (!res.adjuntos) res.adjuntos = []
  } else if (coleccion === 'clientes') {
    if (!res.tipo_documento) res.tipo_documento = 'rif'
    if (!res.documento) res.documento = ''
    if (!res.contacto) res.contacto = {}
  } else if (coleccion === 'colaboradores') {
    if (!res.contacto) res.contacto = {}
  } else if (coleccion === 'candidatos') {
    if (!res.contacto) res.contacto = {}
    if (!res.datos_personales) res.datos_personales = {}
    if (!res.evaluacion) res.evaluacion = {}
    if (!res.creado_en) res.creado_en = new Date().toISOString()
  } else if (coleccion === 'plantillasEntrevista') {
    if (!res.bloques) res.bloques = []
    if (!res.criterios) res.criterios = []
    if (!res.creado_en) res.creado_en = new Date().toISOString()
  } else if (coleccion === 'evalColaborador') {
    if (!res.criterios) res.criterios = {}
    res.porcentaje = Number(res.porcentaje) || 0
  } else if (coleccion === 'evalCliente') {
    res.amigabilidad = Number(res.amigabilidad) || 0
    res.puntualidad_pago = Number(res.puntualidad_pago) || 0
    res.estabilidad_alcance = Number(res.estabilidad_alcance) || 0
    res.comunicacion = Number(res.comunicacion) || 0
  } else if (coleccion === 'hechos' || coleccion === 'auditoria') {
    if (!res.fecha) res.fecha = new Date().toISOString()
  } else if (coleccion === 'herramientas') {
    // Columnas reales de la tabla public.herramientas en Supabase
    const COLUMNAS_VALIDAS_HERRAMIENTAS = new Set([
      'id',
      'codigo',
      'nombre',
      'url',
      'propietario',
      'cliente_ids',
      'proyecto_ids',
      'reparto',
      'correo',
      'contrasena',
      'ciclo',
      'precio',
      'moneda',
      'metodo_pago',
      'proximo_pago',
      'ultimo_pago',
      'notas',
      'activa',
      'creado_en',
    ])

    // Empaqueta metadatos (tipoHerramienta, diaPagoMes, accesos) en notas de forma segura
    const meta: Record<string, unknown> = {}
    if (entidad.tipoHerramienta) meta.tipo = entidad.tipoHerramienta
    if (entidad.diaPagoMes != null) meta.diaPago = entidad.diaPagoMes
    if (Array.isArray(entidad.accesos) && entidad.accesos.length > 0) meta.accesos = entidad.accesos

    let textoNotas = typeof res.notas === 'string' ? res.notas : ''
    textoNotas = textoNotas.replace(/<!--SD_VAULT:.*?-->/s, '').trim()
    if (Object.keys(meta).length > 0) {
      const metaStr = `<!--SD_VAULT:${JSON.stringify(meta)}-->`
      res.notas = textoNotas ? `${textoNotas}\n${metaStr}` : metaStr
    } else {
      res.notas = textoNotas || null
    }

    // Sincroniza correo y contraseña principales para la tabla legacy
    const primerAcceso = Array.isArray(entidad.accesos)
      ? (entidad.accesos[0] as Record<string, unknown> | undefined)
      : undefined
    if (primerAcceso) {
      if (primerAcceso.usuario && !res.correo) res.correo = primerAcceso.usuario
      if (primerAcceso.contrasena && !res.contrasena) res.contrasena = primerAcceso.contrasena
    }

    // Elimina propiedades que no existen como columnas en Supabase para evitar errores de schema cache
    for (const k of Object.keys(res)) {
      if (!COLUMNAS_VALIDAS_HERRAMIENTAS.has(k)) {
        delete res[k]
      }
    }
  }

  return res
}

/**
 * Convierte una fila de Supabase (snake_case) al formato de la aplicación (camelCase).
 */
export function mapearDe_DB(coleccion: string, fila: Record<string, unknown>): Record<string, unknown> {
  const res: Record<string, unknown> = {}

  for (const [clave, valor] of Object.entries(fila)) {
    const claveCamel = aCamelCase(clave)
    res[claveCamel] = valor
  }

  // Garantizar valores por defecto coherentes para evitar inconsistencias en el frontend
  if (coleccion === 'clientes') {
    res.tipoDocumento = res.tipoDocumento ?? res.tipo_documento ?? 'rif'
    res.documento = res.documento ?? ''
    res.nombre = res.nombre ?? 'Cliente'
    if (!res.contacto || typeof res.contacto !== 'object') {
      res.contacto = {}
    }
  } else if (coleccion === 'colaboradores') {
    res.nombre = res.nombre ?? 'Colaborador'
    res.rol = res.rol ?? ''
    if (!res.contacto || typeof res.contacto !== 'object') {
      res.contacto = {}
    }
  } else if (coleccion === 'actividades') {
    if (!Array.isArray(res.etiquetas)) res.etiquetas = []
    if (!Array.isArray(res.responsables)) res.responsables = []
  } else if (coleccion === 'proyectos') {
    if (!Array.isArray(res.modulos)) res.modulos = []
    if (!Array.isArray(res.tagIds)) res.tagIds = []
  } else if (coleccion === 'presupuestos') {
    if (!res.lineas && Array.isArray(res.items)) {
      res.lineas = res.items
    }
    if (!Array.isArray(res.lineas)) {
      res.lineas = []
    }
    if (!res.estado) res.estado = 'borrador'
    if (!res.moneda) res.moneda = 'USD'
    if (res.descuentoGlobal === undefined && res.descuento !== undefined) {
      res.descuentoGlobal = res.descuento
    }
  } else if (coleccion === 'candidatos') {
    if (!res.contacto || typeof res.contacto !== 'object') res.contacto = {}
    if (!res.datosPersonales || typeof res.datosPersonales !== 'object') res.datosPersonales = {}
    if (!res.evaluacion || typeof res.evaluacion !== 'object') res.evaluacion = {}
  } else if (coleccion === 'plantillasEntrevista') {
    if (!Array.isArray(res.bloques)) res.bloques = []
    if (!Array.isArray(res.criterios)) res.criterios = []
  } else if (coleccion === 'evalColaborador') {
    if (!res.criterios || typeof res.criterios !== 'object') res.criterios = {}
  } else if (coleccion === 'herramientas') {
    if (!Array.isArray(res.clienteIds)) res.clienteIds = []
    if (!Array.isArray(res.proyectoIds)) res.proyectoIds = []

    // Desempaqueta metadatos guardados en notas si existen
    if (typeof res.notas === 'string') {
      const match = (res.notas as string).match(/<!--SD_VAULT:(.*?)-->/s)
      if (match) {
        try {
          const meta = JSON.parse(match[1])
          if (meta.tipo && !res.tipoHerramienta) res.tipoHerramienta = meta.tipo
          if (meta.diaPago != null && res.diaPagoMes === undefined) res.diaPagoMes = meta.diaPago
          if (Array.isArray(meta.accesos) && (!res.accesos || (res.accesos as unknown[]).length === 0)) {
            res.accesos = meta.accesos
          }
          res.notas = (res.notas as string).replace(/<!--SD_VAULT:.*?-->/s, '').trim()
        } catch {}
      }
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
  const canalId = `sd-rt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const channel = supabase.channel(canalId)

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
          const id = (payload.old?.id ?? (payload.old as { ID?: string })?.ID) as string | undefined
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

/**
 * Consulta la configuración de la empresa desde Supabase.
 */
export async function cargarConfiguracionEmpresa(): Promise<DatosEmpresa | null> {
  try {
    const { data, error } = await clienteDb.from('empresa').select('*').limit(1).maybeSingle()
    if (error || !data) return null
    return {
      nombre: data.nombre,
      telefonos: data.telefonos,
      ubicacion: data.ubicacion,
      correo: data.correo,
      logo: data.logo,
      pie: data.pie ?? '',
      unidades: Array.isArray(data.unidades) ? data.unidades : [],
      hojaPendientes: data.hoja_pendientes ?? {},
      finanzas: data.finanzas ?? {},
    } as DatosEmpresa
  } catch {
    return null
  }
}

/**
 * Guarda o actualiza los datos corporativos de la empresa en Supabase.
 */
export async function guardarEmpresaEnSupabase(empresa: DatosEmpresa): Promise<void> {
  try {
    await clienteDb.from('empresa').upsert({
      id: 'sd_empresa',
      nombre: empresa.nombre,
      telefonos: empresa.telefonos,
      ubicacion: empresa.ubicacion,
      correo: empresa.correo,
      logo: empresa.logo,
      pie: empresa.pie,
      unidades: empresa.unidades,
      hoja_pendientes: empresa.hojaPendientes,
      finanzas: empresa.finanzas,
      actualizado_en: new Date().toISOString(),
    })
  } catch (err) {
    console.warn('[SupabaseSync] Error al guardar empresa:', err)
  }
}

/**
 * Carga el catálogo de estados de proyecto desde Supabase.
 */
export async function cargarEstadosProyecto(): Promise<EstadoProyecto[] | null> {
  try {
    const { data, error } = await clienteDb
      .from('estados_proyecto')
      .select('*')
      .order('orden', { ascending: true })
    if (error || !data || data.length === 0) return null
    return data.map((d: Record<string, unknown>) => ({
      id: d.id as string,
      nombre: d.nombre as string,
      orden: (d.orden as number) ?? 0,
      color: (d.color as string) ?? '#05e4fd',
      esFinal: Boolean(d.es_final),
    }))
  } catch {
    return null
  }
}

/**
 * Guarda el catálogo de estados de proyecto en Supabase.
 */
export async function guardarEstadosProyectoEnSupabase(estados: EstadoProyecto[]): Promise<void> {
  try {
    const filas = estados.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      orden: e.orden,
      color: e.color,
      es_final: e.esFinal,
    }))
    await clienteDb.from('estados_proyecto').upsert(filas)
  } catch (err) {
    console.warn('[SupabaseSync] Error al guardar estados:', err)
  }
}
