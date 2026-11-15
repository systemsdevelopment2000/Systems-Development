import { useState } from 'react'
import { permisoActual, pedirPermiso, soportado, notificar } from './notificaciones'

export function useNotificaciones() {
  const [permiso, setPermiso] = useState<NotificationPermission>(permisoActual)

  async function activar(): Promise<NotificationPermission> {
    const p = await pedirPermiso()
    setPermiso(p)
    if (p === 'granted') {
      void notificar('Systems Development', 'Notificaciones activadas correctamente.')
    }
    return p
  }

  return { soportado: soportado(), permiso, activar }
}
