import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { X, ListPlus } from 'lucide-react'
import { Button, Combobox } from '@/core/ui'
import type {
  Actividad,
  Colaborador,
  EstadoActividad,
  Prioridad,
  Proyecto,
} from '@/core/datos'
import { COLUMNAS } from '../columnas'
import { PRIORIDADES, PRIO_LABEL } from '../lib/vista'
import type { BaseActividad, EntradaActividad } from '../hooks/useTablero'
import { SelectorResponsables } from './SelectorResponsables'

interface Props {
  inicial?: Actividad
  estadoInicial?: EstadoActividad
  proyectoInicialId?: string
  proyectos: Proyecto[]
  colaboradores: Colaborador[]
  onEditar: (datos: EntradaActividad) => void
  onCrear: (titulos: string[], base: BaseActividad) => void
  onCancelar: () => void
}

export function TareaForm({
  inicial,
  estadoInicial = 'backlog',
  proyectoInicialId,
  proyectos,
  colaboradores,
  onEditar,
  onCrear,
  onCancelar,
}: Props) {
  const esEdicion = !!inicial
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [titulos, setTitulos] = useState('') // crear: una tarea por línea
  const [proyectoId, setProyectoId] = useState(
    inicial?.proyectoId ?? proyectoInicialId ?? proyectos[0]?.id ?? '',
  )
  const [estado, setEstado] = useState<EstadoActividad>(inicial?.estado ?? estadoInicial)
  const [prioridad, setPrioridad] = useState<Prioridad>(inicial?.prioridad ?? 'media')
  const [responsables, setResponsables] = useState<string[]>(inicial?.responsables ?? [])
  const [etiquetas, setEtiquetas] = useState<string[]>(inicial?.etiquetas ?? [])
  const [etqInput, setEtqInput] = useState('')
  const [vence, setVence] = useState(inicial?.vence ?? '')
  const [instrucciones, setInstrucciones] = useState(inicial?.instrucciones ?? '')
  const [creadorId, setCreadorId] = useState(inicial?.creadorId ?? colaboradores[0]?.id ?? '')
  const [requiereAprobacion, setRequiereAprobacion] = useState(!!inicial?.requiereAprobacion)
  // Una aprobación sin fase ni responsable no se puede exigir: por defecto
  // traba la revisión y la firma quien asigna.
  const [apruebaEn, setApruebaEn] = useState<EstadoActividad>(inicial?.apruebaEn ?? 'revision')
  const [aprobadorId, setAprobadorId] = useState(inicial?.aprobadorId ?? '')
  const [error, setError] = useState<string | null>(null)

  /** Una tarea por línea no vacía. */
  const lineas = titulos
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean)
  const nLineas = lineas.length

  function agregarEtiqueta() {
    const v = etqInput.trim().toLowerCase()
    if (v && !etiquetas.includes(v)) setEtiquetas([...etiquetas, v])
    setEtqInput('')
  }
  function etqKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      agregarEtiqueta()
    } else if (e.key === 'Backspace' && !etqInput && etiquetas.length) {
      setEtiquetas(etiquetas.slice(0, -1))
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!proyectoId) {
      setError('Selecciona un proyecto para la tarea.')
      return
    }

    if (esEdicion) {
      if (!titulo.trim()) {
        setError('El título no puede estar vacío.')
        return
      }
      onEditar({
        ...inicial!,
        titulo: titulo.trim(),
        proyectoId,
        estado,
        prioridad,
        responsables,
        etiquetas,
        vence: vence || undefined,
        instrucciones: instrucciones.trim() || undefined,
        creadorId: creadorId || undefined,
        requiereAprobacion: requiereAprobacion || undefined,
        apruebaEn: requiereAprobacion ? apruebaEn : undefined,
        aprobadorId: requiereAprobacion ? aprobadorId || creadorId || undefined : undefined,
      })
      return
    }

    const lista = titulos
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
    if (lista.length === 0) {
      setError('Escribe al menos un título (una tarea por línea).')
      return
    }
    const base: BaseActividad = {
      proyectoId,
      estado,
      prioridad,
      responsables,
      etiquetas,
      vence: vence || undefined,
      instrucciones: instrucciones.trim() || undefined,
      creadorId: creadorId || undefined,
      requiereAprobacion: requiereAprobacion || undefined,
      apruebaEn: requiereAprobacion ? apruebaEn : undefined,
      aprobadorId: requiereAprobacion ? aprobadorId || creadorId || undefined : undefined,
    }
    onCrear(lista, base)
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <label className="field form-grid__full">
        <span className="field__label">
          {esEdicion ? 'Título' : 'Tareas'}
          {!esEdicion && (
            <span className="tf-contador">
              <ListPlus size={13} />
              {nLineas === 0
                ? 'Escribe una tarea por línea'
                : nLineas === 1
                  ? '1 tarea'
                  : `${nLineas} tareas`}
            </span>
          )}
        </span>
        {esEdicion ? (
          <input
            className="field__input"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título de la tarea"
            autoFocus
          />
        ) : (
          <>
            <textarea
              className="field__input tf-area"
              rows={4}
              value={titulos}
              onChange={(e) => setTitulos(e.target.value)}
              placeholder={'Endpoint de pagos\nPantalla de login\nPruebas e2e'}
              autoFocus
            />
            <span className="field__hint">
              Cada salto de línea (Enter) crea una tarea distinta; todas comparten proyecto,
              columna, prioridad y responsables.
            </span>
            {nLineas > 0 && (
              <ol className="tf-previa">
                {lineas.map((t, i) => (
                  <li key={`${t}-${i}`}>
                    <span className="tf-num">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </label>

      <div className="field">
        <span className="field__label">Proyecto</span>
        <Combobox
          opciones={proyectos.map((p) => ({ valor: p.id, etiqueta: p.nombre }))}
          valor={proyectoId}
          onCambio={setProyectoId}
          placeholder="Selecciona proyecto…"
        />
      </div>

      <div className="field">
        <span className="field__label">Columna</span>
        <Combobox
          opciones={COLUMNAS.map((c) => ({ valor: c.id, etiqueta: c.titulo }))}
          valor={estado}
          onCambio={(v) => setEstado(v as EstadoActividad)}
          buscar={false}
        />
      </div>

      <div className="field">
        <span className="field__label">Prioridad</span>
        <Combobox
          opciones={PRIORIDADES.map((p) => ({ valor: p, etiqueta: PRIO_LABEL[p] }))}
          valor={prioridad}
          onCambio={(v) => setPrioridad(v as Prioridad)}
          buscar={false}
        />
      </div>

      <label className="field">
        <span className="field__label">
          Vence <span className="field__hint">(opcional)</span>
        </span>
        <input
          className="field__input"
          type="date"
          value={vence}
          onChange={(e) => setVence(e.target.value)}
        />
      </label>

      <div className="field">
        <span className="field__label">Asignada por</span>
        <Combobox
          opciones={colaboradores.map((c) => ({ valor: c.id, etiqueta: c.nombre }))}
          valor={creadorId}
          onCambio={setCreadorId}
          placeholder="¿Quién asigna?"
        />
      </div>

      <div className="field" style={{ justifyContent: 'flex-end' }}>
        <label className="toggle" title="Casos excepcionales: necesita visto bueno para avanzar">
          <input
            type="checkbox"
            checked={requiereAprobacion}
            onChange={(e) => setRequiereAprobacion(e.target.checked)}
          />
          <span className="toggle__sw" />
          <span className="toggle__txt">Requiere aprobación</span>
        </label>
      </div>

      {/* Una aprobación sin fase ni responsable no se puede exigir: aquí se
          dice en qué columna se traba y quién firma. */}
      {requiereAprobacion && (
        <div className="aprob form-grid__full">
          <div className="field">
            <span className="field__label">
              No sale de <span className="field__hint">se traba en esta fase</span>
            </span>
            <Combobox
              opciones={COLUMNAS.map((c) => ({
                valor: c.id,
                etiqueta: c.titulo,
                color: c.acento,
              }))}
              valor={apruebaEn}
              onCambio={(v) => setApruebaEn(v as EstadoActividad)}
              buscar={false}
            />
          </div>

          <div className="field">
            <span className="field__label">
              Aprueba <span className="field__hint">quien da el visto bueno</span>
            </span>
            <Combobox
              opciones={colaboradores.map((c) => ({ valor: c.id, etiqueta: c.nombre }))}
              valor={aprobadorId || creadorId}
              onCambio={setAprobadorId}
              placeholder="¿Quién firma?"
            />
          </div>

          <p className="aprob__nota">
            Llega hasta <b>{COLUMNAS.find((c) => c.id === apruebaEn)?.titulo}</b> sin trabas, pero
            no avanza de ahí hasta que{' '}
            <b>
              {colaboradores.find((c) => c.id === (aprobadorId || creadorId))?.nombre ?? 'el aprobador'}
            </b>{' '}
            la apruebe. Es una sola fase, no todas.
          </p>
        </div>
      )}

      <div className="field form-grid__full">
        <span className="field__label">
          Responsables <span className="field__hint">({responsables.length} · admite varios)</span>
        </span>
        <SelectorResponsables
          colaboradores={colaboradores}
          seleccion={responsables}
          onCambio={setResponsables}
        />
      </div>

      <div className="field form-grid__full">
        <span className="field__label">Etiquetas</span>
        <div className="tagsel__chips" onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}>
          {etiquetas.map((t) => (
            <span key={t} className="tagsel__chip">
              {t}
              <button type="button" onClick={() => setEtiquetas(etiquetas.filter((x) => x !== t))} aria-label={`Quitar ${t}`}>
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            className="tagsel__input"
            value={etqInput}
            onChange={(e) => setEtqInput(e.target.value)}
            onKeyDown={etqKey}
            onBlur={agregarEtiqueta}
            placeholder={etiquetas.length ? '' : 'Escribe y Enter…'}
          />
        </div>
      </div>

      <label className="field form-grid__full">
        <span className="field__label">
          Instrucciones <span className="field__hint">(opcional)</span>
        </span>
        <textarea
          className="field__input"
          rows={3}
          value={instrucciones}
          onChange={(e) => setInstrucciones(e.target.value)}
          placeholder="Detalles, criterios de aceptación, contexto…"
        />
      </label>

      {error && (
        <p className="form__error form-grid__full" role="alert">
          {error}
        </p>
      )}

      <div className="form-grid__full form-acciones">
        <Button type="button" variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">
          {esEdicion ? 'Guardar cambios' : nLineas > 1 ? `Crear ${nLineas} tareas` : 'Crear tarea'}
        </Button>
      </div>
    </form>
  )
}
