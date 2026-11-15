import { useState, type FormEvent } from 'react'
import { Button, Combobox } from '@/core/ui'
import type { Colaborador, Permisos, RolSistema } from '@/core/datos'
import type { EntradaUsuario } from '../hooks/useUsuarios'
import { permisosPorRol } from '../lib/permisos'
import { PermisosEditor } from './PermisosEditor'

const ROLES: { valor: RolSistema; etiqueta: string }[] = [
  { valor: 'admin', etiqueta: 'Administrador' },
  { valor: 'editor', etiqueta: 'Editor' },
  { valor: 'lectura', etiqueta: 'Lectura' },
]

interface Props {
  inicial?: Colaborador
  disponibles: Colaborador[]
  onGuardar: (datos: EntradaUsuario) => void
  onCancelar: () => void
}

export function UsuarioForm({ inicial, disponibles, onGuardar, onCancelar }: Props) {
  const [colaboradorId, setColaboradorId] = useState(inicial?.id ?? '')
  const [correo, setCorreo] = useState(inicial?.contacto.correo ?? '')
  const [rolSistema, setRolSistema] = useState<RolSistema>(inicial?.rolSistema ?? 'editor')
  const [activo, setActivo] = useState(inicial?.activo ?? true)
  const [permisos, setPermisos] = useState<Permisos>(
    inicial?.permisos ?? permisosPorRol(inicial?.rolSistema ?? 'editor'),
  )
  const [error, setError] = useState<string | null>(null)

  function elegirColaborador(id: string) {
    setColaboradorId(id)
    const c = disponibles.find((x) => x.id === id)
    if (c && !correo) setCorreo(c.contacto.correo ?? '')
  }

  function cambiarRol(v: string) {
    const rol = v as RolSistema
    setRolSistema(rol)
    // El rol es un preset: reestablece los permisos a su base (editable abajo).
    setPermisos(permisosPorRol(rol))
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!colaboradorId) {
      setError('Selecciona un colaborador.')
      return
    }
    onGuardar({ id: colaboradorId, correo: correo.trim() || undefined, rolSistema, activo, permisos })
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <div className="field form-grid__full">
        <span className="field__label">Colaborador</span>
        {inicial ? (
          <input className="field__input" value={inicial.nombre} disabled />
        ) : disponibles.length ? (
          <Combobox
            opciones={disponibles.map((c) => ({ valor: c.id, etiqueta: c.nombre }))}
            valor={colaboradorId}
            onCambio={elegirColaborador}
            placeholder="Selecciona colaborador…"
          />
        ) : (
          <p className="field__hint">
            Todos los colaboradores ya tienen cuenta. Crea uno nuevo en Colaboradores.
          </p>
        )}
      </div>

      <label className="field form-grid__full">
        <span className="field__label">Correo (acceso)</span>
        <input
          className="field__input"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="usuario@sd.dev"
        />
      </label>

      <div className="field">
        <span className="field__label">Rol (preset de permisos)</span>
        <Combobox opciones={ROLES} valor={rolSistema} onCambio={cambiarRol} buscar={false} />
      </div>

      <div className="field" style={{ justifyContent: 'flex-end' }}>
        <label className="toggle">
          <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
          <span className="toggle__sw" />
          <span className="toggle__txt">Cuenta activa</span>
        </label>
      </div>

      <div className="field form-grid__full">
        <span className="field__label">Permisos</span>
        <PermisosEditor permisos={permisos} onCambio={setPermisos} />
      </div>

      {error && (
        <p className="form__error form-grid__full" role="alert">
          {error}
        </p>
      )}

      <div className="form-grid__full form-acciones">
        <Button type="button" variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">{inicial ? 'Guardar' : 'Dar acceso'}</Button>
      </div>
    </form>
  )
}
