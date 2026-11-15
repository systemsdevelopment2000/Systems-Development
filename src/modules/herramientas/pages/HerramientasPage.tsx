import '../styles/herramientas.css'
import { useState } from 'react'
import { Plus, Wrench, AlertTriangle, LayoutGrid, List, Search, X } from 'lucide-react'
import { Combobox, Modal, useConfirmar } from '@/core/ui'
import type { Herramienta } from '@/core/datos'
import {
  useHerramientas,
  type EntradaHerramienta,
  type HerramientaVista,
} from '../hooks/useHerramientas'
import { HerramientaTabla } from '../components/HerramientaTabla'
import { HerramientaCard } from '../components/HerramientaCard'
import { HerramientaForm } from '../components/HerramientaForm'

type Filtro = 'todas' | 'sd' | 'cliente' | 'por_vencer'

export function HerramientasPage() {
  const { herramientas, clientes, proyectos, guardar, borrar, marcarPagada } = useHerramientas()
  const [abierto, setAbierto] = useState(false)
  const [editando, setEditando] = useState<Herramienta | undefined>(undefined)
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [vista, setVista] = useState<'tarjetas' | 'lista'>('tarjetas')
  const [texto, setTexto] = useState('')
  const [clienteId, setClienteId] = useState('')
  const confirmar = useConfirmar()

  const porVencer = herramientas.filter(
    (h) => h.activa && (h.estadoPago === 'por_vencer' || h.estadoPago === 'vencida'),
  )

  /** Clientes que efectivamente tienen alguna herramienta asociada. */
  const clientesConHerramientas = clientes.filter((c) =>
    herramientas.some((h) =>
      (h.clienteIds ?? (h.clienteId ? [h.clienteId] : [])).includes(c.id),
    ),
  )

  const visibles = herramientas.filter((h) => {
    if (filtro === 'sd' && h.propietario !== 'sd') return false
    if (filtro === 'cliente' && h.propietario !== 'cliente') return false
    if (filtro === 'por_vencer' && h.estadoPago !== 'por_vencer' && h.estadoPago !== 'vencida')
      return false

    if (clienteId) {
      const suyos = h.clienteIds ?? (h.clienteId ? [h.clienteId] : [])
      if (!suyos.includes(clienteId)) return false
    }

    const t = texto.trim().toLowerCase()
    if (t) {
      // Se busca por lo que uno recuerda: el nombre, el sitio o el correo.
      const campos = [h.nombre, h.url, h.correo, h.clienteNombre, h.proyectoNombre, h.metodoPago]
      if (!campos.some((c) => c?.toLowerCase().includes(t))) return false
    }
    return true
  })

  const FILTROS: { id: Filtro; label: string }[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'sd', label: 'Propias (SD)' },
    { id: 'cliente', label: 'De cliente' },
    { id: 'por_vencer', label: `Por vencer${porVencer.length ? ` (${porVencer.length})` : ''}` },
  ]

  function nuevo() {
    setEditando(undefined)
    setAbierto(true)
  }
  function editar(h: HerramientaVista) {
    setEditando(h)
    setAbierto(true)
  }
  function onGuardar(d: EntradaHerramienta) {
    guardar(d)
    setAbierto(false)
  }
  async function onBorrar(h: HerramientaVista) {
    const ok = await confirmar({
      titulo: `¿Eliminar "${h.nombre}"?`,
      mensaje: 'Se perderán sus credenciales y su historial de pagos.',
      textoConfirmar: 'Eliminar',
      peligro: true,
    })
    if (ok) borrar(h.id)
  }

  return (
    <section className="page">
      <header className="page__header page__header--fila">
        <div>
          <h1 className="page__title">Herramientas</h1>
          <p className="page__subtitle">
            {herramientas.length} registradas · pagos y credenciales
          </p>
        </div>
        <button className="btn btn--primary btn--icono" onClick={nuevo}>
          <Plus size={16} /> Nueva herramienta
        </button>
      </header>

      {porVencer.length > 0 && (
        <div className="hrr-alerta">
          <AlertTriangle size={16} />
          <span>
            <strong>{porVencer.length}</strong> por vencer o vencida(s):{' '}
            {porVencer.slice(0, 4).map((h) => h.nombre).join(', ')}
            {porVencer.length > 4 ? '…' : ''}
          </span>
        </div>
      )}

      <div className="hrr-barra">
        <div className="hrr-barra__fila">
          <div className="hrr-filtros">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              className={filtro === f.id ? 'is-on' : ''}
              onClick={() => setFiltro(f.id)}
            >
              {f.label}
            </button>
            ))}
          </div>

          <div className="hrr-vista">
            <button
              type="button"
              className={vista === 'tarjetas' ? 'is-on' : ''}
              onClick={() => setVista('tarjetas')}
              aria-pressed={vista === 'tarjetas'}
              title="Tarjetas: vencimientos y pagos"
            >
              <LayoutGrid size={14} /> Tarjetas
            </button>
            <button
              type="button"
              className={vista === 'lista' ? 'is-on' : ''}
              onClick={() => setVista('lista')}
              aria-pressed={vista === 'lista'}
              title="Lista: credenciales de un vistazo"
            >
              <List size={14} /> Credenciales
            </button>
          </div>
        </div>

        <div className="hrr-barra__fila">
          {/* Buscar por lo que uno recuerda, y acotar a un cliente concreto:
            con 30 servicios, las pestañas solas no alcanzan. */}
        <span className="hrr-buscar">
          <Search size={14} />
          <input
            className="field__input"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar servicio, sitio o correo…"
          />
          {texto && (
            <button
              type="button"
              className="hrr-buscar__x"
              onClick={() => setTexto('')}
              aria-label="Limpiar la búsqueda"
            >
              <X size={13} />
            </button>
          )}
        </span>

        {clientesConHerramientas.length > 0 && (
          <div className="hrr-cliente">
            <Combobox
              opciones={[
                { valor: '', etiqueta: 'Todos los clientes' },
                ...clientesConHerramientas.map((c) => ({ valor: c.id, etiqueta: c.nombre })),
              ]}
              valor={clienteId}
              onCambio={setClienteId}
              placeholder="Filtrar por cliente…"
            />
          </div>
        )}

        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="vacio">
          <Wrench size={30} strokeWidth={1.5} />
          <p>
            {texto || clienteId
              ? 'Ninguna herramienta coincide con la búsqueda.'
              : 'Sin herramientas aquí.'}
          </p>
          <button className="btn btn--primary btn--icono" onClick={nuevo}>
            <Plus size={16} /> Crear la primera
          </button>
        </div>
      ) : vista === 'lista' ? (
        <HerramientaTabla herramientas={visibles} onEditar={editar} onBorrar={onBorrar} />
      ) : (
        <div className="hrr-grid">
          {visibles.map((h) => (
            <HerramientaCard
              key={h.id}
              herramienta={h}
              onEditar={() => editar(h)}
              onBorrar={() => onBorrar(h)}
              onPagar={() => marcarPagada(h.id)}
            />
          ))}
        </div>
      )}

      <Modal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo={editando ? 'Editar herramienta' : 'Nueva herramienta'}
        ancho={640}
      >
        <HerramientaForm
          inicial={editando}
          clientes={clientes}
          proyectos={proyectos}
          onGuardar={onGuardar}
          onCancelar={() => setAbierto(false)}
        />
      </Modal>
    </section>
  )
}
