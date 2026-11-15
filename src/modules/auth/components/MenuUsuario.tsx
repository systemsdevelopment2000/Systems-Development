import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  User,
  Settings,
  Smartphone,
  Volume2,
  VolumeX,
  LogOut,
  Shield,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useDatos } from '@/core/datos'
import { useVista } from '@/core/vista'
import { useSonido } from '@/core/sonido'
import { ModalMiCuenta } from './ModalMiCuenta'
import '../styles/mi-cuenta.css'

export function MenuUsuario() {
  const { user, signOut } = useAuth()
  const { estado } = useDatos()
  const { setVista } = useVista()
  const { activo: sonidoActivo, alternar: alternarSonido, sonar } = useSonido()
  const nav = useNavigate()

  const [menuAbierto, setMenuAbierto] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Encontrar colaborador vinculado para enriquecer el display
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

  const cargoUsuario =
    colabActual?.rol ||
    colabActual?.titulo ||
    (user?.user_metadata?.rol as string) ||
    (user?.user_metadata?.cargo as string) ||
    'Colaborador'

  const fotoPerfil =
    colabActual?.fotoPerfil || (user?.user_metadata?.fotoPerfil as string) || undefined

  const rolSistema = colabActual?.rolSistema || 'admin'

  const iniciales = useMemo(() => {
    const n = nombreUsuario.trim()
    const partes = n.split(/\s+/)
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase()
    }
    return n.slice(0, 2).toUpperCase()
  }, [nombreUsuario])

  // Cerrar menú al hacer clic fuera o presionar escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuAbierto(false)
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuAbierto(false)
      }
    }

    if (menuAbierto) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuAbierto])

  function alternarMenu() {
    sonar('tap')
    setMenuAbierto(!menuAbierto)
  }

  function abrirMiCuenta() {
    sonar('abrir')
    setMenuAbierto(false)
    setModalAbierto(true)
  }

  function irAConfiguracion() {
    sonar('tap')
    setMenuAbierto(false)
    nav('/configuracion')
  }

  function cambiarAMovil() {
    sonar('tap')
    setMenuAbierto(false)
    setVista('telefono')
  }

  function alternarSonidos() {
    alternarSonido()
  }

  async function handleCerrarSesion() {
    sonar('cerrar')
    setMenuAbierto(false)
    await signOut()
  }

  if (!user) return null

  return (
    <>
      <div className="user-menu-wrapper" ref={dropdownRef}>
        {/* Botón interactivo pill en el topbar */}
        <button
          type="button"
          className="topbar__user-btn"
          onClick={alternarMenu}
          aria-expanded={menuAbierto}
          aria-haspopup="true"
          title={`Sesión iniciada como ${nombreUsuario}`}
        >
          <div className="user-avatar" aria-hidden="true">
            {fotoPerfil ? (
              <img src={fotoPerfil} alt="" />
            ) : (
              <span>{iniciales}</span>
            )}
          </div>

          <div className="topbar__user-info">
            <span className="topbar__user-name">{nombreUsuario}</span>
            <span className="topbar__user-role">{cargoUsuario}</span>
          </div>

          <ChevronDown size={14} className="topbar__user-chevron" aria-hidden="true" />
        </button>

        {/* Dropdown flotante */}
        {menuAbierto && (
          <div className="user-menu-dropdown" role="menu" aria-label="Opciones de usuario">
            {/* Header del dropdown */}
            <div className="user-menu__header">
              <div className="user-avatar user-avatar--lg" aria-hidden="true">
                {fotoPerfil ? (
                  <img src={fotoPerfil} alt="" />
                ) : (
                  <span>{iniciales}</span>
                )}
              </div>
              <div className="user-menu__header-meta">
                <span className="user-menu__name" title={nombreUsuario}>
                  {nombreUsuario}
                </span>
                <span className="user-menu__email" title={user.email ?? ''}>
                  {user.email}
                </span>
                <span
                  className={`user-menu__badge ${
                    rolSistema === 'admin' ? 'user-menu__badge--admin' : ''
                  }`}
                >
                  <Shield size={10} />
                  {rolSistema === 'admin' ? 'Administrador' : rolSistema === 'editor' ? 'Editor' : 'Lectura'}
                </span>
              </div>
            </div>

            {/* Opciones del menú */}
            <div className="user-menu__items">
              <button
                type="button"
                className="user-menu__item"
                role="menuitem"
                onClick={abrirMiCuenta}
              >
                <div className="user-menu__item-left">
                  <span className="user-menu__item-icon">
                    <User size={16} />
                  </span>
                  <span>Mi Cuenta & Perfil</span>
                </div>
              </button>

              <button
                type="button"
                className="user-menu__item"
                role="menuitem"
                onClick={irAConfiguracion}
              >
                <div className="user-menu__item-left">
                  <span className="user-menu__item-icon">
                    <Settings size={16} />
                  </span>
                  <span>Configuración General</span>
                </div>
              </button>

              <button
                type="button"
                className="user-menu__item"
                role="menuitem"
                onClick={cambiarAMovil}
              >
                <div className="user-menu__item-left">
                  <span className="user-menu__item-icon">
                    <Smartphone size={16} />
                  </span>
                  <span>Vista Móvil PWA</span>
                </div>
              </button>

              <button
                type="button"
                className="user-menu__item"
                role="menuitem"
                onClick={alternarSonidos}
              >
                <div className="user-menu__item-left">
                  <span className="user-menu__item-icon">
                    {sonidoActivo ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </span>
                  <span>Sonidos del Sistema</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {sonidoActivo ? 'ON' : 'OFF'}
                </span>
              </button>

              <div className="user-menu__separator" />

              <button
                type="button"
                className="user-menu__item user-menu__item--danger"
                role="menuitem"
                onClick={() => void handleCerrarSesion()}
              >
                <div className="user-menu__item-left">
                  <span className="user-menu__item-icon">
                    <LogOut size={16} />
                  </span>
                  <span>Cerrar Sesión</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Mi Cuenta */}
      <ModalMiCuenta abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} />
    </>
  )
}

