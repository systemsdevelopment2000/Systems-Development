import { useState, type FormEvent } from 'react'
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/core/ui'
import { env } from '@/core/config/env'
import { useAuth } from '../hooks/useAuth'

interface Props {
  onIrALogin: () => void
  autoFocus?: boolean
}

export function ForgotForm({ onIrALogin, autoFocus = false }: Props) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electrónico.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      if (env.authBypass) {
        setEnviado(true)
      } else {
        await resetPassword(email.trim())
        setEnviado(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el enlace de recuperación.')
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <div className="op-auth__aviso op-auth__aviso--exito" style={{ textAlign: 'center', padding: '24px 16px' }}>
        <CheckCircle2 size={36} color="var(--exito)" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ margin: '0 0 6px', fontSize: 17, color: 'var(--text)' }}>Enlace enviado</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-muted)' }}>
          {env.authBypass
            ? 'Enlace de restablecimiento simulado para el entorno local. Ya puedes volver a ingresar.'
            : `Hemos enviado un enlace seguro a ${email}. Abre el correo y sigue las instrucciones para fijar tu nueva contraseña.`}
        </p>
        <Button onClick={onIrALogin} style={{ width: '100%' }}>
          <ArrowLeft size={16} /> Volver a Iniciar Sesión
        </Button>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <p style={{ margin: '0 0 10px', fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        Ingresa el correo corporativo vinculado a tu cuenta y te enviaremos un enlace de recuperación seguro.
      </p>

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

      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 6 }}>
        <Mail size={16} /> Enviar enlace de recuperación
      </Button>

      <div className="op-auth__switch">
        <button type="button" className="op-auth__switch-btn" onClick={onIrALogin}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <ArrowLeft size={14} /> Volver a Iniciar Sesión
          </span>
        </button>
      </div>
    </form>
  )
}

