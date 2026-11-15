import { Pencil, MapPin, Phone, Mail, Wallet, UserRound, FileText, FolderKanban } from 'lucide-react'
import { Button } from '@/core/ui'
import type { Cliente, Proyecto } from '@/core/datos'

interface Props {
  cliente: Cliente
  proyectos: Proyecto[]
  ponderacion: number | null
  onEditar: () => void
  onVerProyecto: (id: string) => void
}

function Dato({
  icono,
  k,
  v,
}: {
  icono?: React.ReactNode
  k: string
  v?: string
}) {
  return (
    <div className="cd__dato">
      <span className="cd__k">
        {icono} {k}
      </span>
      <span className="cd__v">{v || '—'}</span>
    </div>
  )
}

/** Ficha de solo lectura de un cliente. */
export function ClienteDetalle({ cliente, proyectos, ponderacion, onEditar, onVerProyecto }: Props) {
  const r = cliente.responsable

  return (
    <div className="cd">
      <div className="cd__head">
        <div className="cl-logo cd__logo">
          {cliente.logo ? <img src={cliente.logo} alt="" /> : <span>{cliente.nombre.slice(0, 2).toUpperCase()}</span>}
        </div>
        <div>
          <h3 className="cd__nombre">{cliente.nombre}</h3>
          <span className="cd__doc">
            {cliente.tipoDocumento.toUpperCase()} · {cliente.documento}
          </span>
        </div>
        <span className={'cl-pond' + (ponderacion == null ? ' cl-pond--na' : '')}>
          {ponderacion == null ? 'Sin evaluar' : `${ponderacion}%`}
        </span>
      </div>

      <div className="cd__grid">
        <Dato icono={<MapPin size={12} />} k="Ubicación" v={cliente.ubicacion} />
        <Dato icono={<Phone size={12} />} k="Teléfono" v={cliente.contacto.telefono} />
        <Dato icono={<Mail size={12} />} k="Correo" v={cliente.contacto.correo} />
        <Dato icono={<Wallet size={12} />} k="Medio de pago" v={cliente.medioPago} />
      </div>

      <div className="cd__bloque">
        <span className="cd__tit">
          <UserRound size={13} /> Responsable / contacto
        </span>
        {r ? (
          <div className="cd__grid">
            <Dato k="Nombre" v={r.nombre} />
            <Dato k="Cargo" v={r.cargo} />
            <Dato k="Teléfono" v={r.telefono} />
            <Dato k="Correo" v={r.correo} />
          </div>
        ) : (
          <p className="cd__vacio">Sin responsable cargado. Útil sobre todo si es una empresa.</p>
        )}
      </div>

      <div className="cd__bloque">
        <span className="cd__tit">
          <FolderKanban size={13} /> Proyectos ({proyectos.length})
        </span>
        {proyectos.length ? (
          <div className="cd__proys">
            {proyectos.map((p) => (
              <button key={p.id} className="cd__proy" onClick={() => onVerProyecto(p.id)}>
                {p.nombre}
              </button>
            ))}
          </div>
        ) : (
          <p className="cd__vacio">Todavía no tiene proyectos.</p>
        )}
      </div>

      {cliente.notas && (
        <div className="cd__bloque">
          <span className="cd__tit">
            <FileText size={13} /> Notas
          </span>
          <p className="cd__texto">{cliente.notas}</p>
        </div>
      )}

      <div className="form-acciones">
        <Button type="button" onClick={onEditar}>
          <Pencil size={15} /> Editar
        </Button>
      </div>
    </div>
  )
}
