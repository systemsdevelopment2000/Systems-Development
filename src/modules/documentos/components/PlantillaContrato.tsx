import { DocumentoShell, Editable, FirmaDoble } from './shell'
import { money, totalizar } from '@/core/lib/dinero'
import { FichaProyecto } from './FichaProyecto'
import { CheckCircle2, Clock, Wrench, Layers } from 'lucide-react'
import type { DatosDocumento } from '../types'
import type { ContenidoPersonalizado } from '../lib/plantillasPrellenadas'

interface Props {
  datos: DatosDocumento
  contenido: ContenidoPersonalizado
}

export function PlantillaContrato({ datos, contenido }: Props) {
  const { proyecto, cliente, presupuesto } = datos
  const totales = presupuesto ? totalizar(presupuesto) : null
  const hoy = new Date().toLocaleDateString('es-VE', { dateStyle: 'long' })

  const modulosIncluidos = contenido.modulos.filter((m) => m.incluido)
  const totalHoras = modulosIncluidos.reduce((acc, m) => acc + (Number(m.horas) || 0), 0)
  const alcancesIncluidos = contenido.alcances.filter((a) => a.incluido)

  return (
    <DocumentoShell titulo="Contrato de prestación de servicios">
      <p className="doc-intro">
        En Puerto Ordaz, a {hoy}, celebran el presente contrato <strong>Systems Development</strong>{' '}
        (en adelante, el prestador) y{' '}
        <strong>{cliente?.nombre ?? 'el cliente'}</strong>
        {cliente
          ? ` (${(
              cliente.tipoDocumento ??
              (cliente as unknown as { tipo_documento?: string }).tipo_documento ??
              'rif'
            ).toUpperCase()} ${cliente.documento || ''})`
          : ''}{' '}
        (en adelante, el cliente):
      </p>

      <FichaProyecto datos={datos} />

      {/* 1. Objeto */}
      <section className="doc-sec">
        <h2>1. Objeto del contrato</h2>
        <Editable bloque>
          {contenido.objeto ||
            proyecto.descripcion ||
            `Desarrollo e implementación del proyecto "${proyecto.nombre}" según el alcance técnico acordado entre las partes.`}
        </Editable>
      </section>

      {/* 2. Alcance y Módulos */}
      <section className="doc-sec">
        <div className="doc-sec__head-row">
          <h2>2. Alcance del desarrollo y módulos</h2>
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
                  <th style={{ width: '75%' }}>Módulo / Entregable contratado</th>
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
                  <th>TOTAL ESTIMADO DE HORAS CONTRATADAS</th>
                  <th style={{ textAlign: 'right' }}>{totalHoras} horas</th>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <Editable bloque>
            {proyecto.notas || 'Módulos, entregables y criterios de aceptación acordados.'}
          </Editable>
        )}
      </section>

      {/* 3. Tecnologías y Herramientas */}
      {contenido.herramientas.length > 0 && (
        <section className="doc-sec">
          <div className="doc-sec__head-row">
            <h2>3. Tecnologías, plataformas y herramientas</h2>
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

      {/* 4. Alcances y Compromisos */}
      {alcancesIncluidos.length > 0 && (
        <section className="doc-sec">
          <div className="doc-sec__head-row">
            <h2>4. Compromisos de entrega y alcances</h2>
            <span className="doc-sub-hint">
              <Layers size={11} /> {alcancesIncluidos.length} criterios
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

      {/* 5. Monto y Forma de pago */}
      <section className="doc-sec">
        <h2>5. Monto y forma de pago</h2>
        {totales && presupuesto ? (
          <>
            <p className="doc-p">
              Monto total pactado:{' '}
              <strong className="doc-monto">{money(totales.total, presupuesto.moneda)}</strong>
            </p>
            <p className="doc-ref">
              Según el presupuesto formal {presupuesto.codigo} aceptado el{' '}
              {presupuesto.aceptadoEn
                ? new Date(presupuesto.aceptadoEn).toLocaleDateString('es-VE', {
                    dateStyle: 'long',
                  })
                : '—'}
              .
            </p>
            <p className="doc-p">
              Forma de pago acordada:{' '}
              <Editable>
                {presupuesto.condiciones ||
                  contenido.formaPago ||
                  proyecto.medioPago ||
                  cliente?.medioPago ||
                  'indicar'}
              </Editable>
            </p>
          </>
        ) : (
          <>
            <p className="doc-p">
              Monto total pactado: <Editable>indicar monto</Editable> &nbsp;·&nbsp; Moneda:{' '}
              <Editable>{proyecto.medioPago || cliente?.medioPago || 'USD / Bs'}</Editable>
            </p>
            <p className="doc-p">
              Esquema de pagos:{' '}
              <Editable>
                {contenido.formaPago ||
                  '50% de anticipo al inicio, 30% a la versión funcional y 20% al despliegue final.'}
              </Editable>
            </p>
          </>
        )}
      </section>

      {/* 6. Plazo */}
      <section className="doc-sec">
        <h2>6. Plazo y cronograma</h2>
        <p className="doc-p">
          Inicio previsto: <Editable>{proyecto.fechas?.inicio || hoy}</Editable> &nbsp;·&nbsp;
          Plazo estimado de entrega:{' '}
          <Editable>{contenido.plazoEstimado || proyecto.fechas?.entregaEstim || '4 a 6 semanas'}</Editable>
        </p>
      </section>

      {/* 7. Condiciones generales */}
      <section className="doc-sec">
        <h2>7. Cláusulas y condiciones generales</h2>
        <Editable bloque>
          Confidencialidad: Las partes se comprometen a resguardar la confidencialidad de la
          información y datos compartidos. Propiedad intelectual: Los derechos de uso del software y
          código fuente se transfieren al cliente una vez completada la entrega formal y cancelada la
          totalidad del monto pactado. Cambios de alcance: Toda modificación o funcionalidad adicional
          no descrita en el presente contrato será cotizada y programada por separado. Soporte y
          garantía: Se estipulan 30 días continuos de soporte técnico post-entrega para corrección de
          errores imputables al desarrollo sin costo adicional. Jurisdicción: Para cualquier
          controversia derivada de este contrato, las partes se someten a los tribunales de Puerto
          Ordaz, Estado Bolívar, conforme a las leyes vigentes de la República Bolivariana de
          Venezuela.
        </Editable>
      </section>

      {/* 8. Firmas */}
      <section className="doc-sec">
        <h2>8. Suscripción y firmas</h2>
        <FirmaDoble cliente={cliente?.nombre} />
      </section>
    </DocumentoShell>
  )
}
