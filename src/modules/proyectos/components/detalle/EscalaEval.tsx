/** Niveles de evaluación con significado explícito (se guardan como 0–100). */
export const NIVELES_EVAL = [
  { valor: 20, label: 'Deficiente', desc: 'No cumple lo mínimo acordado.' },
  { valor: 40, label: 'Bajo', desc: 'Cumple solo en parte; requiere seguimiento.' },
  { valor: 60, label: 'Aceptable', desc: 'Cumple lo esperado, sin más.' },
  { valor: 80, label: 'Bueno', desc: 'Cumple y aporta por encima de lo pedido.' },
  { valor: 100, label: 'Excelente', desc: 'Referencia a seguir en el equipo.' },
] as const

type Nivel = (typeof NIVELES_EVAL)[number]

/** Etiqueta semántica del valor más cercano (para mostrar resultados guardados). */
export function etiquetaNivel(v: number): string {
  let mejor: Nivel = NIVELES_EVAL[0]
  for (const n of NIVELES_EVAL) {
    if (Math.abs(n.valor - v) < Math.abs(mejor.valor - v)) mejor = n
  }
  return mejor.label
}

interface Props {
  label: string
  /** Qué significa este criterio, para que la evaluación no sea subjetiva. */
  ayuda?: string
  valor: number
  onCambio: (v: number) => void
}

/**
 * Escala discreta de 5 niveles con anclas nombradas. Sustituye al slider 0–100,
 * que no comunicaba qué significaba cada posición.
 */
export function EscalaEval({ label, ayuda, valor, onCambio }: Props) {
  const actual = NIVELES_EVAL.find((n) => n.valor === valor)

  return (
    <div className="esc">
      <div className="esc__head">
        <span className="esc__label">{label}</span>
        {actual && <span className="esc__sel">{actual.label}</span>}
      </div>
      {ayuda && <span className="esc__ayuda">{ayuda}</span>}

      <div className="esc__niveles" role="radiogroup" aria-label={label}>
        {NIVELES_EVAL.map((n, i) => (
          <button
            key={n.valor}
            type="button"
            role="radio"
            aria-checked={valor === n.valor}
            className={'esc__niv' + (valor === n.valor ? ' is-on' : '')}
            onClick={() => onCambio(n.valor)}
            title={n.desc}
          >
            <span className="esc__num">{i + 1}</span>
            <span className="esc__txt">{n.label}</span>
          </button>
        ))}
      </div>

      {actual && <span className="esc__desc">{actual.desc}</span>}
    </div>
  )
}
