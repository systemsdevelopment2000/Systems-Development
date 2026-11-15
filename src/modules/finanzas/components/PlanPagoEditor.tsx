import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import { Button, Combobox } from '@/core/ui'
import type { CuotaPlan, PlanPago } from '@/core/datos'
import { DISPARADORES, cuotaNueva, planPorDefecto } from '@/core/lib/cobranza'
import { money } from '@/core/lib/dinero'

interface Props {
  plan: PlanPago | undefined
  /** Total del presupuesto, para mostrar a cuánto equivale cada cuota. */
  total: number
  moneda: string
  onCambio: (p: PlanPago) => void
}

/**
 * Condiciones de cobro. No es texto libre: define si hay crédito, en cuántas
 * partes se paga, qué dispara cada parte (hito o fecha) y qué pasa con la mora.
 * De aquí sale la cuenta por cobrar.
 */
export function PlanPagoEditor({ plan: planProp, total, moneda, onCambio }: Props) {
  const plan = planProp ?? planPorDefecto()
  const credito = plan.modalidad === 'credito'
  const totalConInteres = credito ? total * (1 + plan.interes / 100) : total

  function set<K extends keyof PlanPago>(k: K, v: PlanPago[K]) {
    onCambio({ ...plan, [k]: v })
  }
  function setCuota(id: string, cambios: Partial<CuotaPlan>) {
    set(
      'cuotas',
      plan.cuotas.map((c) => (c.id === id ? { ...c, ...cambios } : c)),
    )
  }
  function agregar() {
    set('cuotas', [...plan.cuotas, cuotaNueva(plan.cuotas.length + 1)])
  }
  function quitar(id: string) {
    set(
      'cuotas',
      plan.cuotas.filter((c) => c.id !== id).map((c, i) => ({ ...c, numero: i + 1 })),
    )
  }
  function repartirParejo() {
    const n = plan.cuotas.length || 1
    const pct = Math.floor((100 / n) * 100) / 100
    set(
      'cuotas',
      plan.cuotas.map((c, i) => ({
        ...c,
        monto: undefined,
        porcentaje: i === n - 1 ? Math.round((100 - pct * (n - 1)) * 100) / 100 : pct,
      })),
    )
  }

  const sumaPct = plan.cuotas.reduce((s, c) => s + (c.monto ? 0 : (c.porcentaje ?? 0)), 0)
  const hayMontosFijos = plan.cuotas.some((c) => c.monto)
  const descuadre = !hayMontosFijos && Math.abs(sumaPct - 100) > 0.01

  return (
    <div className="plan">
      <div className="plan__cab">
        <div className="field">
          <span className="field__label">Modalidad</span>
          <Combobox
            opciones={[
              { valor: 'contado', etiqueta: 'Contado' },
              { valor: 'credito', etiqueta: 'Crédito (en partes)' },
            ]}
            valor={plan.modalidad}
            onCambio={(v) => set('modalidad', v as PlanPago['modalidad'])}
            buscar={false}
          />
        </div>

        {credito && (
          <>
            <label className="field">
              <span className="field__label">Interés %</span>
              <input
                className="field__input"
                type="number"
                min={0}
                value={plan.interes}
                onChange={(e) => set('interes', Number(e.target.value))}
              />
            </label>
            <label className="field">
              <span className="field__label">Mora %</span>
              <input
                className="field__input"
                type="number"
                min={0}
                value={plan.moraPorcentaje}
                onChange={(e) => set('moraPorcentaje', Number(e.target.value))}
              />
            </label>
            <div className="field">
              <span className="field__label">Mora sobre</span>
              <Combobox
                opciones={[
                  { valor: 'cuota', etiqueta: 'El saldo de la cuota' },
                  { valor: 'total', etiqueta: 'El total del contrato' },
                ]}
                valor={plan.baseMora ?? 'cuota'}
                onCambio={(v) => set('baseMora', v as PlanPago['baseMora'])}
                buscar={false}
              />
            </div>

            <label className="field">
              <span className="field__label">Días de gracia</span>
              <input
                className="field__input"
                type="number"
                min={0}
                value={plan.diasGracia}
                onChange={(e) => set('diasGracia', Number(e.target.value))}
              />
            </label>
          </>
        )}
      </div>

      {credito && plan.moraPorcentaje > 0 && (
        <p className="plan__nota plan__nota--mora">
          Pasados {plan.diasGracia} días, la mora del {plan.moraPorcentaje}% se calcula sobre{' '}
          <b>
            {plan.baseMora === 'total'
              ? 'el total del contrato'
              : 'el saldo de la cuota vencida'}
          </b>
          {plan.baseMora === 'total'
            ? `, es decir ${money(totalConInteres * (plan.moraPorcentaje / 100), moneda)} por periodo.`
            : '.'}
        </p>
      )}

      {credito && plan.interes > 0 && (
        <p className="plan__nota">
          Con el financiamiento, el total a cobrar pasa de {money(total, moneda)} a{' '}
          <b>{money(totalConInteres, moneda)}</b>.
        </p>
      )}

      <div className="plan__tabla">
        <div className="plan__th">
          <span>Concepto</span>
          <span>%</span>
          <span>Monto fijo</span>
          <span>Se cobra</span>
          <span>Días</span>
          <span>Equivale a</span>
          <span />
        </div>

        {plan.cuotas.map((c) => {
          const monto = c.monto ?? totalConInteres * ((c.porcentaje ?? 0) / 100)
          return (
            <div className="plan__tr" key={c.id}>
              <input
                className="field__input"
                value={c.concepto}
                onChange={(e) => setCuota(c.id, { concepto: e.target.value })}
                placeholder="Enganche, contra entrega…"
              />
              <input
                className="field__input"
                type="number"
                min={0}
                max={100}
                value={c.porcentaje ?? 0}
                disabled={!!c.monto}
                onChange={(e) => setCuota(c.id, { porcentaje: Number(e.target.value) })}
              />
              <input
                className="field__input"
                type="number"
                min={0}
                value={c.monto ?? ''}
                placeholder="—"
                onChange={(e) =>
                  setCuota(c.id, { monto: e.target.value ? Number(e.target.value) : undefined })
                }
              />
              <select
                className="field__input"
                value={c.disparador}
                onChange={(e) =>
                  setCuota(c.id, { disparador: e.target.value as CuotaPlan['disparador'] })
                }
              >
                {DISPARADORES.map((d) => (
                  <option key={d.valor} value={d.valor}>
                    {d.etiqueta}
                  </option>
                ))}
              </select>
              <input
                className="field__input"
                type="number"
                min={0}
                value={c.diasDesdeAceptacion ?? 0}
                disabled={c.disparador !== 'fecha'}
                onChange={(e) => setCuota(c.id, { diasDesdeAceptacion: Number(e.target.value) })}
              />
              <span className="plan__monto">{money(monto, moneda)}</span>
              <button
                type="button"
                className="icono-btn icono-btn--peligro"
                onClick={() => quitar(c.id)}
                aria-label={`Quitar cuota ${c.numero}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}
      </div>

      {descuadre && (
        <p className="plan__aviso">
          <AlertTriangle size={14} /> Los porcentajes suman {sumaPct.toFixed(2)}%. Deberían sumar
          100% para cubrir el total.
        </p>
      )}

      <div className="plan__acc">
        <Button type="button" variant="ghost" onClick={agregar}>
          <Plus size={15} /> Añadir cuota
        </Button>
        <Button type="button" variant="ghost" onClick={repartirParejo}>
          Repartir en partes iguales
        </Button>
      </div>

      <label className="field">
        <span className="field__label">
          Si no paga o paga incompleto <span className="field__hint">(queda en el contrato)</span>
        </span>
        <textarea
          className="field__input"
          rows={2}
          value={plan.politicaMora ?? ''}
          onChange={(e) => set('politicaMora', e.target.value)}
          placeholder="Ej.: pasados 5 días se suspende el desarrollo y se aplica 2% mensual sobre el saldo vencido."
        />
      </label>
    </div>
  )
}
