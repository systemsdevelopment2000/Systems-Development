import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '@/core/ui'
import { useAuth } from '../hooks/useAuth'

interface Props {
  onIrARegistro: () => void
  onIrARecuperar: () => void
  autoFocus?: boolean
}

export function LoginForm({ onIrARegistro, onIrARecuperar, autoFocus = false }: Props) {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: { pathname?: string } } }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verPass, setVerPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Por favor completa tu correo y contraseña.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await signIn({ email: email.trim(), password })
      const to = location.state?.from?.pathname ?? '/tablero'
      navigate(to, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="field__label">Contraseña</span>
          <button
            type="button"
            className="op-auth__switch-btn"
            style={{ fontSize: 12 }}
            onClick={onIrARecuperar}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            className="field__input"
            type={verPass ? 'text' : 'password'}
            autoComplete="current-password"
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

      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" loading={loading} style={{ width: '100%' }}>
        <LogIn size={15} /> Entrar a la plataforma
      </Button>

      <div className="op-auth__switch">
        <span>¿No tienes una cuenta aún?</span>
        <button type="button" className="op-auth__switch-btn" onClick={onIrARegistro}>
          Crear cuenta
        </button>
      </div>
    </form>
  )
}
