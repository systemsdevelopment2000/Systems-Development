import { useState } from 'react'
import {
  ChevronDown,
  Plus,
  Trash2,
  ShieldAlert,
  Landmark,
  Users,
  IdCard,
  Briefcase,
} from 'lucide-react'
import { Button, Combobox } from '@/core/ui'
import { nuevoId, type Dependiente, type FichaPersonal, type Parentesco } from '@/core/datos'

interface Props {
  ficha: FichaPersonal | undefined
  onCambio: (f: FichaPersonal) => void
}

const PARENTESCOS: { valor: Parentesco; etiqueta: string }[] = [
  { valor: 'hijo', etiqueta: 'Hijo / hija' },
  { valor: 'conyuge', etiqueta: 'Cónyuge o pareja' },
  { valor: 'padre', etiqueta: 'Padre' },
  { valor: 'madre', etiqueta: 'Madre' },
  { valor: 'otro', etiqueta: 'Otro' },
]

const ESTADOS_CIVILES = [
  { valor: 'soltero', etiqueta: 'Soltero/a' },
  { valor: 'casado', etiqueta: 'Casado/a' },
  { valor: 'concubinato', etiqueta: 'Concubinato' },
  { valor: 'divorciado', etiqueta: 'Divorciado/a' },
  { valor: 'viudo', etiqueta: 'Viudo/a' },
]

function Seccion({
  titulo,
  Icono,
  nota,
  children,
  abiertaPorDefecto,
}: {
  titulo: string
  Icono: typeof Users
  nota?: string
  children: React.ReactNode
  abiertaPorDefecto?: boolean
}) {
  const [abierta, setAbierta] = useState(!!abiertaPorDefecto)
  return (
    <section className={'fp-sec' + (abierta ? ' is-abierta' : '')}>
      <button
        type="button"
        className="fp-sec__cab"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
      >
        <Icono size={15} />
        <span className="fp-sec__tit">{titulo}</span>
        {nota && <em className="fp-sec__nota">{nota}</em>}
        <ChevronDown size={15} className="fp-sec__chev" />
      </button>
      {abierta && <div className="fp-sec__cuerpo">{children}</div>}
    </section>
  )
}

/**
 * Ficha de ingreso del personal.
 *
 * Se llena al contratar, no al entrevistar: pedir cuenta bancaria o carga
 * familiar a alguien que todavía es candidato no corresponde. Por eso vive
 * plegada y separada de la evaluación.
 */
