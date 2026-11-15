import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, UserPlus, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/core/ui'
import { env } from '@/core/config/env'
import { useAuth } from '../hooks/useAuth'

interface Props {
  onIrALogin: () => void
  autoFocus?: boolean
}

const ROLES_SUGERIDOS = [
  'Arquitecto de Software',
  'Desarrollador Frontend',
  'Desarrollador Backend',
  'Desarrollador Fullstack',
  'Diseñador UI/UX',
  'Ingeniero de QA',
  'Gerente de Proyecto / Operaciones',
  'Consultor de Negocios',
]

export function RegisterForm({ onIrALogin, autoFocus = false }: Props) {
  const { signUp } = useAuth()

  const [paso, setPaso] = useState<1 | 2>(1)
  const [nombre, setNombre] = useState('')
  const [cargo, setCargo] = useState(ROLES_SUGERIDOS[0])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verPass, setVerPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)
  const [loading, setLoading] = useState(false)

  function avanzarPaso() {
    if (!email.trim() || !password) {
      setError('Por favor completa el correo y la contraseña.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe contener al menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setError(null)
    setPaso(2)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (paso === 1) {
      avanzarPaso()
      return
    }

    if (!nombre.trim()) {
      setError('Por favor indica tu nombre completo.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      await signUp({
        email: email.trim(),
        password,
        nombre: nombre.trim(),
        cargo,
      })
      setExito(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar el registro.')
    } finally {
      setLoading(false)
    }
  }

  if (exito) {
    return (
      <div className="op-auth__aviso op-auth__aviso--exito" style={{ textAlign: 'center', padding: '20px 16px' }}>
        <CheckCircle2 size={32} color="var(--exito)" style={{ margin: '0 auto 10px' }} />
        <h3 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--text)' }}>¡Registro completado!</h3>
        <p style={{ margin: '0 0 14px', fontSize: 12.5, color: 'var(--text-muted)' }}>
          {env.authBypass
            ? 'Usuario registrado correctamente en modo desarrollo. Ya puedes iniciar sesión.'
            : 'Hemos enviado un correo de confirmación a tu bandeja de entrada.'}
        </p>
        <Button onClick={onIrALogin} style={{ width: '100%' }}>
          Ir a Iniciar Sesión
        </Button>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {/* Indicador de pasos numerados coherentes */}
      <div className="reg-steps" role="tablist">
        <button
          type="button"
          className={'reg-step' + (paso === 1 ? ' is-active' : ' is-done')}
          onClick={() => setPaso(1)}
        >
          <span className="reg-step__num">1</span>
          <span className="reg-step__lbl">Acceso Obligatorio</span>
        </button>
        <div className="reg-step__line" />
        <button
          type="button"
          className={'reg-step' + (paso === 2 ? ' is-active' : '')}
          onClick={avanzarPaso}
        >
          <span className="reg-step__num">2</span>
          <span className="reg-step__lbl">Perfil &amp; Rol</span>
        </button>
      </div>

      {paso === 1 ? (
        <>
          <label className="field">
            <span className="field__label">Correo corporativo</span>
            <input
              className="field__input"
              type="email"
              autoComplete="email"
              required
              autoFocus={autoFocus}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@systemsdevelopment.com"
            />
          </label>

          <div className="field">
            <span className="field__label">Contraseña (mínimo 6 caracteres)</span>
            <div style={{ position: 'relative' }}>
              <input
                className="field__input"
                type={verPass ? 'text' : 'password'}
                autoComplete="new-password"
                required
                style={{ width: '100%', paddingRight: 38 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
              <button
                type="button"
                className="icono-btn"
                style={{ position: 'absolute', right: 4, top: 4 }}
                onClick={() => setVerPass((v) => !v)}
                title={verPass ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {verPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <label className="field">
            <span className="field__label">Confirmar contraseña</span>
            <input
              className="field__input"
              type={verPass ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
            />
          </label>

          {error && (
            <p className="form__error" role="alert">
              {error}
            </p>
          )}

          <Button type="button" onClick={avanzarPaso} style={{ width: '100%', marginTop: 4 }}>
            Continuar: Perfil y Rol <ArrowRight size={15} />
          </Button>
        </>
      ) : (
        <>
          <label className="field">
            <span className="field__label">Nombre completo</span>
            <input
              className="field__input"
              required
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Ing. Carlos González"
            />
          </label>

          <label className="field">
            <span className="field__label">Rol o especialidad técnica</span>
            <select
              className="field__input"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
            >
              {ROLES_SUGERIDOS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p className="form__error" role="alert">
              {error}
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, marginTop: 4 }}>
            <Button variant="ghost" type="button" onClick={() => setPaso(1)}>
              <ArrowLeft size={14} /> Volver
            </Button>
            <Button type="submit" loading={loading}>
              <UserPlus size={15} /> Finalizar Registro
            </Button>
          </div>
        </>
      )}

      <div className="op-auth__switch">
        <span>¿Ya tienes cuenta?</span>
        <button type="button" className="op-auth__switch-btn" onClick={onIrALogin}>
          Inicia sesión
        </button>
      </div>
    </form>
  )
}
