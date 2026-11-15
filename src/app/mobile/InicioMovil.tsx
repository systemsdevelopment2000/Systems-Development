import { Link } from 'react-router-dom'
import { FolderKanban, Building2, UsersRound, KanbanSquare, ChevronRight } from 'lucide-react'
import { useDatos } from '@/core/datos'

const ACCIONES = [
  { to: '/proyectos', label: 'Proyectos', Icon: FolderKanban },
  { to: '/clientes', label: 'Clientes', Icon: Building2 },
  { to: '/colaboradores', label: 'Equipo', Icon: UsersRound },
  { to: '/tablero', label: 'Tablero', Icon: KanbanSquare },
]

export function InicioMovil() {
  const { estado } = useDatos()

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

  return (
    <div className="home">
      <div className="home__hola">
        <span className="home__eyebrow">Systems Development</span>
        <h1>Hola</h1>
        <p>Resumen de tu operación.</p>
      </div>

      <section className="home__sec">
        <h2 className="home__tit">Acciones</h2>
        <div className="home__acciones">
          {ACCIONES.map((a) => (
            <Link key={a.to} to={a.to} className="home__accion">
              <a.Icon size={20} strokeWidth={1.75} />
              <span>{a.label}</span>
              <ChevronRight size={15} className="home__accion-ir" />
            </Link>
          ))}
        </div>
      </section>

      <section className="home__sec">
        <h2 className="home__tit">Reportes</h2>
        <div className="home__reportes">
          <div className="home__kpi">
            <strong>{activos}</strong>
            <span>Proyectos activos</span>
          </div>
          <div className="home__kpi">
            <strong>{clientes}</strong>
            <span>Clientes</span>
          </div>
          <div className="home__kpi">
            <strong>{colabs}</strong>
            <span>Colaboradores</span>
          </div>
          <div className="home__kpi">
            <strong>{progProm}%</strong>
            <span>Progreso promedio</span>
          </div>
        </div>
      </section>

      <section className="home__sec">
        <h2 className="home__tit">Proyectos por estado</h2>
        <div className="home__barras">
          {porEstado.length === 0 && <p className="muted">Sin proyectos aún.</p>}
          {porEstado.map(({ e, n }) => (
            <div key={e.id} className="home__barra">
              <span className="home__barra-lbl">
                <i style={{ background: e.color }} />
                {e.nombre}
              </span>
              <div className="home__barra-track">
                <span style={{ width: `${(n / maxN) * 100}%`, background: e.color }} />
              </div>
              <span className="home__barra-n">{n}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
