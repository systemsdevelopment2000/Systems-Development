import type { Hecho } from '@/core/datos'

const ETIQUETA: Record<Hecho['tipo'], string> = {
  creacion: 'Creación',
  estado: 'Estado',
  reunion: 'Reunión',
  nota: 'Nota',
  asignacion: 'Asignación',
  evaluacion: 'Evaluación',
  documento: 'Documento',
}

export function TabHistorial({ hechos }: { hechos: Hecho[] }) {
  if (hechos.length === 0) {
    return <p className="muted">Aún no hay hechos registrados en este proyecto.</p>
  }

  return (
    <ol className="timeline">
      {hechos.map((h) => (
        <li key={h.id} className="timeline__item">
          <span className={'timeline__dot t-' + h.tipo} />
          <div className="timeline__body">
            <div className="timeline__fila">
              <span className={'timeline__tipo t-' + h.tipo}>{ETIQUETA[h.tipo]}</span>
              <span className="timeline__meta">
                {new Date(h.fecha).toLocaleString('es-VE', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
            <p className="timeline__desc">{h.descripcion}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
