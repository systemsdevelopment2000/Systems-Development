import '../styles/documento.css'
import '../styles/pendientes.css'
import '../styles/minuta.css'
import { useMemo, useRef, useState } from 'react'
import { NotebookPen, FileDown, Loader2, Paperclip, Info, CalendarClock } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Combobox, ConmutadorHoja, Hoja, MembreteSD, VistaPreviaPdf } from '@/core/ui'
import { useDatos } from '@/core/datos'
import { generarPdf, type PdfGenerado } from '@/core/lib/pdf'
import { GUIONES, PREGUNTAS_POR_TIPO, guionDe } from '../lib/guiones'

/** Renglones en blanco para escribir a mano durante la reunión. */
function Renglones({ n }: { n: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <span className="min-linea" key={i} />
      ))}
    </>
  )
}

/**
 * Formato de minuta para reuniones con clientes.
 *
 * Sirve de dos maneras a la vez: es el guion que lleva el colaborador para no
 * dejar huecos en la conversación, y es la hoja donde anota durante la reunión.
 * Se imprime con el membrete de SD, se llena a mano y después se sube escaneada
 * a la reunión del proyecto como PDF o imágenes.
 */
export function MinutaPage() {
  const { estado } = useDatos()
  const nav = useNavigate()
  const hojaRef = useRef<HTMLDivElement>(null)

  const proyectos = useMemo(
    () => Object.values(estado.proyectos).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [estado.proyectos],
  )

  const [guionId, setGuionId] = useState(GUIONES[0].id)
  const [proyectoId, setProyectoId] = useState('')
  const [renglones, setRenglones] = useState(2)
  const [compromisos, setCompromisos] = useState(6)
  const [ocultos, setOcultos] = useState<string[]>([])
  const [conTipo, setConTipo] = useState(true)
  const [previa, setPrevia] = useState<PdfGenerado | null>(null)
  const [generando, setGenerando] = useState(false)
  const [verHoja, setVerHoja] = useState(false)

  const guion = guionDe(guionId)
  const proyecto = proyectoId ? estado.proyectos[proyectoId] : undefined
  const cliente = proyecto?.clienteId ? estado.clientes[proyecto.clienteId] : undefined
  const extra = conTipo && proyecto?.tipoDesarrollo ? PREGUNTAS_POR_TIPO[proyecto.tipoDesarrollo] : undefined

  const bloques = guion.bloques.filter((b) => !ocultos.includes(b.id))

  function alternar(id: string) {
    setOcultos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function verPdf() {
    const hoja = hojaRef.current?.querySelector<HTMLElement>('.mb')
    if (!hoja) return
    setGenerando(true)
    try {
      const nombre = `minuta-${guion.id}${proyecto?.codigo ? '-' + proyecto.codigo : ''}`
      setPrevia(await generarPdf(hoja, nombre))
    } finally {
      setGenerando(false)
    }
  }

  const totalPreguntas =
    bloques.reduce((s, b) => s + b.preguntas.length, 0) + (extra?.length ?? 0)
  const soloApuntes = bloques.every((b) => b.renglones)

  return (
    <section className={'page' + (verHoja ? ' is-hoja' : '')}>
      <header className="page__header page__header--fila">
        <div>
          <h1 className="page__title">
            <NotebookPen size={19} /> Minuta de reunión
          </h1>
          <p className="page__subtitle">
            {soloApuntes
              ? 'Hoja en blanco con el membrete de SD: renglones para anotar, acuerdos, compromisos y firmas.'
              : `El guion que llevas a la reunión y la hoja donde anotas, en el mismo papel. ${totalPreguntas} preguntas en este formato.`}
          </p>
        </div>
        <div className="page__acciones">
          {/* La minuta vive dentro de Reuniones: se vuelve sin el menú. */}
          <div className="ag-tabs" role="tablist" aria-label="Reuniones">
            <button type="button" role="tab" aria-selected="false" onClick={() => nav('/reuniones')}>
              <CalendarClock size={14} /> Agenda
            </button>
            <button type="button" role="tab" aria-selected="true" className="is-on">
              <NotebookPen size={14} /> Minuta
            </button>
          </div>
          <ConmutadorHoja visible={verHoja} onCambio={setVerHoja} />
          <Button type="button" onClick={verPdf} disabled={generando}>
          {generando ? <Loader2 size={15} className="spin" /> : <FileDown size={15} />} Ver PDF
          </Button>
        </div>
      </header>

      <div className="pend-conf">
        <div className="field">
          <span className="field__label">Tipo de reunión</span>
          <Combobox
            opciones={GUIONES.map((g) => ({ valor: g.id, etiqueta: g.nombre }))}
            valor={guionId}
            onCambio={(v) => {
              setGuionId(v)
              setOcultos([])
            }}
            buscar={false}
          />
        </div>

        <div className="field" style={{ flex: '1 1 220px' }}>
          <span className="field__label">
            Proyecto <span className="field__hint">(opcional)</span>
          </span>
          <Combobox
            opciones={[
              { valor: '', etiqueta: 'Sin proyecto (cliente nuevo)' },
              ...proyectos.map((p) => ({
                valor: p.id,
                etiqueta: `${p.codigo ? p.codigo + ' · ' : ''}${p.nombre}`,
              })),
            ]}
            valor={proyectoId}
            onCambio={setProyectoId}
            placeholder="Elige un proyecto…"
          />
        </div>

        {!soloApuntes && (
          <label className="field pend-conf__num">
            <span className="field__label">Renglones</span>
            <input
              className="field__input"
              type="number"
              min={1}
              max={6}
              value={renglones}
              onChange={(e) => setRenglones(Math.min(6, Math.max(1, Number(e.target.value))))}
            />
          </label>
        )}

        <label className="field pend-conf__num">
          <span className="field__label">Compromisos</span>
          <input
            className="field__input"
            type="number"
            min={0}
            max={20}
            value={compromisos}
            onChange={(e) => setCompromisos(Math.min(20, Math.max(0, Number(e.target.value))))}
          />
        </label>

        {proyecto?.tipoDesarrollo && (
          <div className="pend-conf__checks">
            <label className="pend-check">
              <input
                type="checkbox"
                checked={conTipo}
                onChange={(e) => setConTipo(e.target.checked)}
              />
              Preguntas propias de {proyecto.tipoDesarrollo.replace('_', ' ')}
            </label>
          </div>
        )}
      </div>

      <p className="min-cuando">
        <Info size={14} /> <b>{guion.nombre}:</b> {guion.cuando}
      </p>

      {/* Selección de bloques: una reunión corta no necesita el guion entero. */}
      {!soloApuntes && (
      <div className="min-bloques">
        <span className="min-bloques__tit">Bloques incluidos</span>
        <div className="min-bloques__chips">
          {guion.bloques.map((b) => {
            const activo = !ocultos.includes(b.id)
            return (
              <button
                type="button"
                key={b.id}
                className={'min-chip' + (activo ? ' is-on' : '')}
                onClick={() => alternar(b.id)}
                aria-pressed={activo}
                title={b.proposito}
              >
                {b.titulo}
                <em>{b.preguntas.length}</em>
              </button>
            )
          })}
        </div>
      </div>
      )}

      {/* Propósito de cada bloque: es para el colaborador, no sale impreso. */}
      {!soloApuntes && (
        <ul className="min-guia">
          {bloques.map((b) => (
            <li key={b.id}>
              <b>{b.titulo}</b> — {b.proposito}
            </li>
          ))}
        </ul>
      )}

      <p className="min-adjuntar">
        <Paperclip size={14} />
        Después de la reunión, sube la hoja llena como PDF o fotos
        {proyecto ? (
          <>
            {' '}
            en{' '}
            <Link to={`/proyectos/${proyecto.id}`} className="min-adjuntar__link">
              {proyecto.nombre} → Reuniones
            </Link>
            .
          </>
        ) : (
          ' a la reunión del proyecto, en su pestaña Reuniones.'
        )}
      </p>

      {/* Hoja imprimible. */}
      <Hoja visible={verHoja} innerRef={hojaRef}>
        <MembreteSD
          titulo={`Minuta · ${guion.nombre}`}
          subtitulo={
            proyecto
              ? `${proyecto.codigo ? proyecto.codigo + ' · ' : ''}${proyecto.nombre}${
                  cliente ? ' · ' + cliente.nombre : ''
                }`
              : 'Cliente nuevo'
          }
        >
          <dl className="pend-meta min-meta">
            <div>
              <dt>Cliente</dt>
              <dd className={cliente ? '' : 'is-vacio'}>{cliente?.nombre ?? ''}</dd>
            </div>
            <div>
              <dt>Fecha</dt>
              <dd className="is-vacio" />
            </div>
            <div>
              <dt>Hora</dt>
              <dd className="is-vacio" />
            </div>
            <div>
              <dt>Lugar / modalidad</dt>
              <dd className="is-vacio" />
            </div>
          </dl>

          <dl className="pend-meta min-meta--2">
            <div>
              <dt>Por SD</dt>
              <dd className="is-vacio" />
            </div>
            <div>
              <dt>Por el cliente (nombre y cargo)</dt>
              <dd className="is-vacio" />
            </div>
          </dl>

          {bloques.map((b) => (
            <section className="min-bloque" key={b.id}>
              <h3 className="min-bloque__tit">{b.titulo}</h3>
              {b.renglones ? (
                <Renglones n={b.renglones} />
              ) : (
                b.preguntas.map((q, i) => (
                  <div className="min-preg" key={i}>
                    <p className="min-preg__q">{q}</p>
                    <Renglones n={renglones} />
                  </div>
                ))
              )}
            </section>
          ))}

          {extra && extra.length > 0 && (
            <section className="min-bloque">
              <h3 className="min-bloque__tit">
                Propias del tipo de producto
                <em>{proyecto?.tipoDesarrollo?.replace('_', ' ')}</em>
              </h3>
              {extra.map((q, i) => (
                <div className="min-preg" key={i}>
                  <p className="min-preg__q">{q}</p>
                  <Renglones n={renglones} />
                </div>
              ))}
            </section>
          )}

          <section className="min-bloque">
            <h3 className="min-bloque__tit">Acuerdos y decisiones</h3>
            <Renglones n={4} />
          </section>

          {compromisos > 0 && (
            <section className="min-bloque min-bloque--evitar-corte">
              <h3 className="min-bloque__tit">Compromisos</h3>
              <table className="pend-tabla min-tabla">
                <thead>
                  <tr>
                    <th className="pend-tabla__ord">N°</th>
                    <th>Qué</th>
                    <th className="min-tabla__quien">Quién</th>
                    <th className="min-tabla__cuando">Para cuándo</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: compromisos }, (_, i) => (
                    <tr key={i} className="is-vacia">
                      <td className="pend-tabla__ord">{i + 1}</td>
                      <td />
                      <td className="min-tabla__quien" />
                      <td className="min-tabla__cuando" />
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <dl className="pend-meta min-meta--2 min-proxima">
            <div>
              <dt>Próxima reunión</dt>
              <dd className="is-vacio" />
            </div>
            <div>
              <dt>Responsable de convocarla</dt>
              <dd className="is-vacio" />
            </div>
          </dl>

          <div className="pend-firmas">
            <span>
              <i />
              Por Systems Development
            </span>
            <span>
              <i />
              Por el cliente
            </span>
          </div>
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
