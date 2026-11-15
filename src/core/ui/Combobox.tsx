import './combobox.css'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'

export interface OpcionCombo {
  valor: string
  etiqueta: string
  color?: string
}

interface Props {
  opciones: OpcionCombo[]
  valor: string
  onCambio: (valor: string) => void
  placeholder?: string
  buscar?: boolean
  id?: string
}

/** Lista desplegable buscable con estilo SD (reemplaza a los <select> nativos). */
export function Combobox({
  opciones,
  valor,
  onCambio,
  placeholder = 'Selecciona…',
  buscar = true,
  id,
}: Props) {
  const [abierto, setAbierto] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [abierto])

  const sel = opciones.find((o) => o.valor === valor)
  const filtradas = opciones.filter((o) =>
    o.etiqueta.toLowerCase().includes(q.trim().toLowerCase()),
  )

  function elegir(v: string) {
    onCambio(v)
    setAbierto(false)
    setQ('')
  }

  return (
    <div className="cbx" ref={ref}>
      <button
        type="button"
        id={id}
        className="cbx__btn"
        onClick={() => setAbierto((o) => !o)}
        aria-expanded={abierto}
        aria-haspopup="listbox"
      >
        {sel ? (
          <span className="cbx__val">
            {sel.color && <i style={{ background: sel.color }} />}
            {sel.etiqueta}
          </span>
        ) : (
          <span className="cbx__ph">{placeholder}</span>
        )}
        <ChevronDown size={15} className="cbx__chev" />
      </button>

      {abierto && (
        <div className="cbx__pop">
          {buscar && (
            <div className="cbx__buscar">
              <Search size={14} />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar…"
              />
            </div>
          )}
          <div className="cbx__lista" role="listbox">
            {filtradas.map((o) => (
              <button
                type="button"
                key={o.valor}
                role="option"
                aria-selected={o.valor === valor}
                className={'cbx__op' + (o.valor === valor ? ' is-on' : '')}
                onClick={() => elegir(o.valor)}
              >
                <span className="cbx__op-txt">
                  {o.color && <i style={{ background: o.color }} />}
                  {o.etiqueta}
                </span>
                {o.valor === valor && <Check size={14} />}
              </button>
            ))}
            {filtradas.length === 0 && <p className="cbx__vacio">Sin resultados</p>}
          </div>
        </div>
      )}
    </div>
  )
}
