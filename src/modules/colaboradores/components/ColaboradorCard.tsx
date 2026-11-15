import { Pencil, Trash2, Mail, Phone, IdCard, BadgeCheck } from 'lucide-react'
import type { Colaborador } from '@/core/datos'
import type { EstadisticasColaborador } from '../hooks/useColaboradores'

interface Props {
  colaborador: Colaborador
  stats: EstadisticasColaborador
  onEditar: () => void
  onBorrar: () => void
}

function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function ColaboradorCard({ colaborador, stats, onEditar, onBorrar }: Props) {
  return (
    <article className="co-card">
      <div className="co-card__head">
        <div className="co-avatar">
          {colaborador.fotoPerfil ? (
            <img src={colaborador.fotoPerfil} alt="" />
          ) : (
            <span>{iniciales(colaborador.nombre)}</span>
          )}
          <i className={'co-dot ' + (colaborador.activo ? 'co-dot--on' : 'co-dot--off')} />
        </div>
        <div className="co-card__id">
          <h3 className="cl-card__nombre">{colaborador.nombre}</h3>
          <span className="co-rol">
            {colaborador.rol ?? 'Colaborador'}
            {colaborador.titulo ? ` · ${colaborador.titulo}` : ''}
          </span>
        </div>
        <div className="cl-card__acciones">
          <button className="icono-btn" onClick={onEditar} aria-label="Editar colaborador">
            <Pencil size={15} />
          </button>
          <button
            className="icono-btn icono-btn--peligro"
            onClick={onBorrar}
            aria-label="Eliminar colaborador"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <ul className="cl-card__datos">
        {colaborador.cedula && (
          <li>
            <IdCard size={13} /> {colaborador.cedula}
          </li>
        )}
        {colaborador.contacto.correo && (
          <li>
            <Mail size={13} /> {colaborador.contacto.correo}
          </li>
        )}
        {colaborador.contacto.telefono && (
          <li>
            <Phone size={13} /> {colaborador.contacto.telefono}
          </li>
        )}
      </ul>

      <div className="co-badges">
        <span className={'co-estado ' + (colaborador.activo ? 'co-estado--on' : 'co-estado--off')}>
          {colaborador.activo ? 'Activo' : 'Inactivo'}
        </span>
        {colaborador.esUsuario && (
          <span className="co-badge-user">
            <BadgeCheck size={12} /> Usuario
          </span>
        )}
      </div>

      <div className="co-stats">
        <div className="co-stat">
          <strong>{stats.calificacion == null ? '—' : `${stats.calificacion}%`}</strong>
          <span>Calificación</span>
        </div>
        <div className="co-stat">
          <strong>{stats.proyectosActivos}</strong>
          <span>Proy. activos</span>
        </div>
        <div className="co-stat">
          <strong>{stats.proyectosTotales}</strong>
          <span>Proy. totales</span>
        </div>
      </div>
    </article>
  )
}
