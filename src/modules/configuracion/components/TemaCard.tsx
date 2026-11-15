import '../styles/tema.css'
import { useEffect, useState } from 'react'
import { Palette, Check, RotateCcw, Sun, Moon, Copy, ClipboardCheck, Layers } from 'lucide-react'
import { Button } from '@/core/ui'
import { useDatos } from '@/core/datos'
import {
  ESTILO,
  PALETAS,
  PALETA_POR_DEFECTO,
  aplicarPaleta,
  paletaDe,
  resumenDe,
  type Paleta,
} from '@/core/lib/paletas'

/**
 * Selector de combinación de color. El estilo de diseño no cambia: se mantiene
 * el caparazón actual de SD. Al pasar el mouse por una combinación se aplica al
 * sistema completo para verla en vivo; al salir vuelve la guardada. Solo se
 * fija al confirmar, para que probar no sea un cambio de marca accidental.
 */
export function TemaCard() {
  const { estado, setEmpresa } = useDatos()
  const guardada = estado.empresa.tema ?? PALETA_POR_DEFECTO
  const [previa, setPrevia] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const activa = previa ?? guardada

  useEffect(() => {
    aplicarPaleta(guardada)
  }, [guardada])

  function probar(id: string) {
    setPrevia(id)
    aplicarPaleta(id)
  }
  function soltar() {
    setPrevia(null)
    aplicarPaleta(guardada)
  }
  function fijar(id: string) {
    setPrevia(null)
    setEmpresa({ ...estado.empresa, tema: id })
    aplicarPaleta(id)
  }

  const p = paletaDe(activa)

  async function copiar() {
    const texto = resumenDe(p)
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      // Sin permiso de portapapeles: se cae al método viejo, que sí funciona
      // en contextos no seguros.
      const ta = document.createElement('textarea')
      ta.value = texto
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1800)
  }

  return (
    <div className="cfg-card cfg-card--ancha">
      <div className="cfg-card__head">
        <span className="cfg-card__icono">
          <Palette size={18} />
        </span>
        <div>
          <h2 className="cfg-card__tit">Combinación de color</h2>
          <p className="cfg-card__sub">
            El estilo de diseño no cambia: se mantiene el caparazón actual de SD. Pasa el mouse por
            una combinación para verla aplicada al sistema completo; se guarda solo cuando la fijas.
          </p>
        </div>
      </div>

      {/* El estilo es común a las seis: se enuncia una vez. */}
      <dl className="tema-estilo">
        <div>
          <dt>
            <Layers size={11} /> Estilo de diseño
          </dt>
          <dd>{ESTILO.nombre}</dd>
        </div>
        <div>
          <dt>Forma</dt>
          <dd>
            radio {ESTILO.radio} · trazo {ESTILO.trazo}
          </dd>
        </div>
        <div>
          <dt>Sombra</dt>
          <dd>{ESTILO.sombra}</dd>
        </div>
        <div>
          <dt>Títulos</dt>
          <dd>{ESTILO.titulos}</dd>
        </div>
      </dl>

      <ul className="tema-grid" onMouseLeave={soltar}>
        {PALETAS.map((op) => (
          <li key={op.id}>
            <Opcion
              p={op}
              activa={op.id === activa}
              fijada={op.id === guardada}
              onProbar={() => probar(op.id)}
              onFijar={() => fijar(op.id)}
            />
          </li>
        ))}
      </ul>

      <div className="tema-razon">
        <h3 className="tema-razon__tit">
          {p.nombre}
          <em>contraste del primario {p.contrastePrimario.toFixed(2)}:1</em>
        </h3>
        <p className="tema-razon__txt">{p.razon}</p>
        <p className="tema-razon__riesgo">
          <b>Lo que cuesta:</b> {p.riesgo}
        </p>

        <dl className="tema-tokens">
          <div>
            <dt>Primario</dt>
            <dd className="mono">{p.primario.base}</dd>
          </div>
          <div>
            <dt>
              <Sun size={11} /> Luz
            </dt>
            <dd className="mono">{p.primario.luz}</dd>
          </div>
          <div>
            <dt>
              <Moon size={11} /> Sombra
            </dt>
            <dd className="mono">{p.primario.sombra}</dd>
          </div>
          <div>
            <dt>Secundario</dt>
            <dd className="mono">{p.secundario.base}</dd>
          </div>
          <div>
            <dt>Fondo</dt>
            <dd className="mono">{p.fondo}</dd>
          </div>
          <div>
            <dt>Panel</dt>
            <dd className="mono">{p.panel}</dd>
          </div>
        </dl>
      </div>

      <div className="form-acciones">
        {guardada !== PALETA_POR_DEFECTO && (
          <Button type="button" variant="ghost" onClick={() => fijar(PALETA_POR_DEFECTO)}>
            <RotateCcw size={14} /> Volver a la actual
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={copiar}>
          {copiado ? <ClipboardCheck size={14} /> : <Copy size={14} />}
          {copiado ? 'Copiado' : `Copiar detalles de ${p.nombre}`}
        </Button>
      </div>
    </div>
  )
}

function Opcion({
  p,
  activa,
  fijada,
  onProbar,
  onFijar,
}: {
  p: Paleta
  activa: boolean
  fijada: boolean
  onProbar: () => void
  onFijar: () => void
}) {
  return (
    <button
      type="button"
      className={'tema-op' + (activa ? ' is-activa' : '') + (fijada ? ' is-fijada' : '')}
      onMouseEnter={onProbar}
      onFocus={onProbar}
      onClick={onFijar}
      aria-pressed={fijada}
      data-sonido="seleccion"
      title={`Aplicar ${p.nombre}`}
    >
      {/* Maqueta: un panel de SD pintado con ESTA combinación. */}
      <span className="tema-op__lienzo" style={{ background: p.fondo }} aria-hidden="true">
        <span
          className="tema-op__panel"
          style={{
            background: p.panel,
            borderColor: p.panel2,
            boxShadow: `0 6px 16px -6px ${p.primario.sombra}80`,
          }}
        >
          <span className="tema-op__titulo" style={{ color: p.texto }}>
            Proyecto
          </span>
          <span className="tema-op__barra" style={{ background: p.textoApagado }} />
          <span className="tema-op__barra" style={{ background: p.textoApagado, width: '54%' }} />
          <span
            className="tema-op__btn"
            style={{
              background: `linear-gradient(180deg, ${p.primario.luz}, ${p.primario.base} 55%, ${p.primario.sombra})`,
              color: p.primario.sobre,
              boxShadow: `0 0 14px -2px ${p.primario.base}99`,
            }}
          >
            Acción
          </span>
        </span>
      </span>

      <span className="tema-op__nombre">
        {p.nombre}
        {fijada && <Check size={13} />}
      </span>
      <span className="tema-op__attrs">{p.atributos.join(' · ')}</span>

      <span className="tema-op__rampa" aria-hidden="true">
        <i style={{ background: p.primario.sombra }} />
        <i style={{ background: p.primario.base }} />
        <i style={{ background: p.primario.luz }} />
        <i style={{ background: p.secundario.sombra }} />
        <i style={{ background: p.secundario.base }} />
        <i style={{ background: p.secundario.luz }} />
      </span>
    </button>
  )
}
