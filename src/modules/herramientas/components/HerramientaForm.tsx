import { useState, type FormEvent, type KeyboardEvent } from 'react'
import {
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  GitBranch,
  KeyRound,
} from 'lucide-react'
import { Button, Combobox, Stepper, type PasoDef } from '@/core/ui'
import { nuevoId, type CicloPago, type Cliente, type Herramienta, type PropietarioHerramienta, type Proyecto, type AccesoHerramienta } from '@/core/datos'
import type { EntradaHerramienta } from '../hooks/useHerramientas'
import { CATEGORIAS_HERRAMIENTA, detectarTipoHerramienta } from '../lib/categoriasHerramientas'
import { calcularProximoPagoPorDia } from '../hooks/useHerramientas'

interface Props {
  inicial?: Herramienta
  clientes: Cliente[]
  proyectos: Proyecto[]
  onGuardar: (datos: EntradaHerramienta) => void
  onCancelar: () => void
}

const PASOS_HERRAMIENTA: PasoDef[] = [
  { id: 'servicio', titulo: '1. Herramienta', descripcion: 'Nombre y tipo' },
  { id: 'pagos', titulo: '2. Pagos y Fechas', descripcion: 'Día de pago y costos' },
  { id: 'accesos', titulo: '3. Contraseñas y Accesos', descripcion: 'Tokens y vinculación Git' },
]

