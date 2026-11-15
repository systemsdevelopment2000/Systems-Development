import './combobox.css'
import { useEffect, useRef, useState, type KeyboardEvent as EventoTecla } from 'react'
import { X, Plus } from 'lucide-react'
import type { Tag } from '@/core/datos'

interface Props {
  catalogo: Tag[]
  seleccion: string[]
  onCambio: (ids: string[]) => void
  onCrear: (nombre: string) => Tag
}

/** Selector de tags editable: buscar/añadir existentes y crear nuevos. */
export function SelectorTags({ catalogo, seleccion, onCambio, onCrear }: Props) {
  const [q, setQ] = useState('')
  const [abierto, setAbierto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [abierto])

  const seleccionadas = seleccion
    .map((id) => catalogo.find((t) => t.id === id))
    .filter(Boolean) as Tag[]
  const query = q.trim().toLowerCase()
  const disponibles = catalogo.filter(
    (t) => !seleccion.includes(t.id) && t.nombre.toLowerCase().includes(query),
  )
  const existeExacto = catalogo.some((t) => t.nombre.toLowerCase() === query)

  function agregar(id: string) {
    onCambio([...seleccion, id])
    setQ('')
  }
  function quitar(id: string) {
    onCambio(seleccion.filter((x) => x !== id))
  }
  function crear() {
    const nombre = q.trim()
    if (!nombre || existeExacto) return
    const t = onCrear(nombre)
    onCambio([...seleccion, t.id])
    setQ('')
  }

  function onKey(e: EventoTecla) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (disponibles[0]) agregar(disponibles[0].id)
      else if (q.trim()) crear()
    } else if (e.key === 'Backspace' && !q && seleccion.length) {
      quitar(seleccion[seleccion.length - 1])
    }
  }

  return (
    <div className="tagsel" ref={ref}>
      <div className="tagsel__chips" onClick={() => setAbierto(true)}>
        {seleccionadas.map((t) => (
          <span key={t.id} className="tagsel__chip">
            <i style={{ background: t.color }} />
            {t.nombre}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                quitar(t.id)
              }}
              aria-label={`Quitar ${t.nombre}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          className="tagsel__input"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setAbierto(true)
          }}
          onFocus={() => setAbierto(true)}
          onKeyDown={onKey}
          placeholder={seleccionadas.length ? '' : 'Buscar o crear tag…'}
        />
      </div>

      {abierto && (disponibles.length > 0 || (q.trim() && !existeExacto)) && (
        <div className="cbx__pop tagsel__pop">
          <div className="cbx__lista">
            {disponibles.map((t) => (
              <button type="button" key={t.id} className="cbx__op" onClick={() => agregar(t.id)}>
                <span className="cbx__op-txt">
                  <i style={{ background: t.color }} />
                  {t.nombre}
                </span>
              </button>
            ))}
            {q.trim() && !existeExacto && (
              <button type="button" className="cbx__op tagsel__crear" onClick={crear}>
                <Plus size={13} /> Crear «{q.trim()}»
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
