import { useState } from 'react'
import { Button, Combobox } from '@/core/ui'
import type {
  Colaborador,
  CriteriosColaborador,
  EvaluacionCliente,
  EvaluacionColaborador,
} from '@/core/datos'
import type { CriteriosCliente } from '../../hooks/useProyectoDetalle'
import { EscalaEval, etiquetaNivel } from './EscalaEval'

interface Props {
  colaboradores: Colaborador[]
  evaluacionesColaborador: EvaluacionColaborador[]
  evaluacionesCliente: EvaluacionCliente[]
  clienteNombre?: string
  nombreColaborador: (id?: string) => string
  onEvaluarColaborador: (
    colaboradorId: string,
    criterios: CriteriosColaborador,
    notas?: string,
  ) => void
  onEvaluarCliente: (criterios: CriteriosCliente, notas?: string) => void
}

const CRIT_COLAB: { k: keyof CriteriosColaborador; label: string; ayuda: string }[] = [
  { k: 'cumplimiento', label: 'Cumplimiento', ayuda: 'Entrega lo acordado en la fecha pactada.' },
  { k: 'calidad', label: 'Calidad del trabajo', ayuda: 'El resultado cumple el estándar técnico de SD.' },
  { k: 'comunicacion', label: 'Comunicación', ayuda: 'Informa avances y avisa los bloqueos a tiempo.' },
  { k: 'autonomia', label: 'Autonomía', ayuda: 'Resuelve sin requerir supervisión constante.' },
]

const CRIT_CLIENTE: { k: keyof CriteriosCliente; label: string; ayuda: string }[] = [
  { k: 'amigabilidad', label: 'Trato', ayuda: 'Respeto y cordialidad en la relación de trabajo.' },
  { k: 'puntualidadPago', label: 'Puntualidad de pago', ayuda: 'Paga en los plazos acordados.' },
  { k: 'estabilidadAlcance', label: 'Estabilidad del alcance', ayuda: 'Evita cambios de alcance fuera de lo pactado.' },
  { k: 'comunicacion', label: 'Comunicación', ayuda: 'Responde y define requisitos con claridad.' },
]

const INICIAL_COLAB: CriteriosColaborador = {
  cumplimiento: 60,
  calidad: 60,
  comunicacion: 60,
  autonomia: 60,
}
const INICIAL_CLIENTE: CriteriosCliente = {
  amigabilidad: 60,
  puntualidadPago: 60,
  estabilidadAlcance: 60,
  comunicacion: 60,
}

function promedio(valores: number[]) {
  return Math.round(valores.reduce((s, v) => s + v, 0) / valores.length)
}
function promedioCliente(e: EvaluacionCliente) {
  return promedio([e.amigabilidad, e.puntualidadPago, e.estabilidadAlcance, e.comunicacion])
}

/** Resultado global con su etiqueta semántica. */
function Resultado({ valor }: { valor: number }) {
  return (
    <div className="ev-res">
      <span className="ev-res__k">Resultado</span>
      <strong className="ev-res__v">{valor}%</strong>
      <span className="ev-res__lbl">{etiquetaNivel(valor)}</span>
    </div>
  )
}

