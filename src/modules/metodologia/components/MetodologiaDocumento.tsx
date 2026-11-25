import { forwardRef } from 'react'
import type { MetodologiaTrabajo } from '@/core/datos/tipos'
import { CabeceraSD, PieSD } from '@/core/ui/MembreteSD'
import { useDatos } from '@/core/datos'
import { CheckCircle2, Layers, Calendar, Clock, ShieldCheck } from 'lucide-react'

interface Props {
  metodologia: MetodologiaTrabajo
}

export const MetodologiaDocumento = forwardRef<HTMLDivElement, Props>(function MetodologiaDocumento(
  { metodologia },
  ref,
) {
  const { estado } = useDatos()

  const {
    codigo,
    titulo,
    subtitulo,
    tipo,
    descripcion,
    objetivo,
    alcance,
    mostrarLogoSD = true,
    mostrarDatosSD = true,
    mostrarFirmaSD = true,
    mostrarFirmas = true,
    firmas = [],
    datosContactoSD,
    logoCliente,
    tamanoLogoCliente = 'grande',
    clienteNombre,
    fases = [],
    imagenes = [],
    principios = [],
    version = '1.0',
    creadoEn,
  } = metodologia

  const fechaFormateada = creadoEn
    ? new Date(creadoEn).toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })

  // Configuración de cabecera según los interruptores de SD
  const datosCabecera = {
    ...estado.empresa,
    logo: mostrarLogoSD ? estado.empresa.logo : '',
    telefonos: mostrarDatosSD ? (datosContactoSD?.telefonos ?? estado.empresa.telefonos) : '',
    ubicacion: mostrarDatosSD ? (datosContactoSD?.ubicacion ?? estado.empresa.ubicacion) : '',
    correo: mostrarDatosSD ? (datosContactoSD?.correo ?? estado.empresa.correo) : '',
  }

  // Filtrar fases válidas (si está vacía, no se muestra)
  const fasesValidas = (fases || []).filter(
    (f) =>
      (f.nombre && f.nombre.trim()) ||
      (f.descripcion && f.descripcion.trim()) ||
      (f.entregables && f.entregables.length > 0) ||
      (f.roles && f.roles.length > 0) ||
      (f.herramientas && f.herramientas.length > 0),
  )

  const principiosValidos = (principios || []).filter((p) => p && p.trim())

  // Firmas configuradas (hasta 2 personas)
  const firmasConfiguradas = (firmas || []).filter(
    (f) =>
      (f.nombre && f.nombre.trim()) ||
      (f.cargo && f.cargo.trim()) ||
      (f.empresa && f.empresa.trim()),
  )

  const firmasAFirmar =
    firmasConfiguradas.length > 0
      ? firmasConfiguradas.slice(0, 2)
      : mostrarFirmaSD
        ? [
            {
              nombre: 'Director de Ingeniería & Arquitectura',
              cargo: 'Líder Técnico',
              empresa: 'Systems Development C.A.',
            },
            {
              nombre: 'Aprobación / Contraparte',
              cargo: 'Contraparte Autorizada',
              empresa: clienteNombre || 'Empresa Cliente',
            },
          ]
        : []

  return (
    <div ref={ref} className="met-doc-a4">
      {/* Membrete oficial Systems Development (según si están activos el logo o los datos) */}
      {mostrarLogoSD || mostrarDatosSD ? (
        <CabeceraSD datos={datosCabecera} />
      ) : (
        <div className="met-doc-sin-logo-sd">
          <span className="met-doc-sin-logo-sd__linea" />
        </div>
      )}

      {/* Bloque de Identidad & Logos */}
      <div className="met-doc-cabecera">
        <div className="met-doc-cabecera__info">
          <div className="met-doc-metas">
            <span className="met-doc-badge met-doc-badge--codigo">{codigo || 'MET-SD'}</span>
            <span className="met-doc-badge met-doc-badge--tipo">{tipo.toUpperCase()}</span>
            <span className="met-doc-badge met-doc-badge--ver">VER. {version}</span>
            <span className="met-doc-fecha">
              <Calendar size={12} /> {fechaFormateada}
            </span>
          </div>

          <h1 className="met-doc-titulo">{titulo}</h1>
          {subtitulo && <p className="met-doc-subtitulo">{subtitulo}</p>}

          {clienteNombre && (
            <div className="met-doc-cliente-tag">
              <strong>Cliente / Proyecto Asociado:</strong> {clienteNombre}
            </div>
          )}
        </div>

        {/* Logo adicional del cliente si se configuró (sin texto 'Homologado con' y con tamaño configurable) */}
        {logoCliente && (
          <div
            className={`met-doc-logo-cliente-box met-doc-logo-cliente-box--${tamanoLogoCliente}`}
          >
            <img
              src={logoCliente}
              alt={clienteNombre || 'Cliente'}
              className={`met-doc-logo-cliente-img met-doc-logo-cliente-img--${tamanoLogoCliente}`}
            />
          </div>
        )}
      </div>

      {/* Resumen Ejecutivo & Descripción */}
      {descripcion && (
        <section className="met-doc-seccion">
          <h2 className="met-doc-seccion__titulo">
            <Layers size={14} /> 1. Marco Metodológico & Descripción
          </h2>
          <p className="met-doc-parrafo">{descripcion}</p>
        </section>
      )}

      {/* Objetivo y Alcance */}
      {(objetivo || alcance) && (
        <div className="met-doc-grid-2">
          {objetivo && (
            <div className="met-doc-caja">
              <h3 className="met-doc-caja__titulo">Objetivo General</h3>
              <p className="met-doc-caja__texto">{objetivo}</p>
            </div>
          )}
          {alcance && (
            <div className="met-doc-caja">
              <h3 className="met-doc-caja__titulo">Alcance de Aplicación</h3>
              <p className="met-doc-caja__texto">{alcance}</p>
            </div>
          )}
        </div>
      )}

      {/* Principios de Calidad (si está vacío, no se muestra) */}
      {/* Principios y Reglas de Calidad (si está vacío, no se muestra) */}
      {principiosValidos.length > 0 && (
        <section className="met-doc-seccion">
          <h2 className="met-doc-seccion__titulo">
            <ShieldCheck size={14} /> 2. Principios y Estándares de Ingeniería
            <ShieldCheck size={14} /> 2. Principios y Reglas de Calidad
          </h2>
          <ul className="met-doc-principios-lista">
            {principiosValidos.map((p, i) => (
              <li key={i} className="met-doc-principio-item">
                <CheckCircle2 size={13} className="met-doc-principio-check" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Fases del Proceso (si está vacío, no se muestra) */}
      {fasesValidas.length > 0 && (
        <section className="met-doc-seccion">
          <h2 className="met-doc-seccion__titulo">
            <Clock size={14} /> 3. Fases del Proceso Operacional ({fasesValidas.length}{' '}
            {fasesValidas.length === 1 ? 'Fase' : 'Fases'})
          </h2>

          <div className="met-doc-fases-timeline">
            {fasesValidas.map((f, idx) => (
              <div key={f.id || idx} className="met-doc-fase-tarjeta">
                <div className="met-doc-fase-tarjeta__head">
                  <span className="met-doc-fase-num">{idx + 1}</span>
                  <div className="met-doc-fase-nombre-box">
                    <h4 className="met-doc-fase-nombre">
                      {f.nombre && f.nombre.trim() ? f.nombre : `Fase ${idx + 1}`}
                    </h4>
                    {f.duracionEstimada && f.duracionEstimada.trim() && (
                      <span className="met-doc-fase-duracion">
                        <Clock size={11} /> Estimado: {f.duracionEstimada}
                      </span>
                    )}
                  </div>
                </div>

                {f.descripcion && f.descripcion.trim() && (
                  <p className="met-doc-fase-desc">{f.descripcion}</p>
                )}

                {/* Entregables */}
                {f.entregables && f.entregables.length > 0 && (
                  <div className="met-doc-fase-bloque">
                    <span className="met-doc-fase-bloque__label">Entregables clave:</span>
                    <div className="met-doc-pills">
                      {f.entregables.map((ent, i) => (
                        <span key={i} className="met-doc-pill met-doc-pill--entregable">
                          ✓ {ent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Roles y Herramientas */}
                {((f.roles && f.roles.length > 0) ||
                  (f.herramientas && f.herramientas.length > 0)) && (
                  <div className="met-doc-fase-grid-meta">
                    {f.roles && f.roles.length > 0 && (
                      <div>
                        <span className="met-doc-fase-bloque__label">Responsables / Roles:</span>
                        <div className="met-doc-pills">
                          {f.roles.map((r, i) => (
                            <span key={i} className="met-doc-pill met-doc-pill--rol">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {f.herramientas && f.herramientas.length > 0 && (
                      <div>
                        <span className="met-doc-fase-bloque__label">
                          Herramientas / Plataformas:
                        </span>
                        <div className="met-doc-pills">
                          {f.herramientas.map((h, i) => (
                            <span key={i} className="met-doc-pill met-doc-pill--herramienta">
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Galería de Diagramas y Arquitectura (si está vacío, no se muestra) */}
      {imagenes.length > 0 && (
        <section className="met-doc-seccion met-doc-seccion--diagramas">
          <h2 className="met-doc-seccion__titulo">
            <Layers size={14} /> 4. Diagramas de Flujo y Arquitectura ({imagenes.length})
          </h2>

          <div className="met-doc-imagenes-grid">
            {imagenes.map((img, i) => (
              <figure key={img.id || i} className="met-doc-figura">
                <img
                  src={img.url}
                  alt={img.titulo || `Diagrama ${i + 1}`}
                  className="met-doc-figura__img"
                />
                {(img.titulo || img.pie) && (
                  <figcaption className="met-doc-figura__cap">
                    {img.titulo && <strong>{img.titulo}: </strong>}
                    {img.pie}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Bloque de Firmas (si está vacío o desactivado, no se muestra) */}
      {mostrarFirmas && firmasAFirmar.length > 0 && (
        <section className={`met-doc-firmas met-doc-firmas--${firmasAFirmar.length}`}>
          {firmasAFirmar.map((f, i) => (
            <div key={f.id || i} className="met-doc-firma-col">
              <div className="met-doc-firma-linea" />
              {f.nombre && <strong className="met-doc-firma-nombre">{f.nombre}</strong>}
              {f.cargo && <span className="met-doc-firma-cargo">{f.cargo}</span>}
              {f.empresa && <span className="met-doc-firma-empresa">{f.empresa}</span>}
            </div>
          ))}
        </section>
      )}

      {/* Pie de página oficial Systems Development */}
      {mostrarLogoSD && mostrarDatosSD && mostrarFirmaSD && <PieSD datos={datosCabecera} />}
    </div>
  )
})
