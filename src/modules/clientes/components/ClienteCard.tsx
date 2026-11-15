import { Pencil, Trash2, MapPin, Phone, Mail, Wallet, Eye } from 'lucide-react'
import type { Cliente } from '@/core/datos'

interface Props {
  cliente: Cliente
  proyectos: number
  ponderacion: number | null
  onEditar: () => void
  onBorrar: () => void
  onVer: () => void
}

function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function ClienteCard({ cliente, proyectos, ponderacion, onEditar, onBorrar, onVer }: Props) {
  return (
    <article className="cl-card">
      <div className="cl-card__head">
        <div className="cl-logo">
          {cliente.logo ? <img src={cliente.logo} alt="" /> : <span>{iniciales(cliente.nombre)}</span>}
        </div>
        <div className="cl-card__id">
          <button className="cl-card__nombre cl-card__nombre--btn" onClick={onVer} title="Ver ficha">
            {cliente.nombre}
          </button>
          <span className="cl-card__doc">
            {cliente.tipoDocumento.toUpperCase()} · {cliente.documento}
          </span>
        </div>
        <div className="cl-card__acciones">
          <button className="icono-btn" onClick={onVer} aria-label="Ver ficha del cliente">
            <Eye size={15} />
          </button>
          <button className="icono-btn" onClick={onEditar} aria-label="Editar cliente">
            <Pencil size={15} />
          </button>
          <button
            className="icono-btn icono-btn--peligro"
            onClick={onBorrar}
            aria-label="Eliminar cliente"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <ul className="cl-card__datos">
        {cliente.ubicacion && (
          <li>
            <MapPin size={13} /> {cliente.ubicacion}
          </li>
        )}
        {cliente.contacto.telefono && (
          <li>
            <Phone size={13} /> {cliente.contacto.telefono}
          </li>
        )}
        {cliente.contacto.correo && (
          <li>
            <Mail size={13} /> {cliente.contacto.correo}
          </li>
        )}
        {cliente.medioPago && (
          <li>
            <Wallet size={13} /> {cliente.medioPago}
          </li>
        )}
      </ul>

      <div className="cl-card__foot">
        <span className="cl-chip">
          {proyectos} proyecto{proyectos === 1 ? '' : 's'}
        </span>
        <span className={'cl-pond' + (ponderacion == null ? ' cl-pond--na' : '')}>
          {ponderacion == null ? 'Sin evaluar' : `${ponderacion}%`}
        </span>
      </div>
    </article>
  )
}
