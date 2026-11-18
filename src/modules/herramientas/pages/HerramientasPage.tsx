import '../styles/herramientas.css'
import { useState, useMemo } from 'react'
import {
  Plus,
  Wrench,
  AlertTriangle,
  LayoutGrid,
  List,
  Search,
  X,
  Layers,
  Users,
} from 'lucide-react'
import { Combobox, Modal, useConfirmar } from '@/core/ui'
import type { AccesoHerramienta, Herramienta } from '@/core/datos'
import {
  useHerramientas,
  type EntradaHerramienta,
  type HerramientaVista,
} from '../hooks/useHerramientas'
import { HerramientaTabla } from '../components/HerramientaTabla'
import { HerramientaCard } from '../components/HerramientaCard'
import { HerramientaForm } from '../components/HerramientaForm'
import { BovedaAccesosModal } from '../components/BovedaAccesosModal'
import { EditarAccesoModal } from '../components/EditarAccesoModal'
import { reemplazarAcceso } from '../lib/accesos'
import {
  CATEGORIAS_HERRAMIENTA,
  IconoCategoria,
  obtenerDefTipoHerramienta,
} from '../lib/categoriasHerramientas'

type Filtro = 'todas' | 'sd' | 'cliente' | 'por_vencer'
type Agrupacion = 'tipo' | 'cliente' | 'ninguna'

