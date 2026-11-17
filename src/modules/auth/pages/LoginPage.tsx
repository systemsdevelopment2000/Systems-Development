import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Smartphone, Monitor } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '@/core/supabase/client'
import { useVista } from '@/core/vista'
import { useSonido } from '@/core/sonido'
import { LoginForm } from '../components/LoginForm'
import { RegisterForm } from '../components/RegisterForm'
import { ForgotForm } from '../components/ForgotForm'
import { ResetPasswordForm } from '../components/ResetPasswordForm'
import '../styles/onepage.css'

type AuthModo = 'login' | 'registro' | 'recuperar' | 'nueva-clave'

export function LoginPage() {
  const { isAuthenticated } = useAuth()
  const { vista, setVista } = useVista()
  const { sonar } = useSonido()
  const nav = useNavigate()
  const [errorRecuperacion, setErrorRecuperacion] = useState<string | null>(null)

  const [modo, setModo] = useState<AuthModo>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      const search = window.location.search
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        return 'nueva-clave'
      }
      if (hash.includes('error_description') || search.includes('error_description')) {
        return 'recuperar'
      }
    }
    return 'login'
  })

  // Escuchar eventos de autenticación de Supabase (especialmente PASSWORD_RECOVERY)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      const search = window.location.search
      if (hash.includes('error_description') || search.includes('error_description')) {
        const raw = hash.includes('error_description') ? hash.slice(1) : search.slice(1)
        const params = new URLSearchParams(raw)
        const desc = params.get('error_description')
        if (desc) {
          setErrorRecuperacion(
            'El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.',
          )
          setModo('recuperar')
        }
      } else if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        setModo('nueva-clave')
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setModo('nueva-clave')
      }
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  // Si ya está autenticado, llevar al tablero principal (a menos que esté en el flujo de restablecer contraseña)
  if (isAuthenticated && modo !== 'nueva-clave') {
    return <Navigate to="/tablero" replace />
  }

  function irAPaginaPrincipal() {
    sonar('tap')
    nav('/')
  }

  function alternarVista() {
    sonar('tap')
    setVista(vista === 'telefono' ? 'escritorio' : 'telefono')
  }

  function cambiarModo(nuevoModo: AuthModo) {
    sonar('tap')
    setErrorRecuperacion(null)
    setModo(nuevoModo)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Cabecera con marca interactiva */}
        <div className="login-header">
          <button
            type="button"
            onClick={irAPaginaPrincipal}
            className="login-brand-btn"
            title="Ir a la página principal de Systems Development"
          >
            <img
              src="/marca-sd.png"
              alt="Systems Development"
              className="login-brand-logo"
            />
          </button>

          <h2 className="login-brand-title">
            Systems Development
          </h2>

          <div className="login-brand-badge">
            <ShieldCheck size={12} /> Portal de Acceso Seguro
          </div>
        </div>

        {/* Selector de modo (Segmented Tabs con microinteracción hover) */}
        <div className="op-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'login'}
            className={'op-tab' + (modo === 'login' ? ' is-active' : '')}
            onClick={() => cambiarModo('login')}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'registro'}
            className={'op-tab' + (modo === 'registro' ? ' is-active' : '')}
            onClick={() => cambiarModo('registro')}
          >
            Registro
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'recuperar'}
            className={'op-tab' + (modo === 'recuperar' ? ' is-active' : '')}
            onClick={() => cambiarModo('recuperar')}
          >
            Recuperar
          </button>
          {modo === 'nueva-clave' && (
            <button
              type="button"
              role="tab"
              aria-selected={true}
              className="op-tab is-active"
            >
              Nueva Clave
            </button>
          )}
        </div>

        <div className="login-subhead">
          <p className="login-subhead__desc">
            {modo === 'login' && 'Ingresa tus credenciales para acceder a la plataforma operativa.'}
            {modo === 'registro' && 'Completa el registro en 2 pasos para incorporarte al equipo.'}
            {modo === 'recuperar' && 'Te enviaremos un enlace de recuperación seguro a tu correo.'}
            {modo === 'nueva-clave' && 'Ingresa tu nueva contraseña para actualizar el acceso a tu cuenta.'}
          </p>
        </div>

        {/* Formularios con inputs interactivos */}
        {modo === 'login' && (
          <LoginForm
            autoFocus={true}
            onIrARegistro={() => cambiarModo('registro')}
            onIrARecuperar={() => cambiarModo('recuperar')}
          />
        )}

        {modo === 'registro' && <RegisterForm autoFocus={true} onIrALogin={() => cambiarModo('login')} />}

        {modo === 'recuperar' && (
          <ForgotForm
            autoFocus={true}
            mensajeInicial={errorRecuperacion}
            onIrALogin={() => cambiarModo('login')}
          />
        )}

        {modo === 'nueva-clave' && (
          <ResetPasswordForm
            autoFocus={true}
            onCompletado={() => {
              if (typeof window !== 'undefined') {
                window.history.replaceState(null, '', window.location.pathname)
              }
              nav('/tablero', { replace: true })
            }}
            onIrALogin={() => cambiarModo('login')}
          />
        )}

        {/* Pie con navegación y conmutador de vista responsivo con hover estético */}
        <div className="login-footer-nav">
          <button
            type="button"
            onClick={irAPaginaPrincipal}
            className="login-back-btn"
            title="Volver a la página informativa de Systems Development"
          >
            <ArrowLeft size={13} className="login-back-btn__arrow" />
            <span>Página principal</span>
          </button>

          <button
            type="button"
            className="login-view-btn"
            onClick={alternarVista}
            title={vista === 'escritorio' ? 'Ver en simulador de teléfono' : 'Volver a pantalla completa de escritorio'}
          >
            {vista === 'escritorio' ? (
              <>
                <Smartphone size={13} className="login-view-btn__icon" />
                <span>Probar móvil</span>
              </>
            ) : (
              <>
                <Monitor size={13} className="login-view-btn__icon" />
                <span>Vista escritorio</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

