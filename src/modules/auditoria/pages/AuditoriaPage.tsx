import '../styles/auditoria.css'
import { useMemo, useRef, useState } from 'react'
import {
  ShieldCheck,
  Search,
  FileDown,
  Loader2,
  Download,
  Info,
  PlusCircle,
  PencilLine,
  Trash2,
  Settings2,
  DatabaseBackup,
} from 'lucide-react'
import { Button, Combobox, ConmutadorHoja, Hoja, MembreteSD, VistaPreviaPdf } from '@/core/ui'
import { useDatos, type AccionAuditoria } from '@/core/datos'
import {
  ETIQUETA_ACCION,
  ETIQUETA_COLECCION,
  TOPE_REGISTROS,
  etiquetaCampo,
} from '@/core/lib/auditoria'
import { generarPdf, type PdfGenerado } from '@/core/lib/pdf'

const ICONO: Record<AccionAuditoria, typeof PlusCircle> = {
  crear: PlusCircle,
  editar: PencilLine,
  eliminar: Trash2,
  config: Settings2,
  restaurar: DatabaseBackup,
}

const AGRUPACIONES = [
  { valor: 'fecha', etiqueta: 'Por día' },
  { valor: 'actor', etiqueta: 'Por persona' },
  { valor: 'ambito', etiqueta: 'Por módulo' },
  { valor: 'accion', etiqueta: 'Por acción' },
]

const RANGOS = [
  { valor: '1', etiqueta: 'Hoy' },
  { valor: '7', etiqueta: 'Últimos 7 días' },
  { valor: '30', etiqueta: 'Últimos 30 días' },
  { valor: '0', etiqueta: 'Todo el historial' },
]

function fechaHora(iso: string): string {
  return new Date(iso).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })
}

/**
 * Auditoría del sistema: quién tocó qué y cuándo.
 *
 * Los asientos se escriben desde el reducer del store, que es el único punto
 * por donde pasan todas las escrituras. Por eso cubre cualquier formulario sin
 * que cada uno tenga que acordarse de registrar.
 */
