import { useState } from 'react'
import {
  Calendar,
  ShoppingCart,
  Building2,
  Smartphone,
  Globe,
  Cloud,
  Server,
  Wrench,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  X,
  Layers,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/core/ui'
import {
  PLANTILLAS_PRELLENADAS,
  HERRAMIENTAS_CATALOGO_SUGERIDAS,
  type ContenidoPersonalizado,
  type ModuloItem,
  type AlcanceItem,
} from '../lib/plantillasPrellenadas'

interface Props {
  contenido: ContenidoPersonalizado
  onActualizar: (nuevo: ContenidoPersonalizado) => void
  onGuardarEnProyecto?: () => void
  guardando?: boolean
}

export function PanelPlantillaPrellenada({
  contenido,
  onActualizar,
  onGuardarEnProyecto,
  guardando = false,
}: Props) {
  const [abierto, setAbierto] = useState(true)
  const [tab, setTab] = useState<'modulos' | 'herramientas' | 'alcances'>('modulos')

  // Inputs para agregar nuevos elementos
  const [nuevoModNombre, setNuevoModNombre] = useState('')
  const [nuevoModHoras, setNuevoModHoras] = useState(16)
  const [nuevaHerramienta, setNuevaHerramienta] = useState('')
  const [nuevoAlcance, setNuevoAlcance] = useState('')

  const modulosIncluidos = contenido.modulos.filter((m) => m.incluido)
  const totalHoras = modulosIncluidos.reduce((acc, m) => acc + (Number(m.horas) || 0), 0)

  // Cargar una plantilla prellenada
  function seleccionarPlantilla(id: string) {
    const tpl = PLANTILLAS_PRELLENADAS[id]
    if (!tpl) return
    onActualizar({
      plantillaId: tpl.id,
      objeto: tpl.objeto,
      modulos: tpl.modulos.map((m) => ({ ...m })),
      herramientas: [...tpl.herramientas],
      alcances: tpl.alcances.map((a) => ({ ...a })),
      plazoEstimado: tpl.plazoEstimado,
      formaPago: tpl.formaPago,
    })
  }

  // --- Módulos: Quitar y poner ---
  function alternarModulo(id: string) {
    onActualizar({
      ...contenido,
      modulos: contenido.modulos.map((m) => (m.id === id ? { ...m, incluido: !m.incluido } : m)),
    })
  }

  function cambiarHorasModulo(id: string, horas: number) {
    onActualizar({
      ...contenido,
      modulos: contenido.modulos.map((m) =>
        m.id === id ? { ...m, horas: Math.max(1, horas) } : m,
      ),
    })
  }

  function eliminarModulo(id: string) {
    onActualizar({
      ...contenido,
      modulos: contenido.modulos.filter((m) => m.id !== id),
    })
  }

  function agregarModulo() {
    if (!nuevoModNombre.trim()) return
    const nuevo: ModuloItem = {
      id: `m_${Date.now()}`,
      nombre: nuevoModNombre.trim(),
      horas: Number(nuevoModHoras) || 10,
      incluido: true,
    }
    onActualizar({
      ...contenido,
      modulos: [...contenido.modulos, nuevo],
    })
    setNuevoModNombre('')
    setNuevoModHoras(16)
  }

  // --- Herramientas: Quitar y poner ---
  function alternarHerramienta(herramienta: string) {
    const existe = contenido.herramientas.includes(herramienta)
    onActualizar({
      ...contenido,
      herramientas: existe
        ? contenido.herramientas.filter((h) => h !== herramienta)
        : [...contenido.herramientas, herramienta],
    })
  }

  function agregarHerramienta() {
    const nombre = nuevaHerramienta.trim()
    if (!nombre || contenido.herramientas.includes(nombre)) return
    onActualizar({
      ...contenido,
      herramientas: [...contenido.herramientas, nombre],
    })
    setNuevaHerramienta('')
  }

  // --- Alcances: Quitar y poner ---
  function alternarAlcance(id: string) {
    onActualizar({
      ...contenido,
      alcances: contenido.alcances.map((a) => (a.id === id ? { ...a, incluido: !a.incluido } : a)),
    })
  }

  function eliminarAlcance(id: string) {
    onActualizar({
      ...contenido,
      alcances: contenido.alcances.filter((a) => a.id !== id),
    })
  }

  function agregarAlcance() {
    if (!nuevoAlcance.trim()) return
    const nuevo: AlcanceItem = {
      id: `a_${Date.now()}`,
      texto: nuevoAlcance.trim(),
      incluido: true,
    }
    onActualizar({
      ...contenido,
      alcances: [...contenido.alcances, nuevo],
    })
    setNuevoAlcance('')
  }

  const iconosPlantilla: Record<string, typeof Calendar> = {
    citas: Calendar,
    ecommerce: ShoppingCart,
    erp: Building2,
    app_movil: Smartphone,
    landing: Globe,
    saas: Cloud,
    api: Server,
    a_medida: Wrench,
  }

  return (
    <div className="doc-config-panel">
      {/* Barra superior de control */}
      <div className="doc-config-panel__header">
        <button
          type="button"
          className="doc-config-panel__toggle"
          onClick={() => setAbierto((v) => !v)}
          title="Mostrar / Ocultar opciones de personalización prellenada"
        >
          <SlidersHorizontal size={16} />
          <span>Configurar contenido prellenado</span>
          <span className="doc-badge-pill">
            {modulosIncluidos.length} módulos · {totalHoras} h · {contenido.herramientas.length} herramientas
          </span>
        </button>

        {onGuardarEnProyecto && (
          <Button
            type="button"
            variant="ghost"
            onClick={onGuardarEnProyecto}
            loading={guardando}
            style={{ fontSize: 12.5 }}
            title="Guardar estos módulos y especificaciones en la ficha del proyecto"
          >
            <Save size={14} /> Guardar en Proyecto
          </Button>
        )}
      </div>

      {abierto && (
        <div className="doc-config-panel__body">
          {/* Selector de plantilla arquetipo */}
          <div className="doc-config-sec">
            <span className="doc-config-sec__label">
              <Sparkles size={14} color="var(--brand-2)" /> Plantillas prellenadas sugeridas:
            </span>
            <div className="doc-presets-grid">
              {Object.values(PLANTILLAS_PRELLENADAS).map((tpl) => {
                const Icono = iconosPlantilla[tpl.id] || Layers
                const esActiva = contenido.plantillaId === tpl.id
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => seleccionarPlantilla(tpl.id)}
                    className={'doc-preset-btn' + (esActiva ? ' is-active' : '')}
                  >
                    <Icono size={14} />
                    <span>{tpl.nombre}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Subpestañas de edición rápida */}
          <div className="doc-subtabs">
            <button
              type="button"
              className={'doc-subtab' + (tab === 'modulos' ? ' is-active' : '')}
              onClick={() => setTab('modulos')}
            >
              <Layers size={14} /> Módulos y Horas ({modulosIncluidos.length})
            </button>
            <button
              type="button"
              className={'doc-subtab' + (tab === 'herramientas' ? ' is-active' : '')}
              onClick={() => setTab('herramientas')}
            >
              <Wrench size={14} /> Herramientas ({contenido.herramientas.length})
            </button>
            <button
              type="button"
              className={'doc-subtab' + (tab === 'alcances' ? ' is-active' : '')}
              onClick={() => setTab('alcances')}
            >
              <CheckCircle2 size={14} /> Alcances y Entregables (
              {contenido.alcances.filter((a) => a.incluido).length})
            </button>
          </div>

          {/* TAB 1: Módulos y Horas */}
          {tab === 'modulos' && (
            <div className="doc-config-tabcontent">
              <div className="doc-config-tabhead">
                <span className="doc-subhead-txt">
                  Marca o desmarca para <strong>quitar y poner</strong> módulos en la propuesta/contrato:
                </span>
                <span className="doc-horas-total">
                  <Clock size={14} /> Total estimado: <strong>{totalHoras} horas</strong>
                </span>
              </div>

              <div className="doc-items-list">
                {contenido.modulos.map((m) => (
                  <div
                    key={m.id}
                    className={'doc-item-row' + (m.incluido ? ' is-incluido' : ' is-excluido')}
                  >
                    <label className="doc-item-check">
                      <input
                        type="checkbox"
                        checked={m.incluido}
                        onChange={() => alternarModulo(m.id)}
                      />
                      <div className="doc-item-info">
                        <strong className="doc-item-nombre">{m.nombre}</strong>
                        {m.detalle && <p className="doc-item-desc">{m.detalle}</p>}
                      </div>
                    </label>

                    <div className="doc-item-actions">
                      <div className="doc-horas-input-wrap">
                        <input
                          type="number"
                          min={1}
                          max={500}
                          value={m.horas}
                          onChange={(e) =>
                            cambiarHorasModulo(m.id, parseInt(e.target.value, 10) || 0)
                          }
                          className="doc-horas-input"
                          title="Horas estimadas"
                        />
                        <span>h</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => eliminarModulo(m.id)}
                        className="doc-del-btn"
                        title="Eliminar este módulo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Agregar módulo personalizado */}
              <div className="doc-add-inline">
                <input
                  type="text"
                  placeholder="Nombre de otro módulo a agregar..."
                  value={nuevoModNombre}
                  onChange={(e) => setNuevoModNombre(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarModulo())}
                  className="field__input doc-add-input"
                />
                <input
                  type="number"
                  placeholder="Horas"
                  min={1}
                  value={nuevoModHoras}
                  onChange={(e) => setNuevoModHoras(parseInt(e.target.value, 10) || 0)}
                  className="field__input doc-add-horas"
                  style={{ width: 80 }}
                />
                <Button type="button" onClick={agregarModulo} disabled={!nuevoModNombre.trim()}>
                  <Plus size={15} /> Agregar módulo
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: Herramientas y Tecnologías */}
          {tab === 'herramientas' && (
            <div className="doc-config-tabcontent">
              <span className="doc-subhead-txt">
                Herramientas seleccionadas para el proyecto (haz clic en ✕ para <strong>quitar</strong> o
                en las sugerencias de abajo para <strong>poner</strong>):
              </span>

              {/* Herramientas activas */}
              <div className="doc-chips-container">
                {contenido.herramientas.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => alternarHerramienta(h)}
                    className="doc-chip is-active"
                    title={`Quitar ${h}`}
                  >
                    <span>{h}</span>
                    <X size={13} className="doc-chip__x" />
                  </button>
                ))}
                {contenido.herramientas.length === 0 && (
                  <span className="muted" style={{ fontSize: 13 }}>
                    No has seleccionado ninguna herramienta aún.
                  </span>
                )}
              </div>

              {/* Sugerencias disponibles para agregar con un clic */}
              <div className="doc-chip-sugerencias">
                <span className="doc-chip-sugerencias__label">Sugeridas para agregar:</span>
                <div className="doc-chips-container">
                  {HERRAMIENTAS_CATALOGO_SUGERIDAS.filter(
                    (h) => !contenido.herramientas.includes(h),
                  ).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => alternarHerramienta(h)}
                      className="doc-chip is-suggested"
                      title={`Agregar ${h}`}
                    >
                      <Plus size={12} />
                      <span>{h}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Agregar herramienta personalizada */}
              <div className="doc-add-inline" style={{ marginTop: 12 }}>
                <input
                  type="text"
                  placeholder="Otra herramienta o API (ej. AWS S3, Twilio)..."
                  value={nuevaHerramienta}
                  onChange={(e) => setNuevaHerramienta(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarHerramienta())}
                  className="field__input doc-add-input"
                />
                <Button
                  type="button"
                  onClick={agregarHerramienta}
                  disabled={!nuevaHerramienta.trim()}
                >
                  <Plus size={15} /> Agregar
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: Alcances y Entregables */}
          {tab === 'alcances' && (
            <div className="doc-config-tabcontent">
              <span className="doc-subhead-txt">
                Entregables y alcances formales incluidos en el documento (marca para incluir o
                desmarca para excluir):
              </span>

              <div className="doc-items-list">
                {contenido.alcances.map((a) => (
                  <div
                    key={a.id}
                    className={'doc-item-row' + (a.incluido ? ' is-incluido' : ' is-excluido')}
                  >
                    <label className="doc-item-check" style={{ flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={a.incluido}
                        onChange={() => alternarAlcance(a.id)}
                      />
                      <span className="doc-item-nombre" style={{ fontWeight: 500, fontSize: 13 }}>
                        {a.texto}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => eliminarAlcance(a.id)}
                      className="doc-del-btn"
                      title="Eliminar este alcance"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Agregar alcance personalizado */}
              <div className="doc-add-inline">
                <input
                  type="text"
                  placeholder="Nuevo alcance o entregable formal..."
                  value={nuevoAlcance}
                  onChange={(e) => setNuevoAlcance(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarAlcance())}
                  className="field__input doc-add-input"
                />
                <Button type="button" onClick={agregarAlcance} disabled={!nuevoAlcance.trim()}>
                  <Plus size={15} /> Agregar alcance
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
