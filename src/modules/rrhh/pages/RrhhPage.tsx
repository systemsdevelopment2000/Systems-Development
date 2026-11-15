import '../styles/rrhh.css'
import { useMemo, useRef, useState } from 'react'
import { UsersRound, Plus, Copy, Trash2, FileText, ArrowLeft, Search } from 'lucide-react'
import { Button, ConmutadorHoja, Hoja, MembreteSD, VistaPreviaPdf, useConfirmar } from '@/core/ui'
import { useDatos, type PlantillaEntrevista } from '@/core/datos'
import { ESCALA, ESTADOS_CANDIDATO, lecturaNota } from '@/core/lib/rrhh'
import { generarPdf, type PdfGenerado } from '@/core/lib/pdf'
import { useRrhh } from '../hooks/useRrhh'
import { FichaCandidato } from '../components/FichaCandidato'
import { HojaIngreso } from '../components/HojaIngreso'
import { EditorPlantilla } from '../components/EditorPlantilla'

type Pestana = 'candidatos' | 'plantillas'

/**
 * Recursos humanos: a quién entrevistamos y con qué guion.
 *
 * Dos piezas que se necesitan mutuamente: las plantillas definen qué se
 * pregunta y qué se evalúa; la ficha del candidato guarda lo que contestó y
 * cómo quedó puntuado. La hoja imprimible permite entrevistar en papel y
 * cargar después.
 */
