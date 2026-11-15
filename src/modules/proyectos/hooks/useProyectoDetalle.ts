import { useMemo } from 'react'
import {
  useDatos,
  nuevoId,
  type Actividad,
  type Adjunto,
  type Cliente,
  type CriteriosColaborador,
  type Colaborador,
  type EstadoActividad,
  type EstadoProyecto,
  type OrigenNota,
  type Prioridad,
  type RolAsignacion,
  type Tag,
  type TipoHecho,
} from '@/core/datos'

export interface NuevaReunion {
  titulo?: string
  notas: string
  origen: OrigenNota
  participantes: string[]
  audio?: string
  adjuntos?: Adjunto[]
  participantesExternos?: string[]
  fechaProgramada?: string
}

export interface EntradaActividad {
  id?: string
  titulo: string
  estado: EstadoActividad
  prioridad: Prioridad
  responsables: string[]
  etiquetas: string[]
  checklist?: { total: number; hechos: number }
  vence?: string
  instrucciones?: string
  enlaces?: string[]
  imagenes?: string[]
}

export interface CriteriosCliente {
  amigabilidad: number
  puntualidadPago: number
  estabilidadAlcance: number
  comunicacion: number
}

export function useProyectoDetalle(proyectoId: string) {
  const { estado, upsert, eliminar } = useDatos()

  const p = estado.proyectos[proyectoId]

  const proyecto = useMemo(() => {
    if (!p) return undefined
    return {
      ...p,
      cliente: estado.clientes[p.clienteId] as Cliente | undefined,
      estado: estado.estadosProyecto.find((e) => e.id === p.estadoId) as EstadoProyecto | undefined,
      tags: p.tagIds.map((id) => estado.tags[id]).filter(Boolean) as Tag[],
      responsables: Object.values(estado.asignaciones)
        .filter((a) => a.proyectoId === p.id && a.estado === 'activa')
        .map((a) => estado.colaboradores[a.colaboradorId])
        .filter(Boolean) as Colaborador[],
    }
  }, [p, estado])

  const reuniones = useMemo(
    () =>
      Object.values(estado.reuniones)
        .filter((r) => r.proyectoId === proyectoId)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [estado.reuniones, proyectoId],
  )

  const hechos = useMemo(
    () =>
      Object.values(estado.hechos)
        .filter((h) => h.proyectoId === proyectoId)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [estado.hechos, proyectoId],
  )

  const mensajes = useMemo(
    () =>
      Object.values(estado.mensajes)
        .filter((m) => m.proyectoId === proyectoId)
        .sort((a, b) => a.fecha.localeCompare(b.fecha)),
    [estado.mensajes, proyectoId],
  )

  const actividades = useMemo(
    () => Object.values(estado.actividades).filter((a) => a.proyectoId === proyectoId),
    [estado.actividades, proyectoId],
  )

  const asignaciones = useMemo(
    () =>
      Object.values(estado.asignaciones)
        .filter((a) => a.proyectoId === proyectoId)
        .sort((a, b) => b.desde.localeCompare(a.desde)),
    [estado.asignaciones, proyectoId],
  )

  const evaluacionesColaborador = useMemo(
    () => Object.values(estado.evalColaborador).filter((e) => e.proyectoId === proyectoId),
    [estado.evalColaborador, proyectoId],
  )

  const evaluacionesCliente = useMemo(
    () => Object.values(estado.evalCliente).filter((e) => e.proyectoId === proyectoId),
    [estado.evalCliente, proyectoId],
  )

  const colaboradores = useMemo(
    () => Object.values(estado.colaboradores).filter((c) => c.activo),
    [estado.colaboradores],
  )

  function nombreColaborador(id?: string) {
    if (!id) return 'Sistema'
    return estado.colaboradores[id]?.nombre ?? 'Desconocido'
  }

  function registrarHecho(tipo: TipoHecho, descripcion: string, refId?: string) {
    upsert('hechos', {
      id: nuevoId(),
      proyectoId,
      tipo,
      descripcion,
      fecha: new Date().toISOString(),
      refId,
    })
  }

  // ---- Reuniones / chat ----
  function agregarReunion(datos: NuevaReunion) {
    const id = nuevoId()
    upsert('reuniones', { id, proyectoId, fecha: new Date().toISOString(), ...datos })
    const prog = datos.fechaProgramada
      ? ` · agendada para ${new Date(datos.fechaProgramada).toLocaleString('es-VE', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}`
      : ''
    registrarHecho(
      'reunion',
      `Reunión ${datos.fechaProgramada ? 'agendada' : 'registrada'}${
        datos.titulo ? `: ${datos.titulo}` : ''
      }${prog}`,
      id,
    )
  }

  /** Edita una reunión existente; exige un motivo que queda en el historial. */
  function editarReunion(id: string, datos: NuevaReunion, motivo: string) {
    const prev = estado.reuniones[id]
    if (!prev) return
    upsert('reuniones', { ...prev, ...datos })
    registrarHecho(
      'reunion',
      `Reunión editada${datos.titulo ? `: ${datos.titulo}` : ''}. Motivo: ${motivo}`,
      id,
    )
  }

  /** Toma una reunión agendada antes de su fecha: pasa a realizada (ahora). */
  function tomarReunion(id: string) {
    const prev = estado.reuniones[id]
    if (!prev) return
    upsert('reuniones', {
      ...prev,
      fechaProgramada: undefined,
      avisada: undefined,
      fecha: new Date().toISOString(),
    })
    registrarHecho(
      'reunion',
      `Reunión tomada antes de lo agendado${prev.titulo ? `: ${prev.titulo}` : ''}`,
      id,
    )
  }

  function agregarMensaje(texto: string, autorId?: string) {
    const t = texto.trim()
    if (!t) return
    upsert('mensajes', {
      id: nuevoId(),
      proyectoId,
      autorId: autorId ?? '',
      texto: t,
      fecha: new Date().toISOString(),
    })
  }

  // ---- Actividades ----
  function guardarActividad(datos: EntradaActividad) {
    const act: Actividad = {
      id: datos.id ?? nuevoId(),
      proyectoId,
      titulo: datos.titulo,
      estado: datos.estado,
      prioridad: datos.prioridad,
      responsables: datos.responsables,
      etiquetas: datos.etiquetas,
      checklist: datos.checklist,
      vence: datos.vence,
      instrucciones: datos.instrucciones,
      enlaces: datos.enlaces,
      imagenes: datos.imagenes,
    }
    upsert('actividades', act)
  }
  function borrarActividad(id: string) {
    eliminar('actividades', id)
  }
  function moverActividad(id: string, estadoNuevo: EstadoActividad) {
    const a = estado.actividades[id]
    if (a && a.estado !== estadoNuevo) upsert('actividades', { ...a, estado: estadoNuevo })
  }

  // ---- Asignaciones ----
  function asignar(colaboradorId: string, rol: RolAsignacion) {
    const id = nuevoId()
    upsert('asignaciones', {
      id,
      proyectoId,
      colaboradorId,
      rol,
      estado: 'activa',
      desde: new Date().toISOString().slice(0, 10),
    })
    registrarHecho('asignacion', `Asignado: ${nombreColaborador(colaboradorId)} (${rol})`, id)
  }
  function rescindir(asignacionId: string, motivo: string) {
    const a = estado.asignaciones[asignacionId]
    if (!a) return
    upsert('asignaciones', {
      ...a,
      estado: 'rescindida',
      hasta: new Date().toISOString().slice(0, 10),
      motivo: motivo || undefined,
    })
    registrarHecho(
      'asignacion',
      `Rescindido: ${nombreColaborador(a.colaboradorId)}${motivo ? ` — ${motivo}` : ''}`,
      asignacionId,
    )
  }

  // ---- Evaluaciones ----
  function evaluarColaborador(
    colaboradorId: string,
    criterios: CriteriosColaborador,
    notas?: string,
  ) {
    const asig = Object.values(estado.asignaciones).find(
      (a) => a.proyectoId === proyectoId && a.colaboradorId === colaboradorId,
    )
    const valores = Object.values(criterios)
    const porcentaje = Math.round(valores.reduce((s, v) => s + v, 0) / valores.length)
    const id = nuevoId()
    upsert('evalColaborador', {
      id,
      asignacionId: asig?.id ?? '',
      colaboradorId,
      proyectoId,
      porcentaje,
      criterios,
      notas,
      fecha: new Date().toISOString(),
    })
    registrarHecho(
      'evaluacion',
      `Evaluación a ${nombreColaborador(colaboradorId)}: ${porcentaje}%`,
      id,
    )
  }
  function evaluarCliente(criterios: CriteriosCliente, notas?: string) {
    if (!p) return
    const id = nuevoId()
    upsert('evalCliente', {
      id,
      proyectoId,
      clienteId: p.clienteId,
      ...criterios,
      notas,
      fecha: new Date().toISOString(),
    })
    registrarHecho('evaluacion', 'Evaluación del cliente registrada', id)
  }

  return {
    proyecto,
    reuniones,
    hechos,
    mensajes,
    actividades,
    asignaciones,
    evaluacionesColaborador,
    evaluacionesCliente,
    colaboradores,
    nombreColaborador,
    agregarReunion,
    editarReunion,
    tomarReunion,
    agregarMensaje,
    guardarActividad,
    borrarActividad,
    moverActividad,
    asignar,
    rescindir,
    evaluarColaborador,
    evaluarCliente,
  }
}
