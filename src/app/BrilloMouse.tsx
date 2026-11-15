import { useEffect } from 'react'

/**
 * Brillo radial leve que sigue al cursor y resalta su ubicación. Con mezcla
 * "screen" ilumina sutilmente lo que pasa por debajo (los ítems reaccionan).
 * Se desactiva en táctil y con reduced-motion.
 */
export function BrilloMouse() {
  useEffect(() => {
    const fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fino || reduce) return

    const el = document.getElementById('brillo-mouse')
    if (!el) return
    el.style.opacity = '1'

    let raf = 0
    let x = 0
    let y = 0
    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (raf) return
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', `${x}px`)
        el.style.setProperty('--my', `${y}px`)
        raf = 0
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <div id="brillo-mouse" aria-hidden />
}