export function RrhhPage() {
  const {
    candidatos,
    plantillas,
    colaboradores,
    crearCandidato,
    guardarCandidato,
    borrarCandidato,
    crearPlantilla,
    guardarPlantilla,
    borrarPlantilla,
  } = useRrhh()
  const { estado } = useDatos()
  const confirmar = useConfirmar()
  const hojaRef = useRef<HTMLDivElement>(null)

  const [pestana, setPestana] = useState<Pestana>('candidatos')
  const [abierto, setAbierto] = useState<string | null>(null)
  const [plantillaId, setPlantillaId] = useState<string | null>(null)
  const [texto, setTexto] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [previa, setPrevia] = useState<PdfGenerado | null>(null)
  const [generando, setGenerando] = useState(false)
  /** Plantilla que se está imprimiendo en blanco, si aplica. */
  const [hojaBlanco, setHojaBlanco] = useState<PlantillaEntrevista | null>(null)
  /** Qué documento se arma: la entrevista o la ficha de ingreso. */
  const [documento, setDocumento] = useState<'entrevista' | 'ingreso'>('entrevista')
  const [aviso, setAviso] = useState<string | null>(null)
  const [verHoja, setVerHoja] = useState(false)

  const candidato = candidatos.find((c) => c.id === abierto) ?? null
  const plantillaAbierta = plantillas.find((p) => p.id === plantillaId) ?? null

  const filtrados = useMemo(() => {
    const t = texto.trim().toLowerCase()
    return candidatos.filter((c) => {
      if (filtroEstado && c.estado !== filtroEstado) return false
      if (t && !`${c.nombre} ${c.cargo} ${c.correo ?? ''}`.toLowerCase().includes(t)) return false
      return true
    })
  }, [candidatos, texto, filtroEstado])

  /**
   * La hoja se arma con el candidato abierto o con una plantilla en blanco.
   * Si el candidato todavía no tiene plantilla asignada se usa la general:
   * antes el botón no hacía nada y no se entendía por qué.
   */
  const plantillaRespaldo = plantillas.find((p) => p.id === 'pe-general') ?? plantillas[0]
  const hoja = hojaBlanco
    ? { plantilla: hojaBlanco, candidato: null }
    : candidato
      ? { plantilla: candidato.plantilla ?? plantillaRespaldo, candidato }
      : null

  async function imprimir(plantillaBlanco?: PlantillaEntrevista) {
    if (plantillaBlanco) setHojaBlanco(plantillaBlanco)
    setGenerando(true)
    try {
      // Dos cuadros de espera: uno para que React aplique el estado y otro
      // para que el navegador haya pintado la hoja. Con un setTimeout fijo
      // a veces se rasterizaba antes de tiempo.
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))))
      const el = hojaRef.current?.querySelector<HTMLElement>('.mb')
      if (!el) {
        setAviso('No se pudo armar la hoja: elige una plantilla de entrevista.')
        return
      }
      setAviso(null)
      const quien = plantillaBlanco?.cargo || candidato?.nombre || 'sd'
      const tipo = plantillaBlanco ? 'entrevista' : documento === 'ingreso' ? 'ficha-ingreso' : 'entrevista'
      setPrevia(await generarPdf(el, `${tipo}-${quien}`))
    } finally {
      setGenerando(false)
      setHojaBlanco(null)
    }
  }

  async function confirmarBorrarCandidato(id: string, nombre: string) {
    const ok = await confirmar({
      titulo: `Eliminar a ${nombre}`,
      mensaje: 'Se borra su ficha, su evaluación y sus documentos. No se puede deshacer.',
      textoConfirmar: 'Eliminar',
      peligro: true,
    })
    if (ok) {
      borrarCandidato(id)
      setAbierto(null)
    }
  }

  // ---- Detalle de un candidato ----
  if (candidato) {
    return (
      <section className={'page' + (verHoja ? ' is-hoja' : '')}>
        <div className="rh-barra">
          <button className="volver" onClick={() => setAbierto(null)}>
            <ArrowLeft size={15} /> Candidatos
          </button>
          {/* Qué documento se arma al pedir la hoja. */}
          <div className="ag-tabs" role="group" aria-label="Documento">
            <button
              type="button"
              className={documento === 'entrevista' ? 'is-on' : ''}
              onClick={() => setDocumento('entrevista')}
            >
              Entrevista
            </button>
            <button
              type="button"
              className={documento === 'ingreso' ? 'is-on' : ''}
              onClick={() => setDocumento('ingreso')}
              title="La hoja que la persona llena al ser contratada"
            >
              Ficha de ingreso
            </button>
          </div>
          <ConmutadorHoja visible={verHoja} onCambio={setVerHoja} />
        </div>
        <FichaCandidato
          candidato={candidato}
          plantillas={plantillas}
          colaboradores={colaboradores}
          onCambio={guardarCandidato}
          onBorrar={() => void confirmarBorrarCandidato(candidato.id, candidato.nombre)}
          onHoja={() => void imprimir()}
          generandoHoja={generando}
        />
        {aviso && (
          <p className="form__error" role="alert">
            {aviso}
          </p>
        )}
        {documento === 'ingreso' ? (
          <HojaIngreso refHoja={hojaRef} candidato={candidato} visible={verHoja} />
        ) : (
          <HojaEntrevista
            refHoja={hojaRef}
            hoja={hoja}
            empresaNombre={estado.empresa.nombre}
            visible={verHoja}
          />
        )}
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

  // ---- Editor de una plantilla ----
  if (plantillaAbierta) {
    return (
      <section className={'page' + (verHoja ? ' is-hoja' : '')}>
        <button className="volver" onClick={() => setPlantillaId(null)}>
          <ArrowLeft size={15} /> Plantillas
        </button>
        <EditorPlantilla
          plantilla={plantillaAbierta}
          onCambio={guardarPlantilla}
          onBorrar={async () => {
            const ok = await confirmar({
              titulo: `Eliminar "${plantillaAbierta.nombre}"`,
              mensaje:
                'Los candidatos que la usaron conservan sus respuestas, pero pierden la referencia de qué se les preguntó.',
              textoConfirmar: 'Eliminar plantilla',
              peligro: true,
            })
            if (ok) {
              borrarPlantilla(plantillaAbierta.id)
              setPlantillaId(null)
            }
          }}
          onImprimir={() => void imprimir(plantillaAbierta)}
          generando={generando}
        />
        {documento === 'ingreso' ? (
          <HojaIngreso refHoja={hojaRef} candidato={candidato} visible={verHoja} />
        ) : (
          <HojaEntrevista
            refHoja={hojaRef}
            hoja={hoja}
            empresaNombre={estado.empresa.nombre}
            visible={verHoja}
          />
        )}
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

  // ---- Listados ----
  return (
    <section className={'page' + (verHoja ? ' is-hoja' : '')}>
      <header className="page__header page__header--fila">
        <div>
          <h1 className="page__title">
            <UsersRound size={19} /> Recursos humanos
          </h1>
          <p className="page__subtitle">
            {candidatos.length} candidato{candidatos.length === 1 ? '' : 's'} ·{' '}
            {plantillas.length} plantilla{plantillas.length === 1 ? '' : 's'} de entrevista
          </p>
        </div>
        {pestana === 'candidatos' ? (
          <Button type="button" onClick={() => setAbierto(crearCandidato({}).id)}>
            <Plus size={15} /> Nuevo candidato
          </Button>
        ) : (
          <Button type="button" onClick={() => setPlantillaId(crearPlantilla().id)}>
            <Plus size={15} /> Nueva plantilla
          </Button>
        )}
      </header>

      <div className="rh-tabs">
        <button
          className={pestana === 'candidatos' ? 'is-on' : ''}
          onClick={() => setPestana('candidatos')}
        >
          Candidatos
        </button>
        <button
          className={pestana === 'plantillas' ? 'is-on' : ''}
          onClick={() => setPestana('plantillas')}
        >
          Plantillas
        </button>
      </div>

      {pestana === 'candidatos' ? (
        <>
          <div className="rh-filtros">
            <span className="aud-buscar">
              <Search size={14} />
              <input
                className="field__input"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Nombre, cargo o correo…"
              />
            </span>
            <div className="rh-estados">
              <button
                className={!filtroEstado ? 'is-on' : ''}
                onClick={() => setFiltroEstado('')}
              >
                Todos
              </button>
              {ESTADOS_CANDIDATO.map((e) => (
                <button
                  key={e.valor}
                  className={filtroEstado === e.valor ? 'is-on' : ''}
                  onClick={() => setFiltroEstado(e.valor)}
                  style={filtroEstado === e.valor ? { borderColor: e.color, color: e.color } : undefined}
                >
                  {e.etiqueta}
                </button>
              ))}
            </div>
          </div>

          {!filtrados.length ? (
            <div className="vacio">
              <UsersRound size={30} strokeWidth={1.5} />
              <p>
                {candidatos.length
                  ? 'Ningún candidato coincide con el filtro.'
                  : 'Todavía no hay candidatos. Crea el primero al recibir un currículum.'}
              </p>
            </div>
          ) : (
            <ul className="rh-grid">
              {filtrados.map((c) => {
                const est = ESTADOS_CANDIDATO.find((e) => e.valor === c.estado)
                return (
                  <li key={c.id}>
                    <button
                      className="rh-card"
                      onClick={() => setAbierto(c.id)}
                      data-sonido="seleccion"
                      style={{ borderLeftColor: est?.color }}
                    >
                      <span className="rh-card__cab">
                        <b>{c.nombre}</b>
                        <em style={{ color: est?.color }}>{est?.etiqueta}</em>
                      </span>
                      <span className="rh-card__cargo">{c.cargo || 'Cargo sin definir'}</span>
                      <span className="rh-card__pie">
                        {c.evaluacion.nota !== null ? (
                          <>
                            <b>{c.evaluacion.nota}</b>/5 · {lecturaNota(c.evaluacion.nota)}
                          </>
                        ) : (
                          <em>Sin evaluar</em>
                        )}
                        {c.entrevistador && <span>· {c.entrevistador}</span>}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      ) : (
        <ul className="rh-grid">
          {plantillas.map((p) => (
            <li key={p.id}>
              <div className="rh-plant">
                <button className="rh-plant__abrir" onClick={() => setPlantillaId(p.id)}>
                  <b>{p.nombre}</b>
                  <em>{p.cargo || 'Sin cargo'}</em>
                  <span>
                    {p.bloques.reduce((s, b) => s + b.preguntas.length, 0)} preguntas ·{' '}
                    {p.criterios.length} criterios
                  </span>
                </button>
                <div className="rh-plant__acc">
                  <button
                    className="icono-btn"
                    onClick={() => void imprimir(p)}
                    aria-label="Hoja en blanco"
                    title="Imprimir en blanco para entrevistar en papel"
                  >
                    <FileText size={14} />
                  </button>
                  <button
                    className="icono-btn"
                    onClick={() => setPlantillaId(crearPlantilla(p).id)}
                    aria-label="Duplicar"
                    title="Duplicar"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    className="icono-btn icono-btn--peligro"
                    onClick={async () => {
                      const ok = await confirmar({
                        titulo: `Eliminar "${p.nombre}"`,
                        mensaje: 'No se puede deshacer.',
                        textoConfirmar: 'Eliminar',
                        peligro: true,
                      })
                      if (ok) borrarPlantilla(p.id)
                    }}
                    aria-label="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <HojaEntrevista
            refHoja={hojaRef}
            hoja={hoja}
            empresaNombre={estado.empresa.nombre}
            visible={verHoja}
          />

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

/** Hoja imprimible: el guion con espacio para anotar y la grilla de puntuación. */
function HojaEntrevista({
  refHoja,
  hoja,
  empresaNombre,
  visible,
}: {
  refHoja: React.RefObject<HTMLDivElement | null>
  hoja: { plantilla: PlantillaEntrevista; candidato: { nombre: string; cargo: string } | null } | null
  empresaNombre: string
  visible: boolean
}) {
  if (!hoja)
    return (
      <Hoja visible={visible} innerRef={refHoja}>
        <span />
      </Hoja>
    )

  const { plantilla, candidato } = hoja
  return (
    <Hoja visible={visible} innerRef={refHoja}>
      <MembreteSD
        titulo={`Entrevista · ${plantilla.cargo || plantilla.nombre}`}
        subtitulo={candidato ? candidato.nombre : `${empresaNombre} · hoja para llenar a mano`}
      >
        <dl className="pend-meta">
          <div>
            <dt>Candidato</dt>
            <dd className={candidato ? '' : 'is-vacio'}>{candidato?.nombre ?? ''}</dd>
          </div>
          <div>
            <dt>Fecha</dt>
            <dd className="is-vacio" />
          </div>
          <div>
            <dt>Entrevista</dt>
            <dd className="is-vacio" />
          </div>
        </dl>

        {plantilla.bloques.map((b) => (
          <section className="min-bloque" key={b.id}>
            <h3 className="min-bloque__tit">{b.titulo}</h3>
            {b.preguntas.filter(Boolean).map((q, i) => (
              <div className="min-preg" key={i}>
                <p className="min-preg__q">{q}</p>
                <span className="min-linea" />
                <span className="min-linea" />
              </div>
            ))}
          </section>
        ))}

        <section className="min-bloque">
          <h3 className="min-bloque__tit">Evaluación</h3>
          <table className="pend-tabla rh-hoja__tabla">
            <thead>
              <tr>
                <th>Criterio</th>
                {ESCALA.map((e) => (
                  <th key={e.valor} className="rh-hoja__n">
                    {e.valor}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plantilla.criterios.map((c) => (
                <tr key={c.id}>
                  <td>
                    <b>{c.nombre}</b>
                    {c.descripcion && <em> — {c.descripcion}</em>}
                  </td>
                  {ESCALA.map((e) => (
                    <td key={e.valor} className="rh-hoja__n">
                      <span className="pend-caja" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="fin-nota">
            {ESCALA.map((e) => `${e.valor} ${e.etiqueta}`).join(' · ')}
          </p>
        </section>

        <section className="min-bloque">
          <h3 className="min-bloque__tit">Conclusión</h3>
          <span className="min-linea" />
          <span className="min-linea" />
          <span className="min-linea" />
        </section>

        <div className="pend-firmas">
          <span>
            <i />
            Entrevistó
          </span>
          <span>
            <i />
            Visto bueno
          </span>
        </div>
      </MembreteSD>
    </Hoja>
  )
}
