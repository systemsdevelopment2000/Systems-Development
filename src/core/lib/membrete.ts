import type { DatosEmpresa } from '@/core/datos'

/**
 * Texto del pie de los documentos.
 *
 * Si no se escribió uno propio en Configuración, se arma con los datos del
 * membrete. Así el correo y la ubicación viven en un solo lugar: cambiarlos
 * ahí mueve el pie de todos los reportes, propuestas y contratos, en vez de
 * quedar duplicados dentro de una frase escrita a mano.
 */
export function textoPie(e: DatosEmpresa): string {
  const propio = e.pie?.trim()
  if (propio) return propio
  return [e.nombre, e.ubicacion, e.correo]
    .map((x) => x?.trim())
    .filter(Boolean)
    .join(' · ')
}
