import { useMemo, useState } from 'react'
import { Plus, Trash2, QrCode, AlertTriangle, Landmark } from 'lucide-react'
import { Button, Combobox, CodigoQR } from '@/core/ui'
import { nuevoId, type MetodoCobro, type Pago } from '@/core/datos'
import { MEDIOS_PAGO, equivalenteDe, textoCobro } from '@/core/lib/cobranza'
import { money } from '@/core/lib/dinero'
import type { CuentaPorCobrar } from '../hooks/usePagos'

/** Moneda habitual de cada medio: se precarga, pero se puede cambiar. */
const MONEDA_DE_MEDIO: Record<Pago['medio'], string> = {
  divisa_efectivo: 'USD',
  divisa_binance: 'USD',
  divisa_zelle: 'USD',
  bolivares_efectivo: 'VES',
  pago_movil: 'VES',
  transferencia: 'VES',
  otro: 'USD',
}

const NECESITA_QR: Pago['medio'][] = ['pago_movil', 'transferencia']

interface Abono {
  id: string
  monto: number
  moneda: string
  medio: Pago['medio']
  tasa: number
  referencia: string
}

interface Props {
  cuenta: CuentaPorCobrar
  /** Última tasa conocida para un par de monedas. */
  tasaDe: (base: string, destino: string) => number | undefined
  metodosCobro: MetodoCobro[]
  onRegistrar: (abonos: Omit<Pago, 'id'>[]) => void
  onCerrar: () => void
}

/**
 * Registro de un cobro. Una misma cuota puede recibir varios abonos en
 * distintas monedas y medios (divisas en efectivo + bolívares por Pago Móvil,
 * por ejemplo): cada línea se convierte a la moneda del presupuesto con su
 * propia tasa y lo que manda para el saldo es la suma de equivalentes.
 */
