import '../styles/documento.css'
import { useRef, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileDown, Loader2 } from 'lucide-react'
import { useDatos, type Colaborador, type Proyecto } from '@/core/datos'
import { VistaPreviaPdf } from '@/core/ui'
import { generarPdf, type PdfGenerado } from '@/core/lib/pdf'
import { notificar } from '@/core/notificaciones'
import { PlantillaPropuesta } from '../components/PlantillaPropuesta'
import { PlantillaContrato } from '../components/PlantillaContrato'
import { PanelPlantillaPrellenada } from '../components/PanelPlantillaPrellenada'
import {
  PLANTILLAS_PRELLENADAS,
  detectarPlantillaSugerida,
  type ContenidoPersonalizado,
} from '../lib/plantillasPrellenadas'
import type { DatosDocumento, Plantilla } from '../types'

export function DocumentoPage() {
  const { id } = useParams<{ id: string }>()
  const { estado } = useDatos()
  const p = id ? estado.proyectos[id] : undefined
  if (!p) {
    return (
      <section className="page">
        <p className="muted">Proyecto no encontrado.</p>
      </section>
    )
  }

  return <DocumentoProyecto key={p.id} p={p} />
}

function DocumentoProyecto({ p }: { p: Proyecto }) {
  const nav = useNavigate()
  const { estado, upsert } = useDatos()
  const [plantilla, setPlantilla] = useState<Plantilla>('propuesta')
  const [generando, setGenerando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [previa, setPrevia] = useState<PdfGenerado | null>(null)
  const hojaRef = useRef<HTMLDivElement>(null)

  const tags = useMemo(
    () => p.tagIds.map((tid) => estado.tags[tid]?.nombre).filter(Boolean) as string[],
    [p.tagIds, estado.tags],
  )

  const plantillaInicialId = useMemo(() => {
    return detectarPlantillaSugerida(p, tags)
  }, [p, tags])

  // Contenido prellenado dinámico (Módulos, herramientas, horas, alcances con quitar/poner)
  const [contenido, setContenido] = useState<ContenidoPersonalizado>(() => {
    const tpl = PLANTILLAS_PRELLENADAS[plantillaInicialId] ?? PLANTILLAS_PRELLENADAS.citas
    // Si el proyecto ya tiene módulos guardados, integrarlos
    const modulosProyecto = p.modulos?.length
      ? p.modulos.map((m) => ({
          id: m.id,
          nombre: m.nombre,
          detalle: '',
          horas: m.horas,
          incluido: m.incluido,
        }))
      : tpl.modulos.map((m) => ({ ...m }))

    return {
      plantillaId: tpl.id,
      objeto: p.descripcion || tpl.objeto,
      modulos: modulosProyecto,
      herramientas: [...tpl.herramientas],
      alcances: tpl.alcances.map((a) => ({ ...a })),
      plazoEstimado: tpl.plazoEstimado,
      formaPago: tpl.formaPago,
    }
  })

  const datos: DatosDocumento = {
    proyecto: p,
    cliente: estado.clientes[p.clienteId],
    responsables: Object.values(estado.asignaciones)
      .filter((a) => a.proyectoId === p.id && a.estado === 'activa')
      .map((a) => estado.colaboradores[a.colaboradorId])
      .filter(Boolean) as Colaborador[],
    estadoNombre: estado.estadosProyecto.find((e) => e.id === p.estadoId)?.nombre,
    tags,
  }

  function guardarEnProyecto() {
    if (!p) return
    setGuardando(true)
    try {
      const horasTotales = contenido.modulos
        .filter((m) => m.incluido)
        .reduce((s, m) => s + (Number(m.horas) || 0), 0)

      upsert('proyectos', {
        ...p,
        id: p.id,
        descripcion: contenido.objeto,
        modulos: contenido.modulos.map((m) => ({
          id: m.id,
          nombre: m.nombre,
          clase: 'estandar' as const,
          horas: m.horas,
          incluido: m.incluido,
        })),
        notas: `Estimación: ${horasTotales}h. Plazo: ${contenido.plazoEstimado}. Esquema: ${contenido.formaPago}.`,
      })
      void notificar(
        'Proyecto actualizado',
        'Los módulos, herramientas y alcances se guardaron en la ficha del proyecto.',
      )
    } catch (err) {
      void notificar(
        'Error',
        err instanceof Error ? err.message : 'No se pudo guardar la configuración.',
      )
    } finally {
      setGuardando(false)
    }
  }

  async function descargarPdf() {
    const hoja = hojaRef.current?.querySelector<HTMLElement>('.doc')
    if (!hoja || !p) return
    const limpio = `${plantilla}-${p.nombre}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    setGenerando(true)
    hoja.classList.add('doc--exportando')
    try {
      setPrevia(await generarPdf(hoja, limpio))
    } finally {
      hoja.classList.remove('doc--exportando')
      setGenerando(false)
    }
  }

  function cerrarPrevia() {
    previa?.revocar()
    setPrevia(null)
  }

  return (
    <section className="page doc-page">
      {/* Barra superior de acciones */}
      <div className="doc-toolbar">
        <button className="btn btn--ghost btn--icono" onClick={() => nav(`/proyectos/${p.id}`)}>
          <ArrowLeft size={15} /> Volver
        </button>

        <div className="doc-toolbar__sel">
          <button
            className={'doc-tpl' + (plantilla === 'propuesta' ? ' is-on' : '')}
            onClick={() => setPlantilla('propuesta')}
          >
            Propuesta
          </button>
          <button
            className={'doc-tpl' + (plantilla === 'contrato' ? ' is-on' : '')}
            onClick={() => setPlantilla('contrato')}
          >
            Contrato
          </button>
        </div>

        <button className="btn btn--primary btn--icono" onClick={descargarPdf} disabled={generando}>
          {generando ? <Loader2 size={15} className="spin" /> : <FileDown size={15} />}
          {generando ? 'Generando…' : 'Descargar PDF'}
        </button>
      </div>

      <p className="doc-ayuda">
        Selecciona una plantilla prellenada o personaliza los módulos, herramientas y alcances
        (puedes <strong>quitar y poner</strong> elementos con un clic). Al hacer clic en{' '}
        <strong>Descargar PDF</strong> se exportará el documento con la identidad de SD.
      </p>

      {/* Panel interactivo para quitar y poner módulos, herramientas, horas y alcances */}
      <PanelPlantillaPrellenada
        contenido={contenido}
        onActualizar={setContenido}
        onGuardarEnProyecto={guardarEnProyecto}
        guardando={guardando}
      />

      {/* Lienzo del documento imprimible */}
      <div className="doc-lienzo" ref={hojaRef}>
        {plantilla === 'propuesta' ? (
          <PlantillaPropuesta datos={datos} contenido={contenido} />
        ) : (
          <PlantillaContrato datos={datos} contenido={contenido} />
        )}
      </div>

      {previa && (
        <VistaPreviaPdf
          url={previa.url}
          nombre={previa.nombre}
          onDescargar={previa.descargar}
          onCerrar={cerrarPrevia}
        />
      )}
    </section>
  )
}
