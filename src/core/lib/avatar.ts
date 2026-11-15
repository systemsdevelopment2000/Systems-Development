import { PALETA_CATEGORICA as PALETA } from './colores'

export function colorAvatar(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return PALETA[h % PALETA.length]
}

export function inicialesDe(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  const ini = (partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')
  return ini.toUpperCase() || '?'
}
