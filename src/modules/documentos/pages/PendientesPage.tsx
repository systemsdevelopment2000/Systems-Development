import '../styles/documento.css'
import '../styles/pendientes.css'
import { useMemo, useRef, useState } from 'react'
import { ClipboardList, FileDown, Loader2, Plus, Trash2, Wand2, Eraser, Save, Undo2 } from 'lucide-react'
import { Button, Combobox, ConmutadorHoja, Hoja, MembreteSD, VistaPreviaPdf } from '@/core/ui'
import { useDatos, type PieHoja, type Prioridad } from '@/core/datos'
import { generarPdf, type PdfGenerado } from '@/core/lib/pdf'
import {
  ETIQUETA_PRIORIDAD,
  agregarVacias,
  ajustarVaciasFinales,
  ensamblar,
  hojaEnBlanco,
  renumerar,
  type FilaPendiente,
} from '../lib/pendientes'

/** Lo que dice la hoja si nunca se editó el pie. */
const PIE_POR_DEFECTO: PieHoja = {
  firmaIzquierda: 'Asigna por SD',
  firmaDerecha: 'Recibe / responsable',
  nota: 'El orden indica la secuencia de realización esperada. Una tarea marcada como pendiente de aprobación no avanza de estado hasta recibir el visto bueno.',
}

const PRIORIDADES: { valor: Prioridad | ''; etiqueta: string }[] = [
  { valor: '', etiqueta: '—' },
  { valor: 'baja', etiqueta: 'Baja' },
  { valor: 'media', etiqueta: 'Media' },
  { valor: 'alta', etiqueta: 'Alta' },
  { valor: 'critica', etiqueta: 'Crítica' },
]

/**
 * Hoja de pendientes asignables, con el membrete de SD.
 *
 * Sirve de dos maneras: se ensambla con las tareas reales de un proyecto, o se
 * imprime en blanco con las filas numeradas para repartir trabajo a mano en una
 * reunión. Las filas vacías se imprimen con su recuadro y sus líneas, así que la
 * misma hoja sirve llena, a medio llenar o vacía.
 */
