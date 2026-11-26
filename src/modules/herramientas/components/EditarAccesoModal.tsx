import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, GitBranch, KeyRound } from 'lucide-react'
import type { AccesoHerramienta } from '@/core/datos'
import { primeraMayuscula } from '@/core/lib/validaciones'
import { normalizarAcceso } from '../lib/accesos'

interface Props {
  acceso: AccesoHerramienta
  onGuardar: (acceso: AccesoHerramienta) => void
  onCancelar: () => void
}

/**
 * Editor de UNA sola credencial. Se abre desde la bóveda, las tarjetas o la tabla
 * para no tener que buscar el acceso dentro del formulario completo.
 * Los demás accesos no se tocan: la página reemplaza solo el que tenga este id.
 */
export function EditarAccesoModal({ acceso, onGuardar, onCancelar }: Props) {
  const [form, setForm] = useState<AccesoHerramienta>({ ...acceso })
  const [verPass, setVerPass] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function cambiar(campo: keyof AccesoHerramienta, valor: unknown) {
    const tratado =
      campo === 'nombre' || campo === 'notas'
        ? typeof valor === 'string'
          ? primeraMayuscula(valor)
          : valor
        : valor
    setForm((prev) => ({ ...prev, [campo]: tratado }))
    setError(null)
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (!form.nombre.trim()) {
      setError('Escribe un nombre para esta credencial.')
      return
    }
    onGuardar(normalizarAcceso(form))
  }

  return (
    <form onSubmit={onSubmit} className="hrr-editar-acceso">
      <p className="field__hint" style={{ marginTop: 0 }}>
        Cambia los datos de esta credencial. Las demás credenciales de la herramienta quedan igual.
      </p>

      <div className="form-grid">
        <label className="field form-grid__full">
          <span className="field__label">
            Nombre o identificador del acceso <b style={{ color: 'var(--brand)' }}>*</b>
          </span>
          <input
            className="field__input"
            required
            value={form.nombre}
            onChange={(e) => cambiar('nombre', e.target.value)}
            placeholder="Ej. Acceso Principal, Access Token SUPABASE…"
          />
        </label>

        <div className="field">
          <span className="field__label">¿Vincula con repositorio Git / GitHub?</span>
          <label className="toggle" style={{ marginTop: 6 }}>
            <input
              type="checkbox"
              checked={Boolean(form.vinculaGit)}
              onChange={(e) => cambiar('vinculaGit', e.target.checked)}
            />
            <span className="toggle__sw" />
            <span className="toggle__txt" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <GitBranch size={13} />
              {form.vinculaGit ? 'Sí, vinculado a Git' : 'No vinculado'}
            </span>
          </label>
        </div>

        <label className="field">
          <span className="field__label">Usuario o correo registrado</span>
          <input
            className="field__input"
            name="usuario"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            data-no-capitalize="true"
            value={form.usuario ?? ''}
            onChange={(e) => cambiar('usuario', e.target.value)}
            placeholder="soporte@sd.dev o ID de usuario"
          />
        </label>

        <div className="field form-grid__full">
          <span className="field__label">Contraseña de acceso</span>
          <div style={{ position: 'relative' }}>
            <input
              className="field__input"
              type={verPass ? 'text' : 'password'}
              name="contrasena"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              data-no-capitalize="true"
              style={{ width: '100%', paddingRight: 36 }}
              value={form.contrasena ?? ''}
              onChange={(e) => cambiar('contrasena', e.target.value)}
              placeholder="••••••••••••"
            />
            <button
              type="button"
              className="icono-btn"
              style={{ position: 'absolute', right: 4, top: 4 }}
              onClick={() => setVerPass((v) => !v)}
              title={verPass ? 'Ocultar contraseña' : 'Ver contraseña'}
              aria-label={verPass ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {verPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <label className="field form-grid__full">
          <span className="field__label">
            <KeyRound size={12} /> Access Token / Clave API{' '}
            <span className="field__hint">(token personal, secret key o API key)</span>
          </span>
          <input
            className="field__input mono"
            name="token"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            data-no-capitalize="true"
            style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12.5 }}
            value={form.token ?? ''}
            onChange={(e) => cambiar('token', e.target.value)}
            placeholder="sbp_xxxx o token personal de acceso…"
          />
        </label>

        <label className="field form-grid__full">
          <span className="field__label">Notas específicas de este acceso</span>
          <input
            className="field__input"
            value={form.notas ?? ''}
            onChange={(e) => cambiar('notas', e.target.value)}
            placeholder="Roles, permisos asignados, fecha de expiración del token…"
          />
        </label>
      </div>

      {error && (
        <p className="form__error" style={{ marginTop: 12 }} role="alert">
          {error}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
        <button type="button" className="btn btn--ghost" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary">
          Guardar credencial
        </button>
      </div>
    </form>
  )
}
