import '../styles/dashboard.css'
import { useMemo } from 'react'
import { FolderKanban, CheckCircle2, Building2, UsersRound, TrendingUp } from 'lucide-react'
import { useDatos, type TipoHecho } from '@/core/datos'

const TIPO_LABEL: Record<TipoHecho, string> = {
  creacion: 'Creación',
  estado: 'Estado',
  reunion: 'Reunión',
  nota: 'Nota',
  asignacion: 'Asignación',
  evaluacion: 'Evaluación',
  documento: 'Documento',
}

export function DashboardPage() {
  const { estado } = useDatos()

  const d = useMemo(() => {
    const proyectos = Object.values(estado.proyectos)
    const estados = [...estado.estadosProyecto].sort((a, b) => a.orden - b.orden)
    const finales = new Set(estados.filter((e) => e.esFinal).map((e) => e.id))

    const activos = proyectos.filter((p) => !finales.has(p.estadoId)).length
    const clientes = Object.keys(estado.clientes).length
    const colabs = Object.values(estado.colaboradores).filter((c) => c.activo).length
    const progProm = proyectos.length
      ? Math.round(proyectos.reduce((s, p) => s + p.progreso, 0) / proyectos.length)
      : 0

    const porEstado = estados
      .map((e) => ({ e, n: proyectos.filter((p) => p.estadoId === e.id).length }))
      .filter((x) => x.n > 0)
    const maxN = Math.max(1, ...porEstado.map((x) => x.n))

    const nombreProyecto = (id: string) => estado.proyectos[id]?.nombre ?? '—'
    const hechos = Object.values(estado.hechos)
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 8)

    const proximas = proyectos
      .filter((p) => p.fechas?.entregaEstim && !finales.has(p.estadoId))
      .map((p) => ({ p, fecha: p.fechas!.entregaEstim as string }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 5)

    return {
      total: proyectos.length,
      activos,
      clientes,
      colabs,
      progProm,
      porEstado,
      maxN,
      hechos,
      proximas,
      nombreProyecto,
    }
  }, [estado])

  const kpis = [
    { label: 'Proyectos activos', valor: d.activos, Icon: FolderKanban },
    { label: 'Proyectos totales', valor: d.total, Icon: CheckCircle2 },
    { label: 'Clientes', valor: d.clientes, Icon: Building2 },
    { label: 'Colaboradores', valor: d.colabs, Icon: UsersRound },
    { label: 'Progreso promedio', valor: `${d.progProm}%`, Icon: TrendingUp },
  ]

  return (
    <section className="page">
      <header className="page__header">
        <h1 className="page__title">Dashboard</h1>
        <p className="page__subtitle">Resumen general del sistema.</p>
      </header>

      <div className="dash-kpis">
        {kpis.map((k) => (
          <article key={k.label} className="dash-kpi">
            <span className="dash-kpi__icono">
              <k.Icon size={18} strokeWidth={1.75} />
            </span>
            <div>
              <strong className="dash-kpi__valor">{k.valor}</strong>
              <span className="dash-kpi__label">{k.label}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="dash-grid">
        <article className="dash-card">
          <h2 className="dash-card__tit">Proyectos por estado</h2>
          {d.porEstado.length === 0 && <p className="muted">Sin proyectos aún.</p>}
          <div className="dash-bars">
            {d.porEstado.map(({ e, n }) => (
              <div key={e.id} className="dash-bar">
                <span className="dash-bar__lbl">
                  <i style={{ background: e.color }} />
                  {e.nombre}
                </span>
                <div className="dash-bar__track">
                  <span style={{ width: `${(n / d.maxN) * 100}%`, background: e.color }} />
                </div>
                <span className="dash-bar__n">{n}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="dash-card">
          <h2 className="dash-card__tit">Actividad reciente</h2>
          {d.hechos.length === 0 && <p className="muted">Sin actividad registrada.</p>}
          <ul className="dash-act">
            {d.hechos.map((h) => (
              <li key={h.id}>
                <span className={'dash-act__dot t-' + h.tipo} />
                <div className="dash-act__body">
                  <span className="dash-act__desc">{h.descripcion}</span>
                  <span className="dash-act__meta">
                    {d.nombreProyecto(h.proyectoId)} · {TIPO_LABEL[h.tipo]} ·{' '}
                    {new Date(h.fecha).toLocaleDateString('es-VE')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="dash-card dash-card--ancho">
          <h2 className="dash-card__tit">Próximas entregas</h2>
          {d.proximas.length === 0 && <p className="muted">No hay entregas estimadas próximas.</p>}
          <div className="dash-prox">
            {d.proximas.map(({ p, fecha }) => (
              <div key={p.id} className="dash-prox__item">
                <span className="dash-prox__nombre">{p.nombre}</span>
                <span className="dash-prox__fecha">
                  {new Date(fecha + 'T00:00:00').toLocaleDateString('es-VE', { dateStyle: 'medium' })}
                </span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
