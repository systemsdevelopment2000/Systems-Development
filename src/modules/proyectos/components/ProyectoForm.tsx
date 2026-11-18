import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, Combobox, SelectorTags, Stepper, type PasoDef } from '@/core/ui'
import type { Cliente, Colaborador, EstadoProyecto, Tag } from '@/core/datos'
import { primeraMayuscula } from '@/core/lib/validaciones'
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
  // Al editar, muestra todos los datos para acceso y edición directa
  const [verTodo, setVerTodo] = useState(Boolean(inicial))
  const [paso, setPaso] = useState(0)

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
    if (paso === 0 && !validarPaso1()) return
    const siguiente = Math.min(paso + 1, PASOS_PROYECTO.length - 1)
    setPaso(siguiente)
    setError(null)
  }

  function retroceder() {
    setError(null)
    setPaso((prev) => Math.max(prev - 1, 0))
  }

  function irAlPaso(n: number) {
    if (n > 0 && !validarPaso1()) return
    setError(null)
    setPaso(n)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault()
      e.stopPropagation()
      if (!verTodo && paso < PASOS_PROYECTO.length - 1) {
        avanzar()
      }
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!verTodo && paso < PASOS_PROYECTO.length - 1) {
      avanzar()
      return
    }

    if (!validarPaso1()) {
      if (!verTodo) setPaso(0)
      return
    }
    if (responsables.length === 0 && estadoId !== estadoInicialId) {
      setError('Para un estado distinto al inicial debes asignar al menos un responsable.')
      if (!verTodo) setPaso(2)
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

  const bloqueEsencial = (
    <div className="form-grid">
      <label className="field form-grid__full">
        <span className="field__label">
          Nombre del proyecto <b style={{ color: 'var(--brand)' }}>*</b>
        </span>
        <input
          className="field__input"
          required
          autoFocus={!inicial}
          value={nombre}
          onChange={(e) => {
            setNombre(primeraMayuscula(e.target.value))
            setError(null)
          }}
          placeholder="Ej. Rediseño Portal Corporativo"
        />
      </label>

      <div className="field">
        <span className="field__label">Cliente</span>
        <Combobox
          opciones={clientes.map((c) => ({
            valor: c.id,
            etiqueta: c.nombre,
            subetiqueta: c.ubicacion,
          }))}
          valor={clienteId}
          onCambio={setClienteId}
          placeholder="Sin cliente vinculado"
        />
      </div>

      <div className="field">
        <span className="field__label">Categoría del servicio</span>
        <Combobox
          opciones={CATEGORIAS.map((c) => ({ valor: c.valor, etiqueta: c.etiqueta }))}
          valor={categoria}
          onCambio={(v) => {
            const cat = v as CategoriaProyecto
            setCategoria(cat)
            if (!esDesarrollo(cat)) {
              setTipoDesarrollo(undefined)
              setModulos([])
            }
          }}
          buscar={false}
        />
      </div>

      <div className="field form-grid__full">
        <span className="field__label">
          Estado del proyecto <b style={{ color: 'var(--brand)' }}>*</b>
        </span>
        <Combobox
          opciones={estados.map((e) => ({
            valor: e.id,
            etiqueta: e.nombre,
            color: e.color,
          }))}
          valor={estadoId}
          onCambio={(v) => {
            setEstadoId(v)
            setError(null)
          }}
          buscar={false}
        />
      </div>

      <label className="field form-grid__full">
        <span className="field__label">Descripción o brief inicial</span>
        <textarea
          className="field__input"
          rows={2}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Objetivo principal del proyecto, alcance general, entregables clave…"
        />
      </label>
    </div>
  )

  const bloqueAlcance = (
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
  )

  const bloqueCondiciones = (
    <div className="form-grid">
      <div className="field form-grid__full">
        <span className="field__label">
          Responsables <span className="field__hint">(el primero es el responsable principal)</span>
        </span>
        <div className="chips-sel">
          {colaboradores.map((c) => {
            const idx = responsables.indexOf(c.id)
            const asignado = idx !== -1
            const esLider = idx === 0
            return (
              <button
                type="button"
                key={c.id}
                className={'chip-sel' + (asignado ? ' is-on' : '')}
                onClick={() => toggleResp(c.id)}
              >
                {esLider && <Star size={12} fill="currentColor" />}
                {c.nombre}
                {asignado && <span className="chip-sel__orden">{idx + 1}</span>}
              </button>
            )
          })}
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
        <span className="field__label">Entrega estimada</span>
        <input
          className="field__input"
          type="date"
          value={entregaEstim}
          onChange={(e) => setEntregaEstim(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field__label">Medio de pago pactado</span>
        <input
          className="field__input"
          value={medioPago}
          onChange={(e) => setMedioPago(e.target.value)}
          placeholder="Transferencia, Zelle, Efectivo…"
        />
      </label>

      <label className="field">
        <span className="field__label">Progreso actual: {progreso}%</span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={progreso}
          onChange={(e) => setProgreso(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--brand)' }}
        />
      </label>

      <label className="field form-grid__full">
        <span className="field__label">Notas u observaciones</span>
        <textarea
          className="field__input"
          rows={3}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Acuerdos específicos, requerimientos o condiciones comerciales…"
        />
      </label>
    </div>
  )

  return (
    <form onSubmit={submit} onKeyDown={handleKeyDown} noValidate>
      <Stepper
        pasos={PASOS_PROYECTO}
        pasoActual={paso}
        onPasoClick={irAlPaso}
        verTodo={verTodo}
        onToggleVerTodo={setVerTodo}
      />

      {verTodo ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div id="seccion-paso-esencial">
            <div className="form-seccion form-grid__full" style={{ marginTop: 0, paddingTop: 4, borderTop: 'none' }}>
              <span className="form-seccion__tit">1. Datos Esenciales y Obligatorios</span>
            </div>
            {bloqueEsencial}
          </div>

          <div id="seccion-paso-alcance">
            <div className="form-seccion form-grid__full">
              <span className="form-seccion__tit">2. Alcance, Módulos y Clasificación</span>
            </div>
            {bloqueAlcance}
          </div>

          <div id="seccion-paso-condiciones">
            <div className="form-seccion form-grid__full">
              <span className="form-seccion__tit">3. Equipo, Fechas y Condiciones</span>
            </div>
            {bloqueCondiciones}
          </div>
        </div>
      ) : (
        <>
          {paso === 0 && bloqueEsencial}
          {paso === 1 && bloqueAlcance}
          {paso === 2 && bloqueCondiciones}
        </>
      )}

      {error && (
        <p className="form__error" style={{ marginTop: 12 }} role="alert">
          {error}
        </p>
      )}

      {/* ── BOTONES DE NAVEGACIÓN Y GUARDADO ── */}
      <footer className="form-acciones">
        {verTodo ? (
          <>
            <Button type="button" variant="ghost" onClick={onCancelar}>
              Cancelar
            </Button>
            <div className="form-acciones__grupo">
              <Button type="submit">
                {inicial ? 'Guardar cambios' : 'Crear proyecto'}
              </Button>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </footer>
    </form>
  )
}
