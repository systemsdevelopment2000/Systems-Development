import { useEffect, useState } from 'react'
import { Plus, Mic, FileText, Pencil, CalendarClock, PlayCircle, Eye } from 'lucide-react'
import { Modal, useConfirmar } from '@/core/ui'
import type { Colaborador, Reunion } from '@/core/datos'
import { ReunionForm } from './ReunionForm'
import { ReunionDetalle } from './ReunionDetalle'
import type { NuevaReunion } from '../../hooks/useProyectoDetalle'

interface Props {
  reuniones: Reunion[]
  colaboradores: Colaborador[]
  responsableCliente?: string
  nombreColaborador: (id?: string) => string
  onAgregar: (r: NuevaReunion) => void
  onEditar: (id: string, r: NuevaReunion, motivo: string) => void
  onTomar: (id: string) => void
}

function avisado(id: string): boolean {
  try {
    return sessionStorage.getItem('sd-reunion-aviso-' + id) === '1'
  } catch {
    return false
  }
}
function marcarAvisado(id: string) {
  try {
    sessionStorage.setItem('sd-reunion-aviso-' + id, '1')
  } catch {
    /* no-op */
  }
}

export function TabReuniones({
  reuniones,
  colaboradores,
  responsableCliente,
  nombreColaborador,
  onAgregar,
  onEditar,
  onTomar,
}: Props) {
  const [form, setForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [verId, setVerId] = useState<string | null>(null)
  const confirmar = useConfirmar()

  const ahora = Date.now()
  const programadas = reuniones
    .filter((r) => r.fechaProgramada && new Date(r.fechaProgramada).getTime() > ahora)
    .sort((a, b) => new Date(a.fechaProgramada!).getTime() - new Date(b.fechaProgramada!).getTime())
  const registradas = reuniones
    .filter((r) => !(r.fechaProgramada && new Date(r.fechaProgramada).getTime() > ahora))
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  // Aviso de reuniones agendadas en las próximas 24 h (una vez por sesión).
  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    for (const r of programadas) {
      const t = new Date(r.fechaProgramada!).getTime()
      if (t - ahora <= 24 * 3600 * 1000 && !avisado(r.id)) {
        new Notification('Reunión próxima', {
          body: `${r.titulo || 'Reunión'} · ${new Date(r.fechaProgramada!).toLocaleString('es-VE', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}`,
        })
        marcarAvisado(r.id)
      }
    }
  }, [programadas, ahora])

  const editando = editId ? reuniones.find((r) => r.id === editId) : undefined
  const viendo = verId ? reuniones.find((r) => r.id === verId) : undefined

  function cerrar() {
    setForm(false)
    setEditId(null)
  }

  function tarjeta(r: Reunion, prog: boolean) {
    const externos = r.participantesExternos ?? []
    return (
      <article key={r.id} className={'rn-item' + (prog ? ' rn-item--prog' : '')}>
        <div className="rn-item__head">
          <button className="rn-item__tit rn-item__tit--btn" onClick={() => setVerId(r.id)} title="Ver detalle">
            {prog ? <CalendarClock size={13} /> : r.origen === 'voz' ? <Mic size={13} /> : <FileText size={13} />}
            {r.titulo || 'Reunión'}
          </button>
          <div className="rn-item__acc">
            <span className={'rn-item__fecha' + (prog ? ' rn-item__fecha--prog' : '')}>
              <em className="rn-fecha__lbl">{prog ? 'Agendada para' : 'Registrada'}</em>
              {prog
                ? new Date(r.fechaProgramada!).toLocaleString('es-VE', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : new Date(r.fecha).toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            {prog && (
              <button
                className="rn-tomar"
                onClick={async () => {
                  const ok = await confirmar({
                    titulo: `¿Tomar ahora "${r.titulo || 'Reunión'}"?`,
                    mensaje:
                      'Se registrará con la fecha y hora actuales en vez de la agendada, y quedará en el historial del proyecto.',
                    textoConfirmar: 'Tomar ahora',
                  })
                  if (ok) onTomar(r.id)
                }}
                title="Tomar la reunión ahora (antes de lo agendado)"
              >
                <PlayCircle size={14} /> Tomar ahora
              </button>
            )}
            <button
              className="icono-btn"
              onClick={() => setVerId(r.id)}
              aria-label="Ver reunión"
              title="Ver detalle (solo lectura)"
            >
              <Eye size={15} />
            </button>
            <button
              className="icono-btn"
              onClick={() => {
                setForm(false)
                setEditId(r.id)
              }}
              aria-label="Editar reunión"
              title="Editar (requiere motivo)"
            >
              <Pencil size={14} />
            </button>
          </div>
        </div>
        {prog && (
          <div className="rn-item__metaprog">
            <span className="rn-item__badge">Agendada</span>
            <span className="rn-item__creada">
              creada el{' '}
              {new Date(r.fecha).toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
        )}
        {r.notas && <p className="rn-item__notas">{r.notas}</p>}
        {r.audio && <audio className="rn-item__audio" src={r.audio} controls />}
        {r.adjuntos && r.adjuntos.length > 0 && (
          <div className="rn-item__adjs">
            {r.adjuntos.map((a) =>
              a.tipo.startsWith('image/') ? (
                <a key={a.id} className="rn-item__img" href={a.dataUrl} target="_blank" rel="noreferrer" title={a.nombre}>
                  <img src={a.dataUrl} alt={a.nombre} />
                </a>
              ) : (
                <a key={a.id} className="rn-item__pdf" href={a.dataUrl} target="_blank" rel="noreferrer" download={a.nombre}>
                  <FileText size={14} /> {a.nombre}
                </a>
              ),
            )}
          </div>
        )}
        {(r.participantes.length > 0 || externos.length > 0) && (
          <div className="rn-item__parts">
            {r.participantes.map((id) => (
              <span key={id} className="rn-part">
                {nombreColaborador(id)}
              </span>
            ))}
            {externos.map((n) => (
              <span key={n} className="rn-part rn-part--ext">
                {n}
              </span>
            ))}
          </div>
        )}
      </article>
    )
  }

  return (
    <div className="tab-sec">
      {!form && !editId && (
        <button className="btn btn--primary btn--icono" onClick={() => setForm(true)}>
          <Plus size={16} /> Nueva reunión
        </button>
      )}

      {form && (
        <div className="panel-form">
          <ReunionForm
            colaboradores={colaboradores}
            responsableCliente={responsableCliente}
            onGuardar={(r) => {
              onAgregar(r)
              cerrar()
            }}
            onCancelar={cerrar}
          />
        </div>
      )}

      {editando && (
        <div className="panel-form">
          <ReunionForm
            colaboradores={colaboradores}
            responsableCliente={responsableCliente}
            inicial={editando}
            onGuardar={() => {}}
            onEditar={(r, motivo) => {
              onEditar(editando.id, r, motivo)
              cerrar()
            }}
            onCancelar={cerrar}
          />
        </div>
      )}

      {reuniones.length === 0 && !form && !editId && (
        <p className="muted">Sin reuniones registradas todavía.</p>
      )}

      {programadas.length > 0 && !editId && (
        <div className="rn-grupo">
          <span className="rn-grupo__tit">
            <CalendarClock size={13} /> Programadas ({programadas.length})
          </span>
          <div className="rn-lista">{programadas.map((r) => tarjeta(r, true))}</div>
        </div>
      )}

      {registradas.length > 0 && !editId && (
        <div className="rn-grupo">
          {programadas.length > 0 && <span className="rn-grupo__tit">Registradas</span>}
          <div className="rn-lista">{registradas.map((r) => tarjeta(r, false))}</div>
        </div>
      )}

      <Modal
        abierto={!!viendo}
        onCerrar={() => setVerId(null)}
        titulo="Detalle de la reunión"
        ancho={620}
      >
        {viendo && (
          <ReunionDetalle
            reunion={viendo}
            nombreColaborador={nombreColaborador}
            onEditar={() => {
              setVerId(null)
              setForm(false)
              setEditId(viendo.id)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
