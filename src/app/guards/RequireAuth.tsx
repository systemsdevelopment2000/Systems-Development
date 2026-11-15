import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '@/core/hooks/useSession'
import { Spinner } from '@/core/ui'

/**
 * Protege rutas privadas. Mientras resuelve la sesión muestra un spinner;
 * si no hay usuario autenticado redirige a /login recordando el destino original.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useSession()
  const location = useLocation()

  if (loading) {
    return (
      <div className="screen-center">
        <Spinner label="Verificando sesión…" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
