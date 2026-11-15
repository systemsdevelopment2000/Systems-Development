import type { ReactNode } from 'react'
import { Monitor } from 'lucide-react'
import { useVista } from '@/core/vista'

/**
 * Enmarca la app en un "teléfono" para previsualizar la vista móvil desde
 * el escritorio. En un teléfono real (enmarcar=false) pasa a pantalla completa.
 */
export function MarcoTelefono({ children, enmarcar }: { children: ReactNode; enmarcar: boolean }) {
  const { setVista } = useVista()

  if (!enmarcar) return <>{children}</>

  return (
    <div className="marco-fondo">
      <button className="marco-salir" onClick={() => setVista('escritorio')}>
        <Monitor size={16} /> Vista escritorio
      </button>
      <div className="marco-tel">
        <div className="marco-tel__pantalla">{children}</div>
      </div>
    </div>
  )
}
