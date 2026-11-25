import { useState, useRef, useMemo } from 'react'
import { useMetodologias } from '../hooks/useMetodologias'
import { MetodologiaCard } from '../components/MetodologiaCard'
import { MetodologiaForm } from '../components/MetodologiaForm'
import { MetodologiaDocumento } from '../components/MetodologiaDocumento'
import { ModalPlantillasMetodologia } from '../components/ModalPlantillasMetodologia'
import { Modal } from '@/core/ui/Modal'
import { useDatos } from '@/core/datos'
import type { MetodologiaTrabajo } from '@/core/datos/tipos'
import type { PlantillaMetodologiaDef } from '../lib/plantillasMetodologia'
import { exportarPdf } from '@/core/lib/pdf'
import {
  Layers,
  Plus,
  Sparkles,
  Download,
  Printer,
  Search,
} from 'lucide-react'
import '../styles/metodologia.css'

export function MetodologiaPage() {
  const {
    metodologias,
    crear,
    actualizar,
    eliminar,
    duplicar,
    toggleActiva,
    cargarDesdePlantilla,
  } = useMetodologias()

  const { estado } = useDatos()
  const clientes = useMemo(() => Object.values(estado.clientes || {}), [estado.clientes])

  // Modales
  const [modalFormAbierto, setModalFormAbierto] = useState(false)
  const [editando, setEditando] = useState<MetodologiaTrabajo | undefined>(undefined)
  const [modalPlantillas, setModalPlantillas] = useState(false)
  const [viendoDoc, setViendoDoc] = useState<MetodologiaTrabajo | null>(null)
  const [exportando, setExportando] = useState(false)

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [busqueda, setBusqueda] = useState('')

  // Ref al elemento imprimible para PDF
  const docRef = useRef<HTMLDivElement>(null)

  // Metodologías filtradas
  const filtradas = useMemo(() => {
    return metodologias.filter((m) => {
      if (filtroTipo !== 'todos' && m.tipo !== filtroTipo) return false
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase()
        const matchTitulo = m.titulo?.toLowerCase().includes(q)
        const matchSub = m.subtitulo?.toLowerCase().includes(q)
        const matchCod = m.codigo?.toLowerCase().includes(q)
        const matchCli = m.clienteNombre?.toLowerCase().includes(q)
        if (!matchTitulo && !matchSub && !matchCod && !matchCli) return false
      }
      return true
    })
  }, [metodologias, filtroTipo, busqueda])

  function iniciarNuevo() {
    setEditando(undefined)
    setModalFormAbierto(true)
  }

  function iniciarEditar(m: MetodologiaTrabajo) {
    setEditando(m)
    setModalFormAbierto(true)
  }

  function handleGuardar(datos: Omit<MetodologiaTrabajo, 'id' | 'codigo' | 'creadoEn'> & { id?: string }) {
    if (datos.id) {
      actualizar(datos as MetodologiaTrabajo)
    } else {
      crear(datos)
    }
    setModalFormAbierto(false)
    setEditando(undefined)
  }

  function handleSeleccionarPlantilla(plantilla: PlantillaMetodologiaDef) {
    cargarDesdePlantilla(plantilla)
    setModalPlantillas(false)
  }

  async function handleDescargarPdf() {
    if (!docRef.current || !viendoDoc) return
    setExportando(true)
    try {
      const nombreLimpio = (viendoDoc.codigo || 'MET') + '_' + viendoDoc.titulo.replace(/[^a-zA-Z0-9]/g, '_')
      await exportarPdf(docRef.current, nombreLimpio)
    } catch (err) {
      console.error('Error al generar PDF:', err)
    } finally {
      setExportando(false)
    }
  }

  function handleImprimir() {
    window.print()
  }

  return (
    <section className="page">
      {/* Cabecera Principal */}
      <header className="page__header page__header--fila">
        <div>
          <h1 className="page__title">Metodología de Trabajo</h1>
          <p className="page__subtitle">
            Estandarización de procesos, fases de desarrollo, control de logos, diagramas y exportación en PDF oficial.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn--ghost btn--icono"
            onClick={() => setModalPlantillas(true)}
          >
            <Sparkles size={16} /> Plantillas Oficiales
          </button>

          <button
            type="button"
            className="btn btn--primary btn--icono"
            onClick={iniciarNuevo}
          >
            <Plus size={16} /> Nueva Metodología
          </button>
        </div>
      </header>

      {/* Barra de Búsqueda y Filtros */}
      <div className="met-filtros-barra">
        <div className="met-filtros-chips">
          {[
            { id: 'todos', label: 'Todas' },
            { id: 'desarrollo', label: 'Desarrollo de Software' },
            { id: 'soporte', label: 'Soporte e Infraestructura' },
            { id: 'qa', label: 'Calidad & QA' },
            { id: 'infraestructura', label: 'Infraestructura' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              className={`met-chip-btn ${filtroTipo === f.id ? 'is-active' : ''}`}
              onClick={() => setFiltroTipo(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="met-buscar-box">
          <Search size={14} className="met-buscar-icono" />
          <input
            type="text"
            className="field__input met-buscar-input"
            placeholder="Buscar metodología por título, código o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Metodologías */}
      {filtradas.length === 0 ? (
        <div className="met-vacio-box">
          <Layers size={40} className="met-vacio-icono" />
          <h3>No hay metodologías para mostrar</h3>
          <p>
            {metodologias.length === 0
              ? 'Puedes comenzar cargando una de las plantillas oficiales preconfiguradas o creando una nueva desde cero.'
              : 'No se encontraron resultados con los filtros actuales.'}
          </p>
          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            {metodologias.length === 0 && (
              <button
                type="button"
                className="btn btn--primary btn--icono"
                onClick={() => setModalPlantillas(true)}
              >
                <Sparkles size={16} /> Ver Plantillas Oficiales
              </button>
            )}
            <button
              type="button"
              className="btn btn--ghost btn--icono"
              onClick={iniciarNuevo}
            >
              <Plus size={16} /> Crear Metodología
            </button>
          </div>
        </div>
      ) : (
        <div className="met-grid">
          {filtradas.map((m) => (
            <MetodologiaCard
              key={m.id}
              metodologia={m}
              onVerDocumento={() => setViendoDoc(m)}
              onEditar={() => iniciarEditar(m)}
              onDuplicar={() => duplicar(m.id)}
              onEliminar={() => {
                if (window.confirm(`¿Seguro que deseas eliminar la metodología "${m.titulo}"?`)) {
                  eliminar(m.id)
                }
              }}
              onToggleActiva={() => toggleActiva(m.id)}
            />
          ))}
        </div>
      )}

      {/* Modal Formulario de Creación / Edición */}
      <Modal
        abierto={modalFormAbierto}
        onCerrar={() => {
          setModalFormAbierto(false)
          setEditando(undefined)
        }}
        titulo={editando ? 'Editar Metodología de Trabajo' : 'Nueva Metodología de Trabajo'}
        ancho={960}
        cerrarAlClickFondo={false}
      >
        <MetodologiaForm
          inicial={editando}
          clientes={clientes}
          onGuardar={handleGuardar}
          onCancelar={() => {
            setModalFormAbierto(false)
            setEditando(undefined)
          }}
          onPrevisualizar={(borrador) => {
            setViendoDoc(borrador)
          }}
        />
      </Modal>

      {/* Modal Plantillas Oficiales */}
      <Modal
        abierto={modalPlantillas}
        onCerrar={() => setModalPlantillas(false)}
        titulo="Plantillas Oficiales de Metodología Systems Development"
        ancho={920}
        cerrarAlClickFondo={false}
      >
        <ModalPlantillasMetodologia
          onSeleccionar={handleSeleccionarPlantilla}
          onCerrar={() => setModalPlantillas(false)}
        />
      </Modal>

      {/* Modal Vista Previa Documento & Descarga en PDF */}
      <Modal
        abierto={Boolean(viendoDoc)}
        onCerrar={() => setViendoDoc(null)}
        titulo={`Documento Oficial: ${viendoDoc?.titulo ?? ''}`}
        ancho={960}
        cerrarAlClickFondo={false}
        cabeceraExtra={
          viendoDoc && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn--primary btn--sm btn--icono"
                disabled={exportando}
                onClick={handleDescargarPdf}
              >
                <Download size={14} /> {exportando ? 'Generando PDF...' : 'Descargar en PDF'}
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm btn--icono"
                onClick={handleImprimir}
              >
                <Printer size={14} /> Imprimir
              </button>
            </div>
          )
        }
      >
        {viendoDoc && (
          <div className="met-doc-preview-modal-body">
            <MetodologiaDocumento ref={docRef} metodologia={viendoDoc} />
          </div>
        )}
      </Modal>
    </section>
  )
}
