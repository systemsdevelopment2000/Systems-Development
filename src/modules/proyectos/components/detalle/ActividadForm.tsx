import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Plus, X, ExternalLink, ImagePlus } from 'lucide-react'
import { Button, Combobox } from '@/core/ui'
import { aDataUrl } from '@/core/lib/imagen'
import type { Actividad, Colaborador, EstadoActividad, Prioridad } from '@/core/datos'
import type { EntradaActividad } from '../../hooks/useProyectoDetalle'

const ESTADOS: { id: EstadoActividad; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'por_hacer', label: 'Por hacer' },
  { id: 'en_curso', label: 'En curso' },
  { id: 'revision', label: 'Revisión' },
  { id: 'hecho', label: 'Hecho' },
]
const PRIORIDADES: Prioridad[] = ['baja', 'media', 'alta', 'critica']

interface Props {
  inicial?: Actividad
  colaboradores: Colaborador[]
  estadoInicial?: EstadoActividad
  onGuardar: (datos: EntradaActividad) => void
  onCancelar: () => void
}

export function ActividadForm({ inicial, colaboradores, estadoInicial, onGuardar, onCancelar }: Props) {
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [estadoAct, setEstadoAct] = useState<EstadoActividad>(
    inicial?.estado ?? estadoInicial ?? 'backlog',
  )
  const [prioridad, setPrioridad] = useState<Prioridad>(inicial?.prioridad ?? 'media')
  const [responsables, setResponsables] = useState<string[]>(inicial?.responsables ?? [])
  const [etiquetas, setEtiquetas] = useState(inicial?.etiquetas.join(', ') ?? '')
  const [total, setTotal] = useState(inicial?.checklist?.total ?? 0)
  const [hechos, setHechos] = useState(inicial?.checklist?.hechos ?? 0)
  const [instrucciones, setInstrucciones] = useState(inicial?.instrucciones ?? '')
  const [enlaces, setEnlaces] = useState<string[]>(inicial?.enlaces ?? [])
  const [imagenes, setImagenes] = useState<string[]>(inicial?.imagenes ?? [])
  const fileRef = useRef<HTMLInputElement>(null)

  function toggleResp(id: string) {
    setResponsables((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }
  async function onImagenes(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const urls = await Promise.all(files.map((f) => aDataUrl(f)))
    setImagenes((prev) => [...prev, ...urls])
    e.target.value = ''
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const etqs = etiquetas
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onGuardar({
      id: inicial?.id,
      titulo: titulo.trim(),
      estado: estadoAct,
      prioridad,
      responsables,
      etiquetas: etqs,
      checklist: total > 0 ? { total, hechos: Math.min(hechos, total) } : undefined,
      instrucciones: instrucciones.trim() || undefined,
      enlaces: enlaces.map((x) => x.trim()).filter(Boolean),
      imagenes,
    })
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <label className="field form-grid__full">
        <span className="field__label">Título</span>
        <input
          className="field__input"
          required
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Diseñar pantalla de login"
        />
      </label>

      <div className="field">
        <span className="field__label">Estado</span>
        <Combobox
          opciones={ESTADOS.map((e) => ({ valor: e.id, etiqueta: e.label }))}
          valor={estadoAct}
          onCambio={(v) => setEstadoAct(v as EstadoActividad)}
          buscar={false}
        />
      </div>

      <div className="field">
        <span className="field__label">Prioridad</span>
        <Combobox
          opciones={PRIORIDADES.map((pr) => ({ valor: pr, etiqueta: pr }))}
          valor={prioridad}
          onCambio={(v) => setPrioridad(v as Prioridad)}
          buscar={false}
        />
      </div>

      <label className="field form-grid__full">
        <span className="field__label">
          Etiquetas <span className="field__hint">(separadas por coma)</span>
        </span>
        <input
          className="field__input"
          value={etiquetas}
          onChange={(e) => setEtiquetas(e.target.value)}
          placeholder="frontend, ui"
        />
      </label>

      <div className="field form-grid__full">
        <span className="field__label">Responsables</span>
        <div className="chips-sel">
          {colaboradores.map((c) => (
            <button
              type="button"
              key={c.id}
              className={'chip-sel' + (responsables.includes(c.id) ? ' is-on' : '')}
              onClick={() => toggleResp(c.id)}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      <label className="field form-grid__full">
        <span className="field__label">Instrucciones</span>
        <textarea
          className="field__input"
          rows={3}
          value={instrucciones}
          onChange={(e) => setInstrucciones(e.target.value)}
          placeholder="Detalles, pasos, contexto de la tarea…"
        />
      </label>

      <div className="field form-grid__full">
        <span className="field__label">Enlaces de referencia</span>
        <div className="act-enlaces">
          {enlaces.map((en, i) => (
            <div className="act-enlace" key={i}>
              <input
                className="field__input"
                value={en}
                onChange={(e) =>
                  setEnlaces((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))
                }
                placeholder="https://…"
              />
              {en.trim() && (
                <a
                  className="icono-btn"
                  href={en}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Abrir enlace"
                >
                  <ExternalLink size={14} />
                </a>
              )}
              <button
                type="button"
                className="icono-btn icono-btn--peligro"
                onClick={() => setEnlaces((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label="Quitar enlace"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="act-add-link"
            onClick={() => setEnlaces((prev) => [...prev, ''])}
          >
            <Plus size={14} /> Añadir enlace
          </button>
        </div>
      </div>

      <div className="field form-grid__full">
        <span className="field__label">Imágenes / archivos de referencia</span>
        <div className="act-imgs">
          {imagenes.map((img, i) => (
            <div className="act-img" key={i}>
              <a href={img} target="_blank" rel="noreferrer">
                <img src={img} alt="" />
              </a>
              <button
                type="button"
                className="act-img__x"
                onClick={() => setImagenes((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label="Quitar imagen"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button type="button" className="act-img-add" onClick={() => fileRef.current?.click()}>
            <ImagePlus size={18} />
            <span>Subir</span>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onImagenes} />
      </div>

      <label className="field">
        <span className="field__label">Checklist: total</span>
        <input
          className="field__input"
          type="number"
          min={0}
          value={total}
          onChange={(e) => setTotal(Number(e.target.value))}
        />
      </label>
      <label className="field">
        <span className="field__label">Checklist: hechos</span>
        <input
          className="field__input"
          type="number"
          min={0}
          max={total}
          value={hechos}
          onChange={(e) => setHechos(Number(e.target.value))}
        />
      </label>

      <div className="form-grid__full form-acciones">
        <Button type="button" variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">{inicial ? 'Guardar' : 'Crear actividad'}</Button>
      </div>
    </form>
  )
}
