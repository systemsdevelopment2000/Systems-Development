import './confirmar.css'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AlertTriangle, HelpCircle } from 'lucide-react'
import { reproducir } from '@/core/sonido'
import { Button } from './Button'

export interface OpcionesConfirmar {
  titulo: string
  mensaje?: string
  textoConfirmar?: string
  textoCancelar?: string
  /** Acción destructiva: resalta en rojo. */
  peligro?: boolean
}

type Confirmar = (opciones: OpcionesConfirmar) => Promise<boolean>

const Ctx = createContext<Confirmar | null>(null)

/**
 * Diálogo de confirmación con la identidad de SD, en lugar del `confirm()`
 * nativo del navegador. Se usa con `const confirmar = useConfirmar()` y
 * `if (await confirmar({ ... }))`.
 */
export function ConfirmarProvider({ children }: { children: ReactNode }) {
  const [op, setOp] = useState<OpcionesConfirmar | null>(null)
  const resolver = useRef<((v: boolean) => void) | null>(null)

  const confirmar = useCallback<Confirmar>((opciones) => {
    setOp(opciones)
    return new Promise<boolean>((res) => {
      resolver.current = res
    })
  }, [])

  const cerrar = useCallback((valor: boolean) => {
    setOp(null)
    resolver.current?.(valor)
    resolver.current = null
  }, [])

  useEffect(() => {
    if (!op) return
    reproducir(op.peligro ? 'error' : 'abrir')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar(false)
      if (e.key === 'Enter') cerrar(true)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [op, cerrar])

  return (
    <Ctx.Provider value={confirmar}>
      {children}
      {op && (
        <div className="cfm" role="presentation" onMouseDown={() => cerrar(false)}>
          <div
            className="cfm__panel"
            role="alertdialog"
            aria-modal="true"
            aria-label={op.titulo}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <span className={'cfm__ic' + (op.peligro ? ' cfm__ic--peligro' : '')}>
              {op.peligro ? <AlertTriangle size={20} /> : <HelpCircle size={20} />}
            </span>
            <h2 className="cfm__tit">{op.titulo}</h2>
            {op.mensaje && <p className="cfm__msg">{op.mensaje}</p>}
            <div className="cfm__acc">
              <Button type="button" variant="ghost" onClick={() => cerrar(false)}>
                {op.textoCancelar ?? 'Cancelar'}
              </Button>
              <button
                type="button"
                className={'btn ' + (op.peligro ? 'btn--peligro' : 'btn--primary')}
                data-sonido={op.peligro ? 'eliminar' : 'exito'}
                onClick={() => cerrar(true)}
                autoFocus
              >
                {op.textoConfirmar ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}

export function useConfirmar(): Confirmar {
  const c = useContext(Ctx)
  if (!c) throw new Error('useConfirmar debe usarse dentro de <ConfirmarProvider>')
  return c
}
