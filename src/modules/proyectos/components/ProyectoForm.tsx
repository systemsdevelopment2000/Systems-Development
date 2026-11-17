import { useState, type FormEvent } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, Combobox, SelectorTags, Stepper, type PasoDef } from '@/core/ui'
import type { Cliente, Colaborador, EstadoProyecto, Tag } from '@/core/datos'
import type { EntradaProyecto, ProyectoEnriquecido } from '../hooks/useProyectos'
import type { CategoriaProyecto, ModuloProyecto, TipoDesarrollo } from '@/core/datos'
import { CATEGORIAS, TIPOS_DESARROLLO, esDesarrollo, modulosSugeridos } from '../lib/modulos'
import { SelectorModulos } from './SelectorModulos'

interface Props {
  inicial?: ProyectoEnriquecido
  clientes: Cliente[]
  estados: EstadoProyecto[]
  tags: Tag[]
  colaboradores: Colaborador[]
  estadoInicialId?: string
  onCrearTag: (nombre: string) => Tag
  onGuardar: (datos: EntradaProyecto) => void
  onCancelar: () => void
}

const PASOS_PROYECTO: PasoDef[] = [
  { id: 'esencial', titulo: '1. Esencial', descripcion: 'Datos obligatorios' },
  { id: 'alcance', titulo: '2. Alcance', descripcion: 'Módulos y tags' },
  { id: 'condiciones', titulo: '3. Condiciones', descripcion: 'Equipo y fechas' },
]