export function PendientesPage() {
  const { estado, setEmpresa } = useDatos()
  const hojaRef = useRef<HTMLDivElement>(null)

  const proyectos = useMemo(
    () => Object.values(estado.proyectos).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [estado.proyectos],
  )
  const colaboradores = useMemo(() => Object.values(estado.colaboradores), [estado.colaboradores])

  const [proyectoId, setProyectoId] = useState('')
  const [filasBlanco, setFilasBlanco] = useState(12)
  const [bloque, setBloque] = useState(5)
  const [incluirSinAsignar, setIncluirSinAsignar] = useState(true)
  const [conFirma, setConFirma] = useState(true)
  const [notas, setNotas] = useState('')
  const [lineasNota, setLineasNota] = useState(4)
  const [filas, setFilas] = useState<FilaPendiente[]>(() => hojaEnBlanco(12))
  const [previa, setPrevia] = useState<PdfGenerado | null>(null)
  const [generando, setGenerando] = useState(false)
  const [verHoja, setVerHoja] = useState(false)

  // Textos del pie: arrancan de lo guardado en el membrete y se pueden editar
  // para esta hoja, o guardarse como predeterminados.
  const pieGuardado = estado.empresa.hojaPendientes ?? PIE_POR_DEFECTO
  const [pie, setPie] = useState<PieHoja>(pieGuardado)
  const [piePropio, setPiePropio] = useState(false)
  const [pieGuardadoOk, setPieGuardadoOk] = useState(false)

  const proyecto = proyectoId ? estado.proyectos[proyectoId] : undefined
  const cliente = proyecto?.clienteId ? estado.clientes[proyecto.clienteId] : undefined

  function setCampoPie(k: keyof PieHoja, v: string) {
    setPie((prev) => ({ ...prev, [k]: v }))
    setPiePropio(true)
    setPieGuardadoOk(false)
  }
  function guardarPie() {
    setEmpresa({ ...estado.empresa, hojaPendientes: pie })
    setPiePropio(false)
    setPieGuardadoOk(true)
    setTimeout(() => setPieGuardadoOk(false), 1800)
  }
  function restaurarPie() {
    setPie(pieGuardado)
    setPiePropio(false)
  }

  function desdeElSistema() {
    if (!proyecto) return
    const actividades = Object.values(estado.actividades).filter((a) => a.proyectoId === proyecto.id)
    setFilas(
      ensamblar(actividades, colaboradores, proyecto.modulos ?? [], {
        incluirSinAsignar,
        filasExtra: filasBlanco,
      }),
    )
  }

  function enBlanco() {
    setFilas(hojaEnBlanco(filasBlanco))
  }

  /** El campo de líneas en blanco actúa de inmediato: no hay que pulsar nada. */
  function cambiarBlancas(n: number) {
    const limpio = Math.min(60, Math.max(0, n))
    setFilasBlanco(limpio)
    setFilas((prev) => ajustarVaciasFinales(prev, limpio))
  }

  function set(id: string, cambios: Partial<FilaPendiente>) {
    setFilas((prev) => prev.map((f) => (f.id === id ? { ...f, ...cambios } : f)))
  }
  function quitar(id: string) {
    setFilas((prev) => renumerar(prev.filter((f) => f.id !== id)))
  }
  function agregar(cuantas = bloque) {
    setFilas((prev) => agregarVacias(prev, cuantas))
  }

  async function verPdf() {
    const hoja = hojaRef.current?.querySelector<HTMLElement>('.mb')
    if (!hoja) return
    setGenerando(true)
    try {
      const nombre = proyecto
        ? `pendientes-${proyecto.codigo ?? proyecto.nombre}`
        : 'pendientes-sd'
      setPrevia(await generarPdf(hoja, nombre))
    } finally {
      setGenerando(false)
    }
  }

  const conContenido = filas.filter((f) => f.pendiente.trim()).length

  return (
    <section className={'page' + (verHoja ? ' is-hoja' : '')}>
      <header className="page__header page__header--fila">
        <div>
          <h1 className="page__title">
            <ClipboardList size={19} /> Hoja de pendientes
          </h1>
          <p className="page__subtitle">
            Ármala con las tareas de un proyecto o imprímela en blanco para repartir trabajo a mano.
            {conContenido > 0
              ? ` ${conContenido} de ${filas.length} líneas tienen contenido.`
              : ` ${filas.length} líneas en blanco.`}
          </p>
        </div>
        <div className="page__acciones">
          <ConmutadorHoja visible={verHoja} onCambio={setVerHoja} />
          <Button type="button" onClick={verPdf} disabled={generando}>
          {generando ? <Loader2 size={15} className="spin" /> : <FileDown size={15} />} Ver PDF
          </Button>
        </div>
      </header>

      <div className="pend-conf">
        <div className="field">
          <span className="field__label">Proyecto</span>
          <Combobox
            opciones={[
              { valor: '', etiqueta: 'Sin proyecto (hoja genérica)' },
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

        <label className="field pend-conf__num">
          <span className="field__label">
            Líneas en blanco
          </span>
          <input
            className="field__input"
            type="number"
            min={0}
            max={60}
            value={filasBlanco}
            onChange={(e) => cambiarBlancas(Number(e.target.value))}
          />
        </label>

        <label className="field pend-conf__num">
          <span className="field__label">Líneas de notas</span>
          <input
            className="field__input"
            type="number"
            min={0}
            max={12}
            value={lineasNota}
            onChange={(e) => setLineasNota(Math.min(12, Math.max(0, Number(e.target.value))))}
          />
        </label>

        <div className="pend-conf__checks">
          <label className="pend-check">
            <input
              type="checkbox"
              checked={incluirSinAsignar}
              onChange={(e) => setIncluirSinAsignar(e.target.checked)}
            />
            Incluir tareas sin responsable
          </label>
          <label className="pend-check">
            <input
              type="checkbox"
              checked={conFirma}
              onChange={(e) => setConFirma(e.target.checked)}
            />
            Línea de firmas al pie
          </label>
        </div>

        <div className="pend-conf__acc">
          <Button type="button" variant="ghost" onClick={desdeElSistema} disabled={!proyecto}>
            <Wand2 size={15} /> Ensamblar del sistema
          </Button>
          <Button type="button" variant="ghost" onClick={enBlanco}>
            <Eraser size={15} /> Hoja en blanco
          </Button>
        </div>
      </div>

      {/* Editor: lo que se toca aquí es lo que sale impreso. */}
      <div className="pend-editor">
        <div className="pend-editor__th">
          <span>Orden</span>
          <span>Pendiente</span>
          <span>Asignado a</span>
          <span>Módulo</span>
          <span>Prioridad</span>
          <span>Entrega</span>
          <span />
        </div>
        {filas.map((f) => (
          <div className="pend-editor__tr" key={f.id}>
            <input
              className="field__input"
              type="number"
              min={1}
              value={f.orden}
              onChange={(e) => set(f.id, { orden: Number(e.target.value) })}
            />
            <input
              className="field__input"
              value={f.pendiente}
              onChange={(e) => set(f.id, { pendiente: e.target.value })}
              placeholder="(se deja vacío para llenar a mano)"
            />
            <input
              className="field__input"
              value={f.asignado}
              onChange={(e) => set(f.id, { asignado: e.target.value })}
              list="pend-colaboradores"
            />
            <input
              className="field__input"
              value={f.modulo}
              onChange={(e) => set(f.id, { modulo: e.target.value })}
              list="pend-modulos"
            />
            <select
              className="field__input"
              value={f.prioridad}
              onChange={(e) => set(f.id, { prioridad: e.target.value as Prioridad | '' })}
            >
              {PRIORIDADES.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.etiqueta}
                </option>
              ))}
            </select>
            <input
              className="field__input"
              value={f.entrega}
              onChange={(e) => set(f.id, { entrega: e.target.value })}
              placeholder="dd/mm/aaaa"
            />
            <button
              type="button"
              className="icono-btn icono-btn--peligro"
              onClick={() => quitar(f.id)}
              aria-label={`Quitar línea ${f.orden}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <div className="pend-sumar">
          <Button type="button" variant="ghost" onClick={() => agregar()}>
            <Plus size={15} /> Añadir {bloque} líneas
          </Button>
          <input
            className="field__input pend-sumar__num"
            type="number"
            min={1}
            max={60}
            value={bloque}
            aria-label="Cuántas líneas añadir de una vez"
            onChange={(e) => setBloque(Math.min(60, Math.max(1, Number(e.target.value))))}
          />
          {[5, 10, 20].map((n) => (
            <button key={n} type="button" className="pend-sumar__rapido" onClick={() => agregar(n)}>
              +{n}
            </button>
          ))}
        </div>
      </div>

      <datalist id="pend-colaboradores">
        {colaboradores.map((c) => (
          <option key={c.id} value={c.nombre} />
        ))}
      </datalist>
      <datalist id="pend-modulos">
        {(proyecto?.modulos ?? [])
          .filter((m) => m.incluido)
          .map((m) => (
            <option key={m.id} value={m.nombre} />
          ))}
      </datalist>

      <label className="field">
        <span className="field__label">
          Notas <span className="field__hint">(sale impreso; abajo quedan líneas en blanco)</span>
        </span>
        <textarea
          className="field__input"
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Acuerdos de la reunión, criterios de aceptación, a quién avisar al terminar…"
        />
      </label>

      {/* Pie de la hoja: se edita aquí y se puede fijar como predeterminado,
          igual que el membrete. */}
      <fieldset className="pend-pie-ed">
        <legend>
          Pie de la hoja
          <span className="field__hint">rótulos de firma y nota de cierre</span>
        </legend>

        <div className="pend-pie-ed__firmas">
          <label className="field">
            <span className="field__label">Firma izquierda</span>
            <input
              className="field__input"
              value={pie.firmaIzquierda}
              onChange={(e) => setCampoPie('firmaIzquierda', e.target.value)}
              placeholder="Asigna por SD"
            />
          </label>
          <label className="field">
            <span className="field__label">Firma derecha</span>
            <input
              className="field__input"
              value={pie.firmaDerecha}
              onChange={(e) => setCampoPie('firmaDerecha', e.target.value)}
              placeholder="Recibe / responsable"
            />
          </label>
        </div>

        <label className="field">
          <span className="field__label">Nota de cierre</span>
          <textarea
            className="field__input"
            rows={2}
            value={pie.nota}
            onChange={(e) => setCampoPie('nota', e.target.value)}
            placeholder="Condición que queda asentada en la hoja…"
          />
        </label>

        <div className="pend-pie-ed__acc">
          {piePropio && (
            <>
              <span className="field__hint">
                Cambiado solo para esta hoja. Guárdalo si quieres que salga así siempre.
              </span>
              <Button type="button" variant="ghost" onClick={restaurarPie}>
                <Undo2 size={14} /> Descartar
              </Button>
            </>
          )}
          {pieGuardadoOk && <span className="pend-pie-ed__ok">Guardado como predeterminado</span>}
          <Button type="button" variant="ghost" onClick={guardarPie} disabled={!piePropio}>
            <Save size={14} /> Guardar como predeterminado
          </Button>
        </div>
      </fieldset>

      {/* Hoja imprimible. */}
      <Hoja visible={verHoja} innerRef={hojaRef}>
        <MembreteSD
          titulo="Hoja de pendientes"
          subtitulo={
            proyecto
              ? `${proyecto.codigo ? proyecto.codigo + ' · ' : ''}${proyecto.nombre}${
                  cliente ? ' · ' + cliente.nombre : ''
                }`
              : `Emitida el ${new Date().toLocaleDateString('es-VE', { dateStyle: 'long' })}`
          }
        >
          {/* Los campos a llenar a mano se dibujan con una línea, no con
              guiones bajos: con fuente variable quedaban desparejos. */}
          <dl className="pend-meta">
            <div>
              <dt>Proyecto</dt>
              <dd className={proyecto ? '' : 'is-vacio'}>{proyecto?.nombre ?? ''}</dd>
            </div>
            <div>
              <dt>Fecha</dt>
              <dd>
                {new Date().toLocaleDateString('es-VE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </dd>
            </div>
            <div>
              <dt>Emitida por</dt>
              <dd className="is-vacio" />
            </div>
          </dl>

          <table className="pend-tabla">
            <thead>
              <tr>
                <th className="pend-tabla__ok" aria-label="Listo" />
                <th className="pend-tabla__ord">N°</th>
                <th>Pendiente</th>
                <th className="pend-tabla__asig">Asignado a</th>
                <th className="pend-tabla__mod">Módulo</th>
                <th className="pend-tabla__pri">Prioridad</th>
                <th className="pend-tabla__ent">Entrega</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id} className={f.pendiente.trim() ? '' : 'is-vacia'}>
                  <td className="pend-tabla__ok">
                    <span className="pend-caja" />
                  </td>
                  <td className="pend-tabla__ord">{f.orden}</td>
                  <td>{f.pendiente}</td>
                  <td className="pend-tabla__asig">{f.asignado}</td>
                  <td className="pend-tabla__mod">{f.modulo}</td>
                  <td className="pend-tabla__pri">
                    {f.prioridad ? (
                      <span className={'pend-pri pend-pri--' + f.prioridad}>
                        {ETIQUETA_PRIORIDAD[f.prioridad]}
                      </span>
                    ) : (
                      ''
                    )}
                  </td>
                  <td className="pend-tabla__ent">{f.entrega}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pend-notas">
            <h3 className="pend-notas__tit">Notas</h3>
            {notas.trim() && <p className="pend-notas__txt">{notas}</p>}
            {Array.from({ length: lineasNota }, (_, i) => (
              <span className="pend-notas__linea" key={i} />
            ))}
          </div>

          {conFirma && (
            <div className="pend-firmas">
              <span>
                <i />
                {pie.firmaIzquierda}
              </span>
              <span>
                <i />
                {pie.firmaDerecha}
              </span>
            </div>
          )}

          {pie.nota.trim() && <p className="pend-pie">{pie.nota}</p>}
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
