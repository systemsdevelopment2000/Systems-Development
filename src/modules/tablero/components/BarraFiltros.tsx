import { useEffect, useRef, useState } from 'react'
import { Plus, SlidersHorizontal, Check } from 'lucide-react'
import type { Colaborador, Prioridad, Proyecto } from '@/core/datos'
import { PRIORIDADES, PRIO_LABEL, colorDe, iniciales } from '../lib/vista'
import { AvatarEquipo } from './AvatarEquipo'
import { FiltroProyecto } from './FiltroProyecto'

const MAX_AVATARES = 5

interface Props {
  proyectos: Proyecto[]
  colaboradores: Colaborador[]
  seleccion: string
  onSeleccion: (id: string) => void
  prioridades: Prioridad[]
  onPrioridades: (p: Prioridad[]) => void
  responsables: string[]
  onResponsables: (ids: string[]) => void
  totalVisible: number
  onNueva: () => void
}

export function BarraFiltros({
  proyectos,
  colaboradores,
  seleccion,
  onSeleccion,
  prioridades,
  onPrioridades,
  responsables,
  onResponsables,
  totalVisible,
  onNueva,
}: Props) {
  const visibles = colaboradores.slice(0, MAX_AVATARES)
  const extra = colaboradores.length - visibles.length
  const [abierto, setAbierto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const activos = prioridades.length + responsables.length

  useEffect(() => {
    if (!abierto) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [abierto])

  function togglePrio(p: Prioridad) {
    onPrioridades(prioridades.includes(p) ? prioridades.filter((x) => x !== p) : [...prioridades, p])
  }
  function toggleResp(id: string) {
    onResponsables(
      responsables.includes(id) ? responsables.filter((x) => x !== id) : [...responsables, id],
    )
  }

  return (
    <div className="kb-bar">
      <div className="kb-bar__title">
        <h1>Tablero</h1>
        <span className="kb-bar__sub">
          {totalVisible} {totalVisible === 1 ? 'tarea' : 'tareas'} · asignaciones del equipo
        </span>
      </div>

      <FiltroProyecto proyectos={proyectos} seleccion={seleccion} onSeleccion={onSeleccion} />

      <div className="kb-bar__spacer" />

      <div className="kb-team" aria-label="Equipo">
        {visibles.map((m) => (
          <AvatarEquipo key={m.id} persona={m} size={28} />
        ))}
        {extra > 0 && (
          <span
            className="kb-avatar kb-avatar--mas"
            title={`+${extra} más`}
            style={{ width: 28, height: 28 }}
          >
            +{extra}
          </span>
        )}
      </div>

      <div className="kb-filpop" ref={ref}>
        <button
          type="button"
          className={'kb-ghost' + (activos ? ' is-set' : '')}
          title="Filtros"
          onClick={() => setAbierto((o) => !o)}
          aria-expanded={abierto}
        >
          <SlidersHorizontal size={16} strokeWidth={1.75} />
          {activos > 0 && <span className="kb-ghost__badge">{activos}</span>}
        </button>

        {abierto && (
          <div className="kb-filtro__pop kb-fpop">
            <div className="kb-fpop__grupo">
              <span className="kb-fpop__tit">Prioridad</span>
              {PRIORIDADES.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={'kb-fpop__op' + (prioridades.includes(p) ? ' is-on' : '')}
                  onClick={() => togglePrio(p)}
                >
                  <span className={`kb-prio kb-prio--${p}`}>{PRIO_LABEL[p]}</span>
                  {prioridades.includes(p) && <Check size={14} />}
                </button>
              ))}
            </div>

            <div className="kb-fpop__grupo">
              <span className="kb-fpop__tit">Responsable</span>
              {colaboradores.length === 0 && <p className="kb-filtro__vacio">Sin colaboradores</p>}
              {colaboradores.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={'kb-fpop__op' + (responsables.includes(c.id) ? ' is-on' : '')}
                  onClick={() => toggleResp(c.id)}
                >
                  <span className="kb-fpop__persona">
                    <span className="resp-chip__av" style={{ background: colorDe(c.id) }}>
                      {iniciales(c.nombre)}
                    </span>
                    {c.nombre}
                  </span>
                  {responsables.includes(c.id) && <Check size={14} />}
                </button>
              ))}
            </div>

            {activos > 0 && (
              <button
                type="button"
                className="kb-fpop__limpiar"
                onClick={() => {
                  onPrioridades([])
                  onResponsables([])
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <button type="button" className="kb-new" onClick={onNueva}>
        <Plus size={16} strokeWidth={2.25} /> Nueva tarea
      </button>
    </div>
  )
}
