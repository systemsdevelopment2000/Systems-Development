import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  ListChecks,
  Users,
  CalendarClock,
  Star,
  History,
  MessagesSquare,
  Receipt,
} from 'lucide-react'
import { Modal } from '@/core/ui'
import { EnsamblaWhatsapp, BotonWhatsapp } from '@/modules/whatsapp'
import { usePresupuestos } from '@/modules/finanzas'
import { useProyectoDetalle } from '../../hooks/useProyectoDetalle'
import { TabResumen } from './TabResumen'
import { TabActividades } from './TabActividades'
import { TabEquipo } from './TabEquipo'
import { TabReuniones } from './TabReuniones'
import { TabPresupuestos } from './TabPresupuestos'
import { TabEvaluaciones } from './TabEvaluaciones'
import { TabHistorial } from './TabHistorial'
import { TabChat } from './TabChat'

const TABS = [
  { id: 'resumen', label: 'Resumen', Icon: FileText },
  { id: 'actividades', label: 'Actividades', Icon: ListChecks },
  { id: 'equipo', label: 'Equipo', Icon: Users },
  { id: 'reuniones', label: 'Reuniones', Icon: CalendarClock },
  { id: 'presupuestos', label: 'Presupuestos', Icon: Receipt },
    { id: 'evaluaciones', label: 'Evaluaciones', Icon: Star },
  { id: 'historial', label: 'Historial', Icon: History },
  { id: 'chat', label: 'Chat', Icon: MessagesSquare },
] as const
type TabId = (typeof TABS)[number]['id']

function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function ProyectoDetalle({ proyectoId }: { proyectoId: string }) {
  const nav = useNavigate()
  const d = useProyectoDetalle(proyectoId)
  const [tab, setTab] = useState<TabId>('resumen')
  const [waAbierto, setWaAbierto] = useState(false)
  const { deProyecto, crear } = usePresupuestos()

  if (!d.proyecto) {
    return (
      <div className="pd">
        <button className="pd-volver" onClick={() => nav('/proyectos')}>
          <ArrowLeft size={16} /> Proyectos
        </button>
        <p className="muted">Proyecto no encontrado.</p>
      </div>
    )
  }

  const p = d.proyecto

  return (
    <div className="pd">
      <div className="pd-barra">
        <button className="pd-volver" onClick={() => nav('/proyectos')}>
          <ArrowLeft size={16} /> Proyectos
        </button>
        <div className="pd-barra__acc">
          <BotonWhatsapp
            proyecto={p}
            cliente={p.cliente}
            estadoNombre={p.estado?.nombre}
            onAbrir={() => setWaAbierto(true)}
          />
          <button
            className="btn btn--ghost btn--icono"
            onClick={() => nav(`/proyectos/${proyectoId}/documento`)}
          >
            <FileText size={15} /> Generar documento
          </button>
        </div>
      </div>

      <header className="pd-head">
        <div className="pd-head__main">
          <div className="pd-head__titfila">
            <h1>{p.nombre}</h1>
            {p.estado && (
              <span
                className="pd-estado"
                style={{ color: p.estado.color, borderColor: p.estado.color }}
              >
                {p.estado.nombre}
              </span>
            )}
          </div>
          <span className="pd-cliente">{p.cliente?.nombre ?? 'Sin cliente'}</span>
          {p.tags.length > 0 && (
            <div className="pr-tags">
              {p.tags.map((t) => (
                <span key={t.id} className="pr-tag">
                  <i style={{ background: t.color }} />
                  {t.nombre}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="pd-head__resp">
          {p.responsables.map((c) => (
            <span key={c.id} className="pd-resp" title={c.nombre}>
              {c.fotoPerfil ? <img src={c.fotoPerfil} alt="" /> : iniciales(c.nombre)}
            </span>
          ))}
        </div>
      </header>

      <div className="pd-prog">
        <span style={{ width: `${p.progreso}%` }} />
      </div>

      <nav className="pd-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'is-on' : ''}
            onClick={() => setTab(t.id)}
          >
            <t.Icon size={15} />
            {t.label}
          </button>
        ))}
      </nav>

      <div className="pd-contenido">
        {tab === 'resumen' && <TabResumen proyecto={p} />}
        {tab === 'actividades' && (
          <TabActividades
            actividades={d.actividades}
            colaboradores={d.colaboradores}
            onGuardar={d.guardarActividad}
            onBorrar={d.borrarActividad}
            onMover={d.moverActividad}
          />
        )}
        {tab === 'equipo' && (
          <TabEquipo
            asignaciones={d.asignaciones}
            colaboradores={d.colaboradores}
            nombreColaborador={d.nombreColaborador}
            onAsignar={d.asignar}
            onRescindir={d.rescindir}
          />
        )}
        {tab === 'reuniones' && (
          <TabReuniones
            reuniones={d.reuniones}
            colaboradores={d.colaboradores}
            responsableCliente={p.cliente?.responsable?.nombre}
            nombreColaborador={d.nombreColaborador}
            onAgregar={d.agregarReunion}
            onEditar={d.editarReunion}
            onTomar={d.tomarReunion}
          />
        )}
        {tab === 'presupuestos' && (
          <TabPresupuestos
            presupuestos={deProyecto(proyectoId)}
            onCrear={(tipo) =>
              crear(undefined, { tipo, proyectoId, clienteId: p.cliente?.id })
            }
          />
        )}
        {tab === 'evaluaciones' && (
          <TabEvaluaciones
            colaboradores={d.colaboradores}
            evaluacionesColaborador={d.evaluacionesColaborador}
            evaluacionesCliente={d.evaluacionesCliente}
            clienteNombre={p.cliente?.nombre}
            nombreColaborador={d.nombreColaborador}
            onEvaluarColaborador={d.evaluarColaborador}
            onEvaluarCliente={d.evaluarCliente}
          />
        )}
        {tab === 'historial' && <TabHistorial hechos={d.hechos} />}
        {tab === 'chat' && (
          <TabChat
            mensajes={d.mensajes}
            colaboradores={d.colaboradores}
            referencias={[...p.tags.map((t) => t.nombre), ...d.actividades.map((a) => a.titulo)]}
            nombreColaborador={d.nombreColaborador}
            onEnviar={(t) => d.agregarMensaje(t)}
          />
        )}
      </div>

      <Modal
        abierto={waAbierto}
        onCerrar={() => setWaAbierto(false)}
        titulo="Mensaje de WhatsApp"
        ancho={720}
      >
        <EnsamblaWhatsapp proyecto={p} cliente={p.cliente} estadoNombre={p.estado?.nombre} />
      </Modal>
    </div>
  )
}
