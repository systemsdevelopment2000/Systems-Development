import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Vista = 'escritorio' | 'telefono'

const CLAVE = 'sd:vista'
const MOVIL_QUERY = '(max-width: 760px)'

function esAngosto(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MOVIL_QUERY).matches
}

function vistaInicial(): Vista {
  try {
    const g = localStorage.getItem(CLAVE)
    if (g === 'telefono' || g === 'escritorio') return g
  } catch {
    /* sin almacenamiento */
  }
  // Default: teléfono si el viewport es angosto (móvil real).
  return esAngosto() ? 'telefono' : 'escritorio'
}

interface Ctx {
  vista: Vista
  /** true si el dispositivo real es angosto (entonces la vista móvil va a pantalla completa, sin marco). */
  esMovilReal: boolean
  setVista: (v: Vista) => void
  toggle: () => void
}

const VistaContext = createContext<Ctx | null>(null)

export function VistaProvider({ children }: { children: ReactNode }) {
  const [vista, setVistaState] = useState<Vista>(vistaInicial)
  const [esMovilReal, setEsMovilReal] = useState<boolean>(esAngosto)

  useEffect(() => {
    const mq = window.matchMedia(MOVIL_QUERY)
    const on = () => setEsMovilReal(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  function setVista(v: Vista) {
    setVistaState(v)
    try {
      localStorage.setItem(CLAVE, v)
    } catch {
      /* sin almacenamiento */
    }
  }

  const valor: Ctx = {
    vista,
    esMovilReal,
    setVista,
    toggle: () => setVista(vista === 'telefono' ? 'escritorio' : 'telefono'),
  }

  return <VistaContext.Provider value={valor}>{children}</VistaContext.Provider>
}

export function useVista(): Ctx {
  const ctx = useContext(VistaContext)
  if (!ctx) throw new Error('useVista debe usarse dentro de <VistaProvider>')
  return ctx
}
