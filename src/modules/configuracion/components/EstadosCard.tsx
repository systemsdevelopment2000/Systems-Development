import { useState } from 'react'
import { Workflow, Plus, Trash2, ArrowUp, ArrowDown, Check } from 'lucide-react'
import { Button, useConfirmar } from '@/core/ui'
import { useDatos, nuevoId, type EstadoProyecto } from '@/core/datos'

/**
 * Catálogo de estados de proyecto. Manda sobre las columnas del tablero de
 * proyectos, así que editarlo cambia el flujo de trabajo de SD.
 */
export function EstadosCard() {
  const { estado, setEstados } = useDatos()
  const confirmar = useConfirmar()
  const [lista, setLista] = useState<EstadoProyecto[]>(
    [...estado.estadosProyecto].sort((a, b) => a.orden - b.orden),
  )
  const [guardado, setGuardado] = useState(false)

  function tocar(nueva: EstadoProyecto[]) {
    setLista(nueva.map((e, i) => ({ ...e, orden: i + 1 })))
    setGuardado(false)
  }
  function campo(id: string, k: keyof EstadoProyecto, v: string | boolean) {
    tocar(lista.map((e) => (e.id === id ? { ...e, [k]: v } : e)))
  }
  function mover(i: number, delta: number) {
    const j = i + delta
    if (j < 0 || j >= lista.length) return
    const copia = [...lista]
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
    tocar(copia)
  }
  function agregar() {
    tocar([
      ...lista,
      { id: nuevoId(), nombre: 'Nuevo estado', orden: lista.length + 1, color: '#89898a', esFinal: false },
    ])
  }
  async function quitar(e: EstadoProyecto) {
    const usados = Object.values(estado.proyectos).filter((p) => p.estadoId === e.id).length
    const ok = await confirmar({
      titulo: `¿Quitar el estado "${e.nombre}"?`,
      mensaje: usados
        ? `Hay ${usados} proyecto(s) en este estado; quedarían sin columna hasta reasignarlos.`
        : 'No hay proyectos en este estado.',
      textoConfirmar: 'Quitar',
      peligro: true,
    })
    if (ok) tocar(lista.filter((x) => x.id !== e.id))
  }
  function guardar() {
    setEstados(lista)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 1800)
  }

  return (
    <div className="cfg-card cfg-card--ancha">
      <div className="cfg-card__head">
        <span className="cfg-card__icono">
          <Workflow size={18} />
        </span>
        <div>
          <h2 className="cfg-card__tit">Estados de proyecto</h2>
          <p className="cfg-card__sub">
            Definen las columnas del tablero de proyectos y el flujo de trabajo.
          </p>
        </div>
      </div>

      <div className="est-lista">
        {lista.map((e, i) => (
          <div className="est-fila" key={e.id}>
            <input
              className="est-color"
              type="color"
              value={e.color}
              onChange={(ev) => campo(e.id, 'color', ev.target.value)}
              title="Color"
            />
            <input
              className="field__input est-nombre"
              value={e.nombre}
              onChange={(ev) => campo(e.id, 'nombre', ev.target.value)}
            />
            <label className="est-final" title="Marca el proyecto como cerrado">
              <input
                type="checkbox"
                checked={e.esFinal}
                onChange={(ev) => campo(e.id, 'esFinal', ev.target.checked)}
              />
              Final
            </label>
            <div className="est-acc">
              <button className="icono-btn" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir">
                <ArrowUp size={14} />
              </button>
              <button
                className="icono-btn"
                onClick={() => mover(i, 1)}
                disabled={i === lista.length - 1}
                aria-label="Bajar"
              >
                <ArrowDown size={14} />
              </button>
              <button className="icono-btn icono-btn--peligro" onClick={() => quitar(e)} aria-label="Quitar">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="form-acciones">
        <Button type="button" variant="ghost" onClick={agregar}>
          <Plus size={15} /> Añadir estado
        </Button>
        <Button type="button" onClick={guardar}>
          {guardado ? <Check size={15} /> : null} {guardado ? 'Guardado' : 'Guardar estados'}
        </Button>
      </div>
    </div>
  )
}
