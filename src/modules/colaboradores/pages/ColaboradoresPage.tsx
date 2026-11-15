import '../styles/colaboradores.css'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, UsersRound } from 'lucide-react'
import { Modal, useConfirmar } from '@/core/ui'
import type { Colaborador } from '@/core/datos'
import { useColaboradores, type EntradaColaborador } from '../hooks/useColaboradores'
import { ColaboradorCard } from '../components/ColaboradorCard'
import { ColaboradorForm } from '../components/ColaboradorForm'

export function ColaboradoresPage() {
  const { colaboradores, guardar, borrar, estadisticas } = useColaboradores()
  const [abierto, setAbierto] = useState(false)
  const [editando, setEditando] = useState<Colaborador | undefined>(undefined)
  const [params, setParams] = useSearchParams()
  const confirmar = useConfirmar()

  // Abrir el perfil de un colaborador al llegar con ?ver=<id> (desde un proyecto).
  useEffect(() => {
    const ver = params.get('ver')
    if (!ver) return
    const c = colaboradores.find((x) => x.id === ver)
    if (c) {
      setEditando(c)
      setAbierto(true)
    }
    setParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, colaboradores])

  function nuevo() {
    setEditando(undefined)
    setAbierto(true)
  }
  function editar(c: Colaborador) {
    setEditando(c)
    setAbierto(true)
  }
  function onGuardar(datos: EntradaColaborador) {
    guardar(datos)
    setAbierto(false)
  }
  async function onBorrar(c: Colaborador) {
    const ok = await confirmar({
      titulo: `¿Eliminar a "${c.nombre}"?`,
      mensaje: 'Se quitará del equipo. Esta acción no se puede deshacer.',
      textoConfirmar: 'Eliminar',
      peligro: true,
    })
    if (ok) borrar(c.id)
  }

  return (
    <section className="page">
      <header className="page__header page__header--fila">
        <div>
          <h1 className="page__title">Colaboradores</h1>
          <p className="page__subtitle">
            {colaboradores.length} {colaboradores.length === 1 ? 'registrado' : 'registrados'} ·
            gestión del equipo
          </p>
        </div>
        <button className="btn btn--primary btn--icono" onClick={nuevo}>
          <Plus size={16} /> Nuevo colaborador
        </button>
      </header>

      {colaboradores.length === 0 ? (
        <div className="vacio">
          <UsersRound size={30} strokeWidth={1.5} />
          <p>Aún no hay colaboradores.</p>
          <button className="btn btn--primary btn--icono" onClick={nuevo}>
            <Plus size={16} /> Crear el primero
          </button>
        </div>
      ) : (
        <div className="cl-grid">
          {colaboradores.map((c) => (
            <ColaboradorCard
              key={c.id}
              colaborador={c}
              stats={estadisticas(c.id)}
              onEditar={() => editar(c)}
              onBorrar={() => onBorrar(c)}
            />
          ))}
        </div>
      )}

      <Modal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo={editando ? 'Editar colaborador' : 'Nuevo colaborador'}
      >
        <ColaboradorForm
          inicial={editando}
          onGuardar={onGuardar}
          onCancelar={() => setAbierto(false)}
        />
      </Modal>
    </section>
  )
}
