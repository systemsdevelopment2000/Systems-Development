import '../styles/configuracion.css'
import { useState } from 'react'
import {
  Bell,
  BellRing,
  FileText,
  Check,
  Volume2,
  VolumeX,
  Landmark,
  Workflow,
  Database,
  Info,
  SlidersHorizontal,
} from 'lucide-react'
import { env } from '@/core/config/env'
import { useNotificaciones, notificar } from '@/core/notificaciones'
import { useSonido } from '@/core/sonido'
import { useDatos } from '@/core/datos'
import { Button, SubirImagen, CabeceraSD, PieSD } from '@/core/ui'
import { textoPie } from '@/core/lib/membrete'
import { EstadosCard } from '../components/EstadosCard'
import { DatosCard } from '../components/DatosCard'
import { CobroCard } from '../components/CobroCard'
import { TemaCard } from '../components/TemaCard'
import { UnidadesCard } from '../components/UnidadesCard'

type SeccionId = 'marca' | 'cobros' | 'operacion' | 'sistema' | 'datos'

const SECCIONES: { id: SeccionId; label: string; desc: string; Icon: typeof FileText }[] = [
  {
    id: 'marca',
    label: 'Marca y documentos',
    desc: 'Membrete que encabeza reportes, presupuestos y contratos.',
    Icon: FileText,
  },
  {
    id: 'cobros',
    label: 'Cobros',
    desc: 'Datos para que el cliente pague y parámetros de costeo.',
    Icon: Landmark,
  },
  {
    id: 'operacion',
    label: 'Operación',
    desc: 'Estados del flujo de trabajo de los proyectos.',
    Icon: Workflow,
  },
  {
    id: 'sistema',
    label: 'Sistema',
    desc: 'Notificaciones, sonido e información de la aplicación.',
    Icon: SlidersHorizontal,
  },
  {
    id: 'datos',
    label: 'Datos',
    desc: 'Respaldo, restauración y reinicio de la información local.',
    Icon: Database,
  },
]

/** Membrete editable: lo que encabeza reportes, propuestas y contratos. */
function MembreteCard() {
  const { estado, setEmpresa } = useDatos()
  const [e, setE] = useState(estado.empresa)
  const [guardado, setGuardado] = useState(false)

  function campo(k: keyof typeof e, v: string) {
    setE((prev) => ({ ...prev, [k]: v }))
    setGuardado(false)
  }
  function guardar() {
    setEmpresa(e)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 1800)
  }

  return (
    <div className="cfg-card cfg-card--ancha">
      <div className="cfg-card__head">
        <span className="cfg-card__icono">
          <FileText size={18} />
        </span>
        <div>
          <h2 className="cfg-card__tit">Membrete de documentos</h2>
          <p className="cfg-card__sub">
            Encabeza todos los reportes y PDF. Los cambios se ven al instante.
          </p>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-grid__full">
          <SubirImagen
            valor={e.logo}
            onCambio={(v) => campo('logo', v ?? '/logo-sd.png')}
            etiqueta="Logo del membrete"
            forma="cuadrado"
          />
        </div>

        <label className="field form-grid__full">
          <span className="field__label">Nombre</span>
          <input
            className="field__input"
            value={e.nombre}
            onChange={(ev) => campo('nombre', ev.target.value)}
          />
        </label>

        <label className="field">
          <span className="field__label">Teléfonos</span>
          <input
            className="field__input"
            value={e.telefonos}
            onChange={(ev) => campo('telefonos', ev.target.value)}
          />
        </label>

        <label className="field">
          <span className="field__label">Ubicación</span>
          <input
            className="field__input"
            value={e.ubicacion}
            onChange={(ev) => campo('ubicacion', ev.target.value)}
          />
        </label>

        <label className="field form-grid__full">
          <span className="field__label">Correo</span>
          <input
            className="field__input"
            type="email"
            value={e.correo}
            onChange={(ev) => campo('correo', ev.target.value)}
          />
        </label>

        <label className="field form-grid__full">
          <span className="field__label">
            Pie de página{' '}
            <span className="field__hint">
              si lo dejas vacío se arma con el nombre, la ubicación y el correo de arriba
            </span>
          </span>
          <input
            className="field__input"
            value={e.pie}
            placeholder={textoPie({ ...e, pie: '' })}
            onChange={(ev) => campo('pie', ev.target.value)}
          />
        </label>
      </div>

      <div className="cfg-prev">
        <span className="cfg-prev__tit">Vista previa</span>
        <div className="mb cfg-prev__hoja">
          <CabeceraSD datos={e} />
          {/* También el pie: es lo que cierra cada documento y hasta ahora no
              se veía mientras se editaba. */}
          <PieSD datos={e} />
        </div>
      </div>

      <div className="form-acciones">
        <Button type="button" onClick={guardar}>
          {guardado ? <Check size={15} /> : null} {guardado ? 'Guardado' : 'Guardar membrete'}
        </Button>
      </div>
    </div>
  )
}