export function TabEvaluaciones({
  colaboradores,
  evaluacionesColaborador,
  evaluacionesCliente,
  clienteNombre,
  nombreColaborador,
  onEvaluarColaborador,
  onEvaluarCliente,
}: Props) {
  const [colId, setColId] = useState('')
  const [critColab, setCritColab] = useState<CriteriosColaborador>(INICIAL_COLAB)
  const [notasC, setNotasC] = useState('')
  const [errColab, setErrColab] = useState<string | null>(null)

  const [crit, setCrit] = useState<CriteriosCliente>(INICIAL_CLIENTE)
  const [notasCli, setNotasCli] = useState('')

  const totalColab = promedio(Object.values(critColab))
  const totalCli = promedio(Object.values(crit))

  function guardarColab() {
    if (!colId) {
      setErrColab('Selecciona a quién estás evaluando.')
      return
    }
    onEvaluarColaborador(colId, critColab, notasC.trim() || undefined)
    setColId('')
    setNotasC('')
    setCritColab(INICIAL_COLAB)
    setErrColab(null)
  }
  function guardarCli() {
    onEvaluarCliente(crit, notasCli.trim() || undefined)
    setNotasCli('')
    setCrit(INICIAL_CLIENTE)
  }

  return (
    <div className="tab-sec ev">
      {/* ---- Colaborador ---- */}
      <div className="ev-bloque">
        <h3 className="ev-tit">Evaluar colaborador</h3>
        <p className="ev-sub">
          Califica cada criterio; el resultado se calcula como promedio y queda en el historial.
        </p>

        <div className="ev-form">
          <div className="field">
            <span className="field__label">Colaborador</span>
            <Combobox
              opciones={colaboradores.map((c) => ({ valor: c.id, etiqueta: c.nombre }))}
              valor={colId}
              onCambio={(v) => {
                setColId(v)
                setErrColab(null)
              }}
              placeholder="¿A quién evalúas?"
            />
          </div>

          {CRIT_COLAB.map((c) => (
            <EscalaEval
              key={c.k}
              label={c.label}
              ayuda={c.ayuda}
              valor={critColab[c.k]}
              onCambio={(v) => setCritColab((prev) => ({ ...prev, [c.k]: v }))}
            />
          ))}

          <Resultado valor={totalColab} />

          <label className="field">
            <span className="field__label">
              Notas <span className="field__hint">(sustenta la calificación)</span>
            </span>
            <textarea
              className="field__input"
              rows={2}
              placeholder="Ejemplos concretos que justifiquen la evaluación…"
              value={notasC}
              onChange={(e) => setNotasC(e.target.value)}
            />
          </label>

          {errColab && (
            <p className="form__error" role="alert">
              {errColab}
            </p>
          )}

          <Button type="button" onClick={guardarColab}>
            Guardar evaluación
          </Button>
        </div>

        <div className="ev-lista">
          {evaluacionesColaborador.map((e) => (
            <article key={e.id} className="ev-card">
              <div className="ev-card__head">
                <span className="ev-card__nom">{nombreColaborador(e.colaboradorId)}</span>
                <span className="ev-card__pct">
                  {e.porcentaje}% · {etiquetaNivel(e.porcentaje)}
                </span>
              </div>
              {e.criterios && (
                <div className="ev-card__crits">
                  {CRIT_COLAB.map((c) => (
                    <span key={c.k} className="ev-crit">
                      {c.label}
                      <b>{etiquetaNivel(e.criterios![c.k])}</b>
                    </span>
                  ))}
                </div>
              )}
              {e.notas && <p className="ev-card__notas">{e.notas}</p>}
              <span className="ev-card__fecha">
                {new Date(e.fecha).toLocaleDateString('es-VE', { dateStyle: 'medium' })}
              </span>
            </article>
          ))}
          {evaluacionesColaborador.length === 0 && <p className="muted">Sin evaluaciones.</p>}
        </div>
      </div>

      {/* ---- Cliente ---- */}
      <div className="ev-bloque">
        <h3 className="ev-tit">Evaluar cliente{clienteNombre ? ` · ${clienteNombre}` : ''}</h3>
        <p className="ev-sub">
          Sirve para decidir a futuro si conviene repetir o ajustar condiciones con este cliente.
        </p>

        <div className="ev-form">
          {CRIT_CLIENTE.map((c) => (
            <EscalaEval
              key={c.k}
              label={c.label}
              ayuda={c.ayuda}
              valor={crit[c.k]}
              onCambio={(v) => setCrit((prev) => ({ ...prev, [c.k]: v }))}
            />
          ))}

          <Resultado valor={totalCli} />

          <label className="field">
            <span className="field__label">
              Notas <span className="field__hint">(retrasos de pago, cambios de alcance…)</span>
            </span>
            <textarea
              className="field__input"
              rows={2}
              value={notasCli}
              onChange={(e) => setNotasCli(e.target.value)}
            />
          </label>

          <Button type="button" onClick={guardarCli}>
            Guardar evaluación
          </Button>
        </div>

        <div className="ev-lista">
          {evaluacionesCliente.map((e) => (
            <article key={e.id} className="ev-card">
              <div className="ev-card__head">
                <span className="ev-card__nom">
                  {new Date(e.fecha).toLocaleDateString('es-VE', { dateStyle: 'medium' })}
                </span>
                <span className="ev-card__pct">
                  {promedioCliente(e)}% · {etiquetaNivel(promedioCliente(e))}
                </span>
              </div>
              <div className="ev-card__crits">
                {CRIT_CLIENTE.map((c) => (
                  <span key={c.k} className="ev-crit">
                    {c.label}
                    <b>{etiquetaNivel(e[c.k])}</b>
                  </span>
                ))}
              </div>
              {e.notas && <p className="ev-card__notas">{e.notas}</p>}
            </article>
          ))}
          {evaluacionesCliente.length === 0 && <p className="muted">Sin evaluaciones.</p>}
        </div>
      </div>
    </div>
  )
}
