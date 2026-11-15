import { useState } from 'react'
import { UserMinus } from 'lucide-react'
import { Button, Combobox } from '@/core/ui'
import type { Asignacion, Colaborador, RolAsignacion } from '@/core/datos'

interface Props {
  asignaciones: Asignacion[]
  colaboradores: Colaborador[]
  nombreColaborador: (id?: string) => string
  onAsignar: (colaboradorId: string, rol: RolAsignacion) => void
  onRescindir: (asignacionId: string, motivo: string) => void
}

export function TabEquipo({
  asignaciones,
  colaboradores,
  nombreColaborador,
  onAsignar,
  onRescindir,
}: Props) {
  const [colId, setColId] = useState('')
  const [rol, setRol] = useState<RolAsignacion>('colaborador')

  const activosIds = new Set(
    asignaciones.filter((a) => a.estado === 'activa').map((a) => a.colaboradorId),
  )
  const disponibles = colaboradores.filter((c) => !activosIds.has(c.id))

  function asignar() {
    if (!colId) return
    onAsignar(colId, rol)
    setColId('')
  }
  function rescindir(a: Asignacion) {
    const m = window.prompt('Motivo de la rescisión (opcional):') ?? ''
    onRescindir(a.id, m)
  }

  return (
    <div className="tab-sec">
      <div className="eq-asignar">
        <div style={{ flex: 1, minWidth: 160 }}>
          <Combobox
            opciones={disponibles.map((c) => ({ valor: c.id, etiqueta: c.nombre }))}
            valor={colId}
            onCambio={setColId}
            placeholder="Selecciona colaborador…"
          />
        </div>
        <div style={{ width: 150 }}>
          <Combobox
            opciones={[
              { valor: 'responsable', etiqueta: 'Responsable' },
              { valor: 'colaborador', etiqueta: 'Colaborador' },
            ]}
            valor={rol}
            onCambio={(v) => setRol(v as RolAsignacion)}
            buscar={false}
          />
        </div>
        <Button type="button" onClick={asignar}>
          Asignar
        </Button>
      </div>

      {asignaciones.length === 0 && <p className="muted">Sin asignaciones todavía.</p>}

      <div className="eq-lista">
        {asignaciones.map((a) => (
          <div key={a.id} className={'eq-item eq-item--' + a.estado}>
            <div className="eq-item__main">
              <span className="eq-item__nombre">{nombreColaborador(a.colaboradorId)}</span>
              <span className="eq-item__rol">{a.rol}</span>
            </div>
            <div className="eq-item__meta">
              <span className={'eq-estado eq-estado--' + a.estado}>{a.estado}</span>
              <span className="eq-item__fechas">
                {a.desde}
                {a.hasta ? ` → ${a.hasta}` : ''}
              </span>
            </div>
            {a.motivo && <span className="eq-item__motivo">“{a.motivo}”</span>}
            {a.estado === 'activa' && (
              <button
                className="icono-btn icono-btn--peligro eq-item__accion"
                onClick={() => rescindir(a)}
                aria-label="Rescindir asignación"
              >
                <UserMinus size={15} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
