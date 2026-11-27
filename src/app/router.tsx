import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/app/layouts/RootLayout'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { RequireAuth } from '@/app/guards/RequireAuth'
import { InicioMovil } from '@/app/mobile/InicioMovil'

import { RouteErrorBoundary } from './components/ErrorBoundary'

/**
 * Mapa de rutas del monolito. El app-shell sólo CONECTA módulos;
 * no contiene lógica de negocio.
 */
export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/', lazy: async () => ({ Component: (await import('@/modules/auth')).OnePage }) },
      { path: '/home', lazy: async () => ({ Component: (await import('@/modules/auth')).OnePage }) },
      { path: '/login', lazy: async () => ({ Component: (await import('@/modules/auth')).LoginPage }) },
    ],
  },
  {
    element: (
      <RequireAuth>
        <RootLayout />
      </RequireAuth>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: '/inicio', element: <InicioMovil /> },
      { path: '/tablero', lazy: async () => ({ Component: (await import('@/modules/tablero')).TableroPage }) },
      { path: '/proyectos', lazy: async () => ({ Component: (await import('@/modules/proyectos')).ProyectosPage }) },
      { path: '/proyectos/:id', lazy: async () => ({ Component: (await import('@/modules/proyectos')).ProyectoDetallePage }) },
      { path: '/proyectos/:id/documento', lazy: async () => ({ Component: (await import('@/modules/documentos')).DocumentoPage }) },
      { path: '/pendientes', lazy: async () => ({ Component: (await import('@/modules/documentos')).PendientesPage }) },
      { path: '/reuniones/minuta', lazy: async () => ({ Component: (await import('@/modules/documentos')).MinutaPage }) },
      // Compatibilidad con el enlace anterior.
      { path: '/minuta', element: <Navigate to="/reuniones/minuta" replace /> },
      { path: '/reuniones', lazy: async () => ({ Component: (await import('@/modules/proyectos')).AgendaPage }) },
      { path: '/clientes', lazy: async () => ({ Component: (await import('@/modules/clientes')).ClientesPage }) },
      { path: '/colaboradores', lazy: async () => ({ Component: (await import('@/modules/colaboradores')).ColaboradoresPage }) },
      { path: '/reportes', lazy: async () => ({ Component: (await import('@/modules/reportes')).ReportesPage }) },
      { path: '/presupuesto', lazy: async () => ({ Component: (await import('@/modules/finanzas')).PresupuestoPage }) },
      { path: '/cobranza', lazy: async () => ({ Component: (await import('@/modules/finanzas')).CobranzaPage }) },
      { path: '/tasas', lazy: async () => ({ Component: (await import('@/modules/finanzas')).TasasPage }) },
      { path: '/dashboard', lazy: async () => ({ Component: (await import('@/modules/dashboard')).DashboardPage }) },
      { path: '/usuarios', lazy: async () => ({ Component: (await import('@/modules/usuarios')).UsuariosPage }) },
      { path: '/herramientas', lazy: async () => ({ Component: (await import('@/modules/herramientas')).HerramientasPage }) },
      { path: '/metodologia', lazy: async () => ({ Component: (await import('@/modules/metodologia')).MetodologiaPage }) },
      { path: '/rrhh', lazy: async () => ({ Component: (await import('@/modules/rrhh')).RrhhPage }) },
      { path: '/auditoria', lazy: async () => ({ Component: (await import('@/modules/auditoria')).AuditoriaPage }) },
      { path: '/configuracion', lazy: async () => ({ Component: (await import('@/modules/configuracion')).ConfiguracionPage }) },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
