import { useEffect, useRef, useState } from 'react'
import { ListFilter, ChevronDown, Check, Search } from 'lucide-react'
import type { Proyecto } from '@/core/datos'
import { colorDe } from '../lib/vista'

interface Props {
  proyectos: Proyecto[]
  seleccion: string // 'todos' | id
  onSeleccion: (id: string) => void
}

/**
 * Filtro de proyecto como desplegable con buscador: ancho fijo que no
 * desborda aunque haya N proyectos (la lista hace scroll interno).
 */
export function FiltroProyecto({ proyectos, seleccion, onSeleccion }: Props) {
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

  const actual =
    seleccion === 'todos'
      ? null
      : seleccion === 'sin_proyecto'
        ? { id: 'sin_proyecto', nombre: 'Sin proyecto (General)' }
        : proyectos.find((p) => p.id === seleccion)
  const filtrados = proyectos.filter((p) => p.nombre.toLowerCase().includes(q.trim().toLowerCase()))

  function elegir(id: string) {
    onSeleccion(id)
    setAbierto(false)
    setQ('')
  }

  return (
    <div className="kb-filtro" ref={ref}>
      <button
        type="button"
        className={'kb-filtro__btn' + (seleccion !== 'todos' ? ' is-set' : '')}
        onClick={() => setAbierto((o) => !o)}
        aria-expanded={abierto}
      >
        <ListFilter size={15} strokeWidth={1.75} />
        <span className="kb-filtro__txt">
          {actual ? (
            <>
              <i style={{ background: colorDe(actual.id), color: colorDe(actual.id) }} />
              {actual.nombre}
            </>
          ) : (
            'Todos los proyectos'
          )}
        </span>
        <ChevronDown size={14} className="kb-filtro__chev" />
      </button>

      {abierto && (
        <div className="kb-filtro__pop">
          <div className="kb-filtro__buscar">
            <Search size={14} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar proyecto…"
            />
          </div>
          <div className="kb-filtro__lista" role="listbox">
            <button
              type="button"
              role="option"
              aria-selected={seleccion === 'todos'}
              className={'kb-filtro__op' + (seleccion === 'todos' ? ' is-active' : '')}
              onClick={() => elegir('todos')}
            >
              <span className="kb-filtro__op-txt">Todos los proyectos</span>
              {seleccion === 'todos' && <Check size={14} />}
            </button>
            <button
              type="button"
              role="option"
              aria-selected={seleccion === 'sin_proyecto'}
              className={'kb-filtro__op' + (seleccion === 'sin_proyecto' ? ' is-active' : '')}
              onClick={() => elegir('sin_proyecto')}
            >
              <span className="kb-filtro__op-txt">
                <i style={{ background: '#38bdf8', color: '#38bdf8' }} />
                Sin proyecto (General)
              </span>
              {seleccion === 'sin_proyecto' && <Check size={14} />}
            </button>
            {filtrados.map((p) => (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={seleccion === p.id}
                className={'kb-filtro__op' + (seleccion === p.id ? ' is-active' : '')}
                onClick={() => elegir(p.id)}
              >
                <span className="kb-filtro__op-txt">
                  <i style={{ background: colorDe(p.id), color: colorDe(p.id) }} />
                  {p.nombre}
                </span>
                {seleccion === p.id && <Check size={14} />}
              </button>
            ))}
            {filtrados.length === 0 && <p className="kb-filtro__vacio">Sin resultados</p>}
          </div>
        </div>
      )}
    </div>
  )
}
