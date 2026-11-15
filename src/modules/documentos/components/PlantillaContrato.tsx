import { DocumentoShell, Editable, FirmaDoble } from './shell'
import { money, totalizar } from '@/core/lib/dinero'
import { FichaProyecto } from './FichaProyecto'
import type { DatosDocumento } from '../types'

export function PlantillaContrato({ datos }: { datos: DatosDocumento }) {
  const { proyecto, cliente, presupuesto } = datos
  const totales = presupuesto ? totalizar(presupuesto) : null
  const hoy = new Date().toLocaleDateString('es-VE', { dateStyle: 'long' })

  return (
    <DocumentoShell titulo="Contrato de prestación de servicios">
      <p className="doc-intro">
        En Puerto Ordaz, a {hoy}, celebran el presente contrato <strong>Systems Development</strong>{' '}
        (en adelante, el prestador) y{' '}
        <strong>{cliente?.nombre ?? 'el cliente'}</strong>
        {cliente ? ` (${cliente.tipoDocumento.toUpperCase()} ${cliente.documento})` : ''} (en
        adelante, el cliente):
      </p>

      <FichaProyecto datos={datos} />

      <section className="doc-sec">
        <h2>1. Objeto</h2>
        <Editable bloque>
          {proyecto.descripcion ||
            `Desarrollo del proyecto "${proyecto.nombre}" según el alcance acordado entre las partes.`}
        </Editable>
      </section>

      <section className="doc-sec">
        <h2>2. Alcance</h2>
        <Editable bloque>
          {proyecto.notas || 'Módulos, entregables y criterios de aceptación acordados.'}
        </Editable>
      </section>

      <section className="doc-sec">
        <h2>3. Monto y forma de pago</h2>
        {totales && presupuesto ? (
          <>
            <p className="doc-p">
              Monto total pactado: <strong className="doc-monto">{money(totales.total, presupuesto.moneda)}</strong>
            </p>
            <p className="doc-ref">
              Según el presupuesto {presupuesto.codigo} aceptado el{' '}
              {presupuesto.aceptadoEn
                ? new Date(presupuesto.aceptadoEn).toLocaleDateString('es-VE', { dateStyle: 'long' })
                : '—'}
              . Esta cifra no se edita aquí: proviene del presupuesto aceptado.
            </p>
            <p className="doc-p">
              Forma de pago:{' '}
              <Editable>
                {presupuesto.condiciones || proyecto.medioPago || cliente?.medioPago || 'indicar'}
              </Editable>
            </p>
          </>
        ) : (
          <p className="doc-p">
            Monto total: <Editable>indicar monto</Editable> &nbsp;·&nbsp; Forma de pago:{' '}
            <Editable>{proyecto.medioPago || cliente?.medioPago || 'indicar'}</Editable>
          </p>
        )}
      </section>

      <section className="doc-sec">
        <h2>4. Plazo</h2>
        <p className="doc-p">
          Inicio: <Editable>{proyecto.fechas?.inicio || 'indicar'}</Editable> &nbsp;·&nbsp; Entrega
          estimada: <Editable>{proyecto.fechas?.entregaEstim || 'indicar'}</Editable>
        </p>
      </section>

      <section className="doc-sec">
        <h2>5. Condiciones generales</h2>
        <Editable bloque>
          Confidencialidad de la información del cliente. La propiedad del código se transfiere a la
          entrega y pago total. Los cambios de alcance se cotizan por separado. Soporte post-entrega
          según lo acordado. Las controversias se resuelven conforme a la legislación venezolana.
        </Editable>
      </section>

      <section className="doc-sec">
        <h2>6. Firmas</h2>
        <FirmaDoble cliente={cliente?.nombre} />
      </section>
    </DocumentoShell>
  )
}
