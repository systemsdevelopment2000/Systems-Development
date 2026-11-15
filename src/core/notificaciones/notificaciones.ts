/**
 * Notificaciones del sistema (fase front): permiso + notificaciones locales/disparadas.
 * Usa el service worker si está registrado (producción) y, si no, la Notification API
 * a nivel de página (desarrollo). El push real en segundo plano (app cerrada) requiere
 * backend con VAPID + Web Push — fase posterior.
 */

export function soportado(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function permisoActual(): NotificationPermission {
  return soportado() ? Notification.permission : 'denied'
}

export async function pedirPermiso(): Promise<NotificationPermission> {
  if (!soportado()) return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

export async function notificar(titulo: string, cuerpo?: string): Promise<void> {
  if (!soportado() || Notification.permission !== 'granted') return
  const opciones: NotificationOptions = {
    body: cuerpo,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
  }
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg) {
        await reg.showNotification(titulo, opciones)
        return
      }
    }
  } catch {
    /* sin service worker; se usa el fallback */
  }
  try {
    new Notification(titulo, opciones)
  } catch {
    /* no disponible */
  }
}
