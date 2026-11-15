import './buscador.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Search, CornerDownLeft } from 'lucide-react'
import { ETIQUETA_TIPO, useBuscadorGlobal, type Resultado } from './useBuscadorGlobal'

/**
 * Buscador global tipo paleta de comandos: encuentra proyectos, clientes,
 * colaboradores, tareas, reuniones y herramientas por código o por palabras
 * aproximadas. Se abre con Ctrl/⌘ + K.
 */
/**
 * `compacto` deja solo la lupa: en la cabecera de un teléfono no cabe el
 * disparador con texto y atajo de teclado.
 */
export function BuscadorGlobal({ compacto }: { compacto?: boolean } = {}) {
  const [abierto, setAbierto] = useState(false)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const entrada = useRef<HTMLInputElement>(null)
  const { buscar, total } = useBuscadorGlobal()
  const nav = useNavigate()

  const resultados = useMemo(() => buscar(q), [q, buscar])

  // Atajo global: Ctrl/⌘ + K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setAbierto((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (abierto) {
      setQ('')
      setSel(0)
      setTimeout(() => entrada.current?.focus(), 10)
    }
  }, [abierto])

  useEffect(() => setSel(0), [q])

  function elegir(r: Resultado) {
    setAbierto(false)
    nav(r.ruta)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setAbierto(false)
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSel((s) => Math.min(s + 1, resultados.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSel((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter' && resultados[sel]) {
      e.preventDefault()
      elegir(resultados[sel])
    }
  }

  return (
    <>
      <button
        className={'bus-trigger' + (compacto ? ' bus-trigger--compacto' : '')}
        onClick={() => setAbierto(true)}
        title="Buscar (Ctrl+K)"
        aria-label="Buscar"
      >
        <Search size={15} />
        {!compacto && (
          <>
            <span>Buscar…</span>
            <kbd>Ctrl K</kbd>
          </>
        )}
      </button>

      {/* Portal: la barra superior usa backdrop-filter y atraparía el overlay fijo. */}
      {abierto &&
        createPortal(
          <div className="bus" role="presentation" onMouseDown={() => setAbierto(false)}>
          <div
            className="bus__panel"
            role="dialog"
            aria-modal="true"
            aria-label="Buscador global"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="bus__campo">
              <Search size={17} />
              <input
                ref={entrada}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Código o nombre: PRY-2026-0001, cliente, tarea…"
              />
              <kbd>Esc</kbd>
            </div>

            {q.trim() === '' ? (
              <p className="bus__pista">
                Busca entre {total} registros por código (PRY, CLI, TAR, REU, HER) o por nombre.
              </p>
            ) : resultados.length === 0 ? (
              <p className="bus__pista">Sin coincidencias para «{q}».</p>
            ) : (
              <ul className="bus__lista" role="listbox">
                {resultados.map((r, i) => (
                  <li key={`${r.tipo}-${r.id}`}>
                    <button
                      role="option"
                      aria-selected={i === sel}
                      className={'bus__item' + (i === sel ? ' is-sel' : '')}
                      onMouseEnter={() => setSel(i)}
                      onClick={() => elegir(r)}
                    >
                      <span className={'bus__tipo bus__tipo--' + r.tipo}>
                        {ETIQUETA_TIPO[r.tipo]}
                      </span>
                      <span className="bus__txt">
                        <span className="bus__tit">{r.titulo}</span>
                        {r.detalle && <span className="bus__det">{r.detalle}</span>}
                      </span>
                      {r.codigo && <code className="bus__cod">{r.codigo}</code>}
                      {i === sel && <CornerDownLeft size={13} className="bus__enter" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          </div>,
          document.body,
        )}
    </>
  )
}
