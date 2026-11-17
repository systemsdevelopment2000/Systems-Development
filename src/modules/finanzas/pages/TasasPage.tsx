import '../styles/finanzas.css'
import { useMemo, useState } from 'react'
import { RefreshCw, Plus, ArrowLeftRight, TrendingUp, Trash2, Loader2 } from 'lucide-react'
import { Button, useConfirmar } from '@/core/ui'
import { useDatos, nuevoId, type TasaCambio } from '@/core/datos'
import { consultarTasa, convertir } from '../lib/tasas'

export function TasasPage() {
  const { estado, upsert, eliminar } = useDatos()
  const confirmar = useConfirmar()

  const [base, setBase] = useState('USD')
  const [destino, setDestino] = useState('VES')
  const [cargando, setCargando] = useState(false)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [manual, setManual] = useState('')

  // Calculadora
  const [monto, setMonto] = useState('100')
  const [invertir, setInvertir] = useState(false)

  const historial = useMemo(
    () =>
      Object.values(estado.tasas)
        .filter((t) => t.base === base && t.destino === destino)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [estado.tasas, base, destino],
  )
  const vigente = historial[0]

  function registrar(valor: number, fuente: TasaCambio['fuente'], nota?: string) {
    const t: TasaCambio = {
      id: nuevoId(),
      fecha: new Date().toISOString(),
      base: base.toUpperCase(),
      destino: destino.toUpperCase(),
      valor,
      fuente,
      nota,
    }
    upsert('tasas', t)
  }

  async function actualizar() {
    setCargando(true)
    setAviso(null)
    try {
      const r = await consultarTasa(base, destino)
      registrar(r.valor, 'api', r.fuente)
      setAviso({ tipo: 'ok', texto: `Tasa actualizada desde ${r.fuente}.` })
    } catch (e) {
      setAviso({ tipo: 'error', texto: e instanceof Error ? e.message : 'Fallo al consultar.' })
    } finally {
      setCargando(false)
    }
  }

  function guardarManual() {
    const v = Number(manual.replace(',', '.'))
    if (!v || v <= 0) {
      setAviso({ tipo: 'error', texto: 'Escribe un valor de tasa válido.' })
      return
    }
    registrar(v, 'manual')
    setManual('')
    setAviso({ tipo: 'ok', texto: 'Tasa registrada manualmente.' })
  }

  async function borrar(t: TasaCambio) {
    const ok = await confirmar({
      titulo: '¿Eliminar este registro de tasa?',
      mensaje: `${t.base}→${t.destino} · ${t.valor}`,
      textoConfirmar: 'Eliminar',
      peligro: true,
    })
    if (ok) eliminar('tasas', t.id)
  }

  const montoNum = Number(monto.replace(',', '.')) || 0
  const resultado = vigente ? convertir(montoNum, vigente.valor, invertir) : 0
  const de = invertir ? destino : base
  const a = invertir ? base : destino

  // Variación respecto al registro anterior (historial ligero).
  const anterior = historial[1]
  const variacion =
    vigente && anterior ? ((vigente.valor - anterior.valor) / anterior.valor) * 100 : null

  return (
    <section className="page">
      <header className="page__header">
        <h1 className="page__title">Tasas y divisas</h1>
        <p className="page__subtitle">
          Tasa vigente, historial ligero y calculadora de conversión.
        </p>
      </header>

      <div className="tas-grid">
        {/* Par y tasa vigente */}
        <div className="tas-card">
          <div className="tas-par">
            <label className="field">
              <span className="field__label">Base</span>
              <input
                className="field__input"
                value={base}
                onChange={(e) => setBase(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())}
                maxLength={5}
              />
            </label>
            <ArrowLeftRight size={16} className="tas-flecha" />
            <label className="field">
              <span className="field__label">Destino</span>
              <input
                className="field__input"
                value={destino}
                onChange={(e) => setDestino(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())}
                maxLength={5}
              />
            </label>
          </div>

          <div className="tas-vigente">
            <span className="tas-k">Tasa vigente</span>
            {vigente ? (
              <>
                <strong className="tas-valor">
                  {vigente.valor.toLocaleString('es-VE', { maximumFractionDigits: 4 })}
                </strong>
                <span className="tas-detalle">
                  1 {vigente.base} = {vigente.valor.toLocaleString('es-VE', { maximumFractionDigits: 4 })}{' '}
                  {vigente.destino}
                </span>
                <span className="tas-meta">
                  {new Date(vigente.fecha).toLocaleString('es-VE', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}{' '}
                  · {vigente.fuente === 'api' ? vigente.nota ?? 'API' : 'carga manual'}
                  {variacion !== null && (
                    <em className={variacion >= 0 ? 'tas-sube' : 'tas-baja'}>
                      {variacion >= 0 ? '▲' : '▼'} {Math.abs(variacion).toFixed(2)}%
                    </em>
                  )}
                </span>
              </>
            ) : (
              <p className="field__hint">
                Aún no hay tasa para {base}→{destino}. Actualízala o cárgala manualmente.
              </p>
            )}
          </div>

          <div className="cfg-acciones">
            <Button type="button" onClick={actualizar} disabled={cargando}>
              {cargando ? <Loader2 size={15} className="spin" /> : <RefreshCw size={15} />}
              {cargando ? 'Consultando…' : 'Actualizar desde API'}
            </Button>
          </div>

          <div className="tas-manual">
            <input
              className="field__input"
              placeholder={`Tasa manual ${base}→${destino}`}
              value={manual}
              onChange={(e) => setManual(e.target.value.replace(/[^0-9.,]/g, ''))}
            />
            <Button type="button" variant="ghost" onClick={guardarManual}>
              <Plus size={15} /> Registrar
            </Button>
          </div>

          {aviso && (
            <p className={aviso.tipo === 'ok' ? 'reset__ok' : 'form__error'}>{aviso.texto}</p>
          )}
        </div>

        {/* Calculadora */}
        <div className="tas-card">
          <span className="tas-k">Calculadora</span>
          <div className="tas-calc">
            <input
              className="field__input"
              type="number"
              min={0}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
            <span className="tas-moneda">{de}</span>
            <button
              className="tas-swap"
              onClick={() => setInvertir((v) => !v)}
              title="Invertir conversión"
            >
              <ArrowLeftRight size={15} />
            </button>
          </div>

          <div className="tas-resultado">
            <strong>{resultado.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</strong>
            <span>{a}</span>
          </div>

          {!vigente && <p className="field__hint">Registra una tasa para convertir.</p>}
        </div>
      </div>

      {/* Historial */}
      <div className="tas-hist">
        <span className="tas-k">
          <TrendingUp size={13} /> Historial ({historial.length})
        </span>
        {historial.length === 0 ? (
          <p className="muted">Sin registros para este par.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Par</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                  <th>Origen</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {historial.map((t) => (
                  <tr key={t.id}>
                    <td>
                      {new Date(t.fecha).toLocaleString('es-VE', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td>
                      {t.base}→{t.destino}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {t.valor.toLocaleString('es-VE', { maximumFractionDigits: 4 })}
                    </td>
                    <td>
                      <span className="badge">{t.fuente === 'api' ? 'API' : 'Manual'}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="icono-btn icono-btn--peligro"
                        onClick={() => borrar(t)}
                        aria-label="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
