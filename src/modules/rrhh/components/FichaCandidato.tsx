import { useState } from 'react'
import { Save, Trash2, FileDown, Loader2, Star } from 'lucide-react'
import { Button, Combobox, SubirAdjuntos } from '@/core/ui'
import type { Candidato, Colaborador, PlantillaEntrevista, PuntajeCriterio } from '@/core/datos'
import { ESCALA, ESTADOS_CANDIDATO, evaluar, lecturaNota } from '@/core/lib/rrhh'
import { FichaPersonalForm } from './FichaPersonalForm'

interface Props {
  candidato: Candidato
  plantillas: PlantillaEntrevista[]
  colaboradores: Colaborador[]
  onCambio: (c: Candidato) => void
  onBorrar: () => void
  onHoja: () => void
  generandoHoja?: boolean
}

/**
 * Ficha del candidato: datos, la entrevista aplicada y su evaluación.
 *
 * La puntuación es por criterio y cada uno dice qué mide, porque un "4 en
 * comunicación" sin referencia no significa lo mismo para dos entrevistadores.
 */
export function FichaCandidato({
  candidato: c,
  plantillas,
  colaboradores,
  onCambio,
  onBorrar,
  onHoja,
  generandoHoja,
}: Props) {
  const [verEscala, setVerEscala] = useState(false)
  const plantilla = plantillas.find((p) => p.id === c.plantillaId)
  const resultado = evaluar(c, plantilla)

  function set<K extends keyof Candidato>(k: K, v: Candidato[K]) {
    onCambio({ ...c, [k]: v })
  }

  function puntuar(criterioId: string, valor: number) {
    const previos = c.puntajes ?? []
    const existente = previos.find((p) => p.criterioId === criterioId)
    // Volver a pulsar el mismo valor lo borra: permite deshacer sin recargar.
    const siguientes: PuntajeCriterio[] =
      existente?.valor === valor
        ? previos.filter((p) => p.criterioId !== criterioId)
        : existente
          ? previos.map((p) => (p.criterioId === criterioId ? { ...p, valor } : p))
          : [...previos, { criterioId, valor }]
    set('puntajes', siguientes)
  }

  return (
    <div className="rh-ficha">
      <header className="rh-ficha__cab">
        <div>
          <input
            className="field__input rh-ficha__nombre"
            value={c.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Nombre del candidato"
          />
          <span className="rh-ficha__cod">{c.codigo}</span>
        </div>
        <div className="rh-ficha__acc">
          <Button type="button" variant="ghost" onClick={onHoja} disabled={generandoHoja}>
            {generandoHoja ? <Loader2 size={15} className="spin" /> : <FileDown size={15} />} Hoja
          </Button>
          <Button type="button" variant="ghost" onClick={onBorrar}>
            <Trash2 size={15} /> Eliminar
          </Button>
        </div>
      </header>

      <div className="form-grid">
        <label className="field">
          <span className="field__label">Cargo al que aspira</span>
          <input
            className="field__input"
            value={c.cargo}
            onChange={(e) => set('cargo', e.target.value)}
            placeholder="Frontend junior, vendedor…"
          />
        </label>

        <div className="field">
          <span className="field__label">Estado</span>
          <Combobox
            opciones={ESTADOS_CANDIDATO.map((e) => ({
              valor: e.valor,
              etiqueta: e.etiqueta,
              color: e.color,
            }))}
            valor={c.estado}
            onCambio={(v) => set('estado', v as Candidato['estado'])}
            buscar={false}
          />
        </div>

        <label className="field">
          <span className="field__label">Cédula</span>
          <input
            className="field__input"
            value={c.cedula ?? ''}
            onChange={(e) => set('cedula', e.target.value)}
            placeholder="V-12345678"
          />
        </label>

        <label className="field">
          <span className="field__label">Teléfono</span>
          <input
            className="field__input"
            value={c.telefono ?? ''}
            onChange={(e) => set('telefono', e.target.value)}
            placeholder="0414-0000000"
          />
        </label>

        <label className="field">
          <span className="field__label">Correo</span>
          <input
            className="field__input"
            type="email"
            value={c.correo ?? ''}
            onChange={(e) => set('correo', e.target.value)}
          />
        </label>

        <label className="field">
          <span className="field__label">Ubicación</span>
          <input
            className="field__input"
            value={c.ubicacion ?? ''}
            onChange={(e) => set('ubicacion', e.target.value)}
            placeholder="Puerto Ordaz"
          />
        </label>

        <label className="field">
          <span className="field__label">
            Cómo llegó <span className="field__hint">(fuente)</span>
          </span>
          <input
            className="field__input"
            value={c.fuente ?? ''}
            onChange={(e) => set('fuente', e.target.value)}
            placeholder="Referido por…, anuncio, universidad"
          />
        </label>

        <label className="field">
          <span className="field__label">Pretensión salarial</span>
          <input
            className="field__input"
            value={c.pretension ?? ''}
            onChange={(e) => set('pretension', e.target.value)}
            placeholder="200 USD / mes"
          />
        </label>

        <div className="field">
          <span className="field__label">Plantilla de entrevista</span>
          <Combobox
            opciones={[
              { valor: '', etiqueta: 'Sin plantilla' },
              ...plantillas.map((p) => ({ valor: p.id, etiqueta: p.nombre })),
            ]}
            valor={c.plantillaId ?? ''}
            onCambio={(v) => set('plantillaId', v || undefined)}
          />
        </div>

        <div className="field">
          <span className="field__label">Entrevistó</span>
          <Combobox
            opciones={[
              { valor: '', etiqueta: 'Sin asignar' },
              ...colaboradores.map((x) => ({ valor: x.id, etiqueta: x.nombre })),
            ]}
            valor={c.entrevistadorId ?? ''}
            onCambio={(v) => set('entrevistadorId', v || undefined)}
          />
        </div>

        <label className="field">
          <span className="field__label">Fecha de la entrevista</span>
          <input
            className="field__input"
            type="date"
            value={c.entrevistadoEn?.slice(0, 10) ?? ''}
            onChange={(e) =>
              set('entrevistadoEn', e.target.value ? `${e.target.value}T12:00:00.000Z` : undefined)
            }
          />
        </label>
      </div>

      {/* Evaluación por criterios de la plantilla elegida. */}
      {plantilla && plantilla.criterios.length > 0 && (
        <section className="rh-eval">
          <header className="rh-eval__cab">
            <h3 className="rh-eval__tit">Evaluación</h3>
            <button
              type="button"
              className="rh-eval__ayuda"
              onClick={() => setVerEscala((v) => !v)}
              aria-expanded={verEscala}
            >
              ¿Qué significa cada número?
            </button>
            <span className="rh-eval__nota">
              {resultado.nota !== null ? (
                <>
                  <b>{resultado.nota}</b> / 5 · {lecturaNota(resultado.nota)}
                  <em>
                    {resultado.evaluados} de {resultado.total} criterios
                  </em>
                </>
              ) : (
                <em>Sin evaluar</em>
              )}
            </span>
          </header>

          {verEscala && (
            <ul className="rh-escala">
              {ESCALA.map((e) => (
                <li key={e.valor}>
                  <b>{e.valor}</b> {e.etiqueta} — {e.detalle}
                </li>
              ))}
            </ul>
          )}

          <ul className="rh-criterios">
            {plantilla.criterios.map((cr) => {
              const p = c.puntajes?.find((x) => x.criterioId === cr.id)
              return (
                <li className="rh-criterio" key={cr.id}>
                  <span className="rh-criterio__txt">
                    <b>{cr.nombre}</b>
                    {cr.descripcion && <em>{cr.descripcion}</em>}
                  </span>
                  <span className="rh-criterio__escala">
                    {ESCALA.map((e) => (
                      <button
                        type="button"
                        key={e.valor}
                        className={'rh-punto' + (p?.valor === e.valor ? ' is-on' : '')}
                        onClick={() => puntuar(cr.id, e.valor)}
                        title={`${e.valor} · ${e.etiqueta}: ${e.detalle}`}
                        aria-pressed={p?.valor === e.valor}
                      >
                        <Star size={13} fill={p && p.valor >= e.valor ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <label className="field">
        <span className="field__label">
          Notas de la entrevista <span className="field__hint">(lo que dijo, textual si aplica)</span>
        </span>
        <textarea
          className="field__input"
          rows={5}
          value={c.notas ?? ''}
          onChange={(e) => set('notas', e.target.value)}
          placeholder="Respuestas, señales de alerta, lo que destacó…"
        />
      </label>

      <label className="field">
        <span className="field__label">Conclusión</span>
        <textarea
          className="field__input"
          rows={2}
          value={c.conclusion ?? ''}
          onChange={(e) => set('conclusion', e.target.value)}
          placeholder="Recomendación: avanzar a prueba técnica / descartar por…"
        />
      </label>

      <div className="field">
        <span className="field__label">
          Currículum y documentos <span className="field__hint">(PDF o imágenes)</span>
        </span>
        <SubirAdjuntos
          etiqueta="Currículum, cédula, títulos…"
          adjuntos={c.adjuntos ?? []}
          onCambio={(a) => set('adjuntos', a.length ? a : undefined)}
        />
      </div>

      {/* La ficha de ingreso se llena al contratar, no al entrevistar: pedir
          cuenta bancaria o carga familiar a un candidato no corresponde. */}
      <section className="rh-ingreso">
        <header className="rh-ingreso__cab">
          <h3 className="rh-sec">
            Ficha de ingreso <em>datos para nómina y seguridad social</em>
          </h3>
          {!['oferta', 'contratado'].includes(c.estado) && (
            <span className="rh-ingreso__aviso">
              Normalmente se llena cuando la persona pasa a <b>oferta</b> o <b>contratado</b>.
            </span>
          )}
        </header>
        <FichaPersonalForm ficha={c.ficha} onCambio={(f) => set('ficha', f)} />
      </section>

      <div className="form-acciones">
        <Button type="button" onClick={() => onCambio(c)}>
          <Save size={15} /> Guardado
        </Button>
      </div>
    </div>
  )
}
