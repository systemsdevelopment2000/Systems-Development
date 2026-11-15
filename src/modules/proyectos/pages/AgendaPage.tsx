import '../styles/detalle.css'
import '../styles/agenda.css'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Plus,
  CalendarClock,
  Mic,
  FileText,
  Pencil,
  PlayCircle,
  ExternalLink,
  Eye,
} from 'lucide-react'
import { Combobox, Modal, useConfirmar } from '@/core/ui'
import { useAgenda, type ReunionAgenda } from '../hooks/useAgenda'
import { ReunionForm } from '../components/detalle/ReunionForm'
import { ReunionDetalle } from '../components/detalle/ReunionDetalle'
import type { NuevaReunion } from '../hooks/useProyectoDetalle'

export function AgendaPage() {
  const {
    proyectos,
    colaboradores,
    programadas,
    registradas,
    nombreColaborador,
    responsableCliente,
    agregar,
    editar,
    tomar,
  } = useAgenda()
  const nav = useNavigate()
  const ruta = useLocation()
  const confirmar = useConfirmar()
  const enMinuta = ruta.pathname.endsWith('/minuta')

  const [creando, setCreando] = useState(false)
  const [proyectoId, setProyectoId] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [verId, setVerId] = useState<string | null>(null)

  const viendo = verId ? [...programadas, ...registradas].find((r) => r.id === verId) : undefined

  const editando = editId
    ? [...programadas, ...registradas].find((r) => r.id === editId)
    : undefined

  function abrirCrear() {
    setEditId(null)
    setProyectoId(proyectos[0]?.id ?? '')
    setCreando(true)
  }
  function cerrar() {
    setCreando(false)
    setEditId(null)
  }
  function onCrear(datos: NuevaReunion) {
    if (!proyectoId) return
    agregar(proyectoId, datos)
    cerrar()
  }

  function tarjeta(r: ReunionAgenda, prog: boolean) {
    const externos = r.participantesExternos ?? []
    return (
      <article key={r.id} className={'ag-item' + (prog ? ' ag-item--prog' : '')}>
        <div className="ag-item__head">
          <div className="ag-item__id">
            <button className="ag-item__tit ag-item__tit--btn" onClick={() => setVerId(r.id)} title="Ver detalle">
              {prog ? <CalendarClock size={14} /> : r.origen === 'voz' ? <Mic size={13} /> : <FileText size={13} />}
              {r.titulo || 'Reunión'}
            </button>
            <button
              className="ag-proy"
              onClick={() => nav(`/proyectos/${r.proyectoId}`)}
              title="Ir al proyecto"
            >
              {r.proyectoNombre}
              {r.clienteNombre ? ` · ${r.clienteNombre}` : ''}
              <ExternalLink size={11} />
            </button>
          </div>

          <div className="ag-item__acc">
            <span className={'ag-fecha' + (prog ? ' ag-fecha--prog' : '')}>
              <em>{prog ? 'Agendada para' : 'Registrada'}</em>
              {prog
                ? new Date(r.fechaProgramada!).toLocaleString('es-VE', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : new Date(r.fecha).toLocaleString('es-VE', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
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
                  if (ok) tomar(r.id)
                }}
                title="Tomar ahora (antes de lo agendado)"
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
                setCreando(false)
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
          <span className="ag-item__creada">
            creada el {new Date(r.fecha).toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        )}

        {r.notas && <p className="ag-item__notas">{r.notas}</p>}

        {(r.participantes.length > 0 || externos.length > 0) && (
          <div className="ag-item__parts">
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
    <section className="page">
      <header className="page__header page__header--fila">
        <div>
          <h1 className="page__title">Reuniones</h1>
          <p className="page__subtitle">
            {programadas.length} agendada{programadas.length === 1 ? '' : 's'} ·{' '}
            {registradas.length} registrada{registradas.length === 1 ? '' : 's'} · todos los
            proyectos
          </p>
        </div>
        <div className="page__acciones">
          <div className="ag-tabs" role="tablist" aria-label="Reuniones">
            <button
              type="button"
              role="tab"
              aria-selected={!enMinuta}
              className={enMinuta ? '' : 'is-on'}
              onClick={() => nav('/reuniones')}
            >
              <CalendarClock size={14} /> Agenda
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={enMinuta}
              className={enMinuta ? 'is-on' : ''}
              onClick={() => nav('/reuniones/minuta')}
            >
              <FileText size={14} /> Minuta
            </button>
          </div>
          {!creando && !editId && (
            <button
              className="btn btn--primary btn--icono"
              onClick={abrirCrear}
              disabled={proyectos.length === 0}
            >
              <Plus size={16} /> Agendar reunión
            </button>
          )}
        </div>
      </header>

      {creando && (
        <div className="panel-form">
          <div className="field" style={{ marginBottom: 12 }}>
            <span className="field__label">Proyecto</span>
            <Combobox
              opciones={proyectos.map((p) => ({ valor: p.id, etiqueta: p.nombre }))}
              valor={proyectoId}
              onCambio={setProyectoId}
              placeholder="Selecciona proyecto…"
            />
          </div>
          <ReunionForm
            colaboradores={colaboradores}
            responsableCliente={proyectoId ? responsableCliente(proyectoId) : undefined}
            onGuardar={onCrear}
            onCancelar={cerrar}
          />
        </div>
      )}

      {editando && (
        <div className="panel-form">
          <p className="field__hint" style={{ marginBottom: 10 }}>
            {editando.proyectoNombre}
          </p>
          <ReunionForm
            colaboradores={colaboradores}
            responsableCliente={responsableCliente(editando.proyectoId)}
            inicial={editando}
            onGuardar={() => {}}
            onEditar={(r, motivo) => {
              editar(editando.id, r, motivo)
              cerrar()
            }}
            onCancelar={cerrar}
          />
        </div>
      )}

      {!creando && !editId && (
        <>
          {programadas.length === 0 && registradas.length === 0 && (
            <div className="vacio">
              <CalendarClock size={30} strokeWidth={1.5} />
              <p>Aún no hay reuniones. Agenda la primera.</p>
            </div>
          )}

          {programadas.length > 0 && (
            <div className="ag-grupo">
              <span className="ag-grupo__tit">
                <CalendarClock size={13} /> Próximas ({programadas.length})
              </span>
              <div className="ag-lista">{programadas.map((r) => tarjeta(r, true))}</div>
            </div>
          )}

          {registradas.length > 0 && (
            <div className="ag-grupo">
              <span className="ag-grupo__tit">Historial ({registradas.length})</span>
              <div className="ag-lista">{registradas.map((r) => tarjeta(r, false))}</div>
            </div>
          )}
        </>
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
            proyectoNombre={viendo.proyectoNombre}
            clienteNombre={viendo.clienteNombre}
            nombreColaborador={nombreColaborador}
            onEditar={() => {
              setVerId(null)
              setCreando(false)
              setEditId(viendo.id)
            }}
          />
        )}
      </Modal>
    </section>
  )
}
