import {
  KanbanSquare,
  FolderKanban,
  CalendarClock,
  ClipboardList,
  NotebookPen,
  Building2,
  UsersRound,
  UserSearch,
  Calculator,
  Wallet,
  Coins,
  LayoutDashboard,
  BarChart3,
  Users,
  Wrench,
  ShieldCheck,
  Settings,
} from 'lucide-react'

/**
 * Todos los módulos, agrupados, para la hoja inferior de la vista móvil.
 *
 * La barra inferior solo tiene sitio para cuatro destinos; el resto del
 * sistema vive aquí. Es la misma agrupación que la barra lateral de
 * escritorio, para que el mapa mental sea uno solo.
 */
export const MODULOS_MOVIL = [
  {
    grupo: 'Trabajo',
    items: [
      { to: '/tablero', label: 'Tablero', Icon: KanbanSquare },
      { to: '/proyectos', label: 'Proyectos', Icon: FolderKanban },
      { to: '/reuniones', label: 'Reuniones', Icon: CalendarClock },
      { to: '/reuniones/minuta', label: 'Minuta', Icon: NotebookPen },
      { to: '/pendientes', label: 'Pendientes', Icon: ClipboardList },
    ],
  },
  {
    grupo: 'Relaciones',
    items: [
      { to: '/clientes', label: 'Clientes', Icon: Building2 },
      { to: '/colaboradores', label: 'Equipo', Icon: UsersRound },
      { to: '/rrhh', label: 'Selección', Icon: UserSearch },
    ],
  },
  {
    grupo: 'Finanzas',
    items: [
      { to: '/presupuesto', label: 'Presupuesto', Icon: Calculator },
      { to: '/cobranza', label: 'Cobros', Icon: Wallet },
      { to: '/tasas', label: 'Tasas', Icon: Coins },
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
