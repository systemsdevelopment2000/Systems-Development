import { useState } from 'react'
import { Pencil, Trash2, CalendarDays, Link2, ListChecks, Lock, ShieldCheck, UserRound } from 'lucide-react'
import { Button, Combobox } from '@/core/ui'
import type { Actividad, Colaborador, Proyecto } from '@/core/datos'
import { COLUMNAS } from '../columnas'
import { PRIO_LABEL, colorDe, fechaCorta, iniciales } from '../lib/vista'

interface Props {
  tarea: Actividad
  proyecto?: Proyecto
  responsables: Colaborador[]
  onEditar: () => void
  onBorrar: () => void
  /** Cambio rápido de estado sin abrir el formulario. */
  onEstado: (estado: Actividad['estado']) => void
  /** Nombre de quien asignó la tarea. */
  creador?: string
  /** Nombre de quien aprobó (si ya está aprobada). */
  aprobador?: string
  /** Colaboradores que pueden dar el visto bueno. */
  aprobadores: Colaborador[]
  onAprobar: (aprobadorId: string) => void
}

export function TareaDetalle({
  tarea,
  proyecto,
  responsables,
  onEditar,
  onBorrar,
  onEstado,
  creador,
  aprobador,
  aprobadores,
  onAprobar,
}: Props) {
  const columna = COLUMNAS.find((c) => c.id === tarea.estado)
  const pendiente = !!tarea.requiereAprobacion && !tarea.aprobadaPor
  const fase = COLUMNAS.find((c) => c.id === (tarea.apruebaEn ?? 'revision'))
  const designado = tarea.aprobadorId
    ? aprobadores.find((c) => c.id === tarea.aprobadorId)
    : undefined
  // Ya trabada = está parada en la fase que exige el visto bueno.
  const trabada = pendiente && tarea.estado === (tarea.apruebaEn ?? 'revision')
  const [quien, setQuien] = useState(tarea.aprobadorId ?? aprobadores[0]?.id ?? '')

  return (
    <div className="td">
      <div className="td__chips">
        {proyecto ? (
          <span className="kb-proj">
            <i style={{ background: colorDe(proyecto.id) }} />
            {proyecto.nombre}
          </span>
        ) : (
          <span className="kb-proj kb-proj--general">
            <i style={{ background: '#38bdf8' }} />
            General
          </span>
        )}
        {columna && (
          <span className="td__estado" style={{ color: columna.acento }}>
            <i style={{ background: columna.acento }} />
            {columna.titulo}
          </span>
        )}
        <span className={`kb-prio kb-prio--${tarea.prioridad}`}>{PRIO_LABEL[tarea.prioridad]}</span>
        {tarea.vence && (
          <span className="td__venc">
            <CalendarDays size={13} /> {fechaCorta(tarea.vence)}
          </span>
        )}
      </div>

      <h3 className="td__titulo">{tarea.titulo}</h3>

      {tarea.requiereAprobacion && (
        <div className={'td__aprob' + (pendiente ? ' td__aprob--pend' : ' td__aprob--ok')}>
          <span className="td__aprob-tit">
            {pendiente ? <Lock size={14} /> : <ShieldCheck size={14} />}
            {pendiente
              ? trabada
                ? `Detenida en ${fase?.titulo ?? 'revisión'}: falta el visto bueno`
                : `Necesitará aprobación para salir de ${fase?.titulo ?? 'revisión'}`
              : `Aprobada por ${aprobador ?? '—'}`}
          </span>
          {pendiente ? (
            <>
              <p className="td__aprob-msg">
                Avanza con normalidad hasta <b>{fase?.titulo ?? 'Revisión'}</b>; de ahí no sale
                hasta que {designado ? <b>{designado.nombre}</b> : 'un superior'} la apruebe.
              </p>
              <div className="td__aprob-acc">
                <Combobox
                  opciones={aprobadores.map((c) => ({
                    valor: c.id,
                    etiqueta: c.id === tarea.aprobadorId ? `${c.nombre} · designado` : c.nombre,
                  }))}
                  valor={quien}
                  onCambio={setQuien}
                  placeholder="¿Quién aprueba?"
                />
                <Button type="button" onClick={() => quien && onAprobar(quien)}>
                  <ShieldCheck size={15} /> Aprobar
                </Button>
              </div>
            </>
          ) : (
            tarea.aprobadaEn && (
              <p className="td__aprob-msg">
                {new Date(tarea.aprobadaEn).toLocaleString('es-VE', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            )
          )}
        </div>
      )}

      <div className="td__bloque">
        <span className="td__k">Marcar como {pendiente && '(bloqueado)'}</span>
        <div className="td__estados" role="radiogroup" aria-label="Estado de la tarea">
          {COLUMNAS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              disabled={pendiente}
              aria-checked={tarea.estado === c.id}
              className={'td__est' + (tarea.estado === c.id ? ' is-on' : '')}
              style={
                tarea.estado === c.id
                  ? { borderColor: c.acento, color: c.acento, background: `${c.acento}1f` }
                  : undefined
              }
              onClick={() => onEstado(c.id)}
            >
              <i style={{ background: c.acento }} />
              {c.titulo}
            </button>
          ))}
        </div>
      </div>

      {tarea.etiquetas.length > 0 && (
        <div className="kb-tags td__tags">
          {tarea.etiquetas.map((t) => (
            <span key={t} className="kb-tag">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="td__bloque">
        <span className="td__k">Responsables</span>
        {responsables.length ? (
          <div className="td__resp">
            {responsables.map((c) => (
              <span key={c.id} className="td__persona">
                <span className="resp-chip__av" style={{ background: colorDe(c.id) }}>
                  {iniciales(c.nombre)}
                </span>
                {c.nombre}
              </span>
            ))}
          </div>
        ) : (
          <p className="td__vacio">Sin responsables asignados.</p>
        )}
      </div>

      {tarea.checklist && tarea.checklist.total > 0 && (
        <div className="td__bloque">
          <span className="td__k">
            <ListChecks size={13} /> Checklist
          </span>
          <div className="kb-progress" style={{ marginTop: 6 }}>
            <span style={{ width: `${Math.round((tarea.checklist.hechos / tarea.checklist.total) * 100)}%` }} />
          </div>
          <p className="td__mini">
            {tarea.checklist.hechos} de {tarea.checklist.total} completados
          </p>
        </div>
      )}

      {tarea.instrucciones && (
        <div className="td__bloque">
          <span className="td__k">Instrucciones</span>
          <p className="td__texto">{tarea.instrucciones}</p>
        </div>
      )}

      {tarea.enlaces && tarea.enlaces.length > 0 && (
        <div className="td__bloque">
          <span className="td__k">Enlaces</span>
          <ul className="td__enlaces">
            {tarea.enlaces.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer">
                  <Link2 size={13} /> {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tarea.imagenes && tarea.imagenes.length > 0 && (
        <div className="td__bloque">
          <span className="td__k">Imágenes</span>
          <div className="td__imgs">
            {tarea.imagenes.map((src, i) => (
              <img key={i} src={src} alt={`Referencia ${i + 1}`} />
            ))}
          </div>
        </div>
      )}

      {creador && (
        <span className="td__creador">
          <UserRound size={12} /> Asignada por <b>{creador}</b>
        </span>
      )}

      <div className="form-acciones td__acc">
        <Button type="button" variant="ghost" onClick={onBorrar}>
          <Trash2 size={15} /> Eliminar
        </Button>
        <Button type="button" onClick={onEditar}>
          <Pencil size={15} /> Editar
        </Button>
      </div>
    </div>
  )
}
