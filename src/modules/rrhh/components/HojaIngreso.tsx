import type { RefObject } from 'react'
import { Hoja, MembreteSD } from '@/core/ui'
import type { Candidato } from '@/core/datos'

/**
 * Ficha de ingreso imprimible.
 *
 * Es la hoja que se le entrega a la persona para que la llene de su puño y
 * letra al ser contratada: datos personales, carga familiar, contacto de
 * emergencia y cuenta de nómina. Si el candidato ya tiene datos cargados, se
 * imprimen; si no, salen las líneas en blanco.
 *
 * Lleva al pie la nota de para qué se usan los datos. Pedir cuenta bancaria y
 * condición de salud sin decir para qué no corresponde.
 */
export function HojaIngreso({
  refHoja,
  candidato,
  visible,
}: {
  refHoja: RefObject<HTMLDivElement | null>
  candidato: Candidato | null
  visible: boolean
}) {
  const f = candidato?.ficha
  const dependientes = f?.dependientes ?? []
  // Siempre al menos cuatro filas, para que quede espacio donde escribir.
  const filas = Math.max(4, dependientes.length + 1)

  const campo = (valor?: string) => <dd className={valor ? '' : 'is-vacio'}>{valor ?? ''}</dd>

  return (
    <Hoja visible={visible} innerRef={refHoja}>
      <MembreteSD
        titulo="Ficha de ingreso de personal"
        subtitulo={candidato?.nombre || 'Para llenar a mano'}
      >
        <dl className="pend-meta rh-ing__meta">
          <div>
            <dt>Nombre y apellido</dt>
            {campo(candidato?.nombre)}
          </div>
          <div>
            <dt>Cédula</dt>
            {campo(candidato?.cedula)}
          </div>
          <div>
            <dt>Cargo</dt>
            {campo(candidato?.cargo)}
          </div>
        </dl>

        <section className="min-bloque">
          <h3 className="min-bloque__tit">Datos personales</h3>
          <dl className="pend-meta rh-ing__meta">
            <div>
              <dt>Fecha de nacimiento</dt>
              {campo(f?.fechaNacimiento)}
            </div>
            <div>
              <dt>Lugar de nacimiento</dt>
              {campo(f?.lugarNacimiento)}
            </div>
            <div>
              <dt>Estado civil</dt>
              {campo(f?.estadoCivil)}
            </div>
          </dl>
          <dl className="pend-meta rh-ing__meta--2">
            <div>
              <dt>Dirección de habitación</dt>
              {campo(f?.direccion)}
            </div>
            <div>
              <dt>RIF</dt>
              {campo(f?.rif)}
            </div>
          </dl>
          <dl className="pend-meta rh-ing__meta">
            <div>
              <dt>Nivel educativo</dt>
              {campo(f?.nivelEducativo)}
            </div>
            <div>
              <dt>Profesión u oficio</dt>
              {campo(f?.profesion)}
            </div>
            <div>
              <dt>Licencia de conducir</dt>
              {campo(f?.licenciaConducir)}
            </div>
          </dl>
        </section>

        <section className="min-bloque">
          <h3 className="min-bloque__tit">
            Carga familiar
            <em>determina seguro, guardería y bonos</em>
          </h3>
          <table className="pend-tabla">
            <thead>
              <tr>
                <th className="pend-tabla__ord">N°</th>
                <th>Nombre y apellido</th>
                <th className="rh-ing__col">Parentesco</th>
                <th className="rh-ing__col">Nacimiento</th>
                <th className="pend-tabla__ok">Estudia</th>
                <th className="pend-tabla__ok">Discap.</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: filas }, (_, i) => {
                const d = dependientes[i]
                return (
                  <tr key={i} className={d ? '' : 'is-vacia'}>
                    <td className="pend-tabla__ord">{i + 1}</td>
                    <td>{d?.nombre ?? ''}</td>
                    <td className="rh-ing__col">{d?.parentesco ?? ''}</td>
                    <td className="rh-ing__col">{d?.fechaNacimiento ?? ''}</td>
                    <td className="pend-tabla__ok">
                      <span className="pend-caja" />
                    </td>
                    <td className="pend-tabla__ok">
                      <span className="pend-caja" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        <section className="min-bloque">
          <h3 className="min-bloque__tit">
            Salud y emergencia
            <em>solo para atender una emergencia y adaptar el puesto</em>
          </h3>
          <dl className="pend-meta rh-ing__meta">
            <div>
              <dt>Tipo de sangre</dt>
              {campo(f?.salud?.tipoSangre)}
            </div>
            <div>
              <dt>Alergias</dt>
              {campo(f?.salud?.alergias)}
            </div>
            <div>
              <dt>Condición a contemplar</dt>
              {campo(f?.salud?.condicion)}
            </div>
          </dl>
          <dl className="pend-meta rh-ing__meta">
            <div>
              <dt>Contacto de emergencia</dt>
              {campo(f?.salud?.emergenciaNombre)}
            </div>
            <div>
              <dt>Parentesco</dt>
              {campo(f?.salud?.emergenciaParentesco)}
            </div>
            <div>
              <dt>Teléfono</dt>
              {campo(f?.salud?.emergenciaTelefono)}
            </div>
          </dl>
        </section>

        <section className="min-bloque">
          <h3 className="min-bloque__tit">Nómina y seguridad social</h3>
          <dl className="pend-meta rh-ing__meta">
            <div>
              <dt>N° de asegurado IVSS</dt>
              {campo(f?.ivss)}
            </div>
            <div>
              <dt>Cuenta FAOV</dt>
              {campo(f?.faov)}
            </div>
            <div>
              <dt>Pago móvil</dt>
              {campo(f?.banco?.pagoMovil)}
            </div>
          </dl>
          <dl className="pend-meta rh-ing__meta">
            <div>
              <dt>Banco</dt>
              {campo(f?.banco?.banco)}
            </div>
            <div>
              <dt>Tipo de cuenta</dt>
              {campo(f?.banco?.tipoCuenta)}
            </div>
            <div>
              <dt>Número de cuenta</dt>
              {campo(f?.banco?.numeroCuenta)}
            </div>
          </dl>
        </section>

        <p className="fin-nota">
          Los datos de esta ficha se usan para la nómina, la inscripción en la seguridad social,
          los beneficios de ley y la atención de emergencias. No se comparten con terceros salvo
          obligación legal. Al firmar, la persona autoriza su uso para esos fines.
        </p>

        <div className="pend-firmas">
          <span>
            <i />
            Firma del trabajador
          </span>
          <span>
            <i />
            Recibido por Systems Development
          </span>
        </div>
      </MembreteSD>
    </Hoja>
  )
}
