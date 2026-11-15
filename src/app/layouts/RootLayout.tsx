import '@/styles/movil.css'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  KanbanSquare,
  FolderKanban,
  LayoutDashboard,
  Building2,
  UsersRound,
  UserSearch,
  Users,
  BarChart3,
  CalendarClock,
  ClipboardList,

  Calculator,
  Coins,
  Wallet,
  Wrench,
  Settings,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'
import { MenuUsuario } from '@/modules/auth'
import { useVista } from '@/core/vista'
import { env } from '@/core/config/env'
import { RecordatoriosPagos } from '@/modules/herramientas'
import { BuscadorGlobal } from '@/core/buscador'
import { MarcoTelefono } from './MarcoTelefono'
import { ShellMovil } from './ShellMovil'

/**
 * Navegación agrupada por propósito. Al crecer el sistema, los módulos nuevos
 * entran en su grupo en vez de apilarse al final de una lista plana.
 */
const NAV = [
  {
    grupo: 'Trabajo',
    items: [
      { to: '/tablero', label: 'Tablero', Icon: KanbanSquare },
      { to: '/proyectos', label: 'Proyectos', Icon: FolderKanban },
      { to: '/reuniones', label: 'Reuniones', Icon: CalendarClock },
      { to: '/pendientes', label: 'Hoja de pendientes', Icon: ClipboardList },
    ],
  },
  {
    grupo: 'Relaciones',
    items: [
      { to: '/clientes', label: 'Clientes', Icon: Building2 },
      { to: '/colaboradores', label: 'Colaboradores', Icon: UsersRound },
      { to: '/rrhh', label: 'Selección', Icon: UserSearch },
    ],
  },
  {
    grupo: 'Finanzas',
    items: [
      { to: '/presupuesto', label: 'Presupuesto', Icon: Calculator },
      { to: '/cobranza', label: 'Cuentas por cobrar', Icon: Wallet },
      { to: '/tasas', label: 'Tasas y divisas', Icon: Coins },
    ],
  },
  {
    grupo: 'Análisis',
    items: [
      { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
      { to: '/reportes', label: 'Reportes', Icon: BarChart3 },
    ],
  },
  {
    grupo: 'Administración',
    items: [
      { to: '/usuarios', label: 'Usuarios', Icon: Users },
      { to: '/herramientas', label: 'Herramientas', Icon: Wrench },
      { to: '/auditoria', label: 'Auditoría', Icon: ShieldCheck },
      { to: '/configuracion', label: 'Configuración', Icon: Settings },
    ],
  },
]

/** Layout de la zona privada: barra lateral + cabecera + contenido. */
const CLAVE_GRUPOS = 'sd:nav-cerrados'

export function RootLayout() {
  const { vista, esMovilReal } = useVista()
  const ruta = useLocation()

  // Qué grupos están plegados. Se recuerda para no replegarlos en cada visita.
  const [cerrados, setCerrados] = useState<string[]>(() => {
    try {
      const g = localStorage.getItem(CLAVE_GRUPOS)
      return g ? (JSON.parse(g) as string[]) : []
    } catch {
      return []
    }
  })

  function alternarGrupo(grupo: string) {
    setCerrados((prev) => {
      const sig = prev.includes(grupo) ? prev.filter((x) => x !== grupo) : [...prev, grupo]
      try {
        localStorage.setItem(CLAVE_GRUPOS, JSON.stringify(sig))
      } catch {
        /* sin almacenamiento */
      }
      return sig
    })
  }

  if (vista === 'telefono') {
    // En teléfono, el recordatorio lo monta ShellMovil (dentro del marco).
    return (
      <MarcoTelefono enmarcar={!esMovilReal}>
        <ShellMovil />
      </MarcoTelefono>
    )
  }

  return (
    <>
    <RecordatoriosPagos />
    <div className="layout">
      <aside className="layout__sidebar">
        <div className="brand">
          <img className="brand__logo" src="/marca-sd.png" alt="SD" />
          <span className="brand__name">{env.appName}</span>
        </div>
        <nav className="nav">
          {NAV.map((g) => {
            const abierto = !cerrados.includes(g.grupo)
            // El grupo de la página actual no se puede plegar sin perder de
            // vista dónde estás, así que se fuerza abierto.
            const contieneActual = g.items.some((i) => ruta.pathname.startsWith(i.to))
            const visible = abierto || contieneActual
            return (
              <div className="nav__grupo" key={g.grupo}>
                <button
                  type="button"
                  className={'nav__grupo-tit' + (visible ? ' is-abierto' : '')}
                  onClick={() => alternarGrupo(g.grupo)}
                  aria-expanded={visible}
                  disabled={contieneActual && !abierto}
                >
                  <ChevronRight size={13} className="nav__chevron" aria-hidden />
                  {g.grupo}
                  {!visible && <em className="nav__grupo-n">{g.items.length}</em>}
                </button>

                {visible &&
                  g.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        'nav__link' + (isActive ? ' nav__link--active' : '')
                      }
                    >
                      <span className="nav__icon" aria-hidden>
                        <item.Icon size={18} strokeWidth={1.75} />
                      </span>
                      {item.label}
                    </NavLink>
                  ))}
              </div>
            )
          })}
        </nav>
      </aside>

      <div className="layout__main">
        <header className="topbar">
          <BuscadorGlobal />
          <MenuUsuario />
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
    </>
  )
}
