import { useState, useEffect, useMemo } from 'react'
import {
  User,
  KeyRound,
  ShieldCheck,
  Sliders,
  LogOut,
  CheckCircle2,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  Check,
} from 'lucide-react'
import { Modal, SubirImagen } from '@/core/ui'
import { useAuth } from '../hooks/useAuth'
import { useDatos, nuevoId, type Colaborador, type RolSistema } from '@/core/datos'
import { useSonido } from '@/core/sonido'
import { useVista } from '@/core/vista'
import '../styles/mi-cuenta.css'

interface Props {
  abierto: boolean
  onCerrar: () => void
}

type Pestana = 'perfil' | 'seguridad' | 'rol' | 'preferencias'

export function ModalMiCuenta({ abierto, onCerrar }: Props) {
  const { user, updateProfile, updatePassword, signOut } = useAuth()
  const { estado, upsert } = useDatos()
  const { activo: sonidoActivo, alternar: alternarSonido, sonar } = useSonido()
  const { vista, setVista } = useVista()

  const [pestana, setPestana] = useState<Pestana>('perfil')

  // Identificar el colaborador vinculado al usuario actual
  const colabActual = useMemo(() => {
    if (!user) return null
    return (
      estado.colaboradores[user.id] ||
      Object.values(estado.colaboradores).find(
        (c) => c.contacto?.correo?.trim().toLowerCase() === user.email?.trim().toLowerCase(),
      ) ||
      null
    )
  }, [estado.colaboradores, user])

  // Estado del formulario de Perfil
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [cedula, setCedula] = useState('')
  const [titulo, setTitulo] = useState('')
  const [cargo, setCargo] = useState('')
  const [fotoPerfil, setFotoPerfil] = useState<string | undefined>(undefined)

  // Feedback de perfil
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [exitoPerfil, setExitoPerfil] = useState(false)
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null)

  // Estado del formulario de Contraseña
  const [claveActual, setClaveActual] = useState('')
  const [claveNueva, setClaveNueva] = useState('')
  const [claveConfirmar, setClaveConfirmar] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [guardandoClave, setGuardandoClave] = useState(false)
  const [exitoClave, setExitoClave] = useState(false)
  const [errorClave, setErrorClave] = useState<string | null>(null)

  // Confirmación para cerrar sesión
  const [confirmandoSalir, setConfirmandoSalir] = useState(false)

  // Cargar datos iniciales al abrir o cambiar de usuario
  useEffect(() => {
    if (abierto) {
      const nombreInicial =
        colabActual?.nombre ||
        (user?.user_metadata?.nombre as string) ||
        user?.email?.split('@')[0] ||
        ''
      const correoInicial = colabActual?.contacto?.correo || user?.email || ''
      const telefonoInicial = colabActual?.contacto?.telefono || ''
      const cedulaInicial = colabActual?.cedula || ''
      const tituloInicial = colabActual?.titulo || ''
      const cargoInicial =
        colabActual?.rol ||
        (user?.user_metadata?.rol as string) ||
        (user?.user_metadata?.cargo as string) ||
        'Colaborador'
      const fotoInicial =
        colabActual?.fotoPerfil || (user?.user_metadata?.fotoPerfil as string) || undefined

      setNombre(nombreInicial)
      setCorreo(correoInicial)
      setTelefono(telefonoInicial)
      setCedula(cedulaInicial)
      setTitulo(tituloInicial)
      setCargo(cargoInicial)
      setFotoPerfil(fotoInicial)

      setExitoPerfil(false)
      setErrorPerfil(null)
      setExitoClave(false)
      setErrorClave(null)
      setClaveActual('')
      setClaveNueva('')
      setClaveConfirmar('')
      setConfirmandoSalir(false)
    }
  }, [abierto, colabActual, user])

  // Rol del sistema
  const rolSistema: RolSistema = colabActual?.rolSistema || 'admin'

  async function handleGuardarPerfil(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) {
      setErrorPerfil('El nombre completo es obligatorio.')
      return
    }

    setGuardandoPerfil(true)
    setErrorPerfil(null)
    setExitoPerfil(false)

    try {
      // 1. Actualizar perfil en Auth
      await updateProfile({
        nombre: nombre.trim(),
        cargo: cargo.trim(),
        fotoPerfil,
        telefono: telefono.trim(),
        cedula: cedula.trim(),
        titulo: titulo.trim(),
      })

      // 2. Actualizar o crear Colaborador en DatosContext
      const ahora = new Date().toISOString()
      const colabId = colabActual?.id || user?.id || nuevoId()

      const colaboradorGuardado: Colaborador = {
        id: colabId,
        nombre: nombre.trim(),
        fotoPerfil,
        cedula: cedula.trim() || undefined,
        titulo: titulo.trim() || undefined,
        rol: cargo.trim() || undefined,
        contacto: {
          correo: correo.trim() || undefined,
          telefono: telefono.trim() || undefined,
          medio: colabActual?.contacto?.medio || 'whatsapp',
        },
        activo: true,
        esUsuario: true,
        rolSistema: colabActual?.rolSistema || 'admin',
        permisos: colabActual?.permisos,
        claveTemporal: colabActual?.claveTemporal,
        claveActualizada: colabActual?.claveActualizada,
        creadoEn: colabActual?.creadoEn || ahora.slice(0, 10),
      }

      upsert('colaboradores', colaboradorGuardado)
      sonar('exito')
      setExitoPerfil(true)
      setTimeout(() => setExitoPerfil(false), 4000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar los cambios del perfil.'
      setErrorPerfil(msg)
      sonar('eliminar')
    } finally {
      setGuardandoPerfil(false)
    }
  }

  async function handleActualizarClave(e: React.FormEvent) {
    e.preventDefault()
    setErrorClave(null)
    setExitoClave(false)

    if (claveNueva.length < 6) {
      setErrorClave('La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (claveNueva !== claveConfirmar) {
      setErrorClave('La nueva contraseña y su confirmación no coinciden.')
      return
    }

    setGuardandoClave(true)
    try {
      await updatePassword(claveNueva)

      if (colabActual) {
        upsert('colaboradores', {
          ...colabActual,
          claveTemporal: claveNueva,
          claveActualizada: new Date().toISOString(),
        })
      }

      sonar('exito')
      setExitoClave(true)
      setClaveActual('')
      setClaveNueva('')
      setClaveConfirmar('')
      setTimeout(() => setExitoClave(false), 5000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar la contraseña.'
      setErrorClave(msg)
      sonar('eliminar')
    } finally {
      setGuardandoClave(false)
    }
  }

  function handleCerrarSesion() {
    if (!confirmandoSalir) {
      setConfirmandoSalir(true)
      return
    }
    sonar('cerrar')
    onCerrar()
    void signOut()
  }

  const tabsNav = (
    <nav className="mi-cuenta__tabs" role="tablist" aria-label="Secciones de la cuenta">
      <button
        type="button"
        role="tab"
        aria-selected={pestana === 'perfil'}
        className={`mi-cuenta__tab ${pestana === 'perfil' ? 'is-active' : ''}`}
        onClick={() => setPestana('perfil')}
      >
        <User size={15} /> Perfil
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={pestana === 'seguridad'}
        className={`mi-cuenta__tab ${pestana === 'seguridad' ? 'is-active' : ''}`}
        onClick={() => setPestana('seguridad')}
      >
        <KeyRound size={15} /> Seguridad & Clave
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={pestana === 'rol'}
        className={`mi-cuenta__tab ${pestana === 'rol' ? 'is-active' : ''}`}
        onClick={() => setPestana('rol')}
      >
        <ShieldCheck size={15} /> Rol & Accesos
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={pestana === 'preferencias'}
        className={`mi-cuenta__tab ${pestana === 'preferencias' ? 'is-active' : ''}`}
        onClick={() => setPestana('preferencias')}
      >
        <Sliders size={15} /> Preferencias
      </button>
    </nav>
  )

  const pieModal = (
    <>
      <div>
        <button
          type="button"
          className={`btn ${confirmandoSalir ? 'btn--peligro' : 'btn--ghost'}`}
          onClick={handleCerrarSesion}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            color: confirmandoSalir ? undefined : '#f87171',
          }}
        >
          <LogOut size={15} />
          {confirmandoSalir ? '¿Confirmar cierre de sesión?' : 'Cerrar Sesión'}
        </button>
      </div>

      <div className="mi-cuenta__footer-actions">
        {confirmandoSalir && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setConfirmandoSalir(false)}
          >
            Cancelar
          </button>
        )}
        <button type="button" className="btn btn--ghost" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    </>
  )

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Mi Cuenta · Perfil de Usuario"
      ancho={620}
      cabeceraExtra={tabsNav}
      pie={pieModal}
    >
      <div className="mi-cuenta">
        {/* CUERPO DE LAS PESTAÑAS */}
        <div className="mi-cuenta__body">
          {/* 1. PERFIL */}
          {pestana === 'perfil' && (
            <form onSubmit={handleGuardarPerfil} className="form" style={{ gap: 12 }}>
              <div className="mi-cuenta__perfil-header">
                <div style={{ flexShrink: 0 }}>
                  <SubirImagen
                    valor={fotoPerfil}
                    onCambio={setFotoPerfil}
                    etiqueta="Foto de Perfil"
                    forma="circulo"
                  />
                </div>
                <div className="mi-cuenta__perfil-info">
                  <h3>{nombre || 'Usuario de SD'}</h3>
                  <p>{correo || user?.email}</p>
                  <span className="user-menu__badge user-menu__badge--admin" style={{ marginTop: 4 }}>
                    {cargo || 'Colaborador Activo'}
                  </span>
                </div>
              </div>

              {exitoPerfil && (
                <div className="mi-cuenta__alert mi-cuenta__alert--success">
                  <CheckCircle2 size={16} />
                  <span>Los datos de tu perfil se han actualizado exitosamente.</span>
                </div>
              )}

              {errorPerfil && (
                <div className="mi-cuenta__alert mi-cuenta__alert--warn">
                  <AlertTriangle size={16} />
                  <span>{errorPerfil}</span>
                </div>
              )}

              <div className="mi-cuenta__grid-2">
                <div className="campo">
                  <label className="campo__etiqueta">
                    Nombre completo <span style={{ color: 'var(--brand)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Carlos González"
                    required
                  />
                </div>

                <div className="campo">
                  <label className="campo__etiqueta">Correo de acceso</label>
                  <input
                    type="email"
                    className="input"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="correo@sd.dev"
                    disabled
                    title="El correo de autenticación no se puede modificar directamente"
                  />
                </div>
              </div>

              <div className="mi-cuenta__grid-2">
                <div className="campo">
                  <label className="campo__etiqueta">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    className="input"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. 0414-1234567"
                  />
                </div>

                <div className="campo">
                  <label className="campo__etiqueta">Cédula de Identidad</label>
                  <input
                    type="text"
                    className="input"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    placeholder="Ej. V-20111222"
                  />
                </div>
              </div>

              <div className="mi-cuenta__grid-2">
                <div className="campo">
                  <label className="campo__etiqueta">Título Profesional</label>
                  <input
                    type="text"
                    className="input"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej. Ing. de Sistemas"
                  />
                </div>

                <div className="campo">
                  <label className="campo__etiqueta">Cargo o Especialidad</label>
                  <input
                    type="text"
                    className="input"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="Ej. Arquitecto de Software"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="submit"
                  className="btn btn--primario"
                  disabled={guardandoPerfil}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
                >
                  <Save size={15} />
                  {guardandoPerfil ? 'Guardando...' : 'Guardar Perfil'}
                </button>
              </div>
            </form>
          )}

          {/* 2. SEGURIDAD & CONTRASEÑA */}
          {pestana === 'seguridad' && (
            <form onSubmit={handleActualizarClave} className="form" style={{ gap: 16 }}>
              <div className="mi-cuenta__alert mi-cuenta__alert--info">
                <KeyRound size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <strong>Gestión de Contraseña de Acceso</strong>
                  <p style={{ margin: '3px 0 0', opacity: 0.9 }}>
                    Puedes cambiar tu clave de acceso en cualquier momento. Se recomienda una clave
                    robusta de al menos 8 caracteres con letras y números.
                  </p>
                </div>
              </div>

              {exitoClave && (
                <div className="mi-cuenta__alert mi-cuenta__alert--success">
                  <CheckCircle2 size={16} />
                  <span>Tu contraseña ha sido actualizada con éxito.</span>
                </div>
              )}

              {errorClave && (
                <div className="mi-cuenta__alert mi-cuenta__alert--warn">
                  <AlertTriangle size={16} />
                  <span>{errorClave}</span>
                </div>
              )}

              <div className="campo">
                <label className="campo__etiqueta">Contraseña actual (opcional)</label>
                <input
                  type="password"
                  className="input"
                  value={claveActual}
                  onChange={(e) => setClaveActual(e.target.value)}
                  placeholder="Introduce tu clave actual si la recuerdas"
                />
              </div>

              <div className="mi-cuenta__grid-2">
                <div className="campo">
                  <label className="campo__etiqueta">
                    Nueva contraseña <span style={{ color: 'var(--brand)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={verClave ? 'text' : 'password'}
                      className="input"
                      value={claveNueva}
                      onChange={(e) => setClaveNueva(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      style={{ paddingRight: 38 }}
                    />
                    <button
                      type="button"
                      className="icono-btn"
                      style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }}
                      onClick={() => setVerClave(!verClave)}
                      aria-label="Ver u ocultar contraseña"
                    >
                      {verClave ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="campo">
                  <label className="campo__etiqueta">
                    Confirmar nueva contraseña <span style={{ color: 'var(--brand)' }}>*</span>
                  </label>
                  <input
                    type={verClave ? 'text' : 'password'}
                    className="input"
                    value={claveConfirmar}
                    onChange={(e) => setClaveConfirmar(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    required
                  />
                </div>
              </div>

              {colabActual?.claveActualizada && (
                <p style={{ fontSize: 11.5, color: 'var(--text-faint)', margin: 0 }}>
                  Última actualización de contraseña:{' '}
                  {new Date(colabActual.claveActualizada).toLocaleString('es-VE')}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="submit"
                  className="btn btn--primario"
                  disabled={guardandoClave}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
                >
                  <KeyRound size={15} />
                  {guardandoClave ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          )}

          {/* 3. ROL & ACCESOS */}
          {pestana === 'rol' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="mi-cuenta__card-info">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="mi-cuenta__card-title">
                    <ShieldCheck size={18} color="#05e4fd" />
                    <span>Nivel de Acceso en el Sistema</span>
                  </div>
                  <span className="mi-cuenta__status-badge">
                    <span className="mi-cuenta__status-dot" /> Cuenta Activa
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span className="user-menu__badge user-menu__badge--admin" style={{ fontSize: 12, padding: '3px 10px' }}>
                    {rolSistema === 'admin'
                      ? 'Administrador Total'
                      : rolSistema === 'editor'
                        ? 'Editor General'
                        : 'Acceso de Lectura'}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Asignado a: {colabActual?.nombre || user?.email}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  {rolSistema === 'admin'
                    ? 'Posees privilegios absolutos para consultar, crear, modificar y auditar cualquier registro de proyectos, clientes, finanzas, herramientas y cuentas de usuario en Systems Development.'
                    : rolSistema === 'editor'
                      ? 'Puedes operar sobre proyectos, reuniones, tareas y relaciones comerciales, con restricciones de solo consulta en presupuestos sensibles.'
                      : 'Tienes acceso de consulta para supervisar el progreso de proyectos y tareas.'}
                </p>
              </div>

              <div className="mi-cuenta__card-info">
                <div className="mi-cuenta__card-title">
                  <span>Módulos autorizados con tu perfil</span>
                </div>
                <div className="mi-cuenta__permisos-list">
                  {[
                    'Tablero Kanban',
                    'Proyectos & Alcance',
                    'Reuniones & Minutas',
                    'Hoja de Pendientes',
                    'Cartera de Clientes',
                    'Colaboradores & Equipo',
                    'Selección RRHH',
                    'Presupuesto Comercial',
                    'Cuentas por Cobrar',
                    'Tasas & Divisas BCV',
                    'Usuarios & Accesos',
                    'Bóveda de Herramientas',
                    'Auditoría del Sistema',
                    'Configuración Corporativa',
                  ].map((modulo) => (
                    <span key={modulo} className="mi-cuenta__permiso-chip is-allowed">
                      <Check size={12} color="#05e4fd" /> {modulo}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. PREFERENCIAS */}
          {pestana === 'preferencias' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Sonidos del sistema */}
              <div className="mi-cuenta__card-info">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="mi-cuenta__card-title">
                    {sonidoActivo ? <Volume2 size={18} color="#05e4fd" /> : <VolumeX size={18} />}
                    <span>Efectos de Sonido Web Audio</span>
                  </div>
                  <button
                    type="button"
                    className={`btn ${sonidoActivo ? 'btn--primario' : 'btn--ghost'}`}
                    onClick={alternarSonido}
                    style={{ fontSize: 12, padding: '4px 12px' }}
                  >
                    {sonidoActivo ? 'Activado' : 'Desactivado'}
                  </button>
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                  Genera respuestas táctiles y auditivas sintetizadas (sin descargas de audio) al hacer clic,
                  abrir diálogos, guardar registros o confirmar acciones.
                </p>
                {sonidoActivo && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      style={{ fontSize: 11.5, padding: '3px 9px' }}
                      onClick={() => sonar('exito')}
                    >
                      Probar éxito
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      style={{ fontSize: 11.5, padding: '3px 9px' }}
                      onClick={() => sonar('tap')}
                    >
                      Probar clic
                    </button>
                  </div>
                )}
              </div>

              {/* Vista del sistema */}
              <div className="mi-cuenta__card-info">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="mi-cuenta__card-title">
                    {vista === 'telefono' ? (
                      <Smartphone size={18} color="#05e4fd" />
                    ) : (
                      <Monitor size={18} color="#025ff5" />
                    )}
                    <span>Modo de Interfaz</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className={`btn ${vista === 'escritorio' ? 'btn--primario' : 'btn--ghost'}`}
                      onClick={() => setVista('escritorio')}
                      style={{ fontSize: 12, padding: '4px 10px' }}
                    >
                      Escritorio
                    </button>
                    <button
                      type="button"
                      className={`btn ${vista === 'telefono' ? 'btn--primario' : 'btn--ghost'}`}
                      onClick={() => setVista('telefono')}
                      style={{ fontSize: 12, padding: '4px 10px' }}
                    >
                      Móvil
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                  Alterna entre el panel extendido con barra lateral y el simulador de aplicación móvil
                  PWA optimizada para pulgar y gestos de navegación.
                </p>
              </div>

              {/* Información técnica del navegador */}
              <div className="mi-cuenta__card-info">
                <span style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>
                  SD Sistema · Build Vite 6 / React 19 · Puerto Ordaz, Venezuela
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

