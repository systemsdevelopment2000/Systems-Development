import '../styles/finanzas.css'
import { useMemo, useRef, useState } from 'react'
import { Plus, ArrowLeft, Calculator } from 'lucide-react'
import { ConmutadorHoja, Hoja, MembreteSD, VistaPreviaPdf } from '@/core/ui'
import { useDatos } from '@/core/datos'
import { generarPdf, type PdfGenerado } from '@/core/lib/pdf'
import { usePresupuestos } from '../hooks/usePresupuestos'
import { PresupuestoEditor } from '../components/PresupuestoEditor'
import { ESTADOS_PRESUPUESTO, importeLinea, totalizar } from '../lib/presupuesto'
import { money } from '../lib/calculo'

export function PresupuestoPage() {
  const { estado } = useDatos()
  const { presupuestos, clientes, proyectos, crear, guardar, borrar, cambiarEstado } =
    usePresupuestos()
  const [editId, setEditId] = useState<string | null>(null)
  const [generando, setGenerando] = useState(false)
  const [verHoja, setVerHoja] = useState(false)
  const [previa, setPrevia] = useState<PdfGenerado | null>(null)
  const hojaRef = useRef<HTMLDivElement>(null)

  const actual = editId ? presupuestos.find((p) => p.id === editId) : undefined
  const totales = useMemo(() => (actual ? totalizar(actual) : null), [actual])
  const cliente = actual?.clienteId ? estado.clientes[actual.clienteId] : undefined

  function nuevo() {
    const p = crear(estado.empresa.finanzas?.moneda ?? 'USD')
    setEditId(p.id)
  }

  async function verPdf() {
    const hoja = hojaRef.current?.querySelector<HTMLElement>('.mb')
    if (!hoja) return
    setGenerando(true)
    try {
      setPrevia(await generarPdf(hoja, `presupuesto-${actual?.codigo ?? 'sd'}`))
    } finally {
      setGenerando(false)
    }
  }

  // ---- Listado ----
  if (!actual) {
    return (
      <section className={'page' + (verHoja ? ' is-hoja' : '')}>
        <header className="page__header page__header--fila">
          <div>
            <h1 className="page__title">Presupuestos</h1>
            <p className="page__subtitle">
              {presupuestos.length} cotización{presupuestos.length === 1 ? '' : 'es'} · arma el
              precio concepto por concepto
            </p>
          </div>
          <button className="btn btn--primary btn--icono" onClick={nuevo}>
            <Plus size={16} /> Nuevo presupuesto
          </button>
        </header>

        {presupuestos.length === 0 ? (
          <div className="vacio">
            <Calculator size={30} strokeWidth={1.5} />
            <p>
              Aún no hay presupuestos. Crea uno y ensambla las líneas: puedes partir de cero o traer
              el alcance de un proyecto.
            </p>
            <button className="btn btn--primary btn--icono" onClick={nuevo}>
              <Plus size={16} /> Crear el primero
            </button>
          </div>
        ) : (
          <div className="pre-grid">
            {presupuestos.map((p) => {
              const t = totalizar(p)
              const c = p.clienteId ? estado.clientes[p.clienteId] : undefined
              return (
                <article className={'pre-card pre-card--' + p.estado} key={p.id}>
                  <button className="pre-card__abrir" onClick={() => setEditId(p.id)}>
                    <div className="pre-card__head">
                      <span className="pre-card__cod">{p.codigo ?? '—'}</span>
                      <span className={'pre-estado pre-estado--' + p.estado}>
                        {ESTADOS_PRESUPUESTO.find((e) => e.valor === p.estado)?.etiqueta}
                      </span>
                    </div>
                    <h3 className="pre-card__tit">{p.titulo}</h3>
                    <span className="pre-card__cli">{c?.nombre ?? 'Sin cliente'}</span>
                    <div className="pre-card__foot">
                      <strong>{money(t.total, p.moneda)}</strong>
                      <span>
                        {p.lineas.length} línea{p.lineas.length === 1 ? '' : 's'} ·{' '}
                        {new Date(p.fecha).toLocaleDateString('es-VE')}
                      </span>
                    </div>
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>
    )
  }

  // ---- Editor ----
  return (
    <section className={'page' + (verHoja ? ' is-hoja' : '')}>
      <header className="page__header page__header--fila">
        <div>
          <button className="pd-volver" onClick={() => setEditId(null)}>
            <ArrowLeft size={16} /> Presupuestos
          </button>
          <h1 className="page__title">{actual.titulo}</h1>
          <p className="page__subtitle">
            {actual.codigo} · {cliente?.nombre ?? 'Sin cliente'}
          </p>
        </div>
        <ConmutadorHoja visible={verHoja} onCambio={setVerHoja} />
      </header>

      <PresupuestoEditor
        presupuesto={actual}
        clientes={clientes}
        proyectos={proyectos}
        onCambio={guardar}
        onEstado={(nuevo) => cambiarEstado(actual, nuevo)}
        unidades={estado.empresa.unidades}
        tarifaHora={estado.empresa.finanzas?.tarifaHora}
        onBorrar={() => {
          borrar(actual.id)
          setEditId(null)
        }}
        onPdf={verPdf}
        generandoPdf={generando}
      />

      {/* Hoja imprimible con membrete */}
      <Hoja visible={verHoja} innerRef={hojaRef}>
        <MembreteSD
          titulo={`Presupuesto · ${actual.titulo}`}
          subtitulo={`${actual.codigo ?? ''} · ${cliente?.nombre ?? 'Sin cliente'} · ${new Date(
            actual.fecha,
          ).toLocaleDateString('es-VE', { dateStyle: 'long' })}`}
        >
          {totales?.grupos.map((g) => (
            <div key={g.nombre} className="pre-hoja__grupo">
              <h3 className="pre-hoja__tit">{g.nombre}</h3>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      <th style={{ textAlign: 'right' }}>Cant.</th>
                      <th>Unidad</th>
                      <th style={{ textAlign: 'right' }}>P. unit.</th>
                      <th style={{ textAlign: 'right' }}>Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.lineas.map((l) => (
                      <tr key={l.id}>
                        <td>{l.concepto || '—'}</td>
                        <td style={{ textAlign: 'right' }}>{l.cantidad}</td>
                        <td>{l.unidad}</td>
                        <td style={{ textAlign: 'right' }}>
                          {money(l.precioUnitario, actual.moneda)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {money(importeLinea(l), actual.moneda)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {totales && (
            <table className="table fin-resumen">
              <tbody>
                <tr>
                  <td>Subtotal</td>
                  <td>{money(totales.subtotal, actual.moneda)}</td>
                </tr>
                {actual.descuentoGlobal > 0 && (
                  <tr>
                    <td>Descuento ({actual.descuentoGlobal}%)</td>
                    <td>− {money(totales.descuentoGlobal, actual.moneda)}</td>
                  </tr>
                )}
                {actual.impuesto > 0 && (
                  <tr>
                    <td>Impuesto ({actual.impuesto}%)</td>
                    <td>{money(totales.impuesto, actual.moneda)}</td>
                  </tr>
                )}
                <tr className="fin-total">
                  <td>
                    <b>Total</b>
                  </td>
                  <td>
                    <b>{money(totales.total, actual.moneda)}</b>
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {actual.condiciones && (
            <p className="fin-nota">
              <b>Condiciones:</b> {actual.condiciones}
            </p>
          )}
          {actual.validezDias ? (
            <p className="fin-nota">Validez de la oferta: {actual.validezDias} días.</p>
          ) : null}
          {actual.notas && <p className="fin-nota">{actual.notas}</p>}
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
