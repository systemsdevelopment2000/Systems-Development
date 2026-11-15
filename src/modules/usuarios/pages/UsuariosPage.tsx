import '../styles/usuarios.css'
import { useState } from 'react'
import { Plus, KeyRound, Copy, Check, RefreshCw, Users } from 'lucide-react'
import { Modal, Button } from '@/core/ui'
import type { Colaborador } from '@/core/datos'
import { useUsuarios, type EntradaUsuario } from '../hooks/useUsuarios'
import { UsuarioForm } from '../components/UsuarioForm'
import { UsuarioCard } from '../components/UsuarioCard'

function generarClave(): string {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let s = ''
  for (let i = 0; i < 10; i++) s += abc[Math.floor(Math.random() * abc.length)]
  return s
}

export function UsuariosPage() {
  const { usuarios, sinCuenta, guardar, restablecerClave, deshabilitar, habilitar } = useUsuarios()
  const [abierto, setAbierto] = useState(false)
  const [editando, setEditando] = useState<Colaborador | undefined>(undefined)
  // Reset de contraseña
  const [reset, setReset] = useState<Colaborador | undefined>(undefined)
  const [clave, setClave] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [aplicado, setAplicado] = useState(false)

  const activos = usuarios.filter((u) => !u.cuentaDeshabilitada).length

  function nuevo() {
    setEditando(undefined)
    setAbierto(true)
  }
  function editar(c: Colaborador) {
    setEditando(c)
    setAbierto(true)
  }
  function onGuardar(datos: EntradaUsuario) {
    guardar(datos)
    setAbierto(false)
  }
  function abrirReset(c: Colaborador) {
    setReset(c)
    setClave(generarClave())
    setCopiado(false)
    setAplicado(false)
  }
  function aplicarReset() {
    if (reset) {
      restablecerClave(reset.id, clave)
      setAplicado(true)
    }
  }
  function copiarClave() {
    navigator.clipboard?.writeText(clave).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1400)
    })
  }

  return (
    <section className="page">
      <header className="page__header page__header--fila">
        <div>
          <h1 className="page__title">Usuarios</h1>
          <p className="page__subtitle">
            {usuarios.length} con cuenta · {activos} con acceso activo
          </p>
        </div>
        <button className="btn btn--primary btn--icono" onClick={nuevo}>
          <Plus size={16} /> Nuevo usuario
        </button>
      </header>

      {usuarios.length === 0 ? (
        <div className="vacio">
          <Users size={30} strokeWidth={1.5} />
          <p>Aún no hay usuarios con acceso. Da acceso a un colaborador.</p>
          <button className="btn btn--primary btn--icono" onClick={nuevo}>
            <Plus size={16} /> Dar el primer acceso
          </button>
        </div>
      ) : (
        <div className="usr-grid">
          {usuarios.map((u) => (
            <UsuarioCard
              key={u.id}
              usuario={u}
              onEditar={() => editar(u)}
              onReset={() => abrirReset(u)}
              onAlternarAcceso={() =>
                u.cuentaDeshabilitada ? habilitar(u.id) : deshabilitar(u.id)
              }
            />
          ))}
        </div>
      )}

      <Modal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo={editando ? `Permisos · ${editando.nombre}` : 'Nuevo usuario'}
        ancho={680}
      >
        <UsuarioForm
          inicial={editando}
          disponibles={sinCuenta}
          onGuardar={onGuardar}
          onCancelar={() => setAbierto(false)}
        />
      </Modal>

      <Modal
        abierto={!!reset}
        onCerrar={() => setReset(undefined)}
        titulo={`Restablecer contraseña · ${reset?.nombre ?? ''}`}
      >
        <div className="reset">
          <p className="field__hint">
            Se generará una contraseña temporal. Compártela de forma segura; el usuario deberá
            cambiarla al entrar (en la fase con backend).
          </p>
          <div className="reset__clave">
            <code>{clave}</code>
            <button className="icono-btn" onClick={() => setClave(generarClave())} title="Regenerar">
              <RefreshCw size={15} />
            </button>
            <button className="icono-btn" onClick={copiarClave} title="Copiar">
              {copiado ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
          {aplicado && <p className="reset__ok">Contraseña temporal aplicada.</p>}
          <div className="form-acciones">
            <Button type="button" variant="ghost" onClick={() => setReset(undefined)}>
              {aplicado ? 'Cerrar' : 'Cancelar'}
            </Button>
            <Button type="button" onClick={aplicarReset} disabled={aplicado}>
              <KeyRound size={15} /> Aplicar
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}
