import type { Actividad, Colaborador, ModuloProyecto, Prioridad } from '@/core/datos'

/** Una línea de la hoja de pendientes. Vacía significa "a llenar a mano". */
export interface FilaPendiente {
  id: string
  /** Orden de realización esperado. */
  orden: number
  pendiente: string
  asignado: string
  modulo: string
  prioridad: Prioridad | ''
  entrega: string
}

export const ETIQUETA_PRIORIDAD: Record<Prioridad, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
}

export function filaVacia(orden: number): FilaPendiente {
  return { id: `f${orden}-${Math.random().toString(36).slice(2, 7)}`, orden, pendiente: '', asignado: '', modulo: '', prioridad: '', entrega: '' }
}

/** N filas en blanco, numeradas, para imprimir y llenar a mano. */
export function hojaEnBlanco(filas: number): FilaPendiente[] {
  return Array.from({ length: filas }, (_, i) => filaVacia(i + 1))
}

/** Una fila sin nada escrito: existe solo para llenarla a mano. */
export function estaVacia(f: FilaPendiente): boolean {
  return !f.pendiente.trim() && !f.asignado.trim() && !f.modulo.trim() && !f.entrega.trim() && !f.prioridad
}

/** Renumera de 1 en adelante, respetando el orden de la lista. */
export function renumerar(filas: FilaPendiente[]): FilaPendiente[] {
  return filas.map((f, i) => ({ ...f, orden: i + 1 }))
}

/** Añade `cuantas` líneas vacías al final, de una sola vez. */
export function agregarVacias(filas: FilaPendiente[], cuantas: number): FilaPendiente[] {
  const nuevas = Array.from({ length: Math.max(1, cuantas) }, (_, i) =>
    filaVacia(filas.length + i + 1),
  )
  return [...filas, ...nuevas]
}

/**
 * Deja exactamente `cuantas` líneas vacías al final, conservando todo lo que
 * tenga contenido. Permite que el campo "líneas en blanco" tenga efecto
 * inmediato en vez de depender de pulsar un botón aparte.
 */
export function ajustarVaciasFinales(filas: FilaPendiente[], cuantas: number): FilaPendiente[] {
  const conContenido = [...filas]
  while (conContenido.length && estaVacia(conContenido[conContenido.length - 1])) {
    conContenido.pop()
  }
  if (cuantas <= 0) return renumerar(conContenido)
  return renumerar(agregarVacias(conContenido, cuantas))
}

function fechaCorta(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * Deduce a qué módulo del proyecto pertenece una tarea. Si la tarea no lo
 * declara, se intenta por sus etiquetas contra los nombres de los módulos; si
 * no hay coincidencia se deja vacío para llenarlo a mano, en lugar de inventar.
 */
function moduloDe(a: Actividad, modulos: ModuloProyecto[]): string {
  if (a.modulo) return a.modulo
  const nombres = modulos.filter((m) => m.incluido).map((m) => m.nombre)
  const etiquetas = (a.etiquetas ?? []).map((e) => (typeof e === 'string' ? e.toLowerCase() : ''))
  const hallado = nombres.find((n) => {
    const corto = n.toLowerCase()
    return etiquetas.some((e) => corto.includes(e) || e.includes(corto))
  })
  return hallado ?? ''
}

/**
 * Arma la hoja con las tareas reales del proyecto. El orden de realización sale
 * del orden del tablero; las tareas ya terminadas se omiten, porque la hoja es
 * de pendientes.
 */
export function ensamblar(
  actividades: Actividad[],
  colaboradores: Colaborador[],
  modulos: ModuloProyecto[],
  opciones: { incluirSinAsignar: boolean; filasExtra: number },
): FilaPendiente[] {
  const nombre = (id: string) => colaboradores.find((c) => c.id === id)?.nombre ?? ''

  const vivas = actividades
    .filter((a) => a.estado !== 'hecho')
    .filter((a) => opciones.incluirSinAsignar || a.responsables.length > 0)
    .sort((a, b) => {
      // Primero lo que ya está en curso, luego por el orden del tablero.
      const peso = (x: Actividad) => (x.estado === 'en_curso' ? 0 : x.estado === 'revision' ? 1 : 2)
      const d = peso(a) - peso(b)
      if (d !== 0) return d
      return (a.orden ?? 0) - (b.orden ?? 0)
    })

  const filas: FilaPendiente[] = vivas.map((a, i) => ({
    id: a.id,
    orden: i + 1,
    pendiente: a.titulo,
    asignado: a.responsables.map(nombre).filter(Boolean).join(', '),
    modulo: moduloDe(a, modulos),
    prioridad: a.prioridad,
    entrega: fechaCorta(a.vence),
  }))

  for (let i = 0; i < opciones.filasExtra; i++) filas.push(filaVacia(filas.length + 1))
  return filas
}
