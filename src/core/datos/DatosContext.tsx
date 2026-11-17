import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type {
  AccionAuditoria,
  ColeccionRecord,
  DatosEmpresa,
  EstadoDatos,
  EstadoProyecto,
  RegistroAuditoria,
} from './tipos'
import { cargar, guardar } from './persistencia'
import { nuevoId } from './estadoInicial'
import { PREFIJOS, siguienteCodigo } from '@/core/lib/codigos'
import { ETIQUETA_COLECCION, compararEntidad, nombreEntidad, recortar } from '@/core/lib/auditoria'
import {
  TABLAS_SYNC,
  cargarColeccionDesdeSupabase,
  guardarEnSupabase,
  eliminarDeSupabase,
  suscribirRealtime,
  cargarConfiguracionEmpresa,
  guardarEmpresaEnSupabase,
  cargarEstadosProyecto,
  guardarEstadosProyectoEnSupabase,
} from '@/core/supabase/sync'

/** Colecciones que llevan código correlativo y su prefijo. */
const PREFIJO_COLECCION: Partial<Record<ColeccionRecord, string>> = {
  clientes: PREFIJOS.clientes,
  colaboradores: PREFIJOS.colaboradores,
  proyectos: PREFIJOS.proyectos,
  actividades: PREFIJOS.actividades,
  reuniones: PREFIJOS.reuniones,
  herramientas: PREFIJOS.herramientas,
  presupuestos: PREFIJOS.presupuestos,
  pagos: PREFIJOS.pagos,
  candidatos: PREFIJOS.candidatos,
}

/**
 * Colecciones que NO se auditan: son ruido de alta frecuencia y llenarían el
 * historial tapando lo que importa.
 */
const SIN_AUDITAR = new Set<string>(['mensajes'])

type Accion =
  | { tipo: 'upsert'; coleccion: ColeccionRecord; entidad: { id: string }; actor: string }
  | { tipo: 'eliminar'; coleccion: ColeccionRecord; id: string; actor: string }
  | { tipo: 'sincronizarColeccion'; coleccion: ColeccionRecord; datos: Record<string, unknown> }
  | { tipo: 'estados'; estados: EstadoProyecto[]; actor: string }
  | { tipo: 'empresa'; empresa: DatosEmpresa; actor: string }
  | { tipo: 'reemplazar'; estado: EstadoDatos; actor: string }

/** Añade un asiento al historial y lo recorta si se pasó del tope. */
function asentar(
  estado: EstadoDatos,
  datos: {
    actor: string
    accion: AccionAuditoria
    ambito: string
    entidadId?: string
    detalle: string
    cambios?: RegistroAuditoria['cambios']
  },
): EstadoDatos['auditoria'] {
  const registro: RegistroAuditoria = {
    id: nuevoId(),
    fecha: new Date().toISOString(),
    ...datos,
  }
  return recortar({ ...estado.auditoria, [registro.id]: registro })
}

function reducer(estado: EstadoDatos, accion: Accion): EstadoDatos {
  switch (accion.tipo) {
    case 'upsert': {
      const col = estado[accion.coleccion] as Record<string, { id: string; codigo?: string }>
      const anterior = col[accion.entidad.id]
      let entidad = accion.entidad as { id: string; codigo?: string }

      // Código correlativo automático para entidades nuevas que lo requieran.
      const prefijo = PREFIJO_COLECCION[accion.coleccion]
      if (prefijo && !entidad.codigo) {
        const usados = Object.values(col).map((i) => i.codigo)
        entidad = { ...entidad, codigo: siguienteCodigo(prefijo, usados) }
      }

      const siguiente = {
        ...estado,
        [accion.coleccion]: { ...col, [entidad.id]: entidad },
      } as EstadoDatos

      if (SIN_AUDITAR.has(accion.coleccion)) return siguiente

      const cambios = compararEntidad(
        anterior as Record<string, unknown> | undefined,
        entidad as unknown as Record<string, unknown>,
      )
      // Un guardado que no cambió nada no merece un asiento.
      if (anterior && cambios.length === 0) return siguiente

      const etiqueta = ETIQUETA_COLECCION[accion.coleccion] ?? accion.coleccion
      return {
        ...siguiente,
        auditoria: asentar(estado, {
          actor: accion.actor,
          accion: anterior ? 'editar' : 'crear',
          ambito: accion.coleccion,
          entidadId: entidad.id,
          detalle: `${etiqueta} ${nombreEntidad(entidad as unknown as Record<string, unknown>)}`,
          cambios: cambios.length ? cambios : undefined,
        }),
      }
    }

    case 'eliminar': {
      const original = (estado[accion.coleccion] as Record<string, unknown>)[accion.id] as
        Record<string, unknown> | undefined
      const col = { ...(estado[accion.coleccion] as Record<string, unknown>) }
      delete col[accion.id]
      const siguiente = { ...estado, [accion.coleccion]: col } as EstadoDatos

      if (SIN_AUDITAR.has(accion.coleccion) || !original) return siguiente

      const etiqueta = ETIQUETA_COLECCION[accion.coleccion] ?? accion.coleccion
      return {
        ...siguiente,
        auditoria: asentar(estado, {
          actor: accion.actor,
          accion: 'eliminar',
          ambito: accion.coleccion,
          entidadId: accion.id,
          detalle: `${etiqueta} ${nombreEntidad(original)}`,
        }),
      }
    }

    case 'sincronizarColeccion': {
      return {
        ...estado,
        [accion.coleccion]: accion.datos,
      } as EstadoDatos
    }

    case 'estados':
      return {
        ...estado,
        estadosProyecto: accion.estados,
        auditoria: asentar(estado, {
          actor: accion.actor,
          accion: 'config',
          ambito: 'estadosProyecto',
          detalle: `Catálogo de estados (${accion.estados.length} estados)`,
        }),
      }

    case 'empresa': {
      const cambios = compararEntidad(
        estado.empresa as unknown as Record<string, unknown>,
        accion.empresa as unknown as Record<string, unknown>,
      )
      if (cambios.length === 0) return { ...estado, empresa: accion.empresa }
      return {
        ...estado,
        empresa: accion.empresa,
        auditoria: asentar(estado, {
          actor: accion.actor,
          accion: 'config',
          ambito: 'empresa',
          detalle: `Configuración: ${cambios.map((c) => c.campo).join(', ')}`,
          cambios,
        }),
      }
    }

    case 'reemplazar':
      // Restaurar una copia o reiniciar es lo más destructivo que ofrece el
      // sistema: el asiento se conserva dentro del estado entrante.
      return {
        ...accion.estado,
        auditoria: asentar(accion.estado, {
          actor: accion.actor,
          accion: 'restaurar',
          ambito: 'empresa',
          detalle: 'Se reemplazaron todos los datos (restauración o reinicio)',
        }),
      }

    default:
      return estado
  }
}

