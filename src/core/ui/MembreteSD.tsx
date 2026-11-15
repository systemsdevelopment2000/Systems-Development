import './membrete.css'
import { Phone, MapPin, Mail } from 'lucide-react'
import type { ReactNode } from 'react'
import { useDatos, type DatosEmpresa } from '@/core/datos'
import { textoPie } from '@/core/lib/membrete'

/**
 * Cabecera con la identidad de Systems Development. Los datos salen del
 * membrete editable (Configuración), no están fijos en el código.
 * `datos` permite previsualizar cambios aún sin guardar.
 */
export function CabeceraSD({ datos }: { datos?: DatosEmpresa } = {}) {
  const { estado } = useDatos()
  const e = datos ?? estado.empresa

  return (
    <div className="sdcab-wrap">
      <div className="sdcab">
        <img className="sdcab__logo" src={e.logo} alt={e.nombre} />
        <ul className="sdcab__cont">
          {e.telefonos && (
            <li>
              <span className="sdcab__ic">
                <Phone size={10} />
              </span>
              {e.telefonos}
            </li>
          )}
          {e.ubicacion && (
            <li>
              <span className="sdcab__ic">
                <MapPin size={10} />
              </span>
              {e.ubicacion}
            </li>
          )}
          {e.correo && (
            <li>
              <span className="sdcab__ic">
                <Mail size={10} />
              </span>
              {e.correo}
            </li>
          )}
        </ul>
      </div>
      <div className="sdcab-rule" />
    </div>
  )
}

/** Pie con la marca (texto editable desde Configuración). */
export function PieSD({ datos }: { datos?: DatosEmpresa } = {}) {
  const { estado } = useDatos()
  return (
    <footer className="sdpie">
      <span className="sdpie__dash" />
      {textoPie(datos ?? estado.empresa)}
    </footer>
  )
}

/**
 * Hoja con identidad SD (membrete) para reportes imprimibles. En impresión
 * oculta el chrome de la app y los elementos `.no-print`, dejando solo la hoja.
 */
export function MembreteSD({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string
  subtitulo?: string
  children: ReactNode
}) {
  return (
    <article className="mb">
      <CabeceraSD />
      <div className="mb__titfila">
        <h2 className="mb__titulo">{titulo}</h2>
        {subtitulo && <span className="mb__sub">{subtitulo}</span>}
      </div>
      <div className="mb__cuerpo">{children}</div>
      <PieSD />
    </article>
  )
}