export function FichaPersonalForm({ ficha, onCambio }: Props) {
  const f = ficha ?? {}

  function set<K extends keyof FichaPersonal>(k: K, v: FichaPersonal[K]) {
    onCambio({ ...f, [k]: v })
  }
  function setSalud<K extends keyof NonNullable<FichaPersonal['salud']>>(
    k: K,
    v: NonNullable<FichaPersonal['salud']>[K],
  ) {
    onCambio({ ...f, salud: { ...(f.salud ?? {}), [k]: v } })
  }
  function setBanco<K extends keyof NonNullable<FichaPersonal['banco']>>(
    k: K,
    v: NonNullable<FichaPersonal['banco']>[K],
  ) {
    onCambio({ ...f, banco: { ...(f.banco ?? {}), [k]: v } })
  }

  const dependientes = f.dependientes ?? []
  function setDep(id: string, cambios: Partial<Dependiente>) {
    set(
      'dependientes',
      dependientes.map((d) => (d.id === id ? { ...d, ...cambios } : d)),
    )
  }

  return (
    <div className="fp">
      <Seccion titulo="Datos personales" Icono={IdCard} abiertaPorDefecto>
        <div className="form-grid">
          <label className="field">
            <span className="field__label">Fecha de nacimiento</span>
            <input
              className="field__input"
              type="date"
              value={f.fechaNacimiento ?? ''}
              onChange={(e) => set('fechaNacimiento', e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">Lugar de nacimiento</span>
            <input
              className="field__input"
              value={f.lugarNacimiento ?? ''}
              onChange={(e) => set('lugarNacimiento', e.target.value)}
              placeholder="Ciudad Bolívar, Bolívar"
            />
          </label>
          <div className="field">
            <span className="field__label">Estado civil</span>
            <Combobox
              opciones={ESTADOS_CIVILES}
              valor={f.estadoCivil ?? ''}
              onCambio={(v) => set('estadoCivil', (v || undefined) as FichaPersonal['estadoCivil'])}
              buscar={false}
            />
          </div>
          <label className="field">
            <span className="field__label">Nacionalidad</span>
            <input
              className="field__input"
              value={f.nacionalidad ?? ''}
              onChange={(e) => set('nacionalidad', e.target.value)}
              placeholder="Venezolana"
            />
          </label>
          <label className="field form-grid__full">
            <span className="field__label">Dirección de habitación</span>
            <input
              className="field__input"
              value={f.direccion ?? ''}
              onChange={(e) => set('direccion', e.target.value)}
              placeholder="Urbanización, calle, casa o apartamento"
            />
          </label>
          <label className="field">
            <span className="field__label">RIF</span>
            <input
              className="field__input"
              value={f.rif ?? ''}
              onChange={(e) => set('rif', e.target.value.replace(/[^jvgJvGeE0-9-]/g, '').toUpperCase())}
              placeholder="V-12345678-9"
            />
          </label>
          <label className="field">
            <span className="field__label">
              Licencia de conducir <span className="field__hint">(si el cargo lo requiere)</span>
            </span>
            <input
              className="field__input"
              value={f.licenciaConducir ?? ''}
              onChange={(e) => set('licenciaConducir', e.target.value)}
              placeholder="Grado 2"
            />
          </label>
          <label className="field">
            <span className="field__label">Nivel educativo</span>
            <input
              className="field__input"
              value={f.nivelEducativo ?? ''}
              onChange={(e) => set('nivelEducativo', e.target.value)}
              placeholder="TSU, universitario, técnico medio…"
            />
          </label>
          <label className="field">
            <span className="field__label">Profesión u oficio</span>
            <input
              className="field__input"
              value={f.profesion ?? ''}
              onChange={(e) => set('profesion', e.target.value)}
            />
          </label>
        </div>
      </Seccion>

      <Seccion
        titulo="Carga familiar"
        Icono={Users}
        nota={dependientes.length ? `${dependientes.length} registrada(s)` : 'define beneficios'}
      >
        <p className="fp-aviso">
          Determina beneficios de ley: seguro familiar, guardería para menores de cinco años y
          bonos escolares. No es un dato opcional de relleno.
        </p>

        {dependientes.map((d, i) => (
          <div className="fp-dep" key={d.id}>
            <span className="fp-dep__n">{i + 1}</span>
            <input
              className="field__input"
              value={d.nombre}
              onChange={(e) => setDep(d.id, { nombre: e.target.value })}
              placeholder="Nombre completo"
            />
            <select
              className="field__input"
              value={d.parentesco}
              onChange={(e) => setDep(d.id, { parentesco: e.target.value as Parentesco })}
            >
              {PARENTESCOS.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.etiqueta}
                </option>
              ))}
            </select>
            <input
              className="field__input"
              type="date"
              value={d.fechaNacimiento ?? ''}
              onChange={(e) => setDep(d.id, { fechaNacimiento: e.target.value })}
            />
            <label className="fp-check" title="Estudia actualmente">
              <input
                type="checkbox"
                checked={!!d.estudia}
                onChange={(e) => setDep(d.id, { estudia: e.target.checked })}
              />
              Estudia
            </label>
            <label className="fp-check" title="Discapacidad certificada">
              <input
                type="checkbox"
                checked={!!d.discapacidad}
                onChange={(e) => setDep(d.id, { discapacidad: e.target.checked })}
              />
              Discapacidad
            </label>
            <button
              type="button"
              className="icono-btn icono-btn--peligro"
              onClick={() => set('dependientes', dependientes.filter((x) => x.id !== d.id))}
              aria-label={`Quitar a ${d.nombre || 'este dependiente'}`}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            set('dependientes', [
              ...dependientes,
              { id: nuevoId(), nombre: '', parentesco: 'hijo' },
            ])
          }
        >
          <Plus size={15} /> Añadir familiar
        </Button>
      </Seccion>

      <Seccion titulo="Salud y emergencia" Icono={ShieldAlert} nota="dato sensible">
        <p className="fp-aviso fp-aviso--sensible">
          Se recoge solo lo necesario para <b>atender una emergencia</b> y{' '}
          <b>adaptar el puesto de trabajo</b>. No es un historial clínico y no debe influir en la
          decisión de contratar: hacerlo sería discriminación.
        </p>

        <div className="form-grid">
          <label className="field">
            <span className="field__label">Tipo de sangre</span>
            <input
              className="field__input"
              value={f.salud?.tipoSangre ?? ''}
              onChange={(e) => setSalud('tipoSangre', e.target.value)}
              placeholder="O+"
            />
          </label>
          <label className="field">
            <span className="field__label">Alergias</span>
            <input
              className="field__input"
              value={f.salud?.alergias ?? ''}
              onChange={(e) => setSalud('alergias', e.target.value)}
              placeholder="Penicilina, ninguna…"
            />
          </label>
          <label className="field form-grid__full">
            <span className="field__label">
              Condición que el puesto deba contemplar{' '}
              <span className="field__hint">(opcional)</span>
            </span>
            <input
              className="field__input"
              value={f.salud?.condicion ?? ''}
              onChange={(e) => setSalud('condicion', e.target.value)}
              placeholder="Asma, diabetes, lesión lumbar…"
            />
          </label>
          <label className="field">
            <span className="field__label">
              Discapacidad <span className="field__hint">(certificado CONAPDIS si lo hay)</span>
            </span>
            <input
              className="field__input"
              value={f.salud?.discapacidad ?? ''}
              onChange={(e) => setSalud('discapacidad', e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">Adaptación que necesita el puesto</span>
            <input
              className="field__input"
              value={f.salud?.adaptacion ?? ''}
              onChange={(e) => setSalud('adaptacion', e.target.value)}
              placeholder="Silla ergonómica, horario flexible…"
            />
          </label>

          <label className="field">
            <span className="field__label">Contacto de emergencia</span>
            <input
              className="field__input"
              value={f.salud?.emergenciaNombre ?? ''}
              onChange={(e) => setSalud('emergenciaNombre', e.target.value)}
              placeholder="Nombre completo"
            />
          </label>
          <label className="field">
            <span className="field__label">Parentesco</span>
            <input
              className="field__input"
              value={f.salud?.emergenciaParentesco ?? ''}
              onChange={(e) => setSalud('emergenciaParentesco', e.target.value)}
              placeholder="Madre, esposo…"
            />
          </label>
          <label className="field">
            <span className="field__label">Teléfono de emergencia</span>
            <input
              className="field__input"
              value={f.salud?.emergenciaTelefono ?? ''}
              onChange={(e) => setSalud('emergenciaTelefono', e.target.value.replace(/[^\d+-\s]/g, ''))}
              placeholder="0414-0000000"
            />
          </label>
        </div>
      </Seccion>

      <Seccion titulo="Nómina y seguridad social" Icono={Landmark}>
        <div className="form-grid">
          <label className="field">
            <span className="field__label">
              N° de asegurado IVSS <span className="field__hint">(si ya está inscrito)</span>
            </span>
            <input
              className="field__input"
              value={f.ivss ?? ''}
              onChange={(e) => set('ivss', e.target.value.replace(/[^0-9-]/g, ''))}
            />
          </label>
          <label className="field">
            <span className="field__label">Cuenta FAOV (Banavih)</span>
            <input
              className="field__input"
              value={f.faov ?? ''}
              onChange={(e) => set('faov', e.target.value.replace(/[^0-9-]/g, ''))}
            />
          </label>

          <label className="field">
            <span className="field__label">Banco</span>
            <input
              className="field__input"
              value={f.banco?.banco ?? ''}
              onChange={(e) => setBanco('banco', e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,.-]/g, ''))}
              placeholder="Banesco, Mercantil…"
            />
          </label>
          <div className="field">
            <span className="field__label">Tipo de cuenta</span>
            <Combobox
              opciones={[
                { valor: 'corriente', etiqueta: 'Corriente' },
                { valor: 'ahorro', etiqueta: 'Ahorro' },
              ]}
              valor={f.banco?.tipoCuenta ?? ''}
              onCambio={(v) =>
                setBanco('tipoCuenta', (v || undefined) as 'corriente' | 'ahorro' | undefined)
              }
              buscar={false}
            />
          </div>
          <label className="field form-grid__full">
            <span className="field__label">Número de cuenta</span>
            <input
              className="field__input mono"
              value={f.banco?.numeroCuenta ?? ''}
              onChange={(e) => setBanco('numeroCuenta', e.target.value.replace(/[^0-9-]/g, ''))}
              placeholder="0000-0000-00-0000000000"
            />
          </label>
          <label className="field">
            <span className="field__label">
              Titular <span className="field__hint">(si no es el trabajador)</span>
            </span>
            <input
              className="field__input"
              value={f.banco?.titular ?? ''}
              onChange={(e) => setBanco('titular', e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]/g, ''))}
            />
          </label>
          <label className="field">
            <span className="field__label">Cédula del titular</span>
            <input
              className="field__input"
              value={f.banco?.documentoTitular ?? ''}
              onChange={(e) => setBanco('documentoTitular', e.target.value.replace(/[^vVeEpP0-9-]/g, '').toUpperCase())}
            />
          </label>
          <label className="field">
            <span className="field__label">Pago móvil</span>
            <input
              className="field__input"
              value={f.banco?.pagoMovil ?? ''}
              onChange={(e) => setBanco('pagoMovil', e.target.value.replace(/[^\d+-\s]/g, ''))}
              placeholder="0414-0000000"
            />
          </label>
        </div>
      </Seccion>

      <Seccion titulo="Condiciones de trabajo" Icono={Briefcase}>
        <div className="form-grid">
          <label className="field">
            <span className="field__label">Fecha de ingreso</span>
            <input
              className="field__input"
              type="date"
              value={f.fechaIngreso ?? ''}
              onChange={(e) => set('fechaIngreso', e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field__label">Tipo de contrato</span>
            <input
              className="field__input"
              value={f.tipoContrato ?? ''}
              onChange={(e) => set('tipoContrato', e.target.value)}
              placeholder="Indeterminado, por obra, pasantía…"
            />
          </label>
          <label className="field">
            <span className="field__label">Salario acordado</span>
            <input
              className="field__input"
              value={f.salario ?? ''}
              onChange={(e) => set('salario', e.target.value)}
              placeholder="200 USD / mes"
            />
          </label>
          <label className="field">
            <span className="field__label">Horario</span>
            <input
              className="field__input"
              value={f.horario ?? ''}
              onChange={(e) => set('horario', e.target.value)}
              placeholder="L–V, 8:00 a 17:00"
            />
          </label>
        </div>

        <label className="fp-check fp-consent">
          <input
            type="checkbox"
            checked={!!f.consentimientoEn}
            onChange={(e) => set('consentimientoEn', e.target.checked ? new Date().toISOString() : undefined)}
          />
          La persona autorizó por escrito el tratamiento de estos datos
          {f.consentimientoEn && (
            <em>
              {' '}
              · {new Date(f.consentimientoEn).toLocaleDateString('es-VE', { dateStyle: 'long' })}
            </em>
          )}
        </label>
      </Seccion>
    </div>
  )
}
