import type { Prioridad } from '@/core/datos'

import { PALETA_CATEGORICA as PALETA } from '@/core/lib/colores'

export function colorDe(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return PALETA[h % PALETA.length]
}

export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/)
  const ini = (partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')
  return ini.toUpperCase() || '?'
}

export const PRIO_LABEL: Record<Prioridad, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica',
}

export const PRIORIDADES: Prioridad[] = ['baja', 'media', 'alta', 'critica']

export function fechaCorta(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
  })
}