export function HerramientaForm({ inicial, clientes, proyectos, onGuardar, onCancelar }: Props) {
  // Al editar, muestra todos los datos por defecto para que nada quede oculto
  const [verTodo, setVerTodo] = useState(Boolean(inicial))
  const [paso, setPaso] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Datos principales de la herramienta
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [tipoHerramienta, setTipoHerramienta] = useState(
    inicial?.tipoHerramienta ?? (inicial?.nombre ? detectarTipoHerramienta(inicial.nombre, inicial.url) : 'base_datos'),
  )
  const [url, setUrl] = useState(inicial?.url ?? '')
  const [propietario, setPropietario] = useState<PropietarioHerramienta>(
    inicial?.propietario ?? 'sd',
  )
  const [activa, setActiva] = useState(inicial?.activa ?? true)

  // Asignación de clientes y proyectos
  const [clienteIds, setClienteIds] = useState<string[]>(
    inicial?.clienteIds ?? (inicial?.clienteId ? [inicial.clienteId] : []),
  )
  const [proyectoIds, setProyectoIds] = useState<string[]>(
    inicial?.proyectoIds ?? (inicial?.proyectoId ? [inicial.proyectoId] : []),
  )
  const [reparto, setReparto] = useState(inicial?.reparto ?? 'partes_iguales')

  // Datos de pago y fecha recurrente
  const [ciclo, setCiclo] = useState<CicloPago>(inicial?.ciclo ?? 'mensual')
  const [diaPagoMes, setDiaPagoMes] = useState<string>(
    inicial?.diaPagoMes != null ? String(inicial.diaPagoMes) : '',
  )
  const [proximoPago, setProximoPago] = useState(inicial?.proximoPago ?? '')
  const [precio, setPrecio] = useState(inicial?.precio != null ? String(inicial.precio) : '')
  const [moneda, setMoneda] = useState(inicial?.moneda ?? 'USD')
  const [metodoPago, setMetodoPago] = useState(inicial?.metodoPago ?? '')
  const [notas, setNotas] = useState(inicial?.notas ?? '')

  // Contraseñas y Accesos que parten de la herramienta
  const [accesos, setAccesos] = useState<AccesoHerramienta[]>(() => {
    if (inicial?.accesos && inicial.accesos.length > 0) {
      return inicial.accesos
    }
    if (inicial?.correo || inicial?.contrasena) {
      return [
        {
          id: nuevoId(),
          nombre: 'Acceso Principal',
          usuario: inicial.correo ?? '',
          contrasena: inicial.contrasena ?? '',
          token: '',
          vinculaGit: false,
        },
      ]
    }
    return [
      {
        id: nuevoId(),
        nombre: 'Acceso Principal',
        usuario: '',
        contrasena: '',
        token: '',
        vinculaGit: false,
      },
    ]
  })

  // Visibilidad de contraseñas por ID de acceso
  const [verPassMap, setVerPassMap] = useState<Record<string, boolean>>({})

  const proyectosFiltrados = clienteIds.length
    ? proyectos.filter((p) => p.clienteId && clienteIds.includes(p.clienteId))
    : proyectos

  function toggleVerPass(id: string) {
    setVerPassMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function agregarAcceso() {
    setAccesos((prev) => [
      ...prev,
      {
        id: nuevoId(),
        nombre: `Acceso #${prev.length + 1}`,
        usuario: '',
        contrasena: '',
        token: '',
        vinculaGit: false,
      },
    ])
  }

  function actualizarAcceso(id: string, campo: keyof AccesoHerramienta, valor: unknown) {
    setAccesos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [campo]: valor } : a)),
    )
  }

  function eliminarAcceso(id: string) {
    if (accesos.length <= 1) return
    setAccesos((prev) => prev.filter((a) => a.id !== id))
  }

  function onCambioDiaPago(v: string) {
    const num = v.replace(/\D/g, '')
    if (!num) {
      setDiaPagoMes('')
      return
    }
    const val = Math.min(31, Math.max(1, Number(num)))
    setDiaPagoMes(String(val))
    // Si no hay fecha de próximo pago seleccionada o para sugerir, calcula automáticamente
    if (!proximoPago || proximoPago.length === 10) {
      setProximoPago(calcularProximoPagoPorDia(val))
    }
  }

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
      if (!verTodo && paso < PASOS_HERRAMIENTA.length - 1) {
        e.preventDefault()
        avanzar()
      }
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!verTodo && paso < PASOS_HERRAMIENTA.length - 1) {
      avanzar()
      return
    }

    if (!validarPaso1()) {
      if (!verTodo) setPaso(0)
      return
    }

    // Limpia y normaliza accesos
    const accesosFinales = accesos.map((a, i) => ({
      ...a,
      nombre: a.nombre.trim() || `Acceso #${i + 1}`,
      usuario: a.usuario?.trim() || undefined,
      contrasena: a.contrasena || undefined,
      token: a.token?.trim() || undefined,
      vinculaGit: Boolean(a.vinculaGit),
      notas: a.notas?.trim() || undefined,
    }))

    onGuardar({
      id: inicial?.id,
      nombre: nombre.trim(),
      tipoHerramienta,
      url: url.trim() || undefined,
      propietario,
      clienteIds: propietario === 'cliente' && clienteIds.length ? clienteIds : undefined,
      proyectoIds: propietario === 'cliente' && proyectoIds.length ? proyectoIds : undefined,
      reparto: propietario === 'cliente' && clienteIds.length > 1 ? reparto : undefined,
      clienteId: undefined,
      proyectoId: undefined,
      diaPagoMes: diaPagoMes ? Number(diaPagoMes) : undefined,
      accesos: accesosFinales,
      correo: accesosFinales[0]?.usuario || undefined,
      contrasena: accesosFinales[0]?.contrasena || undefined,
      ciclo,
      precio: precio ? Number(precio) : undefined,
      moneda: moneda || undefined,
      metodoPago: metodoPago.trim() || undefined,
      proximoPago: proximoPago || undefined,
      notas: notas.trim() || undefined,
      activa,
    })
  }

  // ── SECCIÓN 1: DATOS GENERALES DE LA HERRAMIENTA ──
  const bloqueHerramienta = (
    <div className="form-grid">
      <label className="field form-grid__full">
        <span className="field__label">
          Nombre de la herramienta / plataforma <b style={{ color: 'var(--brand)' }}>*</b>
        </span>
        <input
          className="field__input"
          required
          autoFocus={!inicial}
          value={nombre}
          onChange={(e) => {
            const val = e.target.value
            setNombre(val)
            setError(null)
            if (!inicial && val && !tipoHerramienta) {
              setTipoHerramienta(detectarTipoHerramienta(val, url))
            }
          }}
          placeholder="Ej. Supabase, Digital Ocean, IA Antigravity, Vercel…"
        />
      </label>

      <div className="field">
        <span className="field__label">Tipo / Clasificación de la herramienta</span>
        <Combobox
          opciones={CATEGORIAS_HERRAMIENTA.map((c) => ({
            valor: c.id,
            etiqueta: c.etiqueta,
            subetiqueta: c.descripcion,
          }))}
          valor={tipoHerramienta}
          onCambio={(v) => setTipoHerramienta(v)}
          buscar={false}
        />
      </div>

      <label className="field">
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
  )

  // ── SECCIÓN 2: PAGOS Y CLIENTES VINCULADOS ──
  const bloquePagosYClientes = (
    <div className="form-grid">
      <div className="field">
        <span className="field__label">Ciclo de facturación</span>
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

      <label className="field">
        <span className="field__label">
          Día de pago recurrente <span className="field__hint">(ej. 15 de cada mes)</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Día</span>
          <input
            className="field__input"
            type="number"
            min={1}
            max={31}
            value={diaPagoMes}
            onChange={(e) => onCambioDiaPago(e.target.value)}
            placeholder="15"
            style={{ width: 80, textAlign: 'center' }}
          />
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>de cada mes</span>
        </div>
      </label>

      <label className="field">
        <span className="field__label">Próxima fecha de renovación / pago</span>
        <input
          className="field__input"
          type="date"
          value={proximoPago}
          onChange={(e) => setProximoPago(e.target.value)}
        />
      </label>

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
        <span className="field__label">Notas comerciales o de facturación</span>
        <input
          className="field__input"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Plan Pro, cupones o condiciones de pago…"
        />
      </label>

      {propietario === 'cliente' && (
        <>
          <div className="field form-grid__full">
            <span className="field__label">
              Clientes asignados <span className="field__hint">(cuentas o proyectos que comparten el servicio)</span>
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
  )

  // ── SECCIÓN 3: CONTRASEÑAS Y ACCESOS QUE PARTEN DE LA HERRAMIENTA ──
  const bloqueAccesos = (
    <div className="hrr-form-accesos">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <p className="field__hint" style={{ margin: 0 }}>
          Puedes registrar múltiples contraseñas, credenciales o access tokens específicos (ej. por cliente o proyecto).
        </p>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={agregarAcceso}
          style={{ gap: 6, fontSize: 12 }}
        >
          <Plus size={14} /> Agregar otro acceso
        </button>
      </div>

      {accesos.map((acc, idx) => {
        const verPass = Boolean(verPassMap[acc.id])

        return (
          <div key={acc.id} className="hrr-acc-form-card">
            <div className="hrr-acc-form-card__head">
              <span className="hrr-acc-form-card__tit">
                <KeyRound size={14} />
                Acceso #{idx + 1}: {acc.nombre || 'Sin título'}
              </span>

              {accesos.length > 1 && (
                <button
                  type="button"
                  className="icono-btn icono-btn--peligro"
                  onClick={() => eliminarAcceso(acc.id)}
                  title="Eliminar este acceso"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="form-grid">
              <label className="field">
                <span className="field__label">
                  Nombre o Identificador del acceso <b style={{ color: 'var(--brand)' }}>*</b>
                </span>
                <input
                  className="field__input"
                  required
                  value={acc.nombre}
                  onChange={(e) => actualizarAcceso(acc.id, 'nombre', e.target.value)}
                  placeholder="Ej. Access Tokken SUPABASE MGG, Acceso Principal…"
                />
              </label>

              <div className="field">
                <span className="field__label">¿Vincula con repositorio Git / GitHub?</span>
                <label className="toggle" style={{ marginTop: 6 }}>
                  <input
                    type="checkbox"
                    checked={Boolean(acc.vinculaGit)}
                    onChange={(e) => actualizarAcceso(acc.id, 'vinculaGit', e.target.checked)}
                  />
                  <span className="toggle__sw" />
                  <span className="toggle__txt" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <GitBranch size={13} />
                    {acc.vinculaGit ? 'Sí, vinculado a Git' : 'No vinculado'}
                  </span>
                </label>
              </div>

              <label className="field">
                <span className="field__label">Usuario o Correo registrado</span>
                <input
                  className="field__input"
                  value={acc.usuario ?? ''}
                  onChange={(e) => actualizarAcceso(acc.id, 'usuario', e.target.value)}
                  placeholder="soporte@sd.dev o ID de usuario"
                />
              </label>

              <div className="field">
                <span className="field__label">Contraseña de acceso</span>
                <div style={{ position: 'relative' }}>
                  <input
                    className="field__input"
                    type={verPass ? 'text' : 'password'}
                    style={{ width: '100%', paddingRight: 36 }}
                    value={acc.contrasena ?? ''}
                    onChange={(e) => actualizarAcceso(acc.id, 'contrasena', e.target.value)}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    className="icono-btn"
                    style={{ position: 'absolute', right: 4, top: 4 }}
                    onClick={() => toggleVerPass(acc.id)}
                    title={verPass ? 'Ocultar' : 'Ver'}
                  >
                    {verPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <label className="field form-grid__full">
                <span className="field__label">
                  Access Token / Clave API <span className="field__hint">(token personal, secret key o API key)</span>
                </span>
                <input
                  className="field__input mono"
                  style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12.5 }}
                  value={acc.token ?? ''}
                  onChange={(e) => actualizarAcceso(acc.id, 'token', e.target.value)}
                  placeholder="sbp_xxxx o token personal de acceso…"
                />
              </label>

              <label className="field form-grid__full">
                <span className="field__label">Notas específicas de este acceso</span>
                <input
                  className="field__input"
                  value={acc.notas ?? ''}
                  onChange={(e) => actualizarAcceso(acc.id, 'notas', e.target.value)}
                  placeholder="Roles, permisos asignados, fecha de expiración del token…"
                />
              </label>
            </div>
          </div>
        )
      })}

      <button
        type="button"
        className="hrr-btn-agregar-acc"
        onClick={agregarAcceso}
      >
        <Plus size={15} /> Agregar otra contraseña o access token
      </button>
    </div>
  )

  return (
    <form onSubmit={submit} onKeyDown={handleKeyDown} noValidate>
      <Stepper
        pasos={PASOS_HERRAMIENTA}
        pasoActual={paso}
        onPasoClick={irAlPaso}
        verTodo={verTodo}
        onToggleVerTodo={setVerTodo}
      />

      {verTodo ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div id="seccion-paso-servicio">
            <div className="form-seccion form-grid__full" style={{ marginTop: 0, paddingTop: 4, borderTop: 'none' }}>
              <span className="form-seccion__tit">1. Herramienta y Clasificación de Servicio</span>
            </div>
            {bloqueHerramienta}
          </div>

          <div id="seccion-paso-pagos">
            <div className="form-seccion form-grid__full">
              <span className="form-seccion__tit">2. Datos de Pago, Fechas y Asignación</span>
            </div>
            {bloquePagosYClientes}
          </div>

          <div id="seccion-paso-accesos">
            <div className="form-seccion form-grid__full">
              <span className="form-seccion__tit">3. Contraseñas y Accesos que parten de la herramienta</span>
            </div>
            {bloqueAccesos}
          </div>
        </div>
      ) : (
        <>
          {paso === 0 && bloqueHerramienta}
          {paso === 1 && bloquePagosYClientes}
          {paso === 2 && bloqueAccesos}
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
                {inicial ? 'Guardar cambios' : 'Registrar herramienta'}
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
          </>
        )}
      </footer>
    </form>
  )
}
