import { useState, type FormEvent } from 'react'
import { Ruler, Plus, X, RotateCcw } from 'lucide-react'
import { Button } from '@/core/ui'
import { useDatos } from '@/core/datos'
import { UNIDADES_POR_DEFECTO, queMide } from '@/modules/finanzas'

/**
 * Unidades de cobro del presupuestador.
 *
 * Son editables porque ninguna lista fija cubre todo lo que vende SD: un
 * módulo, una característica suelta, un año de dominio o una sesión de
 * capacitación no se miden igual, y forzar "horas" para todo falseaba la
 * cotización. En el presupuesto la unidad además admite texto libre: esto es
 * la lista que se sugiere, no una camisa de fuerza.
 */
export function UnidadesCard() {
  const { estado, setEmpresa } = useDatos()
  const unidades = estado.empresa.unidades?.length
    ? estado.empresa.unidades
    : UNIDADES_POR_DEFECTO
  const [nueva, setNueva] = useState('')

  function guardar(lista: string[]) {
    setEmpresa({ ...estado.empresa, unidades: lista })
  }

  function agregar(e: FormEvent) {
    e.preventDefault()
    const u = nueva.trim().toLowerCase()
    if (!u || unidades.includes(u)) {
      setNueva('')
      return
    }
    guardar([...unidades, u])
    setNueva('')
  }

  function quitar(u: string) {
    guardar(unidades.filter((x) => x !== u))
  }

  const modificada = JSON.stringify(unidades) !== JSON.stringify(UNIDADES_POR_DEFECTO)

  return (
    <div className="cfg-card cfg-card--ancha">
      <div className="cfg-card__head">
        <span className="cfg-card__icono">
          <Ruler size={18} />
        </span>
        <div>
          <h2 className="cfg-card__tit">Unidades de cobro</h2>
          <p className="cfg-card__sub">
            Lo que se multiplica por el precio en cada línea del presupuesto. En el presupuesto
            también puedes escribir una unidad que no esté aquí: esta lista es la que se sugiere.
          </p>
        </div>
      </div>

      <ul className="uni-lista">
        {unidades.map((u) => (
          <li className="uni-chip" key={u} title={queMide(u) ?? 'Unidad propia'}>
            <span className="uni-chip__nombre">{u}</span>
            {queMide(u) && <span className="uni-chip__mide">{queMide(u)}</span>}
            <button
              type="button"
              className="uni-chip__x"
              onClick={() => quitar(u)}
              aria-label={`Quitar ${u}`}
            >
              <X size={12} />
            </button>
          </li>
        ))}
      </ul>

      <form className="uni-alta" onSubmit={agregar}>
        <input
          className="field__input"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          placeholder="Nueva unidad (pantalla, integración, punto de venta…)"
          maxLength={24}
        />
        <Button type="submit" variant="ghost">
          <Plus size={15} /> Añadir
        </Button>
        {modificada && (
          <Button type="button" variant="ghost" onClick={() => guardar(UNIDADES_POR_DEFECTO)}>
            <RotateCcw size={14} /> Restablecer
          </Button>
        )}
      </form>
    </div>
  )
}
