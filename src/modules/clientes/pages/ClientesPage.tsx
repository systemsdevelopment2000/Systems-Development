import '../styles/clientes.css'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Users2 } from 'lucide-react'
import { Modal, useConfirmar } from '@/core/ui'
import type { Cliente } from '@/core/datos'
import { useClientes, type EntradaCliente } from '../hooks/useClientes'
import { ClienteCard } from '../components/ClienteCard'
import { ClienteForm } from '../components/ClienteForm'
import { ClienteDetalle } from '../components/ClienteDetalle'

export function ClientesPage() {
  const { clientes, guardar, borrar, ponderacion, proyectosDe, listaProyectos } = useClientes()
  const [abierto, setAbierto] = useState(false)
  const [editando, setEditando] = useState<Cliente | undefined>(undefined)
  const [viendo, setViendo] = useState<Cliente | undefined>(undefined)
  const [params, setParams] = useSearchParams()
  const confirmar = useConfirmar()
  const nav = useNavigate()

  // Abrir el perfil de un cliente al llegar con ?ver=<id> (desde un proyecto).
  useEffect(() => {
    const ver = params.get('ver')
    if (!ver) return
    const c = clientes.find((x) => x.id === ver)
    if (c) {
      setEditando(c)
      setAbierto(true)
    }
    setParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, clientes])

  function nuevo() {
    setEditando(undefined)
    setAbierto(true)
  }
  function editar(c: Cliente) {
    setEditando(c)
    setAbierto(true)
  }
  function onGuardar(datos: EntradaCliente) {
    guardar(datos)
    setAbierto(false)
  }
  async function onBorrar(c: Cliente) {
    const ok = await confirmar({
      titulo: `¿Eliminar a "${c.nombre}"?`,
      mensaje: 'Se quitará de la lista de clientes. Esta acción no se puede deshacer.',
      textoConfirmar: 'Eliminar',
      peligro: true,
    })
    if (ok) borrar(c.id)
  }

  return (
    <section className="page">
      <header className="page__header page__header--fila">
        <div>
          <h1 className="page__title">Clientes</h1>
          <p className="page__subtitle">
            {clientes.length} {clientes.length === 1 ? 'registrado' : 'registrados'} · gestión de
            clientes
          </p>
        </div>
        <button className="btn btn--primary btn--icono" onClick={nuevo}>
          <Plus size={16} /> Nuevo cliente
        </button>
      </header>

      {clientes.length === 0 ? (
        <div className="vacio">
          <Users2 size={30} strokeWidth={1.5} />
          <p>Aún no hay clientes.</p>
          <button className="btn btn--primary btn--icono" onClick={nuevo}>
            <Plus size={16} /> Crear el primero
          </button>
        </div>
      ) : (
        <div className="cl-grid">
          {clientes.map((c) => (
            <ClienteCard
              key={c.id}
              cliente={c}
              proyectos={proyectosDe(c.id)}
              ponderacion={ponderacion(c.id)}
              onEditar={() => editar(c)}
              onBorrar={() => onBorrar(c)}
              onVer={() => setViendo(c)}
            />
          ))}
        </div>
      )}

      <Modal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo={editando ? 'Editar cliente' : 'Nuevo cliente'}
      >
        <ClienteForm inicial={editando} onGuardar={onGuardar} onCancelar={() => setAbierto(false)} />
      </Modal>

      <Modal
        abierto={!!viendo}
        onCerrar={() => setViendo(undefined)}
        titulo="Ficha del cliente"
        ancho={620}
      >
        {viendo && (
          <ClienteDetalle
            cliente={viendo}
            proyectos={listaProyectos(viendo.id)}
            ponderacion={ponderacion(viendo.id)}
            onEditar={() => {
              const c = viendo
              setViendo(undefined)
              editar(c)
            }}
            onVerProyecto={(id) => {
              setViendo(undefined)
              nav(`/proyectos/${id}`)
            }}
          />
        )}
      </Modal>
    </section>
  )
}
