import { useState } from 'react'
import { Clock, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import type { ModuloProyecto, TipoDesarrollo } from '@/core/datos'
import { horasTotales, modulosSugeridos } from '../lib/modulos'

interface Props {
  tipo?: TipoDesarrollo
  modulos: ModuloProyecto[]
  onCambio: (m: ModuloProyecto[]) => void
}

/**
 * Alcance del proyecto por módulos. Los estándar vienen del tipo de producto;
 * los adicionales se suman si el cliente los pide. El total de horas alimenta
 * el costo y, con el margen, el precio.
 */
export function SelectorModulos({ tipo, modulos, onCambio }: Props) {
  const [abierto, setAbierto] = useState(false)
  const estandar = modulos.filter((m) => m.clase === 'estandar')
  const adicionales = modulos.filter((m) => m.clase === 'adicional')
  const horas = horasTotales(modulos)
  const horasAd = horasTotales(adicionales)
  const incluidos = modulos.filter((m) => m.incluido).length

  function alternar(id: string) {
    onCambio(modulos.map((m) => (m.id === id ? { ...m, incluido: !m.incluido } : m)))
  }
  function cambiarHoras(id: string, h: number) {
    onCambio(modulos.map((m) => (m.id === id ? { ...m, horas: Math.max(0, h) } : m)))
  }
  function restablecer() {
    onCambio(modulosSugeridos(tipo))
  }

  function fila(m: ModuloProyecto) {
    return (
      <label className={'mod-fila' + (m.incluido ? ' is-on' : '')} key={m.id}>
        <input type="checkbox" checked={m.incluido} onChange={() => alternar(m.id)} />
        <span className="mod-check" />
        <span className="mod-nombre">{m.nombre}</span>
        <span className="mod-horas">
          <input
            type="number"
            min={0}
            value={m.horas}
            onChange={(e) => cambiarHoras(m.id, Number(e.target.value))}
            onClick={(e) => e.preventDefault()}
            aria-label={`Horas de ${m.nombre}`}
          />
          h
        </span>
      </label>
    )
  }

  return (
    <div className="mod">
      <div className="mod__barra">
        <span className="mod__total">
          <Clock size={14} /> <b>{horas}</b> h estimadas
          <em>
            · {incluidos} de {modulos.length} módulos
            {horasAd > 0 ? ` · ${horasAd} h en adicionales` : ''}
          </em>
        </span>
        <div className="mod__acc">
          <button type="button" className="mod__reset" onClick={restablecer}>
            <RotateCcw size={13} /> Restablecer
          </button>
          <button
            type="button"
            className="mod__reset"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
          >
            {abierto ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {abierto ? 'Ocultar' : 'Ajustar módulos'}
          </button>
        </div>
      </div>

      {abierto && (
        <div className="mod__cuerpo">
          <div className="mod__grupo">
            <span className="mod__tit">
              Estándar <em>mínimo que exige el tipo de producto</em>
            </span>
            {estandar.length ? (
              estandar.map(fila)
            ) : (
              <p className="field__hint">Elige un tipo de desarrollo.</p>
            )}
          </div>

          <div className="mod__grupo">
            <span className="mod__tit">
              Adicionales <em>integraciones y extras, se cobran aparte</em>
            </span>
            {adicionales.map(fila)}
          </div>
        </div>
      )}
    </div>
  )
}
