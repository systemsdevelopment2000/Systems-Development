import type { AccesoHerramienta } from '@/core/datos'

/**
 * Normaliza un acceso igual que lo hace el formulario completo al guardar.
 * Así el editor individual no cambia el formato en que ya se guardan los datos.
 */
export function normalizarAcceso(
  acceso: AccesoHerramienta,
  idx = 0,
): AccesoHerramienta {
  return {
    ...acceso,
    nombre: acceso.nombre.trim() || `Acceso #${idx + 1}`,
    usuario: acceso.usuario?.trim() || undefined,
    contrasena: acceso.contrasena || undefined,
    token: acceso.token?.trim() || undefined,
    vinculaGit: Boolean(acceso.vinculaGit),
    notas: acceso.notas?.trim() || undefined,
  }
}

/** Reemplaza únicamente el acceso con el mismo id y conserva todos los demás. */
export function reemplazarAcceso(
  accesos: AccesoHerramienta[],
  actualizado: AccesoHerramienta,
): AccesoHerramienta[] {
  return accesos.map((a) => (a.id === actualizado.id ? actualizado : a))
}