export function ProyectoForm({
  inicial,
  clientes,
  estados,
  tags,
  colaboradores,
  estadoInicialId,
  onCrearTag,
  onGuardar,
  onCancelar,
}: Props) {
  const [paso, setPaso] = useState(0)
  const [maxPaso, setMaxPaso] = useState(inicial ? 2 : 0)

  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [clienteId, setClienteId] = useState(inicial?.clienteId ?? '')
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '')
  const [estadoId, setEstadoId] = useState(inicial?.estadoId ?? estadoInicialId ?? '')
  const [tagIds, setTagIds] = useState<string[]>(inicial?.tagIds ?? [])
  const [responsables, setResponsables] = useState<string[]>(
    inicial?.responsables.map((c) => c.id) ?? [],
  )
  const [inicio, setInicio] = useState(inicial?.fechas?.inicio ?? '')
  const [entregaEstim, setEntregaEstim] = useState(inicial?.fechas?.entregaEstim ?? '')
  const [medioPago, setMedioPago] = useState(inicial?.medioPago ?? '')
  const [progreso, setProgreso] = useState(inicial?.progreso ?? 0)
  const [notas, setNotas] = useState(inicial?.notas ?? '')
  const [categoria, setCategoria] = useState<CategoriaProyecto>(inicial?.categoria ?? 'desarrollo')
  const [tipoDesarrollo, setTipoDesarrollo] = useState<TipoDesarrollo | undefined>(
    inicial?.tipoDesarrollo,
  )
  const [modulos, setModulos] = useState<ModuloProyecto[]>(inicial?.modulos ?? [])
  const [error, setError] = useState<string | null>(null)

  function toggleResp(id: string) {
    setResponsables((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }

  function validarPaso1(): boolean {
    if (!nombre.trim()) {
      setError('Debes ingresar el nombre del proyecto.')
      return false
    }
    if (!estadoId) {
      setError('Debes seleccionar un estado para el proyecto.')
      return false
    }
    setError(null)
    return true
  }

  function avanzar() {
    if (paso === 0) {
      if (!validarPaso1()) return
    }
    const siguiente = Math.min(paso + 1, PASOS_PROYECTO.length - 1)
    setPaso(siguiente)
    setMaxPaso((prev) => Math.max(prev, siguiente))
  }

  function retroceder() {
    setError(null)
    setPaso((prev) => Math.max(prev - 1, 0))
  }

  function irAlPaso(n: number) {
    if (n > paso && !validarPaso1()) return
    setError(null)
    setPaso(n)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!validarPaso1()) {
      setPaso(0)
      return
    }
    if (responsables.length === 0 && estadoId !== estadoInicialId) {
      setError('Para un estado distinto al inicial debes asignar al menos un responsable.')
      setPaso(2)
      return
    }
    setError(null)
    onGuardar({
      id: inicial?.id,
      nombre: nombre.trim(),
      clienteId,
      descripcion: descripcion.trim() || undefined,
      estadoId,
      tagIds,
      responsables,
      fechas: { inicio: inicio || undefined, entregaEstim: entregaEstim || undefined },
      medioPago: medioPago.trim() || undefined,
      notas: notas.trim() || undefined,
      progreso,
      categoria,
      tipoDesarrollo: esDesarrollo(categoria) ? tipoDesarrollo : undefined,
      modulos: esDesarrollo(categoria) && modulos.length ? modulos : undefined,
    })
  }

  return (
    <form onSubmit={submit} noValidate>
      <Stepper
        pasos={PASOS_PROYECTO}
        pasoActual={paso}
        maxPasoAlcanzado={maxPaso}
        onPasoClick={irAlPaso}
      />

      {/* ── PASO 1: ESENCIAL Y OBLIGATORIO ── */}
      {paso === 0 && (
        <div className="form-grid">
          <label className="field form-grid__full">
            <span className="field__label">
              Nombre del proyecto <b style={{ color: 'var(--brand)' }}>*</b>
            </span>
            <input
              className="field__input"
              required
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. ERP Mascotas Patitas"
            />
          </label>

          <div className="field">
            <span className="field__label">
              Cliente asociado
            </span>
            <Combobox
              opciones={[
                { valor: '', etiqueta: 'Sin cliente (Interno / Propio)' },
                ...clientes.map((c) => ({ valor: c.id, etiqueta: c.nombre })),
              ]}
              valor={clienteId}
              onCambio={(v) => {
                setClienteId(v)
                setError(null)
              }}
              placeholder="Selecciona cliente…"
            />
          </div>

          <div className="field">
            <span className="field__label">
              Estado inicial <b style={{ color: 'var(--brand)' }}>*</b>
            </span>
            <Combobox
              opciones={estados.map((e) => ({ valor: e.id, etiqueta: e.nombre, color: e.color }))}
              valor={estadoId}
              onCambio={(v) => {
                setEstadoId(v)
                setError(null)
              }}
              buscar={false}
            />
          </div>

          <div className="field">
            <span className="field__label">Categoría</span>
            <Combobox
              opciones={CATEGORIAS.map((c) => ({ valor: c.valor, etiqueta: c.etiqueta }))}
              valor={categoria}
              onCambio={(v) => setCategoria(v as CategoriaProyecto)}
              buscar={false}
            />
          </div>

          <label className="field form-grid__full">
            <span className="field__label">Descripción o propósito principal</span>
            <textarea
              className="field__input"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Objetivo principal del proyecto y alcance inicial…"
            />
          </label>
        </div>
      )}

      {/* ── PASO 2: ALCANCE Y CLASIFICACIÓN ── */}
      {paso === 1 && (
        <div className="form-grid">
          {esDesarrollo(categoria) && (
            <div className="field form-grid__full">
              <span className="field__label">Tipo de desarrollo</span>
              <Combobox
                opciones={TIPOS_DESARROLLO.map((t) => ({ valor: t.valor, etiqueta: t.etiqueta }))}
                valor={tipoDesarrollo ?? ''}
                onCambio={(v) => {
                  const t = v as TipoDesarrollo
                  setTipoDesarrollo(t)
                  setModulos(modulosSugeridos(t))
                }}
                placeholder="ERP, Landing, SaaS, A medida…"
              />
            </div>
          )}

          {esDesarrollo(categoria) && modulos.length > 0 && (
            <div className="field form-grid__full">
              <span className="field__label">
                Alcance por módulos <span className="field__hint">(horas estimadas y costos)</span>
              </span>
              <SelectorModulos tipo={tipoDesarrollo} modulos={modulos} onCambio={setModulos} />
            </div>
          )}

          <div className="field form-grid__full">
            <span className="field__label">Etiquetas (Tags)</span>
            <SelectorTags
              catalogo={tags}
              seleccion={tagIds}
              onCambio={setTagIds}
              onCrear={onCrearTag}
            />
          </div>
        </div>
      )}

      {/* ── PASO 3: EQUIPO, FECHAS Y CONDICIONES ── */}
      {paso === 2 && (
        <div className="form-grid">
          <div className="field form-grid__full">
            <span className="field__label">
              Responsables <span className="field__hint">(el primero es el responsable principal)</span>
            </span>
            <div className="chips-sel">
              {colaboradores.map((c) => {
                const idx = responsables.indexOf(c.id)
                const activo = idx >= 0
                return (
                  <button
                    type="button"
                    key={c.id}
                    className={'chip-sel' + (activo ? ' is-on' : '')}
                    onClick={() => toggleResp(c.id)}
                  >
                    {idx === 0 && <Star size={11} fill="currentColor" />}
                    {c.nombre}
                  </button>
                )
              })}
              {colaboradores.length === 0 && (
                <span className="field__hint">No hay colaboradores activos.</span>
              )}
            </div>
          </div>

          <label className="field">
            <span className="field__label">Fecha de inicio</span>
            <input
              className="field__input"
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">Fecha de entrega estimada</span>
            <input
              className="field__input"
              type="date"
              value={entregaEstim}
              onChange={(e) => setEntregaEstim(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">Medio de pago acordado</span>
            <input
              className="field__input"
              value={medioPago}
              onChange={(e) => setMedioPago(e.target.value)}
              placeholder="Pago Móvil, Transferencia, Zelle…"
            />
          </label>

          {inicial && (
            <label className="field">
              <span className="field__label">
                Progreso ({progreso}%)
              </span>
              <div className="pf-progreso">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={progreso}
                  onChange={(e) => setProgreso(Number(e.target.value))}
                />
                <input
                  className="field__input pf-progreso__num"
                  type="number"
                  min={0}
                  max={100}
                  value={progreso}
                  onChange={(e) => setProgreso(Number(e.target.value))}
                />
              </div>
            </label>
          )}

          <label className="field form-grid__full">
            <span className="field__label">
              Notas / puntos clave <span className="field__hint">(insumo para contratos y minutas)</span>
            </span>
            <textarea
              className="field__input"
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Acuerdos específicos, requerimientos o condiciones comerciales…"
            />
          </label>
        </div>
      )}

      {error && (
        <p className="form__error" style={{ marginTop: 12 }} role="alert">
          {error}
        </p>
      )}

      {/* ── BOTONES DE NAVEGACIÓN Y GUARDADO ── */}
      <footer className="form-acciones">
        <div>
          {paso > 0 ? (
            <Button type="button" variant="ghost" onClick={retroceder}>
              <ChevronLeft size={16} /> Anterior
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={onCancelar}>
              Cancelar
            </Button>
          )}
        </div>

        <div className="form-acciones__grupo">
          {paso < PASOS_PROYECTO.length - 1 ? (
            <Button type="button" onClick={avanzar}>
              Siguiente <ChevronRight size={16} />
            </Button>
          ) : (
            <Button type="submit">
              {inicial ? 'Guardar cambios' : 'Crear proyecto'}
            </Button>
          )}
        </div>
      </footer>
    </form>
  )
}
