import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/app/layouts/RootLayout'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { RequireAuth } from '@/app/guards/RequireAuth'
import { InicioMovil } from '@/app/mobile/InicioMovil'

// Cada página se importa SOLO desde la API pública (barrel) de su módulo.
import { LoginPage, OnePage } from '@/modules/auth'
import { TableroPage } from '@/modules/tablero'
import { ProyectosPage, ProyectoDetallePage, AgendaPage } from '@/modules/proyectos'
import { DocumentoPage, PendientesPage, MinutaPage } from '@/modules/documentos'
import { ClientesPage } from '@/modules/clientes'
import { ColaboradoresPage } from '@/modules/colaboradores'
import { ReportesPage } from '@/modules/reportes'
import { PresupuestoPage, TasasPage, CobranzaPage } from '@/modules/finanzas'
import { DashboardPage } from '@/modules/dashboard'
import { UsuariosPage } from '@/modules/usuarios'
import { HerramientasPage } from '@/modules/herramientas'
import { ConfiguracionPage } from '@/modules/configuracion'
import { AuditoriaPage } from '@/modules/auditoria'
import { RrhhPage } from '@/modules/rrhh'

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
      { path: '/', element: <OnePage /> },
      { path: '/home', element: <OnePage /> },
      { path: '/login', element: <LoginPage /> },
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
      { path: '/tablero', element: <TableroPage /> },
      { path: '/proyectos', element: <ProyectosPage /> },
      { path: '/proyectos/:id', element: <ProyectoDetallePage /> },
      { path: '/proyectos/:id/documento', element: <DocumentoPage /> },
      { path: '/pendientes', element: <PendientesPage /> },
      { path: '/reuniones/minuta', element: <MinutaPage /> },
      // Compatibilidad con el enlace anterior.
      { path: '/minuta', element: <Navigate to="/reuniones/minuta" replace /> },
      { path: '/reuniones', element: <AgendaPage /> },
      { path: '/clientes', element: <ClientesPage /> },
      { path: '/colaboradores', element: <ColaboradoresPage /> },
      { path: '/reportes', element: <ReportesPage /> },
      { path: '/presupuesto', element: <PresupuestoPage /> },
      { path: '/cobranza', element: <CobranzaPage /> },
      { path: '/tasas', element: <TasasPage /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/usuarios', element: <UsuariosPage /> },
      { path: '/herramientas', element: <HerramientasPage /> },
      { path: '/rrhh', element: <RrhhPage /> },
      { path: '/auditoria', element: <AuditoriaPage /> },
      { path: '/configuracion', element: <ConfiguracionPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
