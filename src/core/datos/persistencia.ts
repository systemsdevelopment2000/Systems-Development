import type { EstadoDatos } from './tipos'
import { estadoInicial } from './estadoInicial'
import { PREFIJOS, asignarCodigosFaltantes } from '@/core/lib/codigos'
import { notificarError } from '@/core/notificaciones'

const CLAVE = 'sd:datos:v6'

/**
 * Versión del esquema del store. Súbela cuando cambie la forma de los datos:
 * en la fase front eso re-siembra el estado (descarta datos locales de ejemplo).
 */
const VERSION = 6

interface Envoltura {
  v: number
  datos: Partial<EstadoDatos>
}

/**
 * Asigna códigos correlativos a los registros que aún no los tienen. Es una
 * migración suave: no borra ni reescribe lo que ya existe.
 */
function conCodigos(e: EstadoDatos): EstadoDatos {
  return {
    ...e,
    clientes: asignarCodigosFaltantes(e.clientes, PREFIJOS.clientes),
    colaboradores: asignarCodigosFaltantes(e.colaboradores, PREFIJOS.colaboradores),
    proyectos: asignarCodigosFaltantes(e.proyectos, PREFIJOS.proyectos),
    actividades: asignarCodigosFaltantes(e.actividades, PREFIJOS.actividades),
    reuniones: asignarCodigosFaltantes(e.reuniones, PREFIJOS.reuniones),
    herramientas: asignarCodigosFaltantes(e.herramientas, PREFIJOS.herramientas),
  }
}

/**
 * Migración de marca (noviembre 2026). Los datos ya guardados en el navegador
 * conservan el correo y el logotipo anteriores, así que cambiar la semilla no
 * los mueve: el PDF seguía imprimiendo la dirección muerta. Esto los corrige
 * sin tocar nada que el usuario haya escrito a mano.
 */
const CORREO_ANTERIOR = 'systemsdevelopmentpzo@gmail.com'
const CORREO_ACTUAL = 'systemsdevelopment2000@gmail.com'
const LOGOS_ANTERIORES = ['/logo-letras.jpeg', '/logo-sd.jpeg', '/brand-logo.jpeg', '/sdLogo.jpeg']
const NARANJA_ANTERIOR = '#f47920'

function migrarMarca(e: EstadoDatos): EstadoDatos {
  const emp = { ...e.empresa }
  let tocado = false

  if (emp.correo?.includes(CORREO_ANTERIOR)) {
    emp.correo = emp.correo.replace(CORREO_ANTERIOR, CORREO_ACTUAL)
    tocado = true
  }
  // El pie viejo llevaba el correo incrustado en la frase. Se vacía para que
  // se recomponga solo a partir de nombre, ubicación y correo.
  if (emp.pie?.includes(CORREO_ANTERIOR)) {
    emp.pie = ''
    tocado = true
  }
  if (emp.logo && LOGOS_ANTERIORES.includes(emp.logo)) {
    emp.logo = '/logo-sd.png'
    tocado = true
  }

  // El naranja también quedó guardado como DATO: en el color del estado
  // "En curso" y en el tag ERP. Un cambio de marca no los mueve solo.
  const estados = e.estadosProyecto.map((x) =>
    x.color?.toLowerCase() === NARANJA_ANTERIOR ? { ...x, color: '#05e4fd' } : x,
  )
  const cambioEstados = estados.some((x, i) => x !== e.estadosProyecto[i])

  const tags = { ...e.tags }
  let cambioTags = false
  for (const [id, t] of Object.entries(tags)) {
    if (t.color?.toLowerCase() === NARANJA_ANTERIOR) {
      tags[id] = { ...t, color: '#025ff5' }
      cambioTags = true
    }
  }

  // Herramientas: de un cliente único a lista de clientes.
  const herramientas = { ...e.herramientas }
  let cambioHerr = false
  for (const [id, h] of Object.entries(herramientas)) {
    if (h.clienteIds || h.proyectoIds) continue
    if (!h.clienteId && !h.proyectoId) continue
    herramientas[id] = {
      ...h,
      clienteIds: h.clienteId ? [h.clienteId] : undefined,
      proyectoIds: h.proyectoId ? [h.proyectoId] : undefined,
    }
    cambioHerr = true
  }

  if (!tocado && !cambioEstados && !cambioTags && !cambioHerr) return e
  return {
    ...e,
    empresa: emp,
    estadosProyecto: cambioEstados ? estados : e.estadosProyecto,
    tags: cambioTags ? tags : e.tags,
    herramientas: cambioHerr ? herramientas : e.herramientas,
  }
}

/** Carga el estado desde localStorage; si no hay o la versión no coincide, usa la semilla. */
export function cargar(): EstadoDatos {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('sd:datos')
      localStorage.removeItem('sd:datos:v5')
      localStorage.removeItem('sd:datos:v4')
      localStorage.removeItem('sd:dev-auth-user')
    }
    const raw = localStorage.getItem(CLAVE)
    if (!raw) return conCodigos(estadoInicial())
    const env = JSON.parse(raw) as Envoltura
    if (env.v !== VERSION || !env.datos) return conCodigos(estadoInicial())
    // Mezcla con la semilla para tolerar colecciones nuevas.
    return migrarMarca(conCodigos({ ...estadoInicial(), ...env.datos }))
  } catch {
    return conCodigos(estadoInicial())
  }
}

/** Persiste el estado en localStorage y notifica si ocurre un error. */
export function guardar(estado: EstadoDatos): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ v: VERSION, datos: estado } satisfies Envoltura))
  } catch (err) {
    console.error('[Persistencia] Error al guardar datos:', err)
    notificarError(
      'Error al guardar en el navegador',
      'No se pudo escribir en el almacenamiento local (cuota excedida o bloqueado).',
    )
  }
}
