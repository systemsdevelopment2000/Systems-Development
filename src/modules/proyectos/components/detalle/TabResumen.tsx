import { useNavigate } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import type { ProyectoEnriquecido } from '../../hooks/useProyectos'

export function TabResumen({ proyecto }: { proyecto: ProyectoEnriquecido }) {
  const nav = useNavigate()

  return (
    <div className="tab-sec">
      <div className="res-grid">
        <div className="res-item">
          <span className="res-k">Cliente</span>
          {proyecto.cliente ? (
            <button
              type="button"
              className="res-v res-link"
              onClick={() => nav(`/clientes?ver=${proyecto.cliente!.id}`)}
              title="Ver perfil del cliente"
            >
              {proyecto.cliente.nombre}
              <ExternalLink size={13} />
            </button>
          ) : (
            <span className="res-v">—</span>
          )}
        </div>
        <div className="res-item">
          <span className="res-k">Estado</span>
          <span className="res-v">{proyecto.estado?.nombre ?? '—'}</span>
        </div>
        <div className="res-item">
          <span className="res-k">Progreso</span>
          <span className="res-v">{proyecto.progreso}%</span>
        </div>
        <div className="res-item">
          <span className="res-k">Inicio</span>
          <span className="res-v">{proyecto.fechas?.inicio ?? '—'}</span>
        </div>
        <div className="res-item">
          <span className="res-k">Entrega estim.</span>
          <span className="res-v">{proyecto.fechas?.entregaEstim ?? '—'}</span>
        </div>
        <div className="res-item">
          <span className="res-k">Medio de pago</span>
          <span className="res-v">{proyecto.medioPago ?? '—'}</span>
        </div>
      </div>

      {proyecto.responsables.length > 0 && (
        <div className="res-bloque">
          <span className="res-k">Responsables</span>
          <div className="chips-sel res-resp">
            {proyecto.responsables.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className="chip-sel is-on chip-sel--link"
                onClick={() => nav(`/colaboradores?ver=${c.id}`)}
                title="Ver perfil del colaborador"
              >
                {i === 0 ? '★ ' : ''}
                {c.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {proyecto.descripcion && (
        <div className="res-bloque">
          <span className="res-k">Descripción</span>
          <p className="res-p">{proyecto.descripcion}</p>
        </div>
      )}

      {proyecto.notas && (
        <div className="res-bloque">
          <span className="res-k">Notas / puntos clave</span>
          <p className="res-p res-notas">{proyecto.notas}</p>
        </div>
      )}
    </div>
  )
}
