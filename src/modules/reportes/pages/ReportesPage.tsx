import '../styles/reportes.css'
import { useMemo, useRef, useState } from 'react'
import { FileSpreadsheet, FileDown, Loader2 } from 'lucide-react'
import { useDatos } from '@/core/datos'
import { ConmutadorHoja, Hoja, MembreteSD, VistaPreviaPdf } from '@/core/ui'
import { generarPdf, type PdfGenerado } from '@/core/lib/pdf'
import { exportarExcel } from '../lib/exportar'

type Tipo =
  | 'proyectos'
  | 'clientes'
  | 'colaboradores'
  | 'tareas'
  | 'reuniones'
  | 'herramientas'
  | 'usuarios'

const TIPOS: { id: Tipo; label: string }[] = [
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'colaboradores', label: 'Colaboradores' },
  { id: 'tareas', label: 'Tareas' },
  { id: 'reuniones', label: 'Reuniones' },
  { id: 'herramientas', label: 'Herramientas' },
  { id: 'usuarios', label: 'Usuarios' },
]

export function ReportesPage() {
  const { estado } = useDatos()
  const [tipo, setTipo] = useState<Tipo>('proyectos')
  const [generando, setGenerando] = useState(false)
  const [verHoja, setVerHoja] = useState(false)
  const [previa, setPrevia] = useState<PdfGenerado | null>(null)
  const hojaRef = useRef<HTMLDivElement>(null)

  const { columnas, filas } = useMemo(() => {
    const nombreEstado = (id: string) =>
      estado.estadosProyecto.find((e) => e.id === id)?.nombre ?? id
    const nombreCliente = (id: string) => estado.clientes[id]?.nombre ?? '—'
    const responsablesDe = (pid: string) =>
      Object.values(estado.asignaciones)
        .filter((a) => a.proyectoId === pid && a.estado === 'activa')
        .map((a) => estado.colaboradores[a.colaboradorId]?.nombre)
        .filter(Boolean)
        .join(', ') || '—'

    if (tipo === 'proyectos') {
      return {
        columnas: ['Proyecto', 'Cliente', 'Estado', 'Progreso', 'Responsables'],
        filas: Object.values(estado.proyectos).map((p) => ({
          Proyecto: p.nombre,
          Cliente: nombreCliente(p.clienteId),
          Estado: nombreEstado(p.estadoId),
          Progreso: `${p.progreso}%`,
          Responsables: responsablesDe(p.id),
        })),
      }
    }
    if (tipo === 'clientes') {
      return {
        columnas: ['Cliente', 'Documento', 'Ubicación', 'Teléfono', 'Correo', 'Medio de pago', 'Proyectos'],
        filas: Object.values(estado.clientes).map((c) => ({
          Cliente: c.nombre,
          Documento: `${c.tipoDocumento.toUpperCase()} ${c.documento}`,
          Ubicación: c.ubicacion ?? '—',
          Teléfono: c.contacto.telefono ?? '—',
          Correo: c.contacto.correo ?? '—',
          'Medio de pago': c.medioPago ?? '—',
          Proyectos: Object.values(estado.proyectos).filter((p) => p.clienteId === c.id).length,
        })),
      }
    }
    if (tipo === 'tareas') {
      const ESTADOS: Record<string, string> = {
        backlog: 'Backlog',
        por_hacer: 'Por hacer',
        en_curso: 'En curso',
        revision: 'Revisión',
        hecho: 'Hecho',
      }
      return {
        columnas: ['Código', 'Tarea', 'Proyecto', 'Estado', 'Prioridad', 'Responsables', 'Vence'],
        filas: Object.values(estado.actividades).map((a) => ({
          'Código': a.codigo ?? '—',
          Tarea: a.titulo,
          Proyecto: estado.proyectos[a.proyectoId]?.nombre ?? '—',
          Estado: ESTADOS[a.estado] ?? a.estado,
          Prioridad: a.prioridad,
          Responsables:
            a.responsables.map((id) => estado.colaboradores[id]?.nombre).filter(Boolean).join(', ') ||
            '—',
          Vence: a.vence ?? '—',
        })),
      }
    }

    if (tipo === 'reuniones') {
      return {
        columnas: ['Código', 'Reunión', 'Proyecto', 'Agendada', 'Registrada', 'Participantes'],
        filas: Object.values(estado.reuniones).map((r) => ({
          'Código': r.codigo ?? '—',
          'Reunión': r.titulo || 'Reunión',
          Proyecto: estado.proyectos[r.proyectoId]?.nombre ?? '—',
          Agendada: r.fechaProgramada
            ? new Date(r.fechaProgramada).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })
            : '—',
          Registrada: new Date(r.fecha).toLocaleDateString('es-VE'),
          Participantes:
            [
              ...r.participantes.map((id) => estado.colaboradores[id]?.nombre).filter(Boolean),
              ...(r.participantesExternos ?? []),
            ].join(', ') || '—',
        })),
      }
    }

    if (tipo === 'herramientas') {
      return {
        columnas: ['Código', 'Herramienta', 'Propietario', 'Cliente', 'Ciclo', 'Precio', 'Próximo pago'],
        filas: Object.values(estado.herramientas).map((h) => ({
          'Código': h.codigo ?? '—',
          Herramienta: h.nombre,
          Propietario: h.propietario === 'sd' ? 'SD' : 'Cliente',
          Cliente: h.clienteId ? (estado.clientes[h.clienteId]?.nombre ?? '—') : '—',
          Ciclo: h.ciclo === 'mensual' ? 'Mensual' : 'Anual',
          Precio: h.precio != null ? `${h.precio} ${h.moneda ?? ''}`.trim() : '—',
          'Próximo pago': h.proximoPago ?? '—',
        })),
      }
    }

    if (tipo === 'usuarios') {
      const ROL: Record<string, string> = {
        admin: 'Administrador',
        editor: 'Editor',
        lectura: 'Lectura',
      }
      return {
        columnas: ['Usuario', 'Correo', 'Rol', 'Estado', 'Clave actualizada'],
        filas: Object.values(estado.colaboradores)
          .filter((c) => c.esUsuario)
          .map((c) => ({
            Usuario: c.nombre,
            Correo: c.contacto.correo ?? '—',
            Rol: ROL[c.rolSistema ?? 'editor'],
            Estado: c.cuentaDeshabilitada ? 'Deshabilitada' : c.activo ? 'Activo' : 'Inactivo',
            'Clave actualizada': c.claveActualizada
              ? new Date(c.claveActualizada).toLocaleDateString('es-VE')
              : '—',
          })),
      }
    }

    return {
      columnas: ['Colaborador', 'Cédula', 'Rol', 'Título', 'Correo', 'Activo', 'Usuario'],
      filas: Object.values(estado.colaboradores).map((c) => ({
        Colaborador: c.nombre,
        Cédula: c.cedula ?? '—',
        Rol: c.rol ?? '—',
        Título: c.titulo ?? '—',
        Correo: c.contacto.correo ?? '—',
        Activo: c.activo ? 'Sí' : 'No',
        Usuario: c.esUsuario ? 'Sí' : 'No',
      })),
    }
  }, [estado, tipo])

  const nombreArchivo = `reporte-${tipo}-${new Date().toISOString().slice(0, 10)}`

  async function descargarPdf() {
    const hoja = hojaRef.current?.querySelector<HTMLElement>('.mb')
    if (!hoja) return
    setGenerando(true)
    try {
      setPrevia(await generarPdf(hoja, nombreArchivo))
    } finally {
      setGenerando(false)
    }
  }

  function cerrarPrevia() {
    previa?.revocar()
    setPrevia(null)
  }

  return (
    <section className={'page rep-page' + (verHoja ? ' is-hoja' : '')}>
      <header className="page__header page__header--fila no-print">
        <div>
          <h1 className="page__title">Reportes</h1>
          <p className="page__subtitle">{filas.length} registros · exporta a Excel o PDF</p>
        </div>
        <div className="rep-acciones">
          <ConmutadorHoja visible={verHoja} onCambio={setVerHoja} />
          <button className="btn btn--ghost btn--icono" onClick={descargarPdf} disabled={generando}>
            {generando ? <Loader2 size={15} className="spin" /> : <FileDown size={15} />}
            {generando ? 'Generando…' : 'PDF'}
          </button>
          <button
            className="btn btn--primary btn--icono"
            onClick={() => exportarExcel(nombreArchivo, 'Reporte', filas)}
          >
            <FileSpreadsheet size={15} /> Excel
          </button>
        </div>
      </header>

      <div className="rep-tabs no-print">
        {TIPOS.map((t) => (
          <button key={t.id} className={tipo === t.id ? 'is-on' : ''} onClick={() => setTipo(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <Hoja visible={verHoja} innerRef={hojaRef}>
      <MembreteSD
        titulo={`Reporte de ${TIPOS.find((t) => t.id === tipo)?.label ?? tipo}`}
        subtitulo={`${filas.length} registros · ${new Date().toLocaleDateString('es-VE', {
          dateStyle: 'long',
        })}`}
      >
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {columnas.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.length === 0 && (
                <tr>
                  <td colSpan={columnas.length} className="muted">
                    Sin datos.
                  </td>
                </tr>
              )}
              {filas.map((f, i) => (
                <tr key={i}>
                  {columnas.map((c) => (
                    <td key={c}>{String((f as Record<string, unknown>)[c] ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MembreteSD>
      </Hoja>

      {previa && (
        <VistaPreviaPdf
          url={previa.url}
          nombre={previa.nombre}
          onDescargar={previa.descargar}
          onCerrar={cerrarPrevia}
        />
      )}
    </section>
  )
}
