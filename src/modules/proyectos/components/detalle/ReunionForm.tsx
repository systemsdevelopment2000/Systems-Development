import { useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import {
  Mic,
  MicOff,
  Disc,
  Square,
  Trash2,
  Paperclip,
  FileText,
  X,
  CalendarClock,
  UserPlus,
} from 'lucide-react'
import { Button } from '@/core/ui'
import { useDictado } from '@/core/hooks/useDictado'
import { useGrabadora } from '@/core/hooks/useGrabadora'
import { aDataUrl, archivoADataUrl } from '@/core/lib/imagen'
import { nuevoId, type Adjunto, type Colaborador, type Reunion } from '@/core/datos'
import type { NuevaReunion } from '../../hooks/useProyectoDetalle'

const MAX_MB = 4

interface Props {
  colaboradores: Colaborador[]
  /** Contacto del cliente (dueño/enlace) para añadir con un clic. */
  responsableCliente?: string
  /** Reunión a editar (si se omite, es creación). */
  inicial?: Reunion
  onGuardar: (r: NuevaReunion) => void
  onEditar?: (r: NuevaReunion, motivo: string) => void
  onCancelar: () => void
}

/** ISO → valor de <input type="datetime-local"> en hora local. */
function aLocalInput(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16)
}

export function ReunionForm({
  colaboradores,
  responsableCliente,
  inicial,
  onGuardar,
  onEditar,
  onCancelar,
}: Props) {
  const esEdicion = !!inicial
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [notas, setNotas] = useState(inicial?.notas ?? '')
  const [participantes, setParticipantes] = useState<string[]>(inicial?.participantes ?? [])
  const [externos, setExternos] = useState<string[]>(inicial?.participantesExternos ?? [])
  const [extInput, setExtInput] = useState('')
  const [audio, setAudio] = useState<string | undefined>(inicial?.audio)
  const [adjuntos, setAdjuntos] = useState<Adjunto[]>(inicial?.adjuntos ?? [])
  const [usoVoz, setUsoVoz] = useState(false)
  const [programar, setProgramar] = useState(!!inicial?.fechaProgramada)
  const [fechaProgramada, setFechaProgramada] = useState(aLocalInput(inicial?.fechaProgramada))
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const dictado = useDictado((txt) => {
    setNotas((prev) => (prev ? prev + ' ' : '') + txt)
    setUsoVoz(true)
  })
  const grab = useGrabadora((dataUrl) => {
    setAudio(dataUrl)
    setUsoVoz(true)
  })

  function toggleP(id: string) {
    setParticipantes((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }
  function agregarExterno(nombre: string) {
    const v = nombre.trim()
    if (v && !externos.includes(v)) setExternos((prev) => [...prev, v])
    setExtInput('')
  }
  function extKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      agregarExterno(extInput)
    } else if (e.key === 'Backspace' && !extInput && externos.length) {
      setExternos((prev) => prev.slice(0, -1))
    }
  }

  async function onArchivos(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    setError(null)
    const nuevos: Adjunto[] = []
    for (const f of files) {
      const esImg = f.type.startsWith('image/')
      const esPdf = f.type === 'application/pdf'
      if (!esImg && !esPdf) {
        setError('Solo se admiten imágenes o PDF.')
        continue
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        setError(`"${f.name}" supera ${MAX_MB} MB.`)
        continue
      }
      try {
        const dataUrl = esImg ? await aDataUrl(f, 1280) : await archivoADataUrl(f)
        nuevos.push({
          id: nuevoId(),
          nombre: f.name,
          tipo: esImg ? 'image/webp' : 'application/pdf',
          dataUrl,
        })
      } catch {
        setError(`No se pudo leer "${f.name}".`)
      }
    }
    if (nuevos.length) setAdjuntos((prev) => [...prev, ...nuevos])
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (programar && !fechaProgramada) {
      setError('Indica la fecha y hora de la reunión agendada.')
      return
    }
    if (!titulo.trim() && !notas.trim() && !audio && adjuntos.length === 0 && !programar) {
      setError('Agrega al menos un título, notas, una nota de voz, un adjunto o una fecha agendada.')
      return
    }
    if (esEdicion && !motivo.trim()) {
      setError('Para editar una reunión guardada, indica el motivo del cambio.')
      return
    }
    const datos: NuevaReunion = {
      titulo: titulo.trim() || undefined,
      notas: notas.trim(),
      origen: usoVoz ? 'voz' : 'escrita',
      participantes,
      audio,
      adjuntos: adjuntos.length ? adjuntos : undefined,
      participantesExternos: externos.length ? externos : undefined,
      fechaProgramada: programar && fechaProgramada ? new Date(fechaProgramada).toISOString() : undefined,
    }
    if (esEdicion) onEditar?.(datos, motivo.trim())
    else onGuardar(datos)
  }

  const yaEsExterno = responsableCliente ? externos.includes(responsableCliente) : true

  return (
    <form className="rn-form" onSubmit={submit}>
      <input
        className="field__input"
        placeholder="Título de la reunión (opcional)"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />

      <textarea
        className="field__input"
        rows={4}
        placeholder="Notas de la reunión… o dicta por voz."
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
      />

      <div className="rn-voz">
        {dictado.soportado ? (
          <button
            type="button"
            className={'rn-vbtn' + (dictado.escuchando ? ' is-on' : '')}
            onClick={dictado.alternar}
          >
            {dictado.escuchando ? <MicOff size={14} /> : <Mic size={14} />}
            {dictado.escuchando ? 'Detener dictado' : 'Dictar'}
          </button>
        ) : (
          <span className="field__hint">Dictado no disponible en este navegador.</span>
        )}
        {grab.soportado && (
          <button
            type="button"
            className={'rn-vbtn' + (grab.grabando ? ' is-rec' : '')}
            onClick={grab.alternar}
          >
            {grab.grabando ? <Square size={13} /> : <Disc size={14} />}
            {grab.grabando ? 'Detener' : 'Nota de voz'}
          </button>
        )}
        <button type="button" className="rn-vbtn" onClick={() => fileRef.current?.click()}>
          <Paperclip size={14} /> Imagen o PDF
        </button>
        <button
          type="button"
          className={'rn-vbtn' + (programar ? ' is-on' : '')}
          onClick={() => setProgramar((v) => !v)}
        >
          <CalendarClock size={14} /> {programar ? 'Quitar agenda' : 'Agendar'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          hidden
          onChange={onArchivos}
        />
      </div>

      {programar && (
        <label className="field">
          <span className="field__label">Fecha y hora de la reunión</span>
          <input
            className="field__input"
            type="datetime-local"
            value={fechaProgramada}
            onChange={(e) => setFechaProgramada(e.target.value)}
          />
          <span className="field__hint">Se registrará en el historial y avisará cuando se acerque.</span>
        </label>
      )}

      {audio && (
        <div className="rn-audio">
          <audio src={audio} controls />
          <button
            type="button"
            className="icono-btn icono-btn--peligro"
            onClick={() => setAudio(undefined)}
            aria-label="Quitar nota de voz"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {adjuntos.length > 0 && (
        <div className="rn-adjs">
          {adjuntos.map((a) =>
            a.tipo.startsWith('image/') ? (
              <div key={a.id} className="rn-adj rn-adj--img">
                <img src={a.dataUrl} alt={a.nombre} />
                <button type="button" onClick={() => setAdjuntos((p) => p.filter((x) => x.id !== a.id))} aria-label="Quitar">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div key={a.id} className="rn-adj rn-adj--pdf">
                <FileText size={16} />
                <span className="rn-adj__nom">{a.nombre}</span>
                <button type="button" onClick={() => setAdjuntos((p) => p.filter((x) => x.id !== a.id))} aria-label="Quitar">
                  <X size={12} />
                </button>
              </div>
            ),
          )}
        </div>
      )}

      <div>
        <span className="field__label">Participantes de SD</span>
        <div className="chips-sel">
          {colaboradores.map((c) => (
            <button
              type="button"
              key={c.id}
              className={'chip-sel' + (participantes.includes(c.id) ? ' is-on' : '')}
              onClick={() => toggleP(c.id)}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="field__label">
          Externos <span className="field__hint">(dueño, secretaria, abogado, asesor…)</span>
        </span>
        <div className="tagsel__chips" onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}>
          {externos.map((n) => (
            <span key={n} className="tagsel__chip">
              {n}
              <button type="button" onClick={() => setExternos((p) => p.filter((x) => x !== n))} aria-label={`Quitar ${n}`}>
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            className="tagsel__input"
            value={extInput}
            onChange={(e) => setExtInput(e.target.value)}
            onKeyDown={extKey}
            onBlur={() => agregarExterno(extInput)}
            placeholder={externos.length ? '' : 'Nombre y Enter…'}
          />
        </div>
        {responsableCliente && !yaEsExterno && (
          <button type="button" className="rn-vbtn rn-addresp" onClick={() => agregarExterno(responsableCliente)}>
            <UserPlus size={13} /> Añadir contacto del cliente: {responsableCliente}
          </button>
        )}
      </div>

      {esEdicion && (
        <label className="field">
          <span className="field__label">Motivo del cambio</span>
          <input
            className="field__input"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Por qué se edita (queda en el historial)"
          />
        </label>
      )}

      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}

      <div className="form-acciones">
        <Button type="button" variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">{esEdicion ? 'Guardar cambios' : programar ? 'Agendar reunión' : 'Guardar reunión'}</Button>
      </div>
    </form>
  )
}
