import '../styles/documento.css'
import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileDown, Loader2 } from 'lucide-react'
import { useDatos, type Colaborador } from '@/core/datos'
import { VistaPreviaPdf } from '@/core/ui'
import { generarPdf, type PdfGenerado } from '@/core/lib/pdf'
import { PlantillaPropuesta } from '../components/PlantillaPropuesta'
import { PlantillaContrato } from '../components/PlantillaContrato'
import type { DatosDocumento, Plantilla } from '../types'

export function DocumentoPage() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const { estado } = useDatos()
  const [plantilla, setPlantilla] = useState<Plantilla>('propuesta')
  const [generando, setGenerando] = useState(false)
  const [previa, setPrevia] = useState<PdfGenerado | null>(null)
  const hojaRef = useRef<HTMLDivElement>(null)

  const p = id ? estado.proyectos[id] : undefined
  if (!p) {
    return (
      <section className="page">
        <p className="muted">Proyecto no encontrado.</p>
      </section>
    )
  }

  const datos: DatosDocumento = {
    proyecto: p,
    cliente: estado.clientes[p.clienteId],
    responsables: Object.values(estado.asignaciones)
      .filter((a) => a.proyectoId === p.id && a.estado === 'activa')
      .map((a) => estado.colaboradores[a.colaboradorId])
      .filter(Boolean) as Colaborador[],
    estadoNombre: estado.estadosProyecto.find((e) => e.id === p.estadoId)?.nombre,
    tags: p.tagIds.map((id) => estado.tags[id]?.nombre).filter(Boolean) as string[],
  }

  async function descargarPdf() {
    const hoja = hojaRef.current?.querySelector<HTMLElement>('.doc')
    if (!hoja || !p) return
    const limpio = `${plantilla}-${p.nombre}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    setGenerando(true)
    // Oculta el resaltado de los campos editables solo durante la captura.
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
      <div className="doc-toolbar">
        <button className="btn btn--ghost btn--icono" onClick={() => nav(`/proyectos/${id}`)}>
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
        Edita cualquier campo resaltado antes de descargar. <strong>Descargar PDF</strong> genera el
        archivo con la identidad de SD tal como se ve aquí.
      </p>

      <div className="doc-lienzo" ref={hojaRef}>
        {plantilla === 'propuesta' ? (
          <PlantillaPropuesta datos={datos} />
        ) : (
          <PlantillaContrato datos={datos} />
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
