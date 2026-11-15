import { Outlet, useLocation } from 'react-router-dom'
import { useVista } from '@/core/vista'
import { MarcoTelefono } from './MarcoTelefono'

/** Layout de la zona pública (OnePage Corporativa + Consola de Acceso). */
export function AuthLayout() {
  const { vista, esMovilReal } = useVista()
  const location = useLocation()
  const esLogin = location.pathname === '/login'

  if (vista === 'telefono') {
    return (
      <MarcoTelefono enmarcar={!esMovilReal}>
        <div
          className="movil"
          style={{ height: '100%', overflowY: esLogin ? 'hidden' : 'auto' }}
        >
          <Outlet />
        </div>
      </MarcoTelefono>
    )
  }

  return (
    <div className={'onepage-shell' + (esLogin ? ' onepage-shell--login' : '')}>
      <Outlet />
    </div>
  )
}