/** Parámetros de costeo usados por el presupuestador. */
function CosteoCard() {
  const { estado, setEmpresa } = useDatos()
  const f = estado.empresa.finanzas ?? {
    tarifaHora: 12,
    moneda: 'USD',
    margen: 35,
    indirectos: 10,
    descuento: 0,
  }

  function set(k: keyof typeof f, v: number | string) {
    setEmpresa({ ...estado.empresa, finanzas: { ...f, [k]: v } })
  }

  return (
    <div className="cfg-card cfg-card--ancha">
      <div className="cfg-card__head">
        <span className="cfg-card__icono">
          <SlidersHorizontal size={18} />
        </span>
        <div>
          <h2 className="cfg-card__tit">Parámetros de costeo</h2>
          <p className="cfg-card__sub">
            Valores por defecto al estimar el costo de un proyecto por horas.
          </p>
        </div>
      </div>

      <div className="form-grid">
        <label className="field">
          <span className="field__label">Tarifa por hora</span>
          <input
            className="field__input"
            type="number"
            min={0}
            step="0.5"
            value={f.tarifaHora}
            onChange={(e) => set('tarifaHora', Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span className="field__label">Moneda base</span>
          <input
            className="field__input"
            value={f.moneda}
            onChange={(e) => set('moneda', e.target.value.toUpperCase())}
          />
        </label>
        <label className="field">
          <span className="field__label">Gastos indirectos %</span>
          <input
            className="field__input"
            type="number"
            min={0}
            value={f.indirectos}
            onChange={(e) => set('indirectos', Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span className="field__label">Margen %</span>
          <input
            className="field__input"
            type="number"
            min={0}
            value={f.margen}
            onChange={(e) => set('margen', Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  )
}

/** Sonido de la interfaz: cada acción tiene su efecto propio. */
function SonidoCard() {
  const { activo, alternar, sonar } = useSonido()

  return (
    <div className="cfg-card">
      <div className="cfg-card__head">
        <span className="cfg-card__icono">
          {activo ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </span>
        <div>
          <h2 className="cfg-card__tit">Sonido de la interfaz</h2>
          <p className="cfg-card__sub">
            Cada acción tiene un efecto propio (guardar, eliminar, copiar, avisos).
          </p>
        </div>
      </div>

      <label className="toggle">
        <input type="checkbox" checked={activo} onChange={alternar} />
        <span className="toggle__sw" />
        <span className="toggle__txt">{activo ? 'Sonidos activados' : 'Sonidos silenciados'}</span>
      </label>

      {activo && (
        <div className="snd-probar">
          <span className="field__hint">Probar:</span>
          {(['exito', 'error', 'eliminar', 'copiar', 'aviso'] as const).map((n) => (
            <button key={n} className="snd-chip" data-sonido="ninguno" onClick={() => sonar(n)}>
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function NotificacionesCard() {
  const { soportado, permiso, activar } = useNotificaciones()
  const etiquetaPermiso =
    permiso === 'granted' ? 'Activadas' : permiso === 'denied' ? 'Bloqueadas' : 'Sin activar'

  return (
    <div className="cfg-card">
      <div className="cfg-card__head">
        <span className="cfg-card__icono">
          <Bell size={18} />
        </span>
        <div>
          <h2 className="cfg-card__tit">Notificaciones</h2>
          <p className="cfg-card__sub">Avisos de proyectos, pagos y reuniones próximas.</p>
        </div>
      </div>

      {!soportado && <p className="muted">Este navegador no soporta notificaciones.</p>}

      {soportado && (
        <>
          <p className="cfg-estado">
            Estado: <strong className={'cfg-perm cfg-perm--' + permiso}>{etiquetaPermiso}</strong>
          </p>
          <div className="cfg-acciones">
            {permiso !== 'granted' && (
              <button
                className="btn btn--primary btn--icono"
                onClick={() => void activar()}
                disabled={permiso === 'denied'}
              >
                <BellRing size={15} /> Activar notificaciones
              </button>
            )}
            {permiso === 'granted' && (
              <button
                className="btn btn--ghost btn--icono"
                onClick={() => void notificar('Systems Development', 'Notificación de prueba.')}
              >
                <BellRing size={15} /> Probar notificación
              </button>
            )}
          </div>
          {permiso === 'denied' && (
            <p className="muted">
              Están bloqueadas en el navegador. Habilítalas desde el candado de la barra de
              direcciones.
            </p>
          )}
          <p className="cfg-nota">
            El push en segundo plano se habilitará en la fase de backend (VAPID + Supabase).
          </p>
        </>
      )}
    </div>
  )
}

function AplicacionCard() {
  return (
    <div className="cfg-card">
      <div className="cfg-card__head">
        <span className="cfg-card__icono">
          <Info size={18} />
        </span>
        <div>
          <h2 className="cfg-card__tit">Aplicación</h2>
          <p className="cfg-card__sub">Información del entorno actual.</p>
        </div>
      </div>
      <dl className="deflist">
        <dt>Nombre</dt>
        <dd>{env.appName}</dd>
        <dt>Entorno</dt>
        <dd>
          <span className="badge">{env.appEnv}</span>
        </dd>
        <dt>Supabase URL</dt>
        <dd className="mono">{env.supabaseUrl}</dd>
      </dl>
    </div>
  )
}

export function ConfiguracionPage() {
  const [seccion, setSeccion] = useState<SeccionId>('marca')
  const actual = SECCIONES.find((s) => s.id === seccion)!

  return (
    <section className="page">
      <header className="page__header">
        <h1 className="page__title">Configuración</h1>
        <p className="page__subtitle">Ajustes del sistema, agrupados por propósito.</p>
      </header>

      <div className="cfg-layout">
        <nav className="cfg-nav" aria-label="Secciones de configuración">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              className={'cfg-nav__item' + (seccion === s.id ? ' is-on' : '')}
              onClick={() => setSeccion(s.id)}
            >
              <s.Icon size={16} />
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="cfg-panel">
          <p className="cfg-panel__desc">{actual.desc}</p>

          <div className="cfg">
            {seccion === 'marca' && (
              <>
                <TemaCard />
                <MembreteCard />
              </>
            )}

            {seccion === 'cobros' && (
              <>
                <CobroCard />
                <CosteoCard />
                <UnidadesCard />
              </>
            )}

            {seccion === 'operacion' && <EstadosCard />}

            {seccion === 'sistema' && (
              <>
                <NotificacionesCard />
                <SonidoCard />
                <AplicacionCard />
              </>
            )}

            {seccion === 'datos' && <DatosCard />}
          </div>
        </div>
      </div>
    </section>
  )
}
