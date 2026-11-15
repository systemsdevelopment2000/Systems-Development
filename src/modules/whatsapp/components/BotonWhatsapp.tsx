import '../styles/whatsapp.css'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { MessageCircle, Check } from 'lucide-react'
import type { Cliente, Proyecto } from '@/core/datos'
import { PLANTILLAS } from '../lib/plantillas'

interface Props {
  proyecto: Proyecto
  cliente?: Cliente
  estadoNombre?: string
  /** Click normal: abre el ensamblador completo (editable). */
  onAbrir: () => void
}

const ESPERA_MS = 2000 // hover necesario para desplegar
const GRACIA_MS = 450 // margen al salir para alcanzar una opción

/**
 * Botón de WhatsApp con menú radial de accesibilidad: al mantener el mouse
 * ~2 s sobre el botón se despliegan las plantillas en abanico; un click en una
 * copia el mensaje al portapapeles (copia rápida, sin abrir el editor). Al salir
 * hay un breve margen para cruzar el hueco y pulsar una opción antes de cerrar.
 */
export function BotonWhatsapp({ proyecto, cliente, estadoNombre, onAbrir }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)
  const abrirRef = useRef<number | undefined>(undefined)
  const cerrarRef = useRef<number | undefined>(undefined)

  const limpiar = useCallback(() => {
    window.clearTimeout(abrirRef.current)
    window.clearTimeout(cerrarRef.current)
    abrirRef.current = undefined
    cerrarRef.current = undefined
  }, [])

  useEffect(() => () => limpiar(), [limpiar])

  function onEnter() {
    // Cancela cualquier cierre pendiente (p. ej. al cruzar el hueco a una opción).
    window.clearTimeout(cerrarRef.current)
    cerrarRef.current = undefined
    if (!abierto && !abrirRef.current) {
      abrirRef.current = window.setTimeout(() => {
        setAbierto(true)
        abrirRef.current = undefined
      }, ESPERA_MS)
    }
  }
  function onLeave() {
    window.clearTimeout(abrirRef.current)
    abrirRef.current = undefined
    cerrarRef.current = window.setTimeout(() => {
      setAbierto(false)
      setCopiado(null)
      cerrarRef.current = undefined
    }, GRACIA_MS)
  }

  function copiar(id: string) {
    const p = PLANTILLAS.find((x) => x.id === id)
    if (!p) return
    const texto = p.construir({ proyecto, cliente, estadoNombre })
    navigator.clipboard?.writeText(texto).then(
      () => {
        setCopiado(id)
        window.setTimeout(() => {
          setCopiado(null)
          setAbierto(false)
        }, 1100)
      },
      () => {},
    )
  }

  // Abanico hacia abajo-izquierda (evita la barra superior y los botones vecinos).
  const n = PLANTILLAS.length
  const inicio = 112
  const fin = 190

  return (
    <div
      className={'wa-radial' + (abierto ? ' is-open' : '')}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <button className="btn btn--ghost btn--icono" onClick={onAbrir} aria-haspopup="menu">
        <MessageCircle size={15} /> WhatsApp
      </button>

      {abierto && (
        <div className="wa-radial__menu" role="menu" aria-label="Plantillas rápidas de WhatsApp">
          {PLANTILLAS.map((p, i) => {
            const a = ((inicio + ((fin - inicio) * (n === 1 ? 0.5 : i / (n - 1)))) * Math.PI) / 180
            const r = 162
            const x = Math.cos(a) * r
            const y = Math.sin(a) * r
            return (
              <button
                key={p.id}
                role="menuitem"
                className={'wa-radial__op' + (copiado === p.id ? ' is-copied' : '')}
                style={
                  {
                    '--x': `${x.toFixed(0)}px`,
                    '--y': `${y.toFixed(0)}px`,
                    animationDelay: `${i * 35}ms`,
                  } as CSSProperties
                }
                onClick={() => copiar(p.id)}
                title={`Copiar: ${p.nombre}`}
              >
                {copiado === p.id ? (
                  <>
                    <Check size={13} /> Copiado
                  </>
                ) : (
                  p.nombre.split(/[\s/]+/)[0]
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
