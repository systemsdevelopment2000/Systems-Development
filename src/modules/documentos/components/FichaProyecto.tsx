import type { ReactNode } from 'react'
import type { DatosDocumento } from '../types'

function Fila({ k, v }: { k: string; v?: ReactNode }) {
  if (!v) return null
  return (
    <div className="doc-ficha__item">
      <span className="doc-k">{k}</span>
      <span className="doc-v">{v}</span>
    </div>
  )
}

/** Ficha de datos (cliente + proyecto) para contratos y propuestas. */
export function FichaProyecto({ datos }: { datos: DatosDocumento }) {
  const { proyecto, cliente, responsables, estadoNombre, tags } = datos

  return (
    <div className="doc-ficha">
      <div className="doc-ficha__col">
        <h3 className="doc-ficha__tit">Cliente</h3>
        <Fila k="Nombre / Razón social" v={cliente?.nombre} />
        <Fila
          k={cliente?.tipoDocumento === 'rif' ? 'RIF' : 'Cédula'}
          v={cliente?.documento}
        />
        <Fila k="Ubicación" v={cliente?.ubicacion} />
        <Fila k="Teléfono" v={cliente?.contacto.telefono} />
        <Fila k="Correo" v={cliente?.contacto.correo} />
        <Fila k="Medio de pago" v={proyecto.medioPago || cliente?.medioPago} />
      </div>

      <div className="doc-ficha__col">
        <h3 className="doc-ficha__tit">Proyecto</h3>
        <Fila k="Nombre" v={proyecto.nombre} />
        <Fila k="Estado" v={estadoNombre} />
        <Fila k="Tags" v={tags.length ? tags.join(' · ') : undefined} />
        <Fila k="Inicio" v={proyecto.fechas?.inicio} />
        <Fila k="Entrega estimada" v={proyecto.fechas?.entregaEstim} />
        <Fila
          k="Responsables"
          v={responsables.length ? responsables.map((r) => r.nombre).join(', ') : undefined}
        />
      </div>
    </div>
  )
}
