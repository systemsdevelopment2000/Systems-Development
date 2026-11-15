import { Pencil, FileText, CalendarClock, Mic, Link2 } from 'lucide-react'
import { Button } from '@/core/ui'
import type { Reunion } from '@/core/datos'

interface Props {
  reunion: Reunion
  proyectoNombre?: string
  clienteNombre?: string
  nombreColaborador: (id?: string) => string
  /** Si se pasa, muestra el botón para pasar a edición. */
  onEditar?: () => void
}

function fechaLarga(iso: string) {
  return new Date(iso).toLocaleString('es-VE', { dateStyle: 'full', timeStyle: 'short' })
}

/** Vista de solo lectura de una reunión (sin edición). */
export function ReunionDetalle({
  reunion: r,
  proyectoNombre,
  clienteNombre,
  nombreColaborador,
  onEditar,
}: Props) {
  const prog = !!r.fechaProgramada && new Date(r.fechaProgramada).getTime() > Date.now()
  const externos = r.participantesExternos ?? []

  return (
    <div className="rd">
      <div className="rd__chips">
        {proyectoNombre && (
          <span className="rd__proy">
            {proyectoNombre}
            {clienteNombre ? ` · ${clienteNombre}` : ''}
          </span>
        )}
        <span className={'rd__estado' + (prog ? ' rd__estado--prog' : '')}>
          {prog ? <CalendarClock size={12} /> : r.origen === 'voz' ? <Mic size={12} /> : <FileText size={12} />}
          {prog ? 'Agendada' : 'Registrada'}
        </span>
      </div>

      <h3 className="rd__titulo">{r.titulo || 'Reunión'}</h3>

      <div className="rd__fechas">
        {r.fechaProgramada && (
          <div className="rd__fecha rd__fecha--prog">
            <span className="rd__k">Agendada para</span>
            <span className="rd__v">{fechaLarga(r.fechaProgramada)}</span>
          </div>
        )}
        <div className="rd__fecha">
          <span className="rd__k">{r.fechaProgramada ? 'Creada el' : 'Registrada el'}</span>
          <span className="rd__v">{fechaLarga(r.fecha)}</span>
        </div>
      </div>

      <div className="rd__bloque">
        <span className="rd__k">Participantes</span>
        {r.participantes.length === 0 && externos.length === 0 ? (
          <p className="rd__vacio">Sin participantes registrados.</p>
        ) : (
          <div className="rd__parts">
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
      </div>

      <div className="rd__bloque">
        <span className="rd__k">Notas</span>
        {r.notas ? (
          <p className="rd__texto">{r.notas}</p>
        ) : (
          <p className="rd__vacio">Sin notas escritas.</p>
        )}
      </div>

      {r.audio && (
        <div className="rd__bloque">
          <span className="rd__k">Nota de voz</span>
          <audio className="rd__audio" src={r.audio} controls />
        </div>
      )}

      {r.adjuntos && r.adjuntos.length > 0 && (
        <div className="rd__bloque">
          <span className="rd__k">Adjuntos ({r.adjuntos.length})</span>
          <div className="rd__adjs">
            {r.adjuntos.map((a) =>
              a.tipo.startsWith('image/') ? (
                <a
                  key={a.id}
                  className="rn-item__img"
                  href={a.dataUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={a.nombre}
                >
                  <img src={a.dataUrl} alt={a.nombre} />
                </a>
              ) : (
                <a
                  key={a.id}
                  className="rn-item__pdf"
                  href={a.dataUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={a.nombre}
                >
                  <Link2 size={13} /> {a.nombre}
                </a>
              ),
            )}
          </div>
        </div>
      )}

      {onEditar && (
        <div className="form-acciones rd__acc">
          <Button type="button" onClick={onEditar}>
            <Pencil size={15} /> Editar
          </Button>
        </div>
      )}
    </div>
  )
}
