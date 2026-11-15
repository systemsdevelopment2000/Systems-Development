import { useMemo } from 'react'
import { useDatos } from '@/core/datos'

export type TipoResultado =
  | 'proyecto'
  | 'cliente'
  | 'colaborador'
  | 'tarea'
  | 'reunion'
  | 'herramienta'
  | 'modulo'

export interface Resultado {
  id: string
  tipo: TipoResultado
  codigo?: string
  titulo: string
  /** Contexto corto: cliente, proyecto, estado… */
  detalle?: string
  /** Ruta a la que navegar al elegirlo. */
  ruta: string
  puntaje: number
}

export const ETIQUETA_TIPO: Record<TipoResultado, string> = {
  proyecto: 'Proyecto',
  cliente: 'Cliente',
  colaborador: 'Colaborador',
  tarea: 'Tarea',
  reunion: 'Reunión',
  herramienta: 'Herramienta',
  modulo: 'Ir a',
}

/**
 * Las páginas del sistema también se buscan. Antes el buscador solo conocía
 * registros, así que escribir "proyec" no llevaba a ningún lado aunque
 * Proyectos fuera justo lo que se buscaba.
 *
 * Los sinónimos cubren cómo la gente nombra las cosas de verdad: "cobranza"
 * para cuentas por cobrar, "rrhh" para selección, "dólar" para tasas.
 */
const MODULOS: { titulo: string; ruta: string; detalle: string; alias: string }[] = [
  { titulo: 'Tablero', ruta: '/tablero', detalle: 'Trabajo', alias: 'kanban tareas columnas' },
  { titulo: 'Proyectos', ruta: '/proyectos', detalle: 'Trabajo', alias: 'obras trabajos' },
  { titulo: 'Reuniones', ruta: '/reuniones', detalle: 'Trabajo', alias: 'agenda citas' },
  {
    titulo: 'Minuta de reunión',
    ruta: '/reuniones/minuta',
    detalle: 'Trabajo · Reuniones',
    alias: 'acta entrevista guion preguntas apuntes',
  },
  {
    titulo: 'Hoja de pendientes',
    ruta: '/pendientes',
    detalle: 'Trabajo',
    alias: 'asignar tareas checklist imprimir',
  },
  { titulo: 'Clientes', ruta: '/clientes', detalle: 'Relaciones', alias: 'empresas contactos' },
  {
    titulo: 'Colaboradores',
    ruta: '/colaboradores',
    detalle: 'Relaciones',
    alias: 'equipo personal trabajadores',
  },
  {
    titulo: 'Selección',
    ruta: '/rrhh',
    detalle: 'Relaciones',
    alias: 'rrhh recursos humanos candidatos entrevistas contratar',
  },
  {
    titulo: 'Presupuesto',
    ruta: '/presupuesto',
    detalle: 'Finanzas',
    alias: 'cotizar cotización precio oferta',
  },
  {
    titulo: 'Cuentas por cobrar',
    ruta: '/cobranza',
    detalle: 'Finanzas',
    alias: 'cobranza deuda pagos cuotas mora',
  },
  {
    titulo: 'Tasas y divisas',
    ruta: '/tasas',
    detalle: 'Finanzas',
    alias: 'dolar dólar bolívares cambio conversión',
  },
  { titulo: 'Dashboard', ruta: '/dashboard', detalle: 'Análisis', alias: 'resumen inicio panel' },
  { titulo: 'Reportes', ruta: '/reportes', detalle: 'Análisis', alias: 'informes estadísticas' },
  { titulo: 'Usuarios', ruta: '/usuarios', detalle: 'Administración', alias: 'accesos roles permisos' },
  {
    titulo: 'Herramientas',
    ruta: '/herramientas',
    detalle: 'Administración',
    alias: 'credenciales contraseñas servicios suscripciones dominio hosting',
  },
  {
    titulo: 'Auditoría',
    ruta: '/auditoria',
    detalle: 'Administración',
    alias: 'historial registro bitácora quién cambió',
  },
  {
    titulo: 'Configuración',
    ruta: '/configuracion',
    detalle: 'Administración',
    alias: 'ajustes membrete marca colores unidades respaldo',
  },
]

/** Minúsculas sin acentos, para tolerar "reunion" ≈ "reunión". */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/** ¿Las letras de `q` aparecen en orden dentro de `texto`? (tolera erratas) */
function subsecuencia(q: string, texto: string): boolean {
  let i = 0
  for (const ch of texto) {
    if (ch === q[i]) i++
    if (i === q.length) return true
  }
  return q.length > 0 && i === q.length
}

/**
 * Puntúa qué tan bien coincide un registro con la consulta.
 * 0 = no coincide. Prioriza el código exacto y los inicios de palabra.
 */
