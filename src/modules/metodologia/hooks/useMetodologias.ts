import { useMemo } from 'react'
import { useDatos, nuevoId } from '@/core/datos'
import type { MetodologiaTrabajo } from '@/core/datos/tipos'
import {
  PLANTILLAS_PREDEFINIDAS,
  crearMetodologiaDesdePlantilla,
  type PlantillaMetodologiaDef,
} from '../lib/plantillasMetodologia'

export function useMetodologias() {
  const { estado, upsert, eliminar } = useDatos()

  const metodologias = useMemo(() => {
    const mapa = estado.metodologias || {}
    return Object.values(mapa).sort((a, b) => {
      // Activas primero, luego orden por código o título
      if (a.activa !== b.activa) return a.activa ? -1 : 1
      return (a.codigo || '').localeCompare(b.codigo || '')
    })
  }, [estado.metodologias])

  function crear(datos: Omit<MetodologiaTrabajo, 'id' | 'codigo' | 'creadoEn'>) {
    const id = nuevoId()
    const nueva: MetodologiaTrabajo = {
      ...datos,
      id,
      codigo: '',
      creadoEn: new Date().toISOString(),
    }
    upsert('metodologias', nueva)
    return id
  }

  function actualizar(metodologia: MetodologiaTrabajo) {
    upsert('metodologias', metodologia)
  }

  function borrar(id: string) {
    eliminar('metodologias', id)
  }

  function duplicar(id: string) {
    const original = estado.metodologias?.[id]
    if (!original) return
    const idNuevo = nuevoId()
    const copia: MetodologiaTrabajo = {
      ...original,
      id: idNuevo,
      codigo: '',
      titulo: `${original.titulo} (Copia)`,
      fases: original.fases.map((f) => ({ ...f, id: nuevoId() })),
      imagenes: original.imagenes.map((img) => ({ ...img, id: nuevoId() })),
      creadoEn: new Date().toISOString(),
    }
    upsert('metodologias', copia)
  }

  function toggleActiva(id: string) {
    const actual = estado.metodologias?.[id]
    if (!actual) return
    actualizar({
      ...actual,
      activa: !actual.activa,
    })
  }

  function cargarDesdePlantilla(plantilla: PlantillaMetodologiaDef) {
    const nueva = crearMetodologiaDesdePlantilla(plantilla)
    upsert('metodologias', nueva)
    return nueva.id
  }

  function obtenerPorId(id: string): MetodologiaTrabajo | undefined {
    return estado.metodologias?.[id]
  }

  return {
    metodologias,
    plantillasDisponibles: PLANTILLAS_PREDEFINIDAS,
    crear,
    actualizar,
    eliminar: borrar,
    duplicar,
    toggleActiva,
    cargarDesdePlantilla,
    obtenerPorId,
  }
}
