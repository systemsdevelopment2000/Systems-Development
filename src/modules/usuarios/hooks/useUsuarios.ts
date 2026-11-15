import { useMemo } from 'react'
import { useDatos, type Permisos, type RolSistema } from '@/core/datos'

export interface EntradaUsuario {
  id: string
  correo?: string
  rolSistema: RolSistema
  activo: boolean
  permisos?: Permisos
}

export function useUsuarios() {
  const { estado, upsert } = useDatos()

  const usuarios = useMemo(
    () =>
      Object.values(estado.colaboradores)
        .filter((c) => c.esUsuario)
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [estado.colaboradores],
  )

  const sinCuenta = useMemo(
    () =>
      Object.values(estado.colaboradores)
        .filter((c) => !c.esUsuario)
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [estado.colaboradores],
  )

  function guardar(datos: EntradaUsuario) {
    const c = estado.colaboradores[datos.id]
    if (!c) return
    upsert('colaboradores', {
      ...c,
      esUsuario: true,
      activo: datos.activo,
      rolSistema: datos.rolSistema,
      permisos: datos.permisos,
      contacto: { ...c.contacto, correo: datos.correo?.trim() || c.contacto.correo },
    })
  }

  /** Restablece la contraseña (fase front: clave temporal visible una vez). */
  function restablecerClave(id: string, clave: string) {
    const c = estado.colaboradores[id]
    if (!c) return
    upsert('colaboradores', {
      ...c,
      claveTemporal: clave,
      claveActualizada: new Date().toISOString(),
    })
  }

  /** Deshabilita el acceso sin eliminar al usuario (sigue como colaborador). */
  function deshabilitar(id: string) {
    const c = estado.colaboradores[id]
    if (c) upsert('colaboradores', { ...c, cuentaDeshabilitada: true })
  }
  function habilitar(id: string) {
    const c = estado.colaboradores[id]
    if (c) upsert('colaboradores', { ...c, cuentaDeshabilitada: false })
  }

  return { usuarios, sinCuenta, guardar, restablecerClave, deshabilitar, habilitar }
}
