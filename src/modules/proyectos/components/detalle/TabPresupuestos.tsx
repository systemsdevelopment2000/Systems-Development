import { useNavigate } from 'react-router-dom'
import { Plus, FilePlus2, ExternalLink } from 'lucide-react'
import { money, totalizar } from '@/core/lib/dinero'
import type { Presupuesto } from '@/core/datos'
import { ESTADOS_PRESUPUESTO } from '@/modules/finanzas'

interface Props {
  presupuestos: Presupuesto[]
  /** Crea uno nuevo ya asociado al proyecto. */
  onCrear: (tipo: Presupuesto['tipo']) => void
}

/**
 * Presupuestos del proyecto: el inicial y las ampliaciones que el cliente pida
 * mientras el proyecto avanza (más módulos, funcionalidades nuevas).
 */
export function TabPresupuestos({ presupuestos, onCrear }: Props) {
  const nav = useNavigate()
  const iniciales = presupuestos.filter((p) => p.tipo !== 'ampliacion')
  const ampliaciones = presupuestos.filter((p) => p.tipo === 'ampliacion')

  const aceptadoTotal = presupuestos
    .filter((p) => p.estado === 'aceptado')
    .reduce((s, p) => s + totalizar(p).total, 0)
  const moneda = presupuestos[0]?.moneda ?? 'USD'

  function tarjeta(p: Presupuesto) {
    const t = totalizar(p)
    return (
      <button key={p.id} className="prs-item" onClick={() => nav(`/presupuesto?id=${p.id}`)}>
        <span className="prs-item__cod">{p.codigo ?? '—'}</span>
        <span className="prs-item__tit">{p.titulo}</span>
        <span className={'pre-estado pre-estado--' + p.estado}>
          {ESTADOS_PRESUPUESTO.find((e) => e.valor === p.estado)?.etiqueta}
        </span>
        <span className="prs-item__total">{money(t.total, p.moneda)}</span>
        <ExternalLink size={13} />
      </button>
    )
  }

  return (
    <div className="tab-sec">
      <div className="prs-acc">
        <button className="btn btn--primary btn--icono" onClick={() => onCrear('ampliacion')}>
          <FilePlus2 size={16} /> Cotizar ampliación
        </button>
        {iniciales.length === 0 && (
          <button className="btn btn--ghost btn--icono" onClick={() => onCrear('inicial')}>
            <Plus size={16} /> Presupuesto inicial
          </button>
        )}
      </div>

      {presupuestos.length === 0 ? (
        <p className="muted">
          Este proyecto no tiene presupuestos. Crea el inicial o cotiza una ampliación si el cliente
          pide alcance nuevo.
        </p>
      ) : (
        <>
          {aceptadoTotal > 0 && (
            <div className="prs-total">
              <span>Contratado (aceptado)</span>
              <strong>{money(aceptadoTotal, moneda)}</strong>
            </div>
          )}

          {iniciales.length > 0 && (
            <div className="prs-grupo">
              <span className="rn-grupo__tit">Inicial</span>
              <div className="prs-lista">{iniciales.map(tarjeta)}</div>
            </div>
          )}

          {ampliaciones.length > 0 && (
            <div className="prs-grupo">
              <span className="rn-grupo__tit">Ampliaciones ({ampliaciones.length})</span>
              <div className="prs-lista">{ampliaciones.map(tarjeta)}</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
