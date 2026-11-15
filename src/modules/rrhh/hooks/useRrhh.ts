import { useMemo } from 'react'
import { useDatos, nuevoId, type Candidato, type PlantillaEntrevista } from '@/core/datos'
import { evaluar, type ResultadoEvaluacion } from '@/core/lib/rrhh'

export interface CandidatoVista extends Candidato {
  plantilla?: PlantillaEntrevista
  entrevistador?: string
  evaluacion: ResultadoEvaluacion
}

export function useRrhh() {
  const { estado, upsert, eliminar } = useDatos()

  const plantillas = useMemo(
    () =>
      Object.values(estado.plantillasEntrevista).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [estado.plantillasEntrevista],
  )

  const candidatos = useMemo<CandidatoVista[]>(
    () =>
      Object.values(estado.candidatos)
        .map((c) => {
          const plantilla = c.plantillaId ? estado.plantillasEntrevista[c.plantillaId] : undefined
          return {
            ...c,
            plantilla,
            entrevistador: c.entrevistadorId
              ? estado.colaboradores[c.entrevistadorId]?.nombre
              : undefined,
            evaluacion: evaluar(c, plantilla),
          }
        })
        .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()),
    [estado.candidatos, estado.plantillasEntrevista, estado.colaboradores],
  )

  const colaboradores = useMemo(
    () => Object.values(estado.colaboradores).filter((c) => c.activo),
    [estado.colaboradores],
  )

  function crearCandidato(datos: Partial<Candidato>): Candidato {
    const c: Candidato = {
      id: nuevoId(),
      nombre: datos.nombre?.trim() || 'Sin nombre',
      cargo: datos.cargo?.trim() || '',
      estado: 'recibido',
      creadoEn: new Date().toISOString(),
      ...datos,
    }
    upsert('candidatos', c)
    return c
  }

  function guardarCandidato(c: Candidato) {
    upsert('candidatos', c)
  }

  function borrarCandidato(id: string) {
    eliminar('candidatos', id)
  }

  function crearPlantilla(base?: PlantillaEntrevista): PlantillaEntrevista {
    const p: PlantillaEntrevista = base
      ? { ...base, id: nuevoId(), nombre: `${base.nombre} (copia)`, creadoEn: new Date().toISOString() }
      : {
          id: nuevoId(),
          nombre: 'Nueva plantilla',
          cargo: '',
          bloques: [{ id: nuevoId(), titulo: 'Bloque 1', preguntas: [''] }],
          criterios: [{ id: nuevoId(), nombre: 'Criterio 1', peso: 1 }],
          creadoEn: new Date().toISOString(),
        }
    upsert('plantillasEntrevista', p)
    return p
  }

  function guardarPlantilla(p: PlantillaEntrevista) {
    upsert('plantillasEntrevista', p)
  }

  function borrarPlantilla(id: string) {
    eliminar('plantillasEntrevista', id)
  }

  return {
    candidatos,
    plantillas,
    colaboradores,
    crearCandidato,
    guardarCandidato,
    borrarCandidato,
    crearPlantilla,
    guardarPlantilla,
    borrarPlantilla,
  }
}
