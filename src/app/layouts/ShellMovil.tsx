import { useEffect, useState, useMemo } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  FolderKanban,
  KanbanSquare,
  Wallet,
  LayoutGrid,
  LogOut,
  X,
  ChevronLeft,
} from 'lucide-react'
import { useAuth, ModalMiCuenta } from '@/modules/auth'
import { useDatos } from '@/core/datos'
import { RecordatoriosPagos } from '@/modules/herramientas'
import { BuscadorGlobal } from '@/core/buscador'
import { env } from '@/core/config/env'
import { useGestos, vibrar } from '@/core/hooks/useGestos'
import { MODULOS_MOVIL } from './navMovil'

/** Lo que se alcanza con el pulgar: cuatro destinos y el acceso a todo lo demás. */
const NAV_MOVIL = [
  { to: '/inicio', label: 'Inicio', Icon: Home },
  { to: '/tablero', label: 'Tablero', Icon: KanbanSquare },
  { to: '/proyectos', label: 'Proyectos', Icon: FolderKanban },
  { to: '/cobranza', label: 'Cobros', Icon: Wallet },
]

/**
 * Cáscara de la vista móvil.
 *
 * Se comporta como una aplicación, no como una página: deslizar desde el borde
 * izquierdo vuelve atrás, la navegación inferior llega al pulgar y el resto del
 * sistema se abre en una hoja inferior en vez de esconderse.
 */
export function ShellMovil() {
  const { user, signOut } = useAuth()
  const { estado } = useDatos()
  const nav = useNavigate()
  const ruta = useLocation()
  const [hoja, setHoja] = useState(false)
  const [cuentaAbierta, setCuentaAbierta] = useState(false)

  // Encontrar colaborador vinculado
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

  const nombreUsuario =
    colabActual?.nombre ||
    (user?.user_metadata?.nombre as string) ||
    user?.email?.split('@')[0] ||
    'Usuario'

  const fotoPerfil =
    colabActual?.fotoPerfil || (user?.user_metadata?.fotoPerfil as string) || undefined

  const iniciales = useMemo(() => {
    const n = nombreUsuario.trim()
    const partes = n.split(/\s+/)
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase()
    }
    return n.slice(0, 2).toUpperCase()
  }, [nombreUsuario])

  // Al cambiar de pantalla se cierra la hoja y se sube el scroll: en una app,
  // una pantalla nueva empieza arriba.
  useEffect(() => {
    setHoja(false)
    document.querySelector('.movil__main')?.scrollTo({ top: 0 })
  }, [ruta.pathname])

  const puedeVolver = ruta.pathname !== '/inicio'

  const refGestos = useGestos<HTMLDivElement>({
    onVolver: () => {
      if (!puedeVolver) return
      vibrar()
      nav(-1)
    },
  })

  const moduloActual = MODULOS_MOVIL.flatMap((g) => g.items).find((m) =>
    ruta.pathname.startsWith(m.to),
  )

  return (
    <div className="movil" ref={refGestos}>
      <header className="movil__top">
        {puedeVolver ? (
          <button
            className="movil__volver"
            onClick={() => {
              vibrar()
              nav(-1)
            }}
            aria-label="Volver"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <img className="brand__logo" src="/marca-sd.png" alt="" aria-hidden="true" />
        )}

        <span className="movil__titulo">{moduloActual?.label ?? env.appName}</span>

        <BuscadorGlobal compacto />
        <button
          className="icono-btn"
          onClick={() => {
            vibrar()
            setCuentaAbierta(true)
          }}
          aria-label="Mi Cuenta"
          title={`Mi Cuenta (${nombreUsuario})`}
          style={{ padding: 2 }}
        >
          {fotoPerfil ? (
            <img
              src={fotoPerfil}
              alt=""
              style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div
              className="user-avatar"
              style={{ width: 24, height: 24, fontSize: 10 }}
            >
              {iniciales}
            </div>
          )}
        </button>
      </header>

      <main className="movil__main">
        <Outlet />
      </main>

      <RecordatoriosPagos />

      {/* Hoja inferior con todo el sistema: en un teléfono, una barra de cuatro
          destinos no puede ser el único acceso a diecisiete pantallas. */}
      {hoja && (
        <div className="movil-hoja" role="dialog" aria-label="Todos los módulos">
          <div className="movil-hoja__velo" onClick={() => setHoja(false)} />
          <div className="movil-hoja__panel">
            <div className="movil-hoja__asa" aria-hidden="true" />
            <header className="movil-hoja__cab">
              <h2>Todo el sistema</h2>
              <button className="icono-btn" onClick={() => setHoja(false)} aria-label="Cerrar">
                <X size={16} />
              </button>
            </header>

            <div className="movil-hoja__cuerpo">
              {/* Tarjeta de usuario en la hoja móvil */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'color-mix(in srgb, var(--surface-2) 75%, transparent)',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  marginBottom: 16,
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div
                    className="user-avatar"
                    style={{ width: 36, height: 36, fontSize: 13, flexShrink: 0 }}
                  >
                    {fotoPerfil ? <img src={fotoPerfil} alt="" /> : <span>{iniciales}</span>}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {nombreUsuario}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user?.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    style={{ fontSize: 11.5, padding: '4px 10px' }}
                    onClick={() => {
                      vibrar()
                      setHoja(false)
                      setCuentaAbierta(true)
                    }}
                  >
                    Cuenta
                  </button>
                  <button
                    type="button"
                    className="icono-btn"
                    style={{ color: '#f87171' }}
                    onClick={() => {
                      vibrar()
                      setHoja(false)
                      void signOut()
                    }}
                    aria-label="Cerrar Sesión"
                    title="Cerrar Sesión"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>

              {MODULOS_MOVIL.map((g) => (
                <section key={g.grupo}>
                  <h3 className="movil-hoja__grupo">{g.grupo}</h3>
                  <div className="movil-hoja__rejilla">
                    {g.items.map((m) => (
                      <NavLink
                        key={m.to}
                        to={m.to}
                        className={({ isActive }) =>
                          'movil-hoja__item' + (isActive ? ' is-on' : '')
                        }
                        onClick={() => vibrar()}
                      >
                        <m.Icon size={19} strokeWidth={1.75} />
                        <span>{m.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="movil__nav">
        {NAV_MOVIL.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'on' : '')}
            onClick={() => vibrar()}
          >
            <item.Icon size={20} strokeWidth={1.75} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          className={hoja ? 'on' : ''}
          onClick={() => {
            vibrar()
            setHoja((v) => !v)
          }}
          aria-expanded={hoja}
        >
          <LayoutGrid size={20} strokeWidth={1.75} />
          <span>Todo</span>
        </button>
      </nav>

      <ModalMiCuenta abierto={cuentaAbierta} onCerrar={() => setCuentaAbierta(false)} />
    </div>
  )
}