export function RegistrarPago({ cuenta, tasaDe, metodosCobro, onRegistrar, onCerrar }: Props) {
  const { cobranza, presupuesto } = cuenta
  const pendientes = cobranza.cuotas.filter((c) => c.saldo > 0.009)
  const [cuotaId, setCuotaId] = useState(pendientes[0]?.id ?? cobranza.cuotas[0]?.id ?? '')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [nota, setNota] = useState('')
  const [qrMostrado, setQrMostrado] = useState<MetodoCobro | null>(null)

  function abonoNuevo(medio: Pago['medio'] = 'divisa_efectivo'): Abono {
    const moneda = MONEDA_DE_MEDIO[medio]
    return {
      id: nuevoId(),
      monto: 0,
      moneda,
      medio,
      tasa: moneda === cobranza.moneda ? 0 : (tasaDe(cobranza.moneda, moneda) ?? 0),
      referencia: '',
    }
  }

  const [abonos, setAbonos] = useState<Abono[]>([abonoNuevo()])

  const cuota = cobranza.cuotas.find((c) => c.id === cuotaId)

  const calculados = useMemo(
    () =>
      abonos.map((a) => ({
        ...a,
        equivalente: equivalenteDe(a.monto, a.moneda, cobranza.moneda, a.tasa || undefined),
        faltaTasa: a.moneda.toUpperCase() !== cobranza.moneda.toUpperCase() && !a.tasa,
      })),
    [abonos, cobranza.moneda],
  )

  const totalEquivalente = calculados.reduce((s, a) => s + a.equivalente, 0)
  const saldoCuota = cuota?.saldo ?? 0
  const excede = totalEquivalente - saldoCuota > 0.009
  const hayFaltaTasa = calculados.some((a) => a.faltaTasa && a.monto > 0)
  const vacio = totalEquivalente <= 0
  const requiereQr = abonos.some((a) => NECESITA_QR.includes(a.medio))

  function set(id: string, cambios: Partial<Abono>) {
    setAbonos((prev) => prev.map((a) => (a.id === id ? { ...a, ...cambios } : a)))
  }
  function cambiarMedio(id: string, medio: Pago['medio']) {
    const moneda = MONEDA_DE_MEDIO[medio]
    set(id, {
      medio,
      moneda,
      tasa: moneda === cobranza.moneda ? 0 : (tasaDe(cobranza.moneda, moneda) ?? 0),
    })
  }
  function completarSaldo(id: string) {
    const a = abonos.find((x) => x.id === id)
    if (!a) return
    const otros = calculados.filter((x) => x.id !== id).reduce((s, x) => s + x.equivalente, 0)
    const falta = Math.max(0, saldoCuota - otros)
    // Se expresa en la moneda del abono: si es otra, se multiplica por la tasa.
    const enMonedaAbono =
      a.moneda.toUpperCase() === cobranza.moneda.toUpperCase() ? falta : falta * a.tasa
    set(id, { monto: Math.round(enMonedaAbono * 100) / 100 })
  }

  function confirmar() {
    const iso = new Date(fecha + 'T12:00:00').toISOString()
    const lista: Omit<Pago, 'id'>[] = calculados
      .filter((a) => a.monto > 0 && a.equivalente > 0)
      .map((a) => ({
        presupuestoId: presupuesto.id,
        proyectoId: presupuesto.proyectoId,
        clienteId: presupuesto.clienteId,
        cuotaId,
        fecha: iso,
        monto: a.monto,
        moneda: a.moneda.toUpperCase(),
        medio: a.medio,
        tasa: a.tasa || undefined,
        equivalente: a.equivalente,
        referencia: a.referencia.trim() || undefined,
        nota: nota.trim() || undefined,
      }))
    if (!lista.length) return
    onRegistrar(lista)
  }

  return (
    <div className="pago">
      <div className="pago__cab">
        <div className="field">
          <span className="field__label">Cuota que se abona</span>
          <Combobox
            opciones={cobranza.cuotas.map((c) => ({
              valor: c.id,
              etiqueta: `${c.numero}. ${c.concepto} — saldo ${money(c.saldo, cobranza.moneda)}`,
            }))}
            valor={cuotaId}
            onCambio={setCuotaId}
            buscar={false}
          />
        </div>
        <label className="field">
          <span className="field__label">Fecha del cobro</span>
          <input
            className="field__input"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>
      </div>

      {cuota && (
        <p className="pago__saldo">
          Esta cuota debe <b>{money(cuota.monto, cobranza.moneda)}</b> · ya abonó{' '}
          {money(cuota.pagado, cobranza.moneda)} · falta{' '}
          <b className="pago__saldo--falta">{money(cuota.saldo, cobranza.moneda)}</b>
        </p>
      )}

      <div className="pago__lineas">
        {calculados.map((a, i) => (
          <div className="pago__linea" key={a.id}>
            <span className="pago__num">{i + 1}</span>

            <div className="field">
              <span className="field__label">Medio</span>
              <select
                className="field__input"
                value={a.medio}
                onChange={(e) => cambiarMedio(a.id, e.target.value as Pago['medio'])}
              >
                {MEDIOS_PAGO.map((m) => (
                  <option key={m.valor} value={m.valor}>
                    {m.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            <label className="field pago__f--monto">
              <span className="field__label">Monto recibido</span>
              <input
                className="field__input"
                type="number"
                min={0}
                step="0.01"
                value={a.monto || ''}
                onChange={(e) => set(a.id, { monto: Number(e.target.value) })}
              />
            </label>

            <label className="field pago__f--moneda">
              <span className="field__label">Moneda</span>
              <input
                className="field__input"
                value={a.moneda}
                maxLength={4}
                onChange={(e) => set(a.id, { moneda: e.target.value.toUpperCase() })}
              />
            </label>

            <label className="field pago__f--tasa">
              <span className="field__label">
                Tasa {a.moneda}/{cobranza.moneda}
              </span>
              <input
                className="field__input"
                type="number"
                min={0}
                step="0.01"
                value={a.tasa || ''}
                placeholder={a.moneda === cobranza.moneda ? '—' : 'requerida'}
                disabled={a.moneda.toUpperCase() === cobranza.moneda.toUpperCase()}
                onChange={(e) => set(a.id, { tasa: Number(e.target.value) })}
              />
            </label>

            <label className="field pago__f--ref">
              <span className="field__label">Referencia</span>
              <input
                className="field__input"
                value={a.referencia}
                onChange={(e) => set(a.id, { referencia: e.target.value })}
                placeholder="N° de operación"
              />
            </label>

            <div className="pago__eq">
              <span className="field__label">Equivale a</span>
              <b className={a.faltaTasa && a.monto > 0 ? 'is-error' : ''}>
                {a.faltaTasa && a.monto > 0 ? 'sin tasa' : money(a.equivalente, cobranza.moneda)}
              </b>
            </div>

            <div className="pago__linea-acc">
              <button
                type="button"
                className="pago__mini"
                onClick={() => completarSaldo(a.id)}
                disabled={a.faltaTasa}
                title="Completar lo que falta de la cuota"
              >
                Completar
              </button>
              {abonos.length > 1 && (
                <button
                  type="button"
                  className="icono-btn icono-btn--peligro"
                  onClick={() => setAbonos((prev) => prev.filter((x) => x.id !== a.id))}
                  aria-label={`Quitar abono ${i + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pago__acc">
        <Button type="button" variant="ghost" onClick={() => setAbonos((p) => [...p, abonoNuevo()])}>
          <Plus size={15} /> Otro medio o moneda
        </Button>
        {requiereQr && metodosCobro.length > 0 && (
          <div className="pago__qrs">
            {metodosCobro.map((m) => (
              <button
                type="button"
                key={m.id}
                className="pago__mini"
                onClick={() => setQrMostrado(qrMostrado?.id === m.id ? null : m)}
              >
                <QrCode size={13} /> {m.banco}
              </button>
            ))}
          </div>
        )}
        {requiereQr && metodosCobro.length === 0 && (
          <span className="field__hint">
            <Landmark size={12} /> No hay métodos de cobro cargados (Configuración → Cobros).
          </span>
        )}
      </div>

      {qrMostrado && (
        <div className="pago__qr">
          <CodigoQR
            contenido={textoCobro(qrMostrado)}
            resumen={textoCobro(qrMostrado)}
            nombre={`cobro-${qrMostrado.banco}`}
          />
        </div>
      )}

      <label className="field">
        <span className="field__label">Nota</span>
        <textarea
          className="field__input"
          rows={2}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Lo acordado, quién entregó, observaciones…"
        />
      </label>

      <div className="pago__total">
        <span>Total imputado a la cuota</span>
        <b>{money(totalEquivalente, cobranza.moneda)}</b>
      </div>

      {hayFaltaTasa && (
        <p className="pago__aviso">
          <AlertTriangle size={14} /> Falta la tasa de conversión en algún abono. Cárgala aquí o en
          Finanzas → Tasas.
        </p>
      )}
      {excede && (
        <p className="pago__aviso">
          <AlertTriangle size={14} /> El total supera el saldo de la cuota en{' '}
          {money(totalEquivalente - saldoCuota, cobranza.moneda)}. Se registrará igual y el
          excedente quedará a favor del cliente.
        </p>
      )}

      <div className="form-acciones">
        <Button type="button" variant="ghost" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="button" onClick={confirmar} disabled={vacio || hayFaltaTasa}>
          Registrar cobro
        </Button>
      </div>
    </div>
  )
}
