import { useMemo, useState } from 'react'
import {
  Plus,
  Trash2,
  Save,
  Check,
  FileDown,
  Loader2,
  PackagePlus,
  FolderPlus,
  LayoutTemplate,
} from 'lucide-react'
import { Button, Combobox, useConfirmar } from '@/core/ui'
import { notificarError, notificarExito, notificarAdvertencia } from '@/core/notificaciones'
import type {
  Cliente,
  LineaPresupuesto,
  Presupuesto,
  Proyecto,
  TipoDesarrollo,
} from '@/core/datos'
import { TIPOS_DESARROLLO } from '@/core/lib/modulos'
import { money } from '../lib/calculo'
import {
  ESTADOS_PRESUPUESTO,
  TIPOS_PRESUPUESTO,
  UNIDADES_POR_DEFECTO,
  importeLinea,
  lineasDeTipo,
  queMide,
  sugerirUnidad,
  lineaVacia,
  totalizar,
} from '../lib/presupuesto'
import { PlanPagoEditor } from './PlanPagoEditor'

interface Props {
  presupuesto: Presupuesto
  clientes: Cliente[]
  proyectos: Proyecto[]
  onCambio: (p: Presupuesto) => void
  /** Cambia el estado por el camino del hook, que sella la fecha de aceptación. */
  onEstado: (nuevo: Presupuesto['estado']) => void
  /** Unidades configuradas por la empresa (Configuración → Cobros). */
  unidades?: string[]
  /** Tarifa por hora, para proponer precio al cargar una plantilla. */
  tarifaHora?: number
  onBorrar: () => void
  onPdf: () => void
  generandoPdf?: boolean
}

