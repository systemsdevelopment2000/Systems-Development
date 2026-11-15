import '../styles/finanzas.css'
import '../styles/cobranza.css'
import { useMemo, useRef, useState } from 'react'
import {
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CircleDollarSign,
  Trash2,
  Plus,
  FileDown,
  Loader2,
} from 'lucide-react'
import { Button, ConmutadorHoja, Hoja, Modal, useConfirmar, VistaPreviaPdf, MembreteSD } from '@/core/ui'
import type { Pago } from '@/core/datos'
import { MEDIOS_PAGO, type EstadoCuota } from '@/core/lib/cobranza'
import { money } from '@/core/lib/dinero'
import { generarPdf, type PdfGenerado } from '@/core/lib/pdf'
import { usePagos, type CuentaPorCobrar } from '../hooks/usePagos'
import { RegistrarPago } from '../components/RegistrarPago'

const ETIQUETA_ESTADO: Record<EstadoCuota, string> = {
  pendiente: 'Pendiente',
  parcial: 'Abonada en parte',
  pagada: 'Pagada',
  vencida: 'Vencida',
}

const MEDIO_ETIQUETA = Object.fromEntries(MEDIOS_PAGO.map((m) => [m.valor, m.etiqueta])) as Record<
  Pago['medio'],
  string
>

function fechaCorta(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })
}

/**
 * Cuentas por cobrar. Un presupuesto aceptado es una acreencia: aquí se ve lo
 * cobrado, lo que falta y lo vencido, y se registran los abonos, que pueden
 * llegar en varias monedas y medios para una misma cuota.
 */
