import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, SubirImagen, Combobox, Stepper, type PasoDef } from '@/core/ui'
import type { Cliente, MedioComunicacion } from '@/core/datos'
import { primeraMayuscula } from '@/core/lib/validaciones'
import type { EntradaCliente } from '../hooks/useClientes'

interface Props {
  inicial?: Cliente
  onGuardar: (datos: EntradaCliente) => void
  onCancelar: () => void
}

const PASOS_CLIENTE: PasoDef[] = [
  { id: 'identidad', titulo: '1. Identidad', descripcion: 'Datos fiscales' },
  { id: 'contacto', titulo: '2. Contacto', descripcion: 'Canales y enlace' },
  { id: 'comercial', titulo: '3. Comercial', descripcion: 'Pagos y notas' },
]

export function ClienteForm({ inicial, onGuardar, onCancelar }: Props) {
  // Al editar un cliente existente, muestra todos los datos de una sola vez para que nada quede oculto
  const [verTodo, setVerTodo] = useState(Boolean(inicial))
  const [paso, setPaso] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [tipoDocumento, setTipoDocumento] = useState<'cedula' | 'rif'>(
    inicial?.tipoDocumento ?? 'rif',
  )
  const [documento, setDocumento] = useState(inicial?.documento ?? '')
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [logo, setLogo] = useState<string | undefined>(inicial?.logo)
  const [ubicacion, setUbicacion] = useState(inicial?.ubicacion ?? '')

  const [telefono, setTelefono] = useState(inicial?.contacto?.telefono ?? '')
  const [correo, setCorreo] = useState(inicial?.contacto?.correo ?? '')
  const [medio, setMedio] = useState<MedioComunicacion>(inicial?.contacto?.medio ?? 'whatsapp')

  // Responsable / contacto (enlace directo)
  const [respNombre, setRespNombre] = useState(inicial?.responsable?.nombre ?? '')
  const [respCargo, setRespCargo] = useState(inicial?.responsable?.cargo ?? '')
  const [respTel, setRespTel] = useState(inicial?.responsable?.telefono ?? '')
  const [respCorreo, setRespCorreo] = useState(inicial?.responsable?.correo ?? '')

  const [medioPago, setMedioPago] = useState(inicial?.medioPago ?? '')
  const [notas, setNotas] = useState(inicial?.notas ?? '')

  function validarPaso1(): boolean {
    if (!nombre.trim()) {
      setError('Debes ingresar el nombre o razón social del cliente.')
      return false
    }
    // Cédula / RIF es opcional. Si se ingresa, se verifica formato mínimo.
    if (documento.trim()) {
      const digitos = documento.replace(/\D/g, '')
      if (digitos.length < 5) {
        setError(`El número de ${tipoDocumento === 'rif' ? 'RIF' : 'cédula'} debe tener al menos 5 dígitos.`)
        return false
      }
    }
    setError(null)
    return true
  }

  function validarPaso2(): boolean {
    if (!telefono.trim()) {
      setError('El número de teléfono institucional es obligatorio.')
      return false
    }
    const telDigitos = telefono.replace(/\D/g, '')
    if (telDigitos.length < 7) {
      setError('El número de teléfono debe contener al menos 7 dígitos.')
      return false
    }
    if (correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      setError('El correo institucional no tiene un formato válido (ej. contacto@empresa.com).')
      return false
    }
    if (respTel.trim() && respTel.replace(/\D/g, '').length < 7) {
      setError('El teléfono del responsable debe contener al menos 7 dígitos.')
      return false
    }
    if (respCorreo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(respCorreo.trim())) {
      setError('El correo del responsable no tiene un formato válido.')
      return false
    }
    setError(null)
    return true
  }

  function avanzar() {
    if (paso === 0 && !validarPaso1()) return
    // Permite avanzar del paso 2 al 3 para no trabar la navegación; la validación estricta de teléfono se aplica al guardar
    const siguiente = Math.min(paso + 1, PASOS_CLIENTE.length - 1)
    setPaso(siguiente)
    setError(null)
  }

  function retroceder() {
    setError(null)
    setPaso((prev) => Math.max(prev - 1, 0))
  }

  function irAlPaso(n: number) {
    if (n > 0 && !validarPaso1()) return
    setError(null)
    setPaso(n)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault()
      e.stopPropagation()
      if (!verTodo && paso < PASOS_CLIENTE.length - 1) {
        avanzar()
      }
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!verTodo && paso < PASOS_CLIENTE.length - 1) {
      avanzar()
      return
    }

    if (!validarPaso1()) {
      if (!verTodo) setPaso(0)
      return
    }
    if (!validarPaso2()) {
      if (!verTodo) setPaso(1)
      return
    }

    const nombreResp = respNombre.trim()
    onGuardar({
      id: inicial?.id,
      tipoDocumento,
      documento: documento.trim(),
      nombre: nombre.trim(),
      logo,
      ubicacion: ubicacion.trim() || undefined,
      contacto: {
        telefono: telefono.trim() || undefined,
        correo: correo.trim() || undefined,
        medio,
      },
      responsable: nombreResp
        ? {
            nombre: nombreResp,
            cargo: respCargo.trim() || undefined,
            telefono: respTel.trim() || undefined,
            correo: respCorreo.trim() || undefined,
          }
        : undefined,
      medioPago: medioPago.trim() || undefined,
      notas: notas.trim() || undefined,
    })
  }

  const bloqueIdentidad = (
    <div className="form-grid">
      <div className="form-grid__full">
        <SubirImagen valor={logo} onCambio={setLogo} etiqueta="Logo corporativo" forma="cuadrado" />
      </div>

      <label className="field form-grid__full">
        <span className="field__label">
          Nombre / Razón social <b style={{ color: 'var(--brand)' }}>*</b>
        </span>
        <input
          className="field__input"
          required
          autoFocus={!inicial}
          value={nombre}
          onChange={(e) => {
            setNombre(primeraMayuscula(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.'&-]/g, '')))
            setError(null)
          }}
          placeholder="Ej. Comercial El Roble, C.A."
        />
      </label>

      <div className="field">
        <span className="field__label">Tipo de documento</span>
        <Combobox
          opciones={[
            { valor: 'rif', etiqueta: 'RIF (Empresa)' },
            { valor: 'cedula', etiqueta: 'Cédula (Persona natural)' },
          ]}
          valor={tipoDocumento}
          onCambio={(v) => {
            setTipoDocumento(v as 'cedula' | 'rif')
            setDocumento('')
          }}
          buscar={false}
        />
      </div>

      <label className="field">
        <span className="field__label">
          Número de documento <small style={{ color: 'var(--text-muted)' }}>(Opcional)</small>
        </span>
        <input
          className="field__input"
          value={documento}
          onChange={(e) => {
            const val =
              tipoDocumento === 'cedula'
                ? e.target.value.replace(/\D/g, '')
                : e.target.value.replace(/[^jvgJvGeE0-9-]/g, '').toUpperCase()
            setDocumento(val)
            setError(null)
          }}
          placeholder={tipoDocumento === 'rif' ? 'J-12345678-9' : '12345678'}
        />
      </label>

      <label className="field form-grid__full">
        <span className="field__label">Ubicación / Ciudad</span>
        <input
          className="field__input"
          value={ubicacion}
          onChange={(e) => setUbicacion(primeraMayuscula(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s,.-]/g, '')))}
          placeholder="Puerto Ordaz, Bolívar"
        />
      </label>
    </div>
  )

  const bloqueContacto = (
    <div className="form-grid">
      <label className="field">
        <span className="field__label">
          Teléfono institucional <b style={{ color: 'var(--brand)' }}>*</b>
        </span>
        <input
          className="field__input"
          type="tel"
          required
          value={telefono}
          onChange={(e) => {
            setTelefono(e.target.value.replace(/[^\d+-\s]/g, ''))
            setError(null)
          }}
          placeholder="0414-1234567"
        />
      </label>

      <label className="field">
        <span className="field__label">Correo institucional</span>
        <input
          className="field__input"
          type="email"
          value={correo}
          onChange={(e) => {
            setCorreo(e.target.value.trim())
            setError(null)
          }}
          placeholder="contacto@empresa.com"
        />
      </label>

      <div className="field form-grid__full">
        <span className="field__label">Canal preferido de comunicación</span>
        <Combobox
          opciones={[
            { valor: 'whatsapp', etiqueta: 'WhatsApp' },
            { valor: 'correo', etiqueta: 'Correo electrónico' },
            { valor: 'llamada', etiqueta: 'Llamada telefónica' },
            { valor: 'otro', etiqueta: 'Otro medio' },
          ]}
          valor={medio}
          onCambio={(v) => setMedio(v as MedioComunicacion)}
          buscar={false}
        />
      </div>

      <div className="form-seccion form-grid__full">
        <span className="form-seccion__tit">Persona de contacto / Enlace directo</span>
      </div>

      <label className="field">
        <span className="field__label">Nombre del responsable (solo letras)</span>
        <input
          className="field__input"
          value={respNombre}
          onChange={(e) => {
            setRespNombre(primeraMayuscula(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]/g, '')))
            setError(null)
          }}
          placeholder="Ej. Juan Pérez"
        />
      </label>

      <label className="field">
        <span className="field__label">Cargo / Rol (solo letras)</span>
        <input
          className="field__input"
          value={respCargo}
          onChange={(e) => {
            setRespCargo(primeraMayuscula(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,./-]/g, '')))
            setError(null)
          }}
          placeholder="Gerente de Operaciones"
        />
      </label>

      <label className="field">
        <span className="field__label">Teléfono directo</span>
        <input
          className="field__input"
          type="tel"
          value={respTel}
          onChange={(e) => {
            setRespTel(e.target.value.replace(/[^\d+-\s]/g, ''))
            setError(null)
          }}
          placeholder="0412-9876543"
        />
      </label>

      <label className="field">
        <span className="field__label">Correo directo</span>
        <input
          className="field__input"
          type="email"
          value={respCorreo}
          onChange={(e) => setRespCorreo(e.target.value)}
          placeholder="juan.perez@empresa.com"
        />
      </label>
    </div>
  )

  const bloqueComercial = (
    <div className="form-grid">
      <label className="field form-grid__full">
        <span className="field__label">Medio de pago preferido</span>
        <input
          className="field__input"
          value={medioPago}
          onChange={(e) => setMedioPago(primeraMayuscula(e.target.value))}
          placeholder="Pago Móvil, Transferencia nacional, Zelle, Divisas efectivo…"
        />
      </label>

      <label className="field form-grid__full">
        <span className="field__label">Notas u observaciones</span>
        <textarea
          className="field__input"
          rows={3}
          value={notas}
          onChange={(e) => setNotas(primeraMayuscula(e.target.value))}
          placeholder="Horarios de atención, requerimientos especiales de facturación…"
        />
      </label>
    </div>
  )

  return (
    <form onSubmit={submit} onKeyDown={handleKeyDown} noValidate>
      <Stepper
        pasos={PASOS_CLIENTE}
        pasoActual={paso}
        onPasoClick={irAlPaso}
        verTodo={verTodo}
        onToggleVerTodo={setVerTodo}
      />

      {verTodo ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div id="seccion-paso-identidad">
            <div className="form-seccion form-grid__full" style={{ marginTop: 0, paddingTop: 4, borderTop: 'none' }}>
              <span className="form-seccion__tit">1. Identidad y Datos Fiscales</span>
            </div>
            {bloqueIdentidad}
          </div>

          <div id="seccion-paso-contacto">
            <div className="form-seccion form-grid__full">
              <span className="form-seccion__tit">2. Canales de Contacto y Enlace</span>
            </div>
            {bloqueContacto}
          </div>

          <div id="seccion-paso-comercial">
            <div className="form-seccion form-grid__full">
              <span className="form-seccion__tit">3. Comercial y Notas</span>
            </div>
            {bloqueComercial}
          </div>
        </div>
      ) : (
        <>
          {paso === 0 && bloqueIdentidad}
          {paso === 1 && bloqueContacto}
          {paso === 2 && bloqueComercial}
        </>
      )}

      {error && (
        <p className="form__error" style={{ marginTop: 12 }} role="alert">
          {error}
        </p>
      )}

      {/* ── BOTONES DE NAVEGACIÓN Y GUARDADO ── */}
      <footer className="form-acciones">
        {verTodo ? (
          <>
            <Button type="button" variant="ghost" onClick={onCancelar}>
              Cancelar
            </Button>
            <div className="form-acciones__grupo">
              <Button type="submit">
                {inicial ? 'Guardar cambios' : 'Registrar cliente'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              {paso > 0 ? (
                <Button type="button" variant="ghost" onClick={retroceder}>
                  <ChevronLeft size={16} /> Anterior
                </Button>
              ) : (
                <Button type="button" variant="ghost" onClick={onCancelar}>
                  Cancelar
                </Button>
              )}
            </div>

            <div className="form-acciones__grupo">
              {paso < PASOS_CLIENTE.length - 1 ? (
                <Button type="button" onClick={avanzar}>
                  Siguiente <ChevronRight size={16} />
                </Button>
              ) : (
                <Button type="submit">
                  {inicial ? 'Guardar cambios' : 'Registrar cliente'}
                </Button>
              )}
            </div>
          </>
        )}
      </footer>
    </form>
  )
}