export function HerramientasPage() {
  const { herramientas, clientes, proyectos, guardar, borrar, marcarPagada } = useHerramientas()
  const [abierto, setAbierto] = useState(false)
  const [editando, setEditando] = useState<Herramienta | undefined>(undefined)
  const [viendoAccesos, setViendoAccesos] = useState<HerramientaVista | undefined>(undefined)
  const [editandoAcceso, setEditandoAcceso] = useState<
    { herramienta: HerramientaVista; acceso: AccesoHerramienta } | undefined
  >(undefined)
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [agrupacion, setAgrupacion] = useState<Agrupacion>('tipo')
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

  const visibles = useMemo(() => {
    return herramientas.filter((h) => {
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
        const tipoDef = obtenerDefTipoHerramienta(h.tipoHerramienta)
        const campos = [
          h.nombre,
          h.url,
          h.correo,
          h.clienteNombre,
          h.proyectoNombre,
          h.metodoPago,
          tipoDef.etiqueta,
        ]
        const coincideDirecto = campos.some((c) => c?.toLowerCase().includes(t))
        if (coincideDirecto) return true

        // Busca también dentro de los accesos y contraseñas específicas
        const coincideAcceso = (h.accesosNormalizados || []).some((acc) => {
          if (acc.nombre?.toLowerCase().includes(t)) return true
          if (acc.usuario?.toLowerCase().includes(t)) return true
          if (acc.token?.toLowerCase().includes(t)) return true
          if (acc.notas?.toLowerCase().includes(t)) return true
          if ((t === 'git' || t === 'github') && acc.vinculaGit) return true
          return false
        })
        if (coincideAcceso) return true

        return false
      }
      return true
    })
  }, [herramientas, filtro, clienteId, texto])

  // Agrupación por Tipo de Herramienta
  const gruposPorTipo = useMemo(() => {
    const mapa = new Map<string, HerramientaVista[]>()
    for (const h of visibles) {
      const tipo = h.tipoHerramienta || 'otro'
      if (!mapa.has(tipo)) mapa.set(tipo, [])
      mapa.get(tipo)!.push(h)
    }

    return CATEGORIAS_HERRAMIENTA.map((cat) => {
      const items = mapa.get(cat.id) || []
      const totalAccesos = items.reduce(
        (acc, curr) => acc + (curr.accesosNormalizados?.length || 0),
        0,
      )
      return {
        def: cat,
        items,
        totalAccesos,
      }
    }).filter((g) => g.items.length > 0)
  }, [visibles])

  // Agrupación por Cliente
  const gruposPorCliente = useMemo(() => {
    const mapa = new Map<string, { titulo: string; items: HerramientaVista[] }>()
    for (const h of visibles) {
      let clave = 'sd'
      let titulo = 'Propia de SD (Uso interno)'
      if (h.propietario === 'cliente') {
        clave = h.clienteNombre || 'sin_cliente'
        titulo = h.clienteNombre ? `Cliente: ${h.clienteNombre}` : 'Cliente no especificado'
      }
      if (!mapa.has(clave)) mapa.set(clave, { titulo, items: [] })
      mapa.get(clave)!.items.push(h)
    }
    return Array.from(mapa.values())
  }, [visibles])

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

  /** Abre el editor de una sola credencial, sin pasar por el formulario completo. */
  function editarAcceso(h: HerramientaVista, acceso: AccesoHerramienta) {
    setViendoAccesos(undefined)
    setEditandoAcceso({ herramienta: h, acceso })
  }

  function onGuardarAcceso(accesoEditado: AccesoHerramienta) {
    if (!editandoAcceso) return
    const h = editandoAcceso.herramienta
    const idx = h.accesosNormalizados.findIndex((a) => a.id === accesoEditado.id)
    const accesos = reemplazarAcceso(h.accesosNormalizados, accesoEditado)
    const actualizada: HerramientaVista = {
      ...h,
      accesos,
      accesosNormalizados: accesos,
      correo: accesos[0]?.usuario,
      contrasena: accesos[0]?.contrasena,
    }
    guardar(actualizada)
    setEditandoAcceso(undefined)
    setViendoAccesos(idx >= 0 ? actualizada : undefined)
  }

  async function onBorrar(h: HerramientaVista) {
    const ok = await confirmar({
      titulo: `¿Eliminar "${h.nombre}"?`,
      mensaje: 'Se perderán todos sus accesos, contraseñas y su historial de pagos.',
      textoConfirmar: 'Eliminar',
      peligro: true,
    })
    if (ok) borrar(h.id)
  }

  const totalAccesosEnPantalla = visibles.reduce(
    (acc, curr) => acc + (curr.accesosNormalizados?.length || 0),
    0,
  )

  return (
    <section className="page">
      <header className="page__header page__header--fila">
        <div>
          <h1 className="page__title">Herramientas y Accesos</h1>
          <p className="page__subtitle">
            {herramientas.length} herramientas registradas · {totalAccesosEnPantalla} accesos y contraseñas
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

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Selector de Agrupación */}
            {vista === 'tarjetas' && (
              <div className="hrr-agrupador" role="group" aria-label="Agrupación">
                <button
                  type="button"
                  className={agrupacion === 'tipo' ? 'is-on' : ''}
                  onClick={() => setAgrupacion('tipo')}
                  title="Agrupar por tipo de herramienta"
                >
                  <Layers size={13} /> Por Tipo
                </button>
                <button
                  type="button"
                  className={agrupacion === 'cliente' ? 'is-on' : ''}
                  onClick={() => setAgrupacion('cliente')}
                  title="Agrupar por cliente asignado"
                >
                  <Users size={13} /> Por Cliente
                </button>
                <button
                  type="button"
                  className={agrupacion === 'ninguna' ? 'is-on' : ''}
                  onClick={() => setAgrupacion('ninguna')}
                  title="Mostrar todas sin agrupar"
                >
                  <LayoutGrid size={13} /> Todas
                </button>
              </div>
            )}

            <div className="hrr-vista">
              <button
                type="button"
                className={vista === 'tarjetas' ? 'is-on' : ''}
                onClick={() => setVista('tarjetas')}
                aria-pressed={vista === 'tarjetas'}
                title="Tarjetas: vencimientos, pagos y accesos"
              >
                <LayoutGrid size={14} /> Tarjetas
              </button>
              <button
                type="button"
                className={vista === 'lista' ? 'is-on' : ''}
                onClick={() => setVista('lista')}
                aria-pressed={vista === 'lista'}
                title="Tabla: contraseñas y accesos directos"
              >
                <List size={14} /> Credenciales
              </button>
            </div>
          </div>
        </div>

        <div className="hrr-barra__fila">
          <span className="hrr-buscar">
            <Search size={14} />
            <input
              className="field__input"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar servicio, token, usuario, tipo o Git…"
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
        <HerramientaTabla
          herramientas={visibles}
          onEditar={editar}
          onBorrar={onBorrar}
          onVerAccesos={(h) => setViendoAccesos(h)}
          onEditarAcceso={(h, acc) => editarAcceso(h, acc)}
        />
      ) : agrupacion === 'tipo' ? (
        <div className="hrr-grupos">
          {gruposPorTipo.map((g) => (
            <section key={g.def.id} className="hrr-grupo">
              <header className="hrr-grupo__head">
                <div className="hrr-grupo__tit">
                  <span
                    className="hrr-grupo__icono"
                    style={{
                      color: g.def.color,
                      background: `color-mix(in srgb, ${g.def.color} 15%, transparent)`,
                    }}
                  >
                    <IconoCategoria id={g.def.id} size={15} />
                  </span>
                  <span>{g.def.etiqueta}</span>
                </div>
                <span className="hrr-grupo__badge">
                  {g.items.length} {g.items.length === 1 ? 'herramienta' : 'herramientas'} · {g.totalAccesos} {g.totalAccesos === 1 ? 'acceso' : 'accesos'}
                </span>
              </header>

              <div className="hrr-grid">
                {g.items.map((h) => (
                  <HerramientaCard
                    key={h.id}
                    herramienta={h}
                    onEditar={() => editar(h)}
                    onBorrar={() => onBorrar(h)}
                    onPagar={() => marcarPagada(h.id)}
                    onVerAccesos={() => setViendoAccesos(h)}
                    onEditarAcceso={(acc) => editarAcceso(h, acc)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : agrupacion === 'cliente' ? (
        <div className="hrr-grupos">
          {gruposPorCliente.map((g, idx) => (
            <section key={idx} className="hrr-grupo">
              <header className="hrr-grupo__head">
                <div className="hrr-grupo__tit">
                  <span className="hrr-grupo__icono">
                    <Users size={15} />
                  </span>
                  <span>{g.titulo}</span>
                </div>
                <span className="hrr-grupo__badge">
                  {g.items.length} {g.items.length === 1 ? 'herramienta' : 'herramientas'}
                </span>
              </header>

              <div className="hrr-grid">
                {g.items.map((h) => (
                  <HerramientaCard
                    key={h.id}
                    herramienta={h}
                    onEditar={() => editar(h)}
                    onBorrar={() => onBorrar(h)}
                    onPagar={() => marcarPagada(h.id)}
                    onVerAccesos={() => setViendoAccesos(h)}
                    onEditarAcceso={(acc) => editarAcceso(h, acc)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="hrr-grid">
          {visibles.map((h) => (
            <HerramientaCard
              key={h.id}
              herramienta={h}
              onEditar={() => editar(h)}
              onBorrar={() => onBorrar(h)}
              onPagar={() => marcarPagada(h.id)}
              onVerAccesos={() => setViendoAccesos(h)}
              onEditarAcceso={(acc) => editarAcceso(h, acc)}
            />
          ))}
        </div>
      )}

      {/* Modal Bóveda de Accesos y Contraseñas */}
      <Modal
        abierto={Boolean(viendoAccesos)}
        onCerrar={() => setViendoAccesos(undefined)}
        titulo={`Bóveda de Accesos: ${viendoAccesos?.nombre ?? ''}`}
        ancho={640}
      >
        {viendoAccesos && (
          <BovedaAccesosModal
            herramienta={viendoAccesos}
            onEditar={() => {
              const target = viendoAccesos
              setViendoAccesos(undefined)
              editar(target)
            }}
            onEditarAcceso={(acc) => editarAcceso(viendoAccesos, acc)}
            onCerrar={() => setViendoAccesos(undefined)}
          />
        )}
      </Modal>

      {/* Modal para editar UNA credencial, sin buscarla en el formulario grande */}
      <Modal
        abierto={Boolean(editandoAcceso)}
        onCerrar={() => setEditandoAcceso(undefined)}
        titulo={`Editar credencial: ${editandoAcceso?.acceso.nombre ?? ''}`}
        ancho={520}
      >
        {editandoAcceso && (
          <EditarAccesoModal
            acceso={editandoAcceso.acceso}
            onGuardar={onGuardarAcceso}
            onCancelar={() => setEditandoAcceso(undefined)}
          />
        )}
      </Modal>

      <Modal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo={editando ? 'Editar herramienta y accesos' : 'Nueva herramienta y accesos'}
        ancho={680}
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
