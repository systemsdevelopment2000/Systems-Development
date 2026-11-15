import { Plus, Trash2, FileText, Loader2, GripVertical } from 'lucide-react'
import { Button } from '@/core/ui'
import { nuevoId, type PlantillaEntrevista } from '@/core/datos'

interface Props {
  plantilla: PlantillaEntrevista
  onCambio: (p: PlantillaEntrevista) => void
  onBorrar: () => void
  onImprimir: () => void
  generando?: boolean
}

/**
 * Editor de una plantilla de entrevista: qué se pregunta y qué se evalúa.
 *
 * Cada criterio lleva una descripción de qué mide y un peso. Sin la
 * descripción, dos entrevistadores puntúan cosas distintas con el mismo
 * número; sin el peso, "responsabilidad" vale lo mismo que "trato", y no es
 * así para todos los cargos.
 */
export function EditorPlantilla({ plantilla: p, onCambio, onBorrar, onImprimir, generando }: Props) {
  function set<K extends keyof PlantillaEntrevista>(k: K, v: PlantillaEntrevista[K]) {
    onCambio({ ...p, [k]: v })
  }

  function setBloque(id: string, cambios: Partial<PlantillaEntrevista['bloques'][number]>) {
    set(
      'bloques',
      p.bloques.map((b) => (b.id === id ? { ...b, ...cambios } : b)),
    )
  }

  function setPregunta(bloqueId: string, i: number, texto: string) {
    const b = p.bloques.find((x) => x.id === bloqueId)
    if (!b) return
    const preguntas = [...b.preguntas]
    preguntas[i] = texto
    setBloque(bloqueId, { preguntas })
  }

  function setCriterio(id: string, cambios: Partial<PlantillaEntrevista['criterios'][number]>) {
    set(
      'criterios',
      p.criterios.map((c) => (c.id === id ? { ...c, ...cambios } : c)),
    )
  }

  const totalPreguntas = p.bloques.reduce((s, b) => s + b.preguntas.filter(Boolean).length, 0)

  return (
    <div className="rh-editor">
      <header className="rh-ficha__cab">
        <div className="rh-editor__ident">
          <input
            className="field__input rh-ficha__nombre"
            value={p.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Nombre de la plantilla"
          />
          <input
            className="field__input rh-editor__cargo"
            value={p.cargo}
            onChange={(e) => set('cargo', e.target.value)}
            placeholder="Cargo al que apunta"
          />
        </div>
        <div className="rh-ficha__acc">
          <Button type="button" variant="ghost" onClick={onImprimir} disabled={generando}>
            {generando ? <Loader2 size={15} className="spin" /> : <FileText size={15} />} Hoja en
            blanco
          </Button>
          <Button type="button" variant="ghost" onClick={onBorrar}>
            <Trash2 size={15} /> Eliminar
          </Button>
        </div>
      </header>

      <label className="field">
        <span className="field__label">Cuándo usarla</span>
        <input
          className="field__input"
          value={p.descripcion ?? ''}
          onChange={(e) => set('descripcion', e.target.value)}
          placeholder="Para perfiles de programación, junior o semi senior…"
        />
      </label>

      <h3 className="rh-sec">
        Preguntas <em>{totalPreguntas} en total</em>
      </h3>

      {p.bloques.map((b) => (
        <section className="rh-bloque" key={b.id}>
          <header className="rh-bloque__cab">
            <GripVertical size={14} className="rh-bloque__asa" aria-hidden="true" />
            <input
              className="field__input rh-bloque__tit"
              value={b.titulo}
              onChange={(e) => setBloque(b.id, { titulo: e.target.value })}
              placeholder="Título del bloque"
            />
            <button
              type="button"
              className="icono-btn icono-btn--peligro"
              onClick={() => set('bloques', p.bloques.filter((x) => x.id !== b.id))}
              aria-label={`Eliminar el bloque ${b.titulo}`}
            >
              <Trash2 size={14} />
            </button>
          </header>

          {b.preguntas.map((q, i) => (
            <div className="rh-preg" key={i}>
              <span className="rh-preg__n">{i + 1}</span>
              <input
                className="field__input"
                value={q}
                onChange={(e) => setPregunta(b.id, i, e.target.value)}
                placeholder="¿Qué le preguntas?"
              />
              <button
                type="button"
                className="icono-btn icono-btn--peligro"
                onClick={() =>
                  setBloque(b.id, { preguntas: b.preguntas.filter((_, j) => j !== i) })
                }
                aria-label={`Eliminar la pregunta ${i + 1}`}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          <button
            type="button"
            className="rh-sumar"
            onClick={() => setBloque(b.id, { preguntas: [...b.preguntas, ''] })}
          >
            <Plus size={13} /> Añadir pregunta
          </button>
        </section>
      ))}

      <Button
        type="button"
        variant="ghost"
        onClick={() =>
          set('bloques', [
            ...p.bloques,
            { id: nuevoId(), titulo: `Bloque ${p.bloques.length + 1}`, preguntas: [''] },
          ])
        }
      >
        <Plus size={15} /> Añadir bloque
      </Button>

      <h3 className="rh-sec">
        Criterios de evaluación <em>qué se puntúa del 1 al 5</em>
      </h3>

      <div className="rh-crit-ed">
        <div className="rh-crit-ed__th">
          <span>Criterio</span>
          <span>Qué mide</span>
          <span>Peso</span>
          <span />
        </div>
        {p.criterios.map((c) => (
          <div className="rh-crit-ed__tr" key={c.id}>
            <input
              className="field__input"
              value={c.nombre}
              onChange={(e) => setCriterio(c.id, { nombre: e.target.value })}
              placeholder="Comunicación"
            />
            <input
              className="field__input"
              value={c.descripcion ?? ''}
              onChange={(e) => setCriterio(c.id, { descripcion: e.target.value })}
              placeholder="Explica lo que hizo de forma que se entienda"
            />
            <input
              className="field__input"
              type="number"
              min={0.5}
              max={3}
              step={0.5}
              value={c.peso}
              onChange={(e) => setCriterio(c.id, { peso: Number(e.target.value) })}
            />
            <button
              type="button"
              className="icono-btn icono-btn--peligro"
              onClick={() => set('criterios', p.criterios.filter((x) => x.id !== c.id))}
              aria-label={`Eliminar el criterio ${c.nombre}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={() =>
          set('criterios', [...p.criterios, { id: nuevoId(), nombre: '', peso: 1 }])
        }
      >
        <Plus size={15} /> Añadir criterio
      </Button>
    </div>
  )
}