function puntuar(consulta: string, campos: { codigo?: string; titulo: string; extra?: string }) {
  const q = norm(consulta.trim())
  if (!q) return 0

  const codigo = norm(campos.codigo ?? '')
  const titulo = norm(campos.titulo)
  const extra = norm(campos.extra ?? '')
  const todo = `${codigo} ${titulo} ${extra}`

  if (codigo && codigo === q) return 1000
  if (codigo && codigo.includes(q)) return 900
  if (titulo === q) return 850
  if (titulo.startsWith(q)) return 800
  if (titulo.includes(q)) return 700

  // Todas las palabras de la consulta aparecen en algún campo.
  const palabras = q.split(/\s+/).filter(Boolean)
  if (palabras.length > 1 && palabras.every((p) => todo.includes(p))) return 600

  if (extra.includes(q)) return 500

  // Último recurso: coincidencia aproximada (erratas, palabras cercanas).
  if (q.length >= 3 && subsecuencia(q, titulo)) return 300

  return 0
}

/** Índice de búsqueda sobre todo el sistema. */
export function useBuscadorGlobal() {
  const { estado } = useDatos()

  const indice = useMemo<(Omit<Resultado, 'puntaje'> & { alias?: string })[]>(() => {
    const nombreCliente = (id?: string) => (id ? estado.clientes[id]?.nombre : undefined)
    const nombreProyecto = (id?: string) => (id ? estado.proyectos[id]?.nombre : undefined)

    const proyectos = Object.values(estado.proyectos).map((p) => ({
      id: p.id,
      tipo: 'proyecto' as const,
      codigo: p.codigo,
      titulo: p.nombre,
      detalle: nombreCliente(p.clienteId),
      ruta: `/proyectos/${p.id}`,
    }))

    const clientes = Object.values(estado.clientes).map((c) => ({
      id: c.id,
      tipo: 'cliente' as const,
      codigo: c.codigo,
      titulo: c.nombre,
      detalle: `${c.tipoDocumento.toUpperCase()} ${c.documento}`,
      ruta: `/clientes?ver=${c.id}`,
    }))

    const colaboradores = Object.values(estado.colaboradores).map((c) => ({
      id: c.id,
      tipo: 'colaborador' as const,
      codigo: c.codigo,
      titulo: c.nombre,
      detalle: [c.rol, c.contacto.correo].filter(Boolean).join(' · '),
      ruta: `/colaboradores?ver=${c.id}`,
    }))

    const tareas = Object.values(estado.actividades).map((a) => ({
      id: a.id,
      tipo: 'tarea' as const,
      codigo: a.codigo,
      titulo: a.titulo,
      detalle: [nombreProyecto(a.proyectoId), a.etiquetas.join(' ')].filter(Boolean).join(' · '),
      ruta: `/tablero`,
    }))

    const reuniones = Object.values(estado.reuniones).map((r) => ({
      id: r.id,
      tipo: 'reunion' as const,
      codigo: r.codigo,
      titulo: r.titulo || 'Reunión',
      detalle: nombreProyecto(r.proyectoId),
      ruta: `/reuniones`,
    }))

    const herramientas = Object.values(estado.herramientas).map((h) => ({
      id: h.id,
      tipo: 'herramienta' as const,
      codigo: h.codigo,
      titulo: h.nombre,
      detalle: [nombreCliente(h.clienteId), h.metodoPago].filter(Boolean).join(' · '),
      ruta: `/herramientas`,
    }))

    const modulos = MODULOS.map((m) => ({
      id: 'mod:' + m.ruta,
      tipo: 'modulo' as const,
      titulo: m.titulo,
      detalle: m.detalle,
      ruta: m.ruta,
      alias: m.alias,
    }))

    return [
      ...modulos,
      ...proyectos,
      ...clientes,
      ...colaboradores,
      ...tareas,
      ...reuniones,
      ...herramientas,
    ]
  }, [estado])

  function buscar(consulta: string, limite = 12): Resultado[] {
    if (!consulta.trim()) return []
    return indice
      .map((r) => ({
        ...r,
        puntaje: puntuar(consulta, {
          codigo: r.codigo,
          titulo: r.titulo,
          extra: [r.detalle, r.alias].filter(Boolean).join(' '),
        }),
      }))
      .filter((r) => r.puntaje > 0)
      .sort(
        (a, b) =>
          b.puntaje - a.puntaje ||
          Number(b.tipo === 'modulo') - Number(a.tipo === 'modulo') ||
          a.titulo.localeCompare(b.titulo),
      )
      .slice(0, limite)
  }

  return { buscar, total: indice.length }
}
