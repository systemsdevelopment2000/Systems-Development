import { DocumentoShell, Editable, FirmaDoble } from './shell'
import { FichaProyecto } from './FichaProyecto'
import type { DatosDocumento } from '../types'

export function PlantillaPropuesta({ datos }: { datos: DatosDocumento }) {
  const { proyecto, cliente } = datos
  const hoy = new Date().toLocaleDateString('es-VE', { dateStyle: 'long' })

  return (
    <DocumentoShell titulo="Propuesta de trabajo">
      <p className="doc-intro">
        <strong>Systems Development</strong> presenta a <strong>{cliente?.nombre ?? 'el cliente'}</strong>{' '}
        la siguiente propuesta para el proyecto <strong>{proyecto.nombre}</strong>. Puerto Ordaz, {hoy}.
      </p>

      <FichaProyecto datos={datos} />

      <section className="doc-sec">
        <h2>1. Objeto de la propuesta</h2>
        <Editable bloque>
          {proyecto.descripcion ||
            'Describa el objeto del trabajo: qué se desarrollará para el cliente.'}
        </Editable>
      </section>

      <section className="doc-sec">
        <h2>2. Alcance y módulos</h2>
        <Editable bloque>
          {proyecto.notas || 'Detalle los módulos y entregables acordados con el cliente.'}
        </Editable>
      </section>

      <section className="doc-sec">
        <h2>3. Inversión y forma de pago</h2>
        <p className="doc-p">
          Monto total: <Editable>indicar monto</Editable> &nbsp;·&nbsp; Forma de pago:{' '}
          <Editable>{proyecto.medioPago || cliente?.medioPago || 'indicar'}</Editable>
        </p>
        <Editable bloque>
          Detalle de pagos (abono inicial, cuotas, al cierre…).
        </Editable>
      </section>

      <section className="doc-sec">
        <h2>4. Condiciones</h2>
        <Editable bloque>
          Vigencia de esta propuesta: 15 días a partir de la fecha. Los cambios de alcance se cotizan
          por separado. El inicio queda sujeto a la aceptación de la propuesta y al abono inicial
          acordado. La entrega se realiza según el cronograma convenido.
        </Editable>
      </section>

      <section className="doc-sec">
        <h2>5. Aceptación</h2>
        <p className="doc-p">
          En señal de conformidad con los términos aquí expuestos, las partes firman:
        </p>
        <FirmaDoble cliente={cliente?.nombre} />
      </section>
    </DocumentoShell>
  )
}
