import { useState, type FormEvent } from 'react'
import { Button, SubirImagen } from '@/core/ui'
import type { Colaborador } from '@/core/datos'
import type { EntradaColaborador } from '../hooks/useColaboradores'

interface Props {
  inicial?: Colaborador
  onGuardar: (datos: EntradaColaborador) => void
  onCancelar: () => void
}

export function ColaboradorForm({ inicial, onGuardar, onCancelar }: Props) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [fotoPerfil, setFoto] = useState<string | undefined>(inicial?.fotoPerfil)
  const [cedula, setCedula] = useState(inicial?.cedula ?? '')
  const [titulo, setTitulo] = useState(inicial?.titulo ?? '')
  const [rol, setRol] = useState(inicial?.rol ?? '')
  const [correo, setCorreo] = useState(inicial?.contacto.correo ?? '')
  const [telefono, setTelefono] = useState(inicial?.contacto.telefono ?? '')
  const [activo, setActivo] = useState(inicial?.activo ?? true)
  const [esUsuario, setEsUsuario] = useState(inicial?.esUsuario ?? true)

  function submit(e: FormEvent) {
    e.preventDefault()
    onGuardar({
      id: inicial?.id,
      nombre: nombre.trim(),
      fotoPerfil,
      cedula: cedula.trim() || undefined,
      titulo: titulo.trim() || undefined,
      rol: rol.trim() || undefined,
      contacto: {
        correo: correo.trim() || undefined,
        telefono: telefono.trim() || undefined,
      },
      activo,
      esUsuario,
    })
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <div className="form-grid__full">
        <SubirImagen valor={fotoPerfil} onCambio={setFoto} etiqueta="Foto" forma="circulo" />
      </div>

      <label className="field form-grid__full">
        <span className="field__label">Nombre completo</span>
        <input
          className="field__input"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Carlos González"
        />
      </label>

      <label className="field">
        <span className="field__label">Cédula</span>
        <input
          className="field__input"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          placeholder="V-20111222"
        />
      </label>

      <label className="field">
        <span className="field__label">Rol</span>
        <input
          className="field__input"
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          placeholder="Arquitecto, Frontend, Backend…"
        />
      </label>

      <label className="field form-grid__full">
        <span className="field__label">Título / profesión</span>
        <input
          className="field__input"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ing. de Sistemas"
        />
      </label>

      <label className="field">
        <span className="field__label">Correo</span>
        <input
          className="field__input"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="nombre@sd.dev"
        />
      </label>

      <label className="field">
        <span className="field__label">Teléfono</span>
        <input
          className="field__input"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="0414-1230000"
        />
      </label>

      <div className="form-grid__full toggles">
        <label className="toggle">
          <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
          <span className="toggle__sw" />
          <span className="toggle__txt">Activo</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={esUsuario}
            onChange={(e) => setEsUsuario(e.target.checked)}
          />
          <span className="toggle__sw" />
          <span className="toggle__txt">Tiene cuenta de usuario</span>
        </label>
      </div>

      <div className="form-grid__full form-acciones">
        <Button type="button" variant="ghost" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">{inicial ? 'Guardar cambios' : 'Crear colaborador'}</Button>
      </div>
    </form>
  )
}