export function CobranzaPage() {
  const { cuentas, resumen, registrar, anular, tasaDe, metodosCobro } = usePagos()
  const confirmar = useConfirmar()
  const hojaRef = useRef<HTMLDivElement>(null)
  const [cobrando, setCobrando] = useState<CuentaPorCobrar | null>(null)
  const [abierta, setAbierta] = useState<string | null>(null)
  const [previa, setPrevia] = useState<PdfGenerado | null>(null)
  const [generando, setGenerando] = useState(false)
  const [verHoja, setVerHoja] = useState(false)

  const monedas = Object.keys(resumen)
  const conVencido = cuentas.filter((c) => c.cobranza.vencido > 0)

  const detalle = useMemo(
    () => cuentas.find((c) => c.presupuesto.id === abierta) ?? cuentas[0] ?? null,
    [cuentas, abierta],
  )

  async function verPdf() {
    const hoja = hojaRef.current?.querySelector<HTMLElement>('.mb')
    if (!hoja) return
    setGenerando(true)
    try {
      setPrevia(await generarPdf(hoja, 'cuentas-por-cobrar'))
    } finally {
      setGenerando(false)
    }
  }

  async function quitarPago(p: Pago) {
    const ok = await confirmar({
      titulo: 'Anular este cobro',
      mensaje: `Se eliminará el abono de ${money(p.monto, p.moneda)} y el saldo volverá a subir. No se puede deshacer.`,
      textoConfirmar: 'Anular cobro',
      peligro: true,
    })
    if (ok) anular(p.id)
  }

  return (
    <section className={'page' + (verHoja ? ' is-hoja' : '')}>
      <header className="page__header page__header--fila">
        <div>
          <h1 className="page__title">
            <Wallet size={19} /> Cuentas por cobrar
          </h1>
          <p className="page__subtitle">
            Solo un presupuesto <b>aceptado</b> genera deuda; en borrador o enviado sigue siendo una
            oferta.
          </p>
        </div>
        <div className="page__acciones">
          <ConmutadorHoja visible={verHoja} onCambio={setVerHoja} />
          <Button
            type="button"
            variant="ghost"
            onClick={verPdf}
          disabled={generando || !cuentas.length}
        >
          {generando ? <Loader2 size={15} className="spin" /> : <FileDown size={15} />} Reporte
          </Button>
        </div>
      </header>

      {!cuentas.length ? (
        <div className="vacio">
          <Wallet size={30} strokeWidth={1.5} />
          <p>
            Todavía no hay presupuestos aceptados. Acepta uno en Presupuestos y su cobro aparecerá
            aquí con sus cuotas.
          </p>
        </div>
      ) : (
        <>
          <div className="cxc-kpis">
            {monedas.map((m) => (
              <div className="cxc-kpi" key={m}>
                <span className="cxc-kpi__et">
                  <CircleDollarSign size={14} /> Cartera en {m}
                </span>
                <b className="cxc-kpi__val">{money(resumen[m].saldo, m)}</b>
                <span className="cxc-kpi__pie">
                  facturado {money(resumen[m].total, m)} · cobrado {money(resumen[m].cobrado, m)}
                </span>
                {resumen[m].vencido > 0 && (
                  <span className="cxc-kpi__alerta">
                    <AlertTriangle size={12} /> {money(resumen[m].vencido, m)} vencido
                  </span>
                )}
              </div>
            ))}
          </div>

          {conVencido.length > 0 && (
            <p className="cxc-mora">
              <AlertTriangle size={15} />
              {conVencido.length === 1
                ? '1 cuenta con cuotas vencidas'
                : `${conVencido.length} cuentas con cuotas vencidas`}
              : {conVencido.map((c) => c.cliente?.nombre ?? c.presupuesto.titulo).join(', ')}.
            </p>
          )}

          <div className="cxc-layout">
            <ul className="cxc-lista">
              {cuentas.map((c) => {
                const avance = c.cobranza.total ? c.cobranza.pagado / c.cobranza.total : 0
                const activo = detalle?.presupuesto.id === c.presupuesto.id
                return (
                  <li key={c.presupuesto.id}>
                    <button
                      type="button"
                      className={'cxc-fila' + (activo ? ' is-on' : '')}
                      onClick={() => setAbierta(c.presupuesto.id)}
                      data-sonido="seleccion"
                    >
                      <span className="cxc-fila__cab">
                        <span className="cxc-fila__cli">{c.cliente?.nombre ?? 'Sin cliente'}</span>
                        <span className="cxc-fila__cod">{c.presupuesto.codigo}</span>
                      </span>
                      <span className="cxc-fila__tit">{c.presupuesto.titulo}</span>
                      <span className="cxc-barra" aria-hidden="true">
                        <span
                          className={'cxc-barra__fill' + (c.cobranza.vencido > 0 ? ' is-mora' : '')}
                          style={{ width: `${Math.min(100, avance * 100)}%` }}
                        />
                      </span>
                      <span className="cxc-fila__pie">
                        <b>{money(c.cobranza.saldo, c.cobranza.moneda)}</b> por cobrar
                        {c.cobranza.vencido > 0 && (
                          <em className="cxc-fila__mora">
                            {money(c.cobranza.vencido, c.cobranza.moneda)} vencido
                          </em>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            {detalle && (
              <div className="cxc-detalle">
                <header className="cxc-detalle__cab">
                  <div>
                    <h2 className="cxc-detalle__tit">{detalle.presupuesto.titulo}</h2>
                    <p className="cxc-detalle__sub">
                      {detalle.cliente?.nombre ?? 'Sin cliente'}
                      {detalle.proyecto ? ` · ${detalle.proyecto.nombre}` : ''} ·{' '}
                      {detalle.presupuesto.plan?.modalidad === 'credito'
                        ? `crédito en ${detalle.cobranza.cuotas.length} partes`
                        : 'contado'}
                    </p>
                  </div>
                  <Button type="button" onClick={() => setCobrando(detalle)}>
                    <Plus size={15} /> Registrar cobro
                  </Button>
                </header>

                <div className="cxc-tot">
                  <span>
                    Presupuesto <b>{money(detalle.cobranza.base, detalle.cobranza.moneda)}</b>
                  </span>
                  {detalle.cobranza.interes > 0 && (
                    <span>
                      Financiamiento{' '}
                      <b>+{money(detalle.cobranza.interes, detalle.cobranza.moneda)}</b>
                    </span>
                  )}
                  <span>
                    Cobrado <b>{money(detalle.cobranza.pagado, detalle.cobranza.moneda)}</b>
                  </span>
                  <span className="cxc-tot--saldo">
                    Saldo <b>{money(detalle.cobranza.saldo, detalle.cobranza.moneda)}</b>
                  </span>
                  {detalle.cobranza.mora > 0 && (
                    <span className="cxc-tot--mora">
                      Mora estimada <b>{money(detalle.cobranza.mora, detalle.cobranza.moneda)}</b>
                    </span>
                  )}
                </div>

                <h3 className="cxc-h3">Cuotas</h3>
                <ul className="cxc-cuotas">
                  {detalle.cobranza.cuotas.map((c) => (
                    <li className={`cxc-cuota is-${c.estado}`} key={c.id}>
                      <span className="cxc-cuota__n">{c.numero}</span>
                      <span className="cxc-cuota__txt">
                        <b>{c.concepto}</b>
                        <em>
                          {c.vence ? `vence ${fechaCorta(c.vence)}` : 'por hito'}
                          {c.diasAtraso > 0 ? ` · ${c.diasAtraso} días de atraso` : ''}
                        </em>
                      </span>
                      <span className="cxc-cuota__montos">
                        <b>{money(c.monto, detalle.cobranza.moneda)}</b>
                        <em>
                          abonado {money(c.pagado, detalle.cobranza.moneda)} · falta{' '}
                          {money(c.saldo, detalle.cobranza.moneda)}
                        </em>
                      </span>
                      <span className={`cxc-pill cxc-pill--${c.estado}`}>
                        {c.estado === 'pagada' ? (
                          <CheckCircle2 size={12} />
                        ) : c.estado === 'vencida' ? (
                          <AlertTriangle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {ETIQUETA_ESTADO[c.estado]}
                      </span>
                    </li>
                  ))}
                </ul>

                <h3 className="cxc-h3">Cobros recibidos</h3>
                {!detalle.pagos.length ? (
                  <p className="field__hint">Aún no se ha recibido ningún abono.</p>
                ) : (
                  <ul className="cxc-pagos">
                    {detalle.pagos.map((p) => (
                      <li className="cxc-pago" key={p.id}>
                        <span className="cxc-pago__fecha">{fechaCorta(p.fecha)}</span>
                        <span className="cxc-pago__medio">{MEDIO_ETIQUETA[p.medio]}</span>
                        <span className="cxc-pago__monto">
                          {money(p.monto, p.moneda)}
                          {p.moneda.toUpperCase() !== detalle.cobranza.moneda.toUpperCase() && (
                            <em>
                              = {money(p.equivalente, detalle.cobranza.moneda)}
                              {p.tasa ? ` @ ${p.tasa}` : ''}
                            </em>
                          )}
                        </span>
                        <span className="cxc-pago__ref">{p.referencia ?? p.codigo ?? ''}</span>
                        <button
                          type="button"
                          className="icono-btn icono-btn--peligro"
                          onClick={() => void quitarPago(p)}
                          aria-label="Anular cobro"
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <Modal
        abierto={!!cobrando}
        onCerrar={() => setCobrando(null)}
        titulo="Registrar cobro"
        ancho={940}
      >
        {cobrando && (
          <RegistrarPago
            cuenta={cobrando}
            tasaDe={tasaDe}
            metodosCobro={metodosCobro}
            onRegistrar={(abonos) => {
              abonos.forEach(registrar)
              setCobrando(null)
            }}
            onCerrar={() => setCobrando(null)}
          />
        )}
      </Modal>

      {/* Hoja imprimible del estado de cartera. */}
      <Hoja visible={verHoja} innerRef={hojaRef}>
        <MembreteSD
          titulo="Cuentas por cobrar"
          subtitulo={`Estado de cartera al ${new Date().toLocaleDateString('es-VE', { dateStyle: 'long' })}`}
        >
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Concepto</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'right' }}>Cobrado</th>
                  <th style={{ textAlign: 'right' }}>Saldo</th>
                  <th style={{ textAlign: 'right' }}>Vencido</th>
                </tr>
              </thead>
              <tbody>
                {cuentas.map((c) => (
                  <tr key={c.presupuesto.id}>
                    <td>{c.presupuesto.codigo}</td>
                    <td>{c.cliente?.nombre ?? '—'}</td>
                    <td>{c.presupuesto.titulo}</td>
                    <td style={{ textAlign: 'right' }}>
                      {money(c.cobranza.total, c.cobranza.moneda)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {money(c.cobranza.pagado, c.cobranza.moneda)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {money(c.cobranza.saldo, c.cobranza.moneda)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {c.cobranza.vencido > 0 ? money(c.cobranza.vencido, c.cobranza.moneda) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {monedas.map((m) => (
            <p className="fin-nota" key={m}>
              Cartera en {m}: facturado {money(resumen[m].total, m)}, cobrado{' '}
              {money(resumen[m].cobrado, m)}, por cobrar {money(resumen[m].saldo, m)}
              {resumen[m].vencido > 0 ? `, vencido ${money(resumen[m].vencido, m)}` : ''}.
            </p>
          ))}
          <p className="fin-nota">
            Cada monto está expresado en la moneda de su presupuesto. Los abonos recibidos en otra
            moneda se convirtieron con la tasa aplicada el día del pago.
          </p>
        </MembreteSD>
      </Hoja>

      {previa && (
        <VistaPreviaPdf
          url={previa.url}
          nombre={previa.nombre}
          onDescargar={previa.descargar}
          onCerrar={() => {
            previa.revocar()
            setPrevia(null)
          }}
        />
      )}
    </section>
  )
}
