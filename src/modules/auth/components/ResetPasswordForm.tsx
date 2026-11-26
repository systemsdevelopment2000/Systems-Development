import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, KeyRound, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/core/ui'
import { useAuth } from '../hooks/useAuth'

interface Props {
  onCompletado: () => void
  onIrALogin: () => void
  autoFocus?: boolean
}

export function ResetPasswordForm({ onCompletado, onIrALogin, autoFocus = true }: Props) {
  const { updatePassword } = useAuth()
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [verNueva, setVerNueva] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [exito, setExito] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nuevaPassword || !confirmarPassword) {
      setError('Por favor completa ambos campos de contraseña.')
      return
    }
    if (nuevaPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden. Por favor verifica.')
      return
    }

    setError(null)
    setLoading(true)
    try {
      await updatePassword(nuevaPassword)
      setExito(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la contraseña. El enlace puede haber expirado.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (exito) {
    return (
      <div
        className="op-auth__aviso op-auth__aviso--exito"
        style={{ textAlign: 'center', padding: '24px 16px' }}
      >
        <CheckCircle2 size={40} color="var(--exito)" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ margin: '0 0 6px', fontSize: 18, color: 'var(--text)' }}>
          ¡Contraseña actualizada!
        </h3>
        <p style={{ margin: '0 0 18px', fontSize: 13.5, color: 'var(--text-muted)' }}>
          Tu clave de acceso ha sido restablecida con éxito. Ya puedes ingresar al sistema con tus
          nuevas credenciales.
        </p>
        <Button onClick={onCompletado} style={{ width: '100%' }}>
          Continuar al Tablero <ArrowRight size={16} />
        </Button>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <span className="field__label">Nueva contraseña</span>
        <div style={{ position: 'relative' }}>
          <input
            className="field__input"
            type={verNueva ? 'text' : 'password'}
            name="nuevaPassword"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            data-no-capitalize="true"
            autoComplete="new-password"
            required
            autoFocus={autoFocus}
            style={{ width: '100%', paddingRight: 38 }}
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
          <button
            type="button"
            className="icono-btn"
            style={{ position: 'absolute', right: 4, top: 4 }}
            onClick={() => setVerNueva((v) => !v)}
            title={verNueva ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            {verNueva ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      <div className="field">
        <span className="field__label">Confirmar nueva contraseña</span>
        <div style={{ position: 'relative' }}>
          <input
            className="field__input"
            type={verConfirmar ? 'text' : 'password'}
            name="confirmarPassword"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            data-no-capitalize="true"
            autoComplete="new-password"
            required
            style={{ width: '100%', paddingRight: 38 }}
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            placeholder="Repite tu nueva contraseña"
          />
          <button
            type="button"
            className="icono-btn"
            style={{ position: 'absolute', right: 4, top: 4 }}
            onClick={() => setVerConfirmar((v) => !v)}
            title={verConfirmar ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            {verConfirmar ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8 }}>
        <KeyRound size={16} /> Guardar nueva contraseña
      </Button>

      <div className="op-auth__switch">
        <button type="button" className="op-auth__switch-btn" onClick={onIrALogin}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <ArrowLeft size={14} /> Cancelar y volver al inicio
          </span>
        </button>
      </div>
    </form>
  )
}
