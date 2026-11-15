import { useState } from 'react'
import { SlidersHorizontal, LayoutList } from 'lucide-react'
import type { NivelModulo, Permisos } from '@/core/datos'
import {
  CATALOGO_PERMISOS,
  NIVELES,
  accionActiva,
  esPersonalizado,
} from '../lib/permisos'

interface Props {
  permisos: Permisos
  onCambio: (p: Permisos) => void
}

export function PermisosEditor({ permisos, onCambio }: Props) {
  const [modo, setModo] = useState<'sencillo' | 'avanzado'>('sencillo')

  function setNivel(moduloId: string, nivel: NivelModulo) {
    // Al elegir un nivel sencillo se limpian los overrides avanzados del módulo.
    onCambio({ ...permisos, [moduloId]: { nivel } })
  }
  function setAccion(moduloId: string, accionId: string, valor: boolean) {
    const pm = permisos[moduloId] ?? { nivel: 'ninguno' }
    const acciones = { ...(pm.acciones ?? {}), [accionId]: valor }
    onCambio({ ...permisos, [moduloId]: { ...pm, acciones } })
  }

  return (
    <div className="perm">
      <div className="perm__barra">
        <div className="perm__modo">
          <button
            type="button"
            className={modo === 'sencillo' ? 'is-on' : ''}
            onClick={() => setModo('sencillo')}
          >
            <LayoutList size={13} /> Sencillo
          </button>
          <button
            type="button"
            className={modo === 'avanzado' ? 'is-on' : ''}
            onClick={() => setModo('avanzado')}
          >
            <SlidersHorizontal size={13} /> Avanzado
          </button>
        </div>
        <span className="field__hint">
          {modo === 'sencillo'
            ? 'Acceso general por módulo.'
            : 'Permisos puntuales dentro de cada módulo.'}
        </span>
      </div>

      <div className="perm__lista">
        {CATALOGO_PERMISOS.map((m) => {
          const pm = permisos[m.id] ?? { nivel: 'ninguno' as NivelModulo }
          return (
            <div className="perm__mod" key={m.id}>
              <div className="perm__modhead">
                <span className="perm__modnom">
                  {m.label}
                  {esPersonalizado(pm, m) && <em className="perm__custom">Personalizado</em>}
                </span>
                <div className="perm__niveles">
                  {NIVELES.map((nv) => (
                    <button
                      type="button"
                      key={nv.valor}
                      className={'perm__niv' + (pm.nivel === nv.valor ? ' is-on' : '')}
                      onClick={() => setNivel(m.id, nv.valor)}
                    >
                      {nv.label}
                    </button>
                  ))}
                </div>
              </div>

              {modo === 'avanzado' && (
                <div className="perm__acciones">
                  {m.acciones.map((a) => (
                    <label className="perm__acc" key={a.id}>
                      <input
                        type="checkbox"
                        checked={accionActiva(pm, a)}
                        onChange={(e) => setAccion(m.id, a.id, e.target.checked)}
                      />
                      <span className="perm__acc-sw" />
                      <span className="perm__acc-txt">{a.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