interface Ctx {
  estado: EstadoDatos
  /** Crea o reemplaza una entidad en su colección. */
  upsert: <K extends ColeccionRecord>(coleccion: K, entidad: EstadoDatos[K][string]) => void
  /** Elimina una entidad por id. */
  eliminar: (coleccion: ColeccionRecord, id: string) => void
  /** Reemplaza el catálogo de estados de proyecto. */
  setEstados: (estados: EstadoProyecto[]) => void
  /** Actualiza el membrete (cabecera/pie de reportes y documentos). */
  setEmpresa: (empresa: DatosEmpresa) => void
  /** Reemplaza todo el estado (restaurar copia de seguridad / reiniciar). */
  reemplazarTodo: (estado: EstadoDatos) => void
}

const DatosContext = createContext<Ctx | null>(null)

export function DatosProvider({
  children,
  actor = 'sistema',
}: {
  children: ReactNode
  /** Quién está operando: queda asentado en la auditoría. */
  actor?: string
}) {
  const [estado, dispatch] = useReducer(reducer, undefined, cargar)

  useEffect(() => {
    guardar(estado)
  }, [estado])

  // Sincronización inicial y Realtime con Supabase
  useEffect(() => {
    let cancelado = false

    async function sincronizarInicial() {
      for (const coleccion of TABLAS_SYNC) {
        if (cancelado) break
        const remotos = await cargarColeccionDesdeSupabase(coleccion)
        if (remotos !== null && !cancelado) {
          dispatch({
            tipo: 'sincronizarColeccion',
            coleccion,
            datos: remotos,
          })
        }
      }

      const [emp, est] = await Promise.all([cargarConfiguracionEmpresa(), cargarEstadosProyecto()])
      if (!cancelado) {
        if (emp) dispatch({ tipo: 'empresa', empresa: emp, actor: 'supabase' })
        if (est) dispatch({ tipo: 'estados', estados: est, actor: 'supabase' })
      }
    }

    void sincronizarInicial()

    const desuscribir = suscribirRealtime(
      (coleccion, entidad) => {
        if (!cancelado && entidad.id) {
          dispatch({
            tipo: 'upsert',
            coleccion,
            entidad: entidad as { id: string },
            actor: 'supabase-realtime',
          })
        }
      },
      (coleccion, id) => {
        if (!cancelado && id) {
          dispatch({
            tipo: 'eliminar',
            coleccion,
            id,
            actor: 'supabase-realtime',
          })
        }
      },
    )

    return () => {
      cancelado = true
      desuscribir()
    }
  }, [])

  const valor: Ctx = {
    estado,
    upsert: (coleccion, entidad) => {
      dispatch({ tipo: 'upsert', coleccion, entidad: entidad as { id: string }, actor })
      if (actor !== 'supabase-realtime' && actor !== 'supabase-inicial') {
        void guardarEnSupabase(coleccion, entidad as { id: string })
      }
    },
    eliminar: (coleccion, id) => {
      dispatch({ tipo: 'eliminar', coleccion, id, actor })
      if (actor !== 'supabase-realtime') {
        void eliminarDeSupabase(coleccion, id)
      }
    },
    setEstados: (estados) => {
      dispatch({ tipo: 'estados', estados, actor })
      void guardarEstadosProyectoEnSupabase(estados)
    },
    setEmpresa: (empresa) => {
      dispatch({ tipo: 'empresa', empresa, actor })
      void guardarEmpresaEnSupabase(empresa)
    },
    reemplazarTodo: (nuevo) => dispatch({ tipo: 'reemplazar', estado: nuevo, actor }),
  }

  return <DatosContext.Provider value={valor}>{children}</DatosContext.Provider>
}

export function useDatos(): Ctx {
  const ctx = useContext(DatosContext)
  if (!ctx) throw new Error('useDatos debe usarse dentro de <DatosProvider>')
  return ctx
}
