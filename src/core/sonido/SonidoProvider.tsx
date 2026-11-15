import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  NOMBRES,
  reproducir,
  setSonidoActivo,
  sonidoActivo,
  type SonidoNombre,
} from './motor'

interface Ctx {
  activo: boolean
  alternar: () => void
  sonar: (n: SonidoNombre) => void
}

const SonidoCtx = createContext<Ctx | null>(null)

function esNombre(v: string | null): v is SonidoNombre {
  return !!v && (NOMBRES as string[]).includes(v)
}

/**
 * Sonido global. Escucha los clics en toda la app: si el elemento (o un
 * ancestro) declara `data-sonido="exito|eliminar|…"` reproduce ese efecto; si
 * no, un tick discreto para cualquier botón o enlace. Así cada acción suena sin
 * tener que cablear cada componente.
 */
export function SonidoProvider({ children }: { children: ReactNode }) {
  const [activo, setActivo] = useState(sonidoActivo())

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const destino = e.target as HTMLElement | null
      if (!destino) return
      const conSonido = destino.closest<HTMLElement>('[data-sonido]')
      if (conSonido) {
        const n = conSonido.getAttribute('data-sonido')
        if (n === 'ninguno') return
        if (esNombre(n)) {
          reproducir(n)
          return
        }
      }
      const interactivo = destino.closest(
        'button, a[href], [role="button"], input[type="checkbox"], label.toggle',
      )
      if (interactivo) reproducir('tap')
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  const alternar = useCallback(() => {
    const v = !sonidoActivo()
    setSonidoActivo(v)
    setActivo(v)
  }, [])

  const sonar = useCallback((n: SonidoNombre) => reproducir(n), [])

  return <SonidoCtx.Provider value={{ activo, alternar, sonar }}>{children}</SonidoCtx.Provider>
}

export function useSonido(): Ctx {
  const c = useContext(SonidoCtx)
  if (!c) throw new Error('useSonido debe usarse dentro de <SonidoProvider>')
  return c
}
