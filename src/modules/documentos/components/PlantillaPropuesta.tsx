import { DocumentoShell, Editable, FirmaDoble } from './shell'
import { FichaProyecto } from './FichaProyecto'
import { CheckCircle2, Clock, Wrench, Layers } from 'lucide-react'
import type { DatosDocumento } from '../types'
import type { ContenidoPersonalizado } from '../lib/plantillasPrellenadas'

interface Props {
  datos: DatosDocumento
  contenido: ContenidoPersonalizado
}

export function PlantillaPropuesta({ datos, contenido }: Props) {
  const { proyecto, cliente } = datos
  const hoy = new Date().toLocaleDateString('es-VE', { dateStyle: 'long' })

  const modulosIncluidos = contenido.modulos.filter((m) => m.incluido)
  const totalHoras = modulosIncluidos.reduce((acc, m) => acc + (Number(m.horas) || 0), 0)
  const alcancesIncluidos = contenido.alcances.filter((a) => a.incluido)

  return (
    <DocumentoShell titulo="Propuesta de trabajo">
      <p className="doc-intro">
        <strong>Systems Development</strong> presenta a <strong>{cliente?.nombre ?? 'el cliente'}</strong>{' '}
        la siguiente propuesta técnica y económica para el proyecto <strong>{proyecto.nombre}</strong>.
        Puerto Ordaz, {hoy}.
      </p>

      <FichaProyecto datos={datos} />

      {/* 1. Objeto */}
      <section className="doc-sec">
        <h2>1. Objeto de la propuesta</h2>
        <Editable bloque>
          {contenido.objeto ||
            proyecto.descripcion ||
            'Describa el objeto del trabajo: qué se desarrollará para el cliente.'}
        </Editable>
      </section>

      {/* 2. Módulos y Horas */}
      <section className="doc-sec">
        <div className="doc-sec__head-row">
          <h2>2. Módulos y especificaciones funcionales</h2>
          {totalHoras > 0 && (
            <span className="doc-horas-pill">
              <Clock size={12} /> Total estimado: <strong>{totalHoras} h</strong>
            </span>
          )}
        </div>

        {modulosIncluidos.length > 0 ? (
          <div className="doc-modulos-tabla-wrap">
            <table className="doc-modulos-tabla">
              <thead>
                <tr>
                  <th style={{ width: '75%' }}>Módulo / Entregable funcional</th>
                  <th style={{ width: '25%', textAlign: 'right' }}>Horas Estimadas</th>
                </tr>
              </thead>
              <tbody>
                {modulosIncluidos.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="doc-mod-item">
                        <strong className="doc-mod-nombre">{m.nombre}</strong>
                        {m.detalle && <p className="doc-mod-detalle">{m.detalle}</p>}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{m.horas} h</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>TOTAL ESTIMADO DE DESARROLLO</th>
                  <th style={{ textAlign: 'right' }}>{totalHoras} horas</th>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <Editable bloque>
            {proyecto.notas || 'Detalle los módulos y entregables acordados con el cliente.'}
          </Editable>
        )}
      </section>

      {/* 3. Tecnologías y Herramientas */}
      {contenido.herramientas.length > 0 && (
        <section className="doc-sec">
          <div className="doc-sec__head-row">
            <h2>3. Tecnologías y herramientas a implementar</h2>
            <span className="doc-sub-hint">
              <Wrench size={11} /> {contenido.herramientas.length} herramientas
            </span>
          </div>

          <div className="doc-tech-container">
            {contenido.herramientas.map((h) => (
              <span key={h} className="doc-tech-badge">
                {h}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 4. Alcances y Entregables */}
      {alcancesIncluidos.length > 0 && (
        <section className="doc-sec">
          <div className="doc-sec__head-row">
            <h2>4. Alcances y entregables clave</h2>
            <span className="doc-sub-hint">
              <Layers size={11} /> {alcancesIncluidos.length} ítems
            </span>
          </div>

          <ul className="doc-alcances-list">
            {alcancesIncluidos.map((a) => (
              <li key={a.id} className="doc-alcances-list__item">
                <CheckCircle2 size={13} className="doc-alcances-list__icon" />
                <span>{a.texto}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 5. Inversión y Forma de pago */}
      <section className="doc-sec">
        <h2>5. Inversión y condiciones de pago</h2>
        <p className="doc-p">
          Forma y estructura de pago convenida:
        </p>
        <Editable bloque>
          {contenido.formaPago ||
            proyecto.medioPago ||
            cliente?.medioPago ||
            '50% de anticipo al inicio, 30% a la presentación de la versión funcional y 20% al despliegue final.'}
        </Editable>
      </section>

      {/* 6. Plazo de entrega */}
      <section className="doc-sec">
        <h2>6. Plazo de ejecución</h2>
        <p className="doc-p">
          Tiempo estimado de entrega:{' '}
          <strong>
            <Editable>{contenido.plazoEstimado || '4 a 6 semanas hábiles'}</Editable>
          </strong>{' '}
          a partir de la validación técnica y confirmación del abono inicial.
        </p>
      </section>

      {/* 7. Condiciones generales */}
      <section className="doc-sec">
        <h2>7. Términos y garantía</h2>
        <Editable bloque>
          Vigencia de esta propuesta: 15 días continuos a partir de la fecha de emisión. Los
          requerimientos no contemplados en esta propuesta se cotizan por separado. El inicio de
          actividades queda sujeto a la aceptación formal y a la recepción del anticipo acordado. Se
          incluyen 30 días de garantía técnica y soporte post-lanzamiento para corrección de
          incidencias sin costo adicional.
        </Editable>
      </section>

      {/* 8. Aceptación y Firmas */}
      <section className="doc-sec">
        <h2>8. Aceptación de la propuesta</h2>
        <p className="doc-p">
          En señal de conformidad con los términos técnicos y económicos aquí expuestos, las partes
          firman:
        </p>
        <FirmaDoble cliente={cliente?.nombre} />
      </section>
    </DocumentoShell>
  )
}
