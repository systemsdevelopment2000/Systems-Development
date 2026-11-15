import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, Combobox, Stepper, type PasoDef } from '@/core/ui'
import type {
  CicloPago,
  Cliente,
  Herramienta,
  PropietarioHerramienta,
  Proyecto,
} from '@/core/datos'
import type { EntradaHerramienta } from '../hooks/useHerramientas'

interface Props {
  inicial?: Herramienta
  clientes: Cliente[]
  proyectos: Proyecto[]
  onGuardar: (datos: EntradaHerramienta) => void
  onCancelar: () => void
}

const PASOS_HERRAMIENTA: PasoDef[] = [
  { id: 'servicio', titulo: '1. Servicio', descripcion: 'Datos esenciales' },
  { id: 'asignacion', titulo: '2. Asignación', descripcion: 'Clientes y proyectos' },
  { id: 'pagos', titulo: '3. Pagos y Claves', descripcion: 'Costos y acceso' },
]

export function HerramientaForm({ inicial, clientes, proyectos, onGuardar, onCancelar }: Props) {
  const [paso, setPaso] = useState(0)
  const [maxPaso, setMaxPaso] = useState(inicial ? 2 : 0)
  const [error, setError] = useState<string | null>(null)

  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [url, setUrl] = useState(inicial?.url ?? '')
  const [propietario, setPropietario] = useState<PropietarioHerramienta>(
    inicial?.propietario ?? 'sd',
  )
  const [clienteIds, setClienteIds] = useState<string[]>(
    inicial?.clienteIds ?? (inicial?.clienteId ? [inicial.clienteId] : []),
  )
  const [proyectoIds, setProyectoIds] = useState<string[]>(
    inicial?.proyectoIds ?? (inicial?.proyectoId ? [inicial.proyectoId] : []),
  )
  const [reparto, setReparto] = useState(inicial?.reparto ?? 'partes_iguales')
  const [correo, setCorreo] = useState(inicial?.correo ?? '')
  const [contrasena, setContrasena] = useState(inicial?.contrasena ?? '')
  const [verPass, setVerPass] = useState(false)
  const [ciclo, setCiclo] = useState<CicloPago>(inicial?.ciclo ?? 'mensual')
  const [precio, setPrecio] = useState(inicial?.precio != null ? String(inicial.precio) : '')
  const [moneda, setMoneda] = useState(inicial?.moneda ?? 'USD')
  const [metodoPago, setMetodoPago] = useState(inicial?.metodoPago ?? '')
  const [proximoPago, setProximoPago] = useState(inicial?.proximoPago ?? '')
  const [notas, setNotas] = useState(inicial?.notas ?? '')
  const [activa, setActiva] = useState(inicial?.activa ?? true)

  const proyectosFiltrados = clienteIds.length
    ? proyectos.filter((p) => p.clienteId && clienteIds.includes(p.clienteId))
    : proyectos

  function validarPaso1(): boolean {
    if (!nombre.trim()) {
      setError('Debes ingresar el nombre de la herramienta o servicio.')
      return false
    }
    setError(null)
    return true
  }

  function avanzar() {
    if (paso === 0 && !validarPaso1()) return
    const siguiente = Math.min(paso + 1, PASOS_HERRAMIENTA.length - 1)
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

    onGuardar({
      id: inicial?.id,
      nombre: nombre.trim(),
      url: url.trim() || undefined,
      propietario,
      clienteIds: propietario === 'cliente' && clienteIds.length ? clienteIds : undefined,
      proyectoIds: propietario === 'cliente' && proyectoIds.length ? proyectoIds : undefined,
      reparto: propietario === 'cliente' && clienteIds.length > 1 ? reparto : undefined,
      clienteId: undefined,
      proyectoId: undefined,
      correo: correo.trim() || undefined,
      contrasena: contrasena || undefined,
      ciclo,
      precio: precio ? Number(precio) : undefined,
      moneda: moneda || undefined,
      metodoPago: metodoPago.trim() || undefined,
      proximoPago: proximoPago || undefined,
      notas: notas.trim() || undefined,
      activa,
    })
  }

  return (
    <form onSubmit={submit} noValidate>
      <Stepper
        pasos={PASOS_HERRAMIENTA}
        pasoActual={paso}
        maxPasoAlcanzado={maxPaso}
        onPasoClick={irAlPaso}
      />

      {/* ── PASO 1: SERVICIO Y PROPIETARIO ── */}
      {paso === 0 && (
        <div className="form-grid">
          <label className="field form-grid__full">
            <span className="field__label">
              Nombre de la herramienta / servicio <b style={{ color: 'var(--brand)' }}>*</b>
            </span>
            <input
              className="field__input"
              required
              autoFocus
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value)
                setError(null)
              }}
              placeholder="Ej. Vercel Pro, Supabase Pro, Hostinger…"
            />
          </label>

          <label className="field form-grid__full">
            <span className="field__label">URL del sitio o panel de control</span>
            <input
              className="field__input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://app.servicio.com"
            />
          </label>

          <div className="field">
            <span className="field__label">Propietario del servicio</span>
            <Combobox
              opciones={[
                { valor: 'sd', etiqueta: 'Propia de SD' },
                { valor: 'cliente', etiqueta: 'Contratada para Cliente' },
              ]}
              valor={propietario}
              onCambio={(v) => setPropietario(v as PropietarioHerramienta)}
              buscar={false}
            />
          </div>

          <div className="field" style={{ justifyContent: 'center' }}>
            <span className="field__label">Estado operativo</span>
            <label className="toggle" style={{ marginTop: 6 }}>
              <input
                type="checkbox"
                checked={activa}
                onChange={(e) => setActiva(e.target.checked)}
              />
              <span className="toggle__sw" />
              <span className="toggle__txt">{activa ? 'Servicio activo' : 'Servicio inactivo / pausado'}</span>
            </label>
          </div>
        </div>
      )}

      {/* ── PASO 2: ASIGNACIÓN Y CLIENTES ── */}
      {paso === 1 && (
        <div className="form-grid">
          {propietario === 'sd' ? (
            <div className="form-grid__full" style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ margin: 0 }}>
                Esta herramienta es de uso interno exclusivo de <strong>Systems Development</strong>. No requiere asignación a clientes específicos.
              </p>
            </div>
          ) : (
            <>
              <div className="field form-grid__full">
                <span className="field__label">
                  Clientes asignados <span className="field__hint">(selecciona los clientes que usan esta cuenta)</span>
                </span>
                <div className="chips-sel">
                  {clientes.map((c) => {
                    const on = clienteIds.includes(c.id)
                    return (
                      <button
                        type="button"
                        key={c.id}
                        className={'chip-sel' + (on ? ' is-on' : '')}
                        onClick={() =>
                          setClienteIds((prev) =>
                            on ? prev.filter((x) => x !== c.id) : [...prev, c.id],
                          )
                        }
                      >
                        {c.nombre}
                      </button>
                    )
                  })}
                  {clientes.length === 0 && (
                    <span className="field__hint">No hay clientes registrados en el sistema.</span>
                  )}
                </div>
              </div>

              <div className="field form-grid__full">
                <span className="field__label">
                  Proyectos vinculados <span className="field__hint">(opcional)</span>
                </span>
                <div className="chips-sel">
                  {proyectosFiltrados.map((p) => {
                    const on = proyectoIds.includes(p.id)
                    return (
                      <button
                        type="button"
                        key={p.id}
                        className={'chip-sel' + (on ? ' is-on' : '')}
                        onClick={() =>
                          setProyectoIds((prev) =>
                            on ? prev.filter((x) => x !== p.id) : [...prev, p.id],
                          )
                        }
                      >
                        {p.nombre}
                      </button>
                    )
                  })}
                  {proyectosFiltrados.length === 0 && (
                    <span className="field__hint">
                      {clienteIds.length ? 'Ningún proyecto vinculado a estos clientes.' : 'Selecciona un cliente para ver sus proyectos.'}
                    </span>
                  )}
                </div>
              </div>

              {clienteIds.length > 1 && (
                <div className="field form-grid__full">
                  <span className="field__label">
                    Reparto del costo <span className="field__hint">(cuenta compartida por {clienteIds.length} clientes)</span>
                  </span>
                  <Combobox
                    opciones={[
                      {
                        valor: 'partes_iguales',
                        etiqueta: `Partes iguales entre los ${clienteIds.length} clientes`,
                      },
                      { valor: 'solo_sd', etiqueta: 'Lo asume SD (no facturar a los clientes)' },
                    ]}
                    valor={reparto}
                    onCambio={(v) => setReparto(v as 'partes_iguales' | 'solo_sd')}
                    buscar={false}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── PASO 3: PAGOS Y CREDENCIALES ── */}
      {paso === 2 && (
        <div className="form-grid">
          <div className="field">
            <span className="field__label">Ciclo de pago</span>
            <Combobox
              opciones={[
                { valor: 'mensual', etiqueta: 'Mensual' },
                { valor: 'anual', etiqueta: 'Anual' },
              ]}
              valor={ciclo}
              onCambio={(v) => setCiclo(v as CicloPago)}
              buscar={false}
            />
          </div>

          <div className="field">
            <span className="field__label">Precio estimado</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                className="field__input"
                type="number"
                step="0.01"
                min="0"
                style={{ flex: 1 }}
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0.00"
              />
              <select
                className="field__input"
                style={{ width: 88 }}
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="VES">VES</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <label className="field">
            <span className="field__label">Método de pago habitual</span>
            <input
              className="field__input"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              placeholder="Tarjeta internacional, PayPal, Zinli…"
            />
          </label>

          <label className="field">
            <span className="field__label">Próxima fecha de renovación</span>
            <input
              className="field__input"
              type="date"
              value={proximoPago}
              onChange={(e) => setProximoPago(e.target.value)}
            />
          </label>

          <div className="form-seccion form-grid__full">
            <span className="form-seccion__tit">Credenciales de Acceso (Bóveda)</span>
          </div>

          <label className="field">
            <span className="field__label">Usuario o Correo registrado</span>
            <input
              className="field__input"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="soporte@sd.dev"
            />
          </label>

          <div className="field">
            <span className="field__label">Contraseña de acceso</span>
            <div style={{ position: 'relative' }}>
              <input
                className="field__input"
                type={verPass ? 'text' : 'password'}
                style={{ width: '100%', paddingRight: 36 }}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••••••"
              />
              <button
                type="button"
                className="icono-btn"
                style={{ position: 'absolute', right: 4, top: 4 }}
                onClick={() => setVerPass((v) => !v)}
                title={verPass ? 'Ocultar' : 'Ver'}
              >
                {verPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <label className="field form-grid__full">
            <span className="field__label">Notas u observaciones</span>
            <textarea
              className="field__input"
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Datos de recuperación, 2FA, planes de migración…"
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
          {paso < PASOS_HERRAMIENTA.length - 1 ? (
            <Button type="button" onClick={avanzar}>
              Siguiente <ChevronRight size={16} />
            </Button>
          ) : (
            <Button type="submit">
              {inicial ? 'Guardar cambios' : 'Registrar herramienta'}
            </Button>
          )}
        </div>
      </footer>
    </form>
  )
}
