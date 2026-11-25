import { useState } from 'react'
import type {
  MetodologiaTrabajo,
  TipoMetodologia,
  FaseMetodologia,
  ImagenMetodologia,
  Cliente,
} from '@/core/datos/tipos'
import { nuevoId } from '@/core/datos'
import {
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Plus,
  Upload,
  Eye,
  Info,
  X,
} from 'lucide-react'

interface Props {
  inicial?: MetodologiaTrabajo
  clientes: Cliente[]
  onGuardar: (datos: Omit<MetodologiaTrabajo, 'id' | 'codigo' | 'creadoEn'> & { id?: string }) => void
  onCancelar: () => void
  onPrevisualizar?: (datos: MetodologiaTrabajo) => void
}

const TABS = [
  { id: 'general', label: '1. General', icon: Info },
  { id: 'logos', label: '2. Logos & Diagramas', icon: ImageIcon },
  { id: 'fases', label: '3. Fases & Entregables', icon: Layers },
  { id: 'principios', label: '4. Principios & Calidad', icon: CheckCircle2 },
] as const

type TabId = (typeof TABS)[number]['id']

export function MetodologiaForm({ inicial, clientes, onGuardar, onCancelar, onPrevisualizar }: Props) {
  const [tab, setTab] = useState<TabId>('general')
  const [error, setError] = useState<string | null>(null)

  // Datos Generales
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [subtitulo, setSubtitulo] = useState(inicial?.subtitulo ?? '')
  const [tipo, setTipo] = useState<TipoMetodologia>(inicial?.tipo ?? 'desarrollo')
  const [version, setVersion] = useState(inicial?.version ?? '1.0')
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '')
  const [objetivo, setObjetivo] = useState(inicial?.objetivo ?? '')
  const [alcance, setAlcance] = useState(inicial?.alcance ?? '')
  const [clienteId, setClienteId] = useState(inicial?.clienteId ?? '')
  const [activa, setActiva] = useState(inicial?.activa ?? true)

  // Logos
  const [mostrarLogoSD, setMostrarLogoSD] = useState(inicial?.mostrarLogoSD ?? true)
  const [logoCliente, setLogoCliente] = useState(inicial?.logoCliente ?? '')

  // Imágenes / Diagramas
  const [imagenes, setImagenes] = useState<ImagenMetodologia[]>(inicial?.imagenes ?? [])

  // Fases
  const [fases, setFases] = useState<FaseMetodologia[]>(() => {
    if (inicial?.fases && inicial.fases.length > 0) return inicial.fases
    return [
      {
        id: nuevoId(),
        nombre: '1. Levantamiento & Requisitos',
        descripcion: 'Definición inicial de requerimientos funcionales y alcance.',
        entregables: ['Documento de Requisitos'],
        roles: ['Project Manager'],
        herramientas: ['Reuniones SD'],
        duracionEstimada: '1 semana',
      },
      {
        id: nuevoId(),
        nombre: '2. Desarrollo & Pruebas',
        descripcion: 'Construcción iterativa y validación continua.',
        entregables: ['Módulos de software', 'Pruebas'],
        roles: ['Desarrollador'],
        herramientas: ['TypeScript', 'Supabase'],
        duracionEstimada: '2 semanas',
      },
    ]
  })

  // Principios
  const [principios, setPrincipios] = useState<string[]>(
    inicial?.principios && inicial.principios.length > 0
      ? inicial.principios
      : [
          'Validación obligatoria de compilación limpia y pruebas.',
          'Control estricto de seguridad en Supabase y políticas RLS.',
        ],
  )

  // ----------------------------------------------------
  // Manejadores de Fases
  // ----------------------------------------------------
  function agregarFase() {
    setFases((prev) => [
      ...prev,
      {
        id: nuevoId(),
        nombre: `Fase ${prev.length + 1}`,
        descripcion: '',
        entregables: [],
        roles: [],
        herramientas: [],
        duracionEstimada: '',
      },
    ])
  }

  function eliminarFase(id: string) {
    if (fases.length <= 1) return
    setFases((prev) => prev.filter((f) => f.id !== id))
  }

  function actualizarFase(id: string, campo: keyof FaseMetodologia, valor: unknown) {
    setFases((prev) => prev.map((f) => (f.id === id ? { ...f, [campo]: valor } : f)))
  }

  function agregarEntregable(faseId: string, texto: string) {
    const val = texto.trim()
    if (!val) return
    setFases((prev) =>
      prev.map((f) =>
        f.id === faseId ? { ...f, entregables: [...(f.entregables || []), val] } : f,
      ),
    )
  }

  function quitarEntregable(faseId: string, idx: number) {
    setFases((prev) =>
      prev.map((f) =>
        f.id === faseId
          ? { ...f, entregables: (f.entregables || []).filter((_, i) => i !== idx) }
          : f,
      ),
    )
  }

  // ----------------------------------------------------
  // Manejadores de Imágenes
  // ----------------------------------------------------
  function handleSubirImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        if (url) {
          setImagenes((prev) => [
            ...prev,
            {
              id: nuevoId(),
              url,
              titulo: file.name.replace(/\.[^/.]+$/, ''),
              pie: 'Diagrama de arquitectura / flujo metodológico',
            },
          ])
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function agregarImagenUrl(url: string) {
    const u = url.trim()
    if (!u) return
    setImagenes((prev) => [
      ...prev,
      {
        id: nuevoId(),
        url: u,
        titulo: 'Diagrama de Flujo',
        pie: '',
      },
    ])
  }

  function eliminarImagen(id: string) {
    setImagenes((prev) => prev.filter((img) => img.id !== id))
  }

  function actualizarImagen(id: string, campo: 'titulo' | 'pie', valor: string) {
    setImagenes((prev) => prev.map((img) => (img.id === id ? { ...img, [campo]: valor } : img)))
  }

  // Logo de Cliente
  function handleSubirLogoCliente(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target?.result as string
      if (url) setLogoCliente(url)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // ----------------------------------------------------
  // Manejadores de Principios
  // ----------------------------------------------------
  function agregarPrincipio(texto: string) {
    const val = texto.trim()
    if (!val) return
    setPrincipios((prev) => [...prev, val])
  }

  function eliminarPrincipio(idx: number) {
    setPrincipios((prev) => prev.filter((_, i) => i !== idx))
  }

  // ----------------------------------------------------
  // Guardado Final
  // ----------------------------------------------------
  function ejecutarGuardar() {
    if (!titulo.trim()) {
      setError('Debes ingresar un título para la metodología.')
      setTab('general')
      return
    }

    const clienteObj = clientes.find((c) => c.id === clienteId)

    onGuardar({
      id: inicial?.id,
      titulo: titulo.trim(),
      subtitulo: subtitulo.trim() || undefined,
      tipo,
      version: version.trim() || '1.0',
      descripcion: descripcion.trim(),
      objetivo: objetivo.trim() || undefined,
      alcance: alcance.trim() || undefined,
      clienteId: clienteId || undefined,
      clienteNombre: clienteObj?.nombre,
      mostrarLogoSD,
      logoCliente: logoCliente || undefined,
      fases,
      imagenes,
      principios,
      activa,
    })
  }

  function obtenerObjetoBorrador(): MetodologiaTrabajo {
    const clienteObj = clientes.find((c) => c.id === clienteId)
    return {
      id: inicial?.id ?? 'preview-draft',
      codigo: inicial?.codigo ?? 'MET-DRAFT',
      titulo: titulo || 'Metodología sin título',
      subtitulo,
      tipo,
      version,
      descripcion,
      objetivo,
      alcance,
      clienteId,
      clienteNombre: clienteObj?.nombre,
      mostrarLogoSD,
      logoCliente,
      fases,
      imagenes,
      principios,
      activa,
      creadoEn: inicial?.creadoEn ?? new Date().toISOString(),
    }
  }

  return (
    <div className="met-form-contenedor">
      {/* Pestañas de Navegación del Formulario */}
      <div className="met-form-tabs" role="tablist">
        {TABS.map((t) => {
          const Icon = t.icon
          const activo = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activo}
              className={`met-form-tab ${activo ? 'is-active' : ''}`}
              onClick={() => {
                setError(null)
                setTab(t.id)
              }}
            >
              <Icon size={15} />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {error && <div className="met-form-alerta">{error}</div>}

      {/* Contenido por Pestaña */}
      <div className="met-form-cuerpo">
        {/* TAB 1: GENERAL */}
        {tab === 'general' && (
          <div className="met-form-seccion">
            <div className="met-form-fila">
              <div className="field" style={{ flex: 2 }}>
                <label className="field__label">Título de la Metodología *</label>
                <input
                  type="text"
                  className="field__input"
                  placeholder="Ej: Metodología Ágil SD — Desarrollo de Software"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>

              <div className="field" style={{ flex: 1 }}>
                <label className="field__label">Tipo / Clasificación</label>
                <select
                  className="field__input"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoMetodologia)}
                >
                  <option value="desarrollo">Desarrollo de Software</option>
                  <option value="soporte">Soporte e Infraestructura</option>
                  <option value="qa">Aseguramiento & Calidad (QA)</option>
                  <option value="infraestructura">Infraestructura & Servidores</option>
                  <option value="general">Marco General de Operaciones</option>
                </select>
              </div>

              <div className="field" style={{ width: 100 }}>
                <label className="field__label">Versión</label>
                <input
                  type="text"
                  className="field__input"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="1.0"
                />
              </div>
            </div>

            <div className="field">
              <label className="field__label">Subtítulo o Resumen Corto</label>
              <input
                type="text"
                className="field__input"
                placeholder="Ej: Marco iterativo de ingeniería de software con validación de ciclo completo"
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
              />
            </div>

            <div className="met-form-fila">
              <div className="field" style={{ flex: 1 }}>
                <label className="field__label">Cliente o Empresa Asociada (Opcional)</label>
                <select
                  className="field__input"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                >
                  <option value="">Metodología Propia (Estándar General SD)</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field" style={{ width: 160 }}>
                <label className="field__label">Estado Operativo</label>
                <label className="met-switch-label">
                  <input
                    type="checkbox"
                    checked={activa}
                    onChange={(e) => setActiva(e.target.checked)}
                  />
                  <span>{activa ? 'Activa / Vigente' : 'Inactiva / Archivo'}</span>
                </label>
              </div>
            </div>

            <div className="field">
              <label className="field__label">Descripción General del Marco Metodológico</label>
              <textarea
                className="field__input"
                rows={3}
                placeholder="Describe la estructura, valor operacional y propósito de esta metodología..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div className="met-form-fila">
              <div className="field" style={{ flex: 1 }}>
                <label className="field__label">Objetivo General</label>
                <textarea
                  className="field__input"
                  rows={2}
                  placeholder="Garantizar la entrega de software robusto, seguro y sin defectos..."
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label className="field__label">Alcance de Aplicación</label>
                <textarea
                  className="field__input"
                  rows={2}
                  placeholder="Aplica a todos los proyectos de plataformas web y microservicios..."
                  value={alcance}
                  onChange={(e) => setAlcance(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOGOS E IMÁGENES */}
        {tab === 'logos' && (
          <div className="met-form-seccion">
            <h3 className="met-form-subtitulo">
              <ImageIcon size={16} /> Control de Logos en el Documento & PDF
            </h3>

            <div className="met-logos-control-grid">
              {/* Logo de Systems Development */}
              <div className="met-logo-caja">
                <div className="met-logo-caja__header">
                  <strong>Logo Systems Development</strong>
                  <label className="met-switch-label">
                    <input
                      type="checkbox"
                      checked={mostrarLogoSD}
                      onChange={(e) => setMostrarLogoSD(e.target.checked)}
                    />
                    <span>{mostrarLogoSD ? 'Mostrar en cabecera' : 'Oculto'}</span>
                  </label>
                </div>
                <p className="met-logo-caja__desc">
                  Muestra el membrete oficial con datos de contacto y la marca registrada de Systems Development.
                </p>
                {mostrarLogoSD ? (
                  <div className="met-logo-preview met-logo-preview--activo">
                    <span>✓ Logo SD activo en cabecera y pie de página</span>
                  </div>
                ) : (
                  <div className="met-logo-preview met-logo-preview--inactivo">
                    <span>Sin membrete oficial SD (Hoja blanca neutra)</span>
                  </div>
                )}
              </div>

              {/* Logo del Cliente */}
              <div className="met-logo-caja">
                <div className="met-logo-caja__header">
                  <strong>Logo del Cliente / Homologación</strong>
                  {logoCliente && (
                    <button
                      type="button"
                      className="btn-link-rojo"
                      onClick={() => setLogoCliente('')}
                    >
                      <Trash2 size={13} /> Quitar logo
                    </button>
                  )}
                </div>
                <p className="met-logo-caja__desc">
                  Agrega el logo de la empresa cliente para generar el PDF co-brandeado oficial.
                </p>

                {logoCliente ? (
                  <div className="met-logo-cliente-muestra">
                    <img src={logoCliente} alt="Logo Cliente" />
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => setLogoCliente('')}
                    >
                      <X size={14} /> Quitar
                    </button>
                  </div>
                ) : (
                  <div className="met-logo-subir-box">
                    <label className="btn btn--ghost btn--sm btn--icono">
                      <Upload size={14} /> Subir archivo de logo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleSubirLogoCliente}
                      />
                    </label>
                    <span className="met-o-separador">o bien URL:</span>
                    <input
                      type="text"
                      className="field__input"
                      placeholder="https://..."
                      onBlur={(e) => {
                        if (e.target.value.trim()) setLogoCliente(e.target.value.trim())
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Diagramas de Flujo e Imágenes */}
            <div className="met-diagramas-header">
              <div>
                <h3 className="met-form-subtitulo">
                  <Layers size={16} /> Diagramas de Flujo & Esquemas de Arquitectura
                </h3>
                <p className="met-logo-caja__desc">
                  Agrega capturas de flujos, diagramas de bases de datos o arquitectura para incluirlos en el PDF final.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <label className="btn btn--primary btn--sm btn--icono">
                  <Upload size={14} /> Subir Diagrama
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleSubirImagen}
                  />
                </label>
              </div>
            </div>

            {imagenes.length === 0 ? (
              <div className="met-imagenes-vacias">
                <ImageIcon size={32} />
                <p>No has agregado diagramas aún. Puedes subir imágenes PNG/JPG o ingresar una URL.</p>
                <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <input
                    id="input-url-diagrama"
                    type="text"
                    className="field__input"
                    placeholder="https://ejemplo.com/diagrama.png"
                    style={{ maxWidth: 320 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        agregarImagenUrl((e.target as HTMLInputElement).value)
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => {
                      const el = document.getElementById('input-url-diagrama') as HTMLInputElement
                      if (el?.value) {
                        agregarImagenUrl(el.value)
                        el.value = ''
                      }
                    }}
                  >
                    Agregar URL
                  </button>
                </div>
              </div>
            ) : (
              <div className="met-imagenes-lista">
                {imagenes.map((img) => (
                  <div key={img.id} className="met-imagen-fila">
                    <img src={img.url} alt={img.titulo || 'Diagrama'} className="met-imagen-mini" />
                    <div className="met-imagen-campos">
                      <input
                        type="text"
                        className="field__input"
                        placeholder="Título del diagrama (Ej: Arquitectura de Datos)"
                        value={img.titulo || ''}
                        onChange={(e) => actualizarImagen(img.id, 'titulo', e.target.value)}
                      />
                      <input
                        type="text"
                        className="field__input"
                        placeholder="Pie o explicación técnica del diagrama"
                        value={img.pie || ''}
                        onChange={(e) => actualizarImagen(img.id, 'pie', e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-icono-rojo"
                      title="Eliminar este diagrama"
                      onClick={() => eliminarImagen(img.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FASES Y ENTREGABLES */}
        {tab === 'fases' && (
          <div className="met-form-seccion">
            <div className="met-fases-head">
              <div>
                <h3 className="met-form-subtitulo">
                  <Layers size={16} /> Fases del Ciclo de Trabajo ({fases.length} fases)
                </h3>
                <p className="met-logo-caja__desc">
                  Define, agrega, edita y quita las etapas de ejecución, sus entregables y herramientas.
                </p>
              </div>
              <button
                type="button"
                className="btn btn--primary btn--sm btn--icono"
                onClick={agregarFase}
              >
                <Plus size={14} /> Agregar Fase
              </button>
            </div>

            <div className="met-fases-editor-lista">
              {fases.map((f, idx) => (
                <div key={f.id} className="met-fase-editor-card">
                  <div className="met-fase-editor-card__head">
                    <span className="met-fase-badge-num">Fase {idx + 1}</span>
                    <input
                      type="text"
                      className="field__input met-fase-input-titulo"
                      value={f.nombre}
                      onChange={(e) => actualizarFase(f.id, 'nombre', e.target.value)}
                      placeholder="Nombre de la fase..."
                    />
                    <input
                      type="text"
                      className="field__input met-fase-input-duracion"
                      value={f.duracionEstimada || ''}
                      onChange={(e) => actualizarFase(f.id, 'duracionEstimada', e.target.value)}
                      placeholder="Duración (ej: 2 semanas)"
                    />
                    {fases.length > 1 && (
                      <button
                        type="button"
                        className="btn-icono-rojo"
                        title="Quitar esta fase"
                        onClick={() => eliminarFase(f.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div className="field" style={{ marginTop: 8 }}>
                    <textarea
                      className="field__input"
                      rows={2}
                      value={f.descripcion}
                      onChange={(e) => actualizarFase(f.id, 'descripcion', e.target.value)}
                      placeholder="Descripción detallada de las actividades de esta fase..."
                    />
                  </div>

                  {/* Entregables */}
                  <div className="met-fase-subseccion">
                    <span className="met-fase-subseccion__lbl">Entregables:</span>
                    <div className="met-fase-chips">
                      {(f.entregables || []).map((ent, entIdx) => (
                        <span key={entIdx} className="met-chip">
                          {ent}
                          <button
                            type="button"
                            onClick={() => quitarEntregable(f.id, entIdx)}
                            className="met-chip__x"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        className="met-chip-input"
                        placeholder="+ Añadir entregable y presionar Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            agregarEntregable(f.id, (e.target as HTMLInputElement).value)
                            ;(e.target as HTMLInputElement).value = ''
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PRINCIPIOS Y CALIDAD */}
        {tab === 'principios' && (
          <div className="met-form-seccion">
            <h3 className="met-form-subtitulo">
              <CheckCircle2 size={16} /> Principios y Reglas de Calidad
            </h3>
            <p className="met-logo-caja__desc">
              Pautas no negociables que rigen esta metodología (ej. compilación limpia, RLS de seguridad, etc.).
            </p>

            <div className="met-principios-lista-editor">
              {principios.map((p, idx) => (
                <div key={idx} className="met-principio-fila">
                  <CheckCircle2 size={16} className="met-check-icono" />
                  <input
                    type="text"
                    className="field__input"
                    value={p}
                    onChange={(e) => {
                      const nuevo = e.target.value
                      setPrincipios((prev) => prev.map((item, i) => (i === idx ? nuevo : item)))
                    }}
                  />
                  <button
                    type="button"
                    className="btn-icono-rojo"
                    onClick={() => eliminarPrincipio(idx)}
                    title="Quitar principio"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div className="met-principio-agregar">
              <input
                id="input-nuevo-principio"
                type="text"
                className="field__input"
                placeholder="Escribe un principio y haz clic en Agregar (o pulsa Enter)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    agregarPrincipio((e.target as HTMLInputElement).value)
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }}
              />
              <button
                type="button"
                className="btn btn--ghost btn--icono"
                onClick={() => {
                  const el = document.getElementById('input-nuevo-principio') as HTMLInputElement
                  if (el?.value) {
                    agregarPrincipio(el.value)
                    el.value = ''
                  }
                }}
              >
                <Plus size={14} /> Agregar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botones de Pie de Formulario */}
      <footer className="met-form-pie">
        <div className="met-form-pie__izq">
          {onPrevisualizar && (
            <button
              type="button"
              className="btn btn--ghost btn--icono"
              onClick={() => onPrevisualizar(obtenerObjetoBorrador())}
            >
              <Eye size={15} /> Vista Previa Documento
            </button>
          )}
        </div>

        <div className="met-form-pie__der">
          <button type="button" className="btn btn--ghost" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="button" className="btn btn--primary" onClick={ejecutarGuardar}>
            {inicial ? 'Guardar Cambios' : 'Registrar Metodología'}
          </button>
        </div>
      </footer>
    </div>
  )
}
