import { useEffect, useRef } from 'react'

/**
 * Gestos táctiles de la vista móvil.
 *
 * Criterios que importan para que un gesto se sienta nativo y no estorbe:
 *
 * - El deslizamiento para volver arranca **solo desde el borde izquierdo**.
 *   Si se activara en cualquier parte, chocaría con el desplazamiento
 *   horizontal de tablas, el tablero kanban y los carruseles.
 * - Se exige que el movimiento sea claramente horizontal antes de actuar: un
 *   dedo que baja no debe disparar una navegación.
 * - Se ignora por completo si el toque empieza dentro de algo que se desplaza
 *   en horizontal.
 */

interface Opciones {
  /** Volver atrás: deslizar desde el borde izquierdo hacia la derecha. */
  onVolver?: () => void
  /** Deslizar a la izquierda sobre el contenido (siguiente pestaña). */
  onSiguiente?: () => void
  /** Deslizar a la derecha sobre el contenido (pestaña anterior). */
  onAnterior?: () => void
  /** Desactiva todo sin tener que desmontar el componente. */
  activo?: boolean
}

/** Distancia mínima para considerar que hubo gesto, en px. */
const UMBRAL = 64
/** Cuánto más horizontal que vertical debe ser el movimiento. */
const RATIO = 1.6
/** Ancho de la zona de borde que activa el "volver", en px. */
const BORDE = 28

/**
 * Un toque que empieza dentro de un modal pertenece al modal, no a la pantalla:
 * si se tratara como gesto de la cáscara, un simple deslizamiento al tocar
 * "Siguiente" sacaría al usuario del formulario y perdería lo que lleva escrito.
 */
export function esDentroDeDialogo(destino: EventTarget | null): boolean {
  const n = destino as Element | null
  return typeof n?.closest === 'function' && Boolean(n.closest('[role="dialog"], .modal'))
}

export function useGestos<T extends HTMLElement>(opciones: Opciones) {
  const ref = useRef<T>(null)
  const inicio = useRef<{ x: number; y: number; desdeBorde: boolean } | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || opciones.activo === false) return

    function enScrollHorizontal(destino: EventTarget | null): boolean {
      let n = destino as HTMLElement | null
      while (n && n !== el) {
        if (n.scrollWidth - n.clientWidth > 4) {
          const ovf = getComputedStyle(n).overflowX
          if (ovf === 'auto' || ovf === 'scroll') return true
        }
        n = n.parentElement
      }
      return false
    }

    function onInicio(e: TouchEvent) {
      if (e.touches.length !== 1) {
        inicio.current = null
        return
      }
      const t = e.touches[0]
      if (esDentroDeDialogo(e.target) || enScrollHorizontal(e.target)) {
        inicio.current = null
        return
      }
      const caja = el!.getBoundingClientRect()
      inicio.current = {
        x: t.clientX,
        y: t.clientY,
        desdeBorde: t.clientX - caja.left <= BORDE,
      }
    }

    function onFin(e: TouchEvent) {
      const ini = inicio.current
      inicio.current = null
      if (!ini) return

      const t = e.changedTouches[0]
      const dx = t.clientX - ini.x
      const dy = t.clientY - ini.y
      if (Math.abs(dx) < UMBRAL) return
      if (Math.abs(dx) < Math.abs(dy) * RATIO) return

      if (dx > 0 && ini.desdeBorde && opciones.onVolver) {
        opciones.onVolver()
        return
      }
      if (dx < 0 && opciones.onSiguiente) opciones.onSiguiente()
      else if (dx > 0 && !ini.desdeBorde && opciones.onAnterior) opciones.onAnterior()
    }

    el.addEventListener('touchstart', onInicio, { passive: true })
    el.addEventListener('touchend', onFin, { passive: true })
    el.addEventListener('touchcancel', () => (inicio.current = null), { passive: true })

    return () => {
      el.removeEventListener('touchstart', onInicio)
      el.removeEventListener('touchend', onFin)
    }
  }, [opciones])

  return ref
}

/**
 * Vibración corta al confirmar un gesto. Es lo que separa "pasó algo" de
 * "pasó algo y lo sentí". Silenciosa donde no exista la API.
 */
export function vibrar(ms = 12) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* el navegador no la soporta */
  }
}