export function PresupuestoEditor({
  presupuesto: p,
  clientes,
  proyectos,
  onCambio,
  onEstado,
  unidades,
  tarifaHora = 12,
  onBorrar,
  onPdf,
  generandoPdf,
}: Props) {
  const confirmar = useConfirmar()
  const [grupoNuevo, setGrupoNuevo] = useState('')
  const [conAdicionales, setConAdicionales] = useState(false)
  const [recienteGuardado, setRecienteGuardado] = useState(false)
  const totales = useMemo(() => totalizar(p), [p])

  function set<K extends keyof Presupuesto>(k: K, v: Presupuesto[K]) {
    onCambio({ ...p, [k]: v })
  }
  function setLinea(id: string, cambios: Partial<LineaPresupuesto>) {
    onCambio({ ...p, lineas: p.lineas.map((l) => (l.id === id ? { ...l, ...cambios } : l)) })
  }

  function guardarManual() {
    if (!p.titulo || !p.titulo.trim()) {
      notificarError('Título requerido', 'Por favor ingresa un título para la cotización antes de guardar.')
      return
    }

    const lineasInvalidas = p.lineas.some(
      (l) => isNaN(l.cantidad) || isNaN(l.precioUnitario) || l.cantidad < 0 || l.precioUnitario < 0
    )
    if (lineasInvalidas) {
      notificarError(
        'Líneas inválidas',
        'Hay líneas con cantidades o precios no válidos. Verifica los números ingresados.'
      )
      return
    }

    try {
      onCambio(p)
      setRecienteGuardado(true)
      notificarExito('Cotización guardada', `"${p.titulo.trim()}" se guardó correctamente.`)
      setTimeout(() => setRecienteGuardado(false), 3000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la cotización.'
      notificarError('Error al guardar', msg)
    }
  }

  /** Añade de golpe los módulos propios de un tipo de sistema. */
  function cargarPlantilla(tipo: TipoDesarrollo) {
    const nuevas = lineasDeTipo(tipo, tarifaHora, { incluirAdicionales: conAdicionales })
    // Se añaden a lo que ya hay: cotizar suele ser sumar sobre una base.
    onCambio({ ...p, lineas: [...p.lineas, ...nuevas] })
  }

  /** Elimina una sección entera con todas sus líneas, tras confirmar. */
  async function borrarGrupo(grupo: string, cuantas: number) {
    const ok = await confirmar({
      titulo: `Eliminar la sección "${grupo}"`,
      mensaje:
        cuantas === 1
          ? 'Se eliminará su única línea. No se puede deshacer.'
          : `Se eliminarán sus ${cuantas} líneas. No se puede deshacer.`,
      textoConfirmar: 'Eliminar sección',
      peligro: true,
    })
    if (!ok) return
    onCambio({ ...p, lineas: p.lineas.filter((l) => l.grupo !== grupo) })
  }

  function agregarLinea(grupo: string) {
    onCambio({ ...p, lineas: [...p.lineas, lineaVacia(grupo)] })
  }
  function quitarLinea(id: string) {
    onCambio({ ...p, lineas: p.lineas.filter((l) => l.id !== id) })
  }
  function agregarGrupo() {
    const g = grupoNuevo.trim()
    if (!g) {
      notificarAdvertencia('Sección requerida', 'Escribe el nombre de la nueva sección antes de añadirla.')
      return
    }
    onCambio({ ...p, lineas: [...p.lineas, lineaVacia(g)] })
    setGrupoNuevo('')
  }

  /** Comodidad: trae el alcance del proyecto como líneas (sigue siendo editable). */
  function cargarAlcance() {
    const proy = p.proyectoId ? proyectos.find((x) => x.id === p.proyectoId) : undefined
    const mods = proy?.modulos?.filter((m) => m.incluido) ?? []
    if (!mods.length) return
    const nuevas: LineaPresupuesto[] = mods.map((m) => ({
      id: crypto.randomUUID(),
      grupo: m.clase === 'estandar' ? 'Desarrollo' : 'Adicionales',
      concepto: m.nombre,
      cantidad: m.horas,
      unidad: 'h',
      precioUnitario: 0,
      descuento: 0,
    }))
    onCambio({ ...p, lineas: [...p.lineas, ...nuevas] })
  }

  async function confirmarBorrar() {
    const ok = await confirmar({
      titulo: `¿Eliminar "${p.titulo}"?`,
      mensaje: 'Se perderán sus líneas y totales.',
      textoConfirmar: 'Eliminar',
      peligro: true,
    })
    if (ok) onBorrar()
  }

  const sinAlcance = !p.proyectoId || !proyectos.find((x) => x.id === p.proyectoId)?.modulos?.length

  return (
    <div className="pre">
      {/* Cabecera */}
      <div className="pre__cab">
        <label className="field pre__titulo">
          <span className="field__label">Título</span>
          <input
            className="field__input"
            value={p.titulo}
            onChange={(e) => set('titulo', e.target.value)}
            placeholder="Ej.: ERP para veterinaria — fase 1"
          />
        </label>

        <div className="field">
          <span className="field__label">
            Tipo <span className="field__hint">(ampliación = alcance nuevo sobre un proyecto en curso)</span>
          </span>
          <Combobox
            opciones={TIPOS_PRESUPUESTO.map((t) => ({ valor: t.valor, etiqueta: t.etiqueta }))}
            valor={p.tipo}
            onCambio={(v) => set('tipo', v as Presupuesto['tipo'])}
            buscar={false}
          />
        </div>

        <div className="field pre-estado">
          <span className="field__label">
            Estado de la cotización{' '}
            <span className="field__hint">aceptarla crea la cuenta por cobrar</span>
          </span>
          <div className="pre-flujo">
            {ESTADOS_PRESUPUESTO.map((e) => {
              const actual = p.estado === e.valor
              return (
                <button
                  type="button"
                  key={e.valor}
                  className={'pre-flujo__paso is-' + e.valor + (actual ? ' is-on' : '')}
                  aria-pressed={actual}
                  onClick={() => !actual && onEstado(e.valor)}
                  data-sonido={e.valor === 'aceptado' ? 'exito' : 'seleccion'}
                >
                  {e.etiqueta}
                </button>
              )
            })}
          </div>
          {p.estado === 'aceptado' && (
            <span className="pre-flujo__sello">
              Aceptada el{' '}
              {p.aceptadoEn
                ? new Date(p.aceptadoEn).toLocaleDateString('es-VE', { dateStyle: 'long' })
                : '—'}
              . Ya figura en Cuentas por cobrar.
            </span>
          )}
        </div>

        <div className="field">
          <span className="field__label">Cliente</span>
          <Combobox
            opciones={[
              { valor: '', etiqueta: 'Sin cliente' },
              ...clientes.map((c) => ({ valor: c.id, etiqueta: c.nombre })),
            ]}
            valor={p.clienteId ?? ''}
            onCambio={(v) => set('clienteId', v || undefined)}
            placeholder="Selecciona cliente…"
          />
        </div>

        <div className="field">
          <span className="field__label">
            Proyecto <span className="field__hint">(opcional)</span>
          </span>
          <Combobox
            opciones={[
              { valor: '', etiqueta: 'Sin proyecto' },
              ...proyectos.map((x) => ({
                valor: x.id,
                etiqueta: `${x.codigo ? x.codigo + ' · ' : ''}${x.nombre}`,
              })),
            ]}
            valor={p.proyectoId ?? ''}
            onCambio={(v) => set('proyectoId', v || undefined)}
            placeholder="Asociar a proyecto…"
          />
        </div>

        <label className="field pre__chico">
          <span className="field__label">Moneda</span>
          <input
            className="field__input"
            value={p.moneda}
            onChange={(e) => set('moneda', e.target.value.toUpperCase())}
          />
        </label>

        <label className="field pre__chico">
          <span className="field__label">Validez (días)</span>
          <input
            className="field__input"
            type="number"
            min={0}
            value={p.validezDias ?? 0}
            onChange={(e) => set('validezDias', Number(e.target.value))}
          />
        </label>
      </div>

      {/* Líneas por grupo */}
      <div className="pre__lineas">
        {totales.grupos.map((g) => (
          <div className="pre-grupo" key={g.nombre}>
            <div className="pre-grupo__head">
              <span className="pre-grupo__nom">{g.nombre}</span>
              <span className="pre-grupo__sub">{money(g.subtotal, p.moneda)}</span>
              {/* Una plantilla cargada por error son 6-12 líneas: borrarlas de
                  a una es inviable. */}
              <button
                type="button"
                className="icono-btn icono-btn--peligro pre-grupo__x"
                onClick={() => void borrarGrupo(g.nombre, g.lineas.length)}
                aria-label={`Eliminar la sección ${g.nombre}`}
                title={`Eliminar la sección completa (${g.lineas.length} líneas)`}
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="pre-tabla">
              <div className="pre-th">
                <span>Concepto</span>
                <span>Cant.</span>
                <span>Unidad</span>
                <span>P. unitario</span>
                <span>Desc.%</span>
                <span>Importe</span>
                <span />
              </div>

              {g.lineas.map((l) => (
                <div className="pre-tr" key={l.id}>
                  <input
                    className="field__input"
                    value={l.concepto}
                    onChange={(e) => setLinea(l.id, { concepto: e.target.value })}
                    placeholder="Concepto…"
                  />
                  <input
                    className="field__input"
                    type="number"
                    min={0}
                    step="0.5"
                    value={l.cantidad}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      setLinea(l.id, { cantidad: isNaN(val) ? 0 : Math.max(0, val) })
                    }}
                  />
                  <div className="pre-unidad">
                    {/* Texto libre con sugerencias: la lista se configura en
                        Configuración → Cobros, y aun así se puede escribir una
                        unidad que no esté en ella. */}
                    <input
                      className="field__input"
                      list="pre-unidades"
                      value={l.unidad}
                      title={queMide(l.unidad) ?? 'Unidad de cobro'}
                      placeholder="módulo"
                      onChange={(e) => setLinea(l.id, { unidad: e.target.value })}
                    />
                    {/* Sugerencia a partir del concepto. No cambia nada sola:
                        quien cotiza decide si la acepta. */}
                    {(() => {
                      const s = sugerirUnidad(l.concepto)
                      if (!s || s === l.unidad) return null
                      return (
                        <button
                          type="button"
                          className="pre-unidad__sug"
                          onClick={() => setLinea(l.id, { unidad: s })}
                          title={`Esto suele cobrarse por ${s}: ${queMide(s) ?? ''}`}
                        >
                          ¿{s}?
                        </button>
                      )
                    })()}
                  </div>
                  <input
                    className="field__input"
                    type="number"
                    min={0}
                    step="0.01"
                    value={l.precioUnitario}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      setLinea(l.id, { precioUnitario: isNaN(val) ? 0 : Math.max(0, val) })
                    }}
                  />
                  <input
                    className="field__input"
                    type="number"
                    min={0}
                    max={100}
                    value={l.descuento ?? 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      setLinea(l.id, { descuento: isNaN(val) ? 0 : Math.min(100, Math.max(0, val)) })
                    }}
                  />
                  <span className="pre-importe">{money(importeLinea(l), p.moneda)}</span>
                  <button
                    className="icono-btn icono-btn--peligro"
                    onClick={() => quitarLinea(l.id)}
                    aria-label="Quitar línea"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button className="pre-add" onClick={() => agregarLinea(g.nombre)}>
              <Plus size={13} /> Añadir línea en {g.nombre}
            </button>
          </div>
        ))}

        {p.lineas.length === 0 && (
          <p className="field__hint">
            Aún no hay líneas. Añade una sección y arma el presupuesto concepto por concepto.
          </p>
        )}

        <div className="pre__nuevo-grupo">
          <input
            className="field__input"
            value={grupoNuevo}
            onChange={(e) => setGrupoNuevo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), agregarGrupo())}
            placeholder="Nueva sección (Desarrollo, Integraciones, Capacitación…)"
          />
          <Button type="button" variant="ghost" onClick={agregarGrupo}>
            <FolderPlus size={15} /> Añadir sección
          </Button>
          <Button type="button" variant="ghost" onClick={cargarAlcance} disabled={sinAlcance}>
            <PackagePlus size={15} /> Traer alcance del proyecto
          </Button>
        </div>

        {/* Plantilla por tipo de sistema: evita armar desde cero lo que todo
            ERP, e-commerce, landing o SaaS necesita para ser lo que es.
            Lo cargado queda editable como cualquier línea. */}
        <div className="pre-plantilla">
          <span className="pre-plantilla__et">
            <LayoutTemplate size={14} /> Cargar módulos de un tipo de sistema
          </span>
          <div className="pre-plantilla__chips">
            {TIPOS_DESARROLLO.filter((t) => t.valor !== 'otro').map((t) => (
              <button
                type="button"
                key={t.valor}
                className="pre-plantilla__chip"
                onClick={() => cargarPlantilla(t.valor)}
                title={`Añade los módulos que necesita un ${t.etiqueta}`}
              >
                {t.etiqueta}
              </button>
            ))}
          </div>
          <label className="pend-check">
            <input
              type="checkbox"
              checked={conAdicionales}
              onChange={(e) => setConAdicionales(e.target.checked)}
            />
            Incluir adicionales sugeridos
          </label>
        </div>
      </div>

      {/* Sugerencias de unidad para todas las líneas. */}
      <datalist id="pre-unidades">
        {(unidades?.length ? unidades : UNIDADES_POR_DEFECTO).map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>

      {/* Totales */}
      <div className="pre__totales">
        <div className="pre-tot">
          <span>Subtotal</span>
          <b>{money(totales.subtotal, p.moneda)}</b>
        </div>
        <div className="pre-tot">
          <span>
            Descuento global
            <input
              className="pre-pct"
              type="number"
              min={0}
              max={100}
              value={p.descuentoGlobal}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                set('descuentoGlobal', isNaN(val) ? 0 : Math.min(100, Math.max(0, val)))
              }}
            />
            %
          </span>
          <b>− {money(totales.descuentoGlobal, p.moneda)}</b>
        </div>
        <div className="pre-tot">
          <span>Base imponible</span>
          <b>{money(totales.baseImponible, p.moneda)}</b>
        </div>
        <div className="pre-tot">
          <span>
            Impuesto
            <input
              className="pre-pct"
              type="number"
              min={0}
              max={100}
              value={p.impuesto}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                set('impuesto', isNaN(val) ? 0 : Math.min(100, Math.max(0, val)))
              }}
            />
            %
          </span>
          <b>{money(totales.impuesto, p.moneda)}</b>
        </div>
        <div className="pre-tot pre-tot--final">
          <span>Total</span>
          <b>{money(totales.total, p.moneda)}</b>
        </div>
      </div>

      <section className="pre-bloque">
        <h4 className="pre-bloque__tit">
          Condiciones de cobro
          <span className="field__hint">de aquí sale la cuenta por cobrar</span>
        </h4>
        <PlanPagoEditor
          plan={p.plan}
          total={totales.total}
          moneda={p.moneda}
          onCambio={(plan) => set('plan', plan)}
        />
      </section>

      <label className="field">
        <span className="field__label">
          Observaciones de pago <span className="field__hint">(texto que verá el cliente)</span>
        </span>
        <textarea
          className="field__input"
          rows={2}
          value={p.condiciones ?? ''}
          onChange={(e) => set('condiciones', e.target.value)}
          placeholder="Los montos en bolívares se calculan a la tasa del día del pago…"
        />
      </label>

      <label className="field">
        <span className="field__label">Notas</span>
        <textarea
          className="field__input"
          rows={2}
          value={p.notas ?? ''}
          onChange={(e) => set('notas', e.target.value)}
        />
      </label>

      <div className="form-acciones">
        <Button type="button" variant="ghost" onClick={confirmarBorrar}>
          <Trash2 size={15} /> Eliminar
        </Button>
        <Button type="button" variant="ghost" onClick={onPdf} disabled={generandoPdf}>
          {generandoPdf ? <Loader2 size={15} className="spin" /> : <FileDown size={15} />} PDF
        </Button>
        <Button
          type="button"
          onClick={guardarManual}
          className={recienteGuardado ? 'btn--primary is-guardado' : 'btn--primary'}
        >
          {recienteGuardado ? (
            <>
              <Check size={15} /> Guardado
            </>
          ) : (
            <>
              <Save size={15} /> Guardar cotización
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