export function AuditoriaPage() {
  const { estado } = useDatos()
  const hojaRef = useRef<HTMLDivElement>(null)

  const [texto, setTexto] = useState('')
  const [ambito, setAmbito] = useState('')
  const [accion, setAccion] = useState('')
  const [actor, setActor] = useState('')
  const [rango, setRango] = useState('7')
  const [agrupar, setAgrupar] = useState('fecha')
  const [abierto, setAbierto] = useState<string | null>(null)
  const [previa, setPrevia] = useState<PdfGenerado | null>(null)
  const [generando, setGenerando] = useState(false)
  const [verHoja, setVerHoja] = useState(false)

  const todos = useMemo(
    () =>
      Object.values(estado.auditoria).sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      ),
    [estado.auditoria],
  )

  const actores = useMemo(() => [...new Set(todos.map((r) => r.actor))].sort(), [todos])
  const ambitos = useMemo(() => [...new Set(todos.map((r) => r.ambito))].sort(), [todos])

  const registros = useMemo(() => {
    const t = texto.trim().toLowerCase()
    const desde = rango === '0' ? 0 : Date.now() - Number(rango) * 86400000
    return todos.filter((r) => {
      if (desde && new Date(r.fecha).getTime() < desde) return false
      if (ambito && r.ambito !== ambito) return false
      if (accion && r.accion !== accion) return false
      if (actor && r.actor !== actor) return false
      if (t && !`${r.detalle} ${r.actor} ${r.ambito}`.toLowerCase().includes(t)) return false
      return true
    })
  }, [todos, texto, ambito, accion, actor, rango])

  /**
   * Agrupa los asientos para leerlos como una línea de tiempo. Por día es la
   * lectura natural ("qué pasó ayer"); por persona o módulo sirve para auditar
   * a alguien o un área concreta.
   */
  const grupos = useMemo(() => {
    const mapa = new Map<string, typeof registros>()

    for (const r of registros) {
      let clave: string
      if (agrupar === 'fecha') {
        const d = new Date(r.fecha)
        const hoy = new Date()
        const ayer = new Date(Date.now() - 86400000)
        const mismoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString()
        clave = mismoDia(d, hoy)
          ? 'Hoy'
          : mismoDia(d, ayer)
            ? 'Ayer'
            : d.toLocaleDateString('es-VE', { weekday: 'long', day: '2-digit', month: 'long' })
      } else if (agrupar === 'actor') {
        clave = r.actor
      } else if (agrupar === 'ambito') {
        clave = ETIQUETA_COLECCION[r.ambito as keyof typeof ETIQUETA_COLECCION] ?? r.ambito
      } else {
        clave = ETIQUETA_ACCION[r.accion]
      }
      const lista = mapa.get(clave)
      if (lista) lista.push(r)
      else mapa.set(clave, [r])
    }
    return [...mapa.entries()]
  }, [registros, agrupar])

  async function verPdf() {
    const hoja = hojaRef.current?.querySelector<HTMLElement>('.mb')
    if (!hoja) return
    setGenerando(true)
    try {
      setPrevia(await generarPdf(hoja, 'auditoria-sd'))
    } finally {
      setGenerando(false)
    }
  }

  /** Exporta lo filtrado a CSV, para abrirlo en una hoja de cálculo. */
  function exportarCsv() {
    const escapar = (v: string) => `"${v.replace(/"/g, '""')}"`
    const filas = [
      ['Fecha', 'Actor', 'Acción', 'Ámbito', 'Detalle', 'Cambios'].map(escapar).join(','),
      ...registros.map((r) =>
        [
          fechaHora(r.fecha),
          r.actor,
          ETIQUETA_ACCION[r.accion],
          ETIQUETA_COLECCION[r.ambito as keyof typeof ETIQUETA_COLECCION] ?? r.ambito,
          r.detalle,
          (r.cambios ?? [])
            .map((c) => `${etiquetaCampo(c.campo)}: ${c.antes ?? '—'} → ${c.despues ?? '—'}`)
            .join(' | '),
        ]
          .map(escapar)
          .join(','),
      ),
    ].join('\n')

    // BOM para que Excel respete los acentos.
    const blob = new Blob(['﻿' + filas], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `auditoria-sd-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className={'page' + (verHoja ? ' is-hoja' : '')}>
      <header className="page__header page__header--fila">
        <div>
          <h1 className="page__title">
            <ShieldCheck size={19} /> Auditoría
          </h1>
          <p className="page__subtitle">
            Quién tocó qué y cuándo. {registros.length} de {todos.length} asientos.
          </p>
        </div>
        <div className="aud-acc">
          <ConmutadorHoja visible={verHoja} onCambio={setVerHoja} />
          <Button type="button" variant="ghost" onClick={exportarCsv} disabled={!registros.length}>
            <Download size={15} /> CSV
          </Button>
          <Button type="button" variant="ghost" onClick={verPdf} disabled={generando || !registros.length}>
            {generando ? <Loader2 size={15} className="spin" /> : <FileDown size={15} />} PDF
          </Button>
        </div>
      </header>

      <div className="aud-filtros">
        <label className="field aud-filtros__buscar">
          <span className="field__label">Buscar</span>
          <span className="aud-buscar">
            <Search size={14} />
            <input
              className="field__input"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Cliente, código, correo…"
            />
          </span>
        </label>

        <div className="field">
          <span className="field__label">Agrupar</span>
          <Combobox opciones={AGRUPACIONES} valor={agrupar} onCambio={setAgrupar} buscar={false} />
        </div>

        <div className="field">
          <span className="field__label">Periodo</span>
          <Combobox opciones={RANGOS} valor={rango} onCambio={setRango} buscar={false} />
        </div>

        <div className="field">
          <span className="field__label">Módulo</span>
          <Combobox
            opciones={[
              { valor: '', etiqueta: 'Todos' },
              ...ambitos.map((a) => ({
                valor: a,
                etiqueta: ETIQUETA_COLECCION[a as keyof typeof ETIQUETA_COLECCION] ?? a,
              })),
            ]}
            valor={ambito}
            onCambio={setAmbito}
            buscar={false}
          />
        </div>

        <div className="field">
          <span className="field__label">Acción</span>
          <Combobox
            opciones={[
              { valor: '', etiqueta: 'Todas' },
              ...Object.entries(ETIQUETA_ACCION).map(([v, e]) => ({ valor: v, etiqueta: e })),
            ]}
            valor={accion}
            onCambio={setAccion}
            buscar={false}
          />
        </div>

        <div className="field">
          <span className="field__label">Quién</span>
          <Combobox
            opciones={[
              { valor: '', etiqueta: 'Cualquiera' },
              ...actores.map((a) => ({ valor: a, etiqueta: a })),
            ]}
            valor={actor}
            onCambio={setActor}
          />
        </div>
      </div>

      <p className="aud-aviso">
        <Info size={14} />
        En esta fase el actor es el correo de la sesión, no un colaborador: el acceso de
        desarrollo todavía no está mapeado a una persona. Las contraseñas nunca se guardan
        aquí — se asienta que cambiaron, no a qué. Se conservan los últimos {TOPE_REGISTROS}{' '}
        asientos.
      </p>

      {!registros.length ? (
        <div className="vacio">
          <ShieldCheck size={30} strokeWidth={1.5} />
          <p>
            {todos.length
              ? 'Ningún asiento coincide con el filtro.'
              : 'Todavía no hay movimientos registrados. Cualquier cambio que hagas aparecerá aquí.'}
          </p>
        </div>
      ) : (
        <div className="aud-timeline">
          {grupos.map(([clave, asientos]) => (
            <section className="aud-grupo" key={clave}>
              <header className="aud-grupo__cab">
                <span className="aud-grupo__punto" aria-hidden="true" />
                <h2 className="aud-grupo__tit">{clave}</h2>
                <span className="aud-grupo__n">
                  {asientos.length} movimiento{asientos.length === 1 ? '' : 's'}
                </span>
              </header>

              <ul className="aud-lista">
                {asientos.map((r) => {
            const Icono = ICONO[r.accion]
            const expandido = abierto === r.id
            const tieneDetalle = !!r.cambios?.length
            return (
              <li className={'aud-item is-' + r.accion} key={r.id}>
                <button
                  type="button"
                  className="aud-item__fila"
                  onClick={() => setAbierto(expandido ? null : r.id)}
                  aria-expanded={expandido}
                  disabled={!tieneDetalle}
                >
                  <span className="aud-item__ic">
                    <Icono size={14} />
                  </span>
                  <span className="aud-item__txt">
                    <b>{ETIQUETA_ACCION[r.accion]}</b> {r.detalle}
                    {tieneDetalle && (
                      <em className="aud-item__n">
                        {r.cambios!.length} campo{r.cambios!.length === 1 ? '' : 's'}
                      </em>
                    )}
                  </span>
                  <span className="aud-item__actor">{r.actor}</span>
                  <span className="aud-item__fecha">{fechaHora(r.fecha)}</span>
                </button>

                {expandido && tieneDetalle && (
                  <table className="aud-cambios">
                    <thead>
                      <tr>
                        <th>Campo</th>
                        <th>Antes</th>
                        <th>Después</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.cambios!.map((c) => (
                        <tr key={c.campo}>
                          <td>{etiquetaCampo(c.campo)}</td>
                          <td className="aud-cambios__antes">{c.antes ?? '—'}</td>
                          <td className="aud-cambios__despues">{c.despues ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {/* Hoja imprimible del historial filtrado. */}
      <Hoja visible={verHoja} innerRef={hojaRef}>
        <MembreteSD
          titulo="Registro de auditoría"
          subtitulo={`${registros.length} asientos · emitido el ${new Date().toLocaleDateString(
            'es-VE',
            { dateStyle: 'long' },
          )}`}
        >
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Quién</th>
                  <th>Acción</th>
                  <th>Qué</th>
                </tr>
              </thead>
              <tbody>
                {registros.slice(0, 400).map((r) => (
                  <tr key={r.id}>
                    <td>{fechaHora(r.fecha)}</td>
                    <td>{r.actor}</td>
                    <td>{ETIQUETA_ACCION[r.accion]}</td>
                    <td>{r.detalle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {registros.length > 400 && (
            <p className="fin-nota">
              Se imprimen los 400 asientos más recientes de los {registros.length} filtrados. Para
              el listado completo, exporta el CSV.
            </p>
          )}
          <p className="fin-nota">
            Las contraseñas y claves no se registran: se asienta que cambiaron, nunca su valor.
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
