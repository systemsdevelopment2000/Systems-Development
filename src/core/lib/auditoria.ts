import type { AccionAuditoria, CambioAuditoria, ColeccionRecord, EstadoDatos } from '@/core/datos'

/**
 * Auditoría: quién tocó qué y cuándo.
 *
 * El registro se arma en el reducer del store, que es el único punto por donde
 * pasan todas las escrituras. Eso evita tener que acordarse de registrar en
 * cada formulario: si un dato cambió, quedó asentado.
 */

/** Nombre legible de cada colección, para no mostrar identificadores crudos. */
export const ETIQUETA_COLECCION: Partial<Record<ColeccionRecord | 'empresa' | 'estadosProyecto', string>> = {
  clientes: 'Cliente',
  colaboradores: 'Colaborador',
  proyectos: 'Proyecto',
  actividades: 'Tarea',
  asignaciones: 'Asignación',
  reuniones: 'Reunión',
  herramientas: 'Herramienta',
  metodologias: 'Metodología de Trabajo',
  presupuestos: 'Presupuesto',
  pagos: 'Cobro',
  tags: 'Etiqueta',
  tasas: 'Tasa de cambio',
  mensajes: 'Mensaje',
  hechos: 'Hito',
  evalColaborador: 'Evaluación de colaborador',
  evalCliente: 'Evaluación de cliente',
  candidatos: 'Candidato',
  plantillasEntrevista: 'Plantilla de entrevista',
  empresa: 'Membrete y configuración',
  estadosProyecto: 'Catálogo de estados',
}

export const ETIQUETA_ACCION: Record<AccionAuditoria, string> = {
  crear: 'Creó',
  editar: 'Editó',
  eliminar: 'Eliminó',
  config: 'Cambió la configuración',
  restaurar: 'Reemplazó todos los datos',
}

/**
 * Campos que NUNCA se registran. Una auditoría que copia contraseñas es una
 * filtración con otro nombre: se asienta que cambió, no a qué cambió.
 */
const SECRETOS = new Set(['contrasena', 'password', 'token', 'clave'])

/** Campos de ruido que no aportan al registro. */
const IGNORADOS = new Set(['id', 'codigo', 'creadoEn', 'orden'])

function textoDe(v: unknown): string {
  if (v === undefined || v === null || v === '') return '—'
  if (Array.isArray(v)) return v.length ? `${v.length} elemento(s)` : '—'
  if (typeof v === 'object') return 'datos'
  const s = String(v)
  return s.length > 80 ? s.slice(0, 77) + '…' : s
}

/** Diferencias entre dos versiones de una entidad, en términos legibles. */
export function compararEntidad(
  antes: Record<string, unknown> | undefined,
  despues: Record<string, unknown>,
): CambioAuditoria[] {
  if (!antes) return []
  const campos = new Set([...Object.keys(antes), ...Object.keys(despues)])
  const cambios: CambioAuditoria[] = []

  for (const campo of campos) {
    if (IGNORADOS.has(campo)) continue
    const a = antes[campo]
    const d = despues[campo]
    if (JSON.stringify(a) === JSON.stringify(d)) continue

    if (SECRETOS.has(campo)) {
      cambios.push({ campo, antes: '(oculto)', despues: '(cambiado)' })
      continue
    }
    cambios.push({ campo, antes: textoDe(a), despues: textoDe(d) })
  }
  return cambios
}

/** Nombre con el que identificar una entidad en el registro. */
export function nombreEntidad(entidad: Record<string, unknown>): string {
  const candidatos = ['codigo', 'nombre', 'titulo', 'concepto']
  const partes = candidatos
    .map((c) => (typeof entidad[c] === 'string' ? (entidad[c] as string) : ''))
    .filter(Boolean)
  if (partes.length === 0) return 'sin nombre'
  // Si hay código y nombre, se muestran juntos: "PRE-2026-0001 · Landing".
  return partes.slice(0, 2).join(' · ')
}

/** Cuántos registros se conservan. Más allá, el almacenamiento local sufre. */
export const TOPE_REGISTROS = 1500

/** Recorta el historial dejando los más recientes. */
export function recortar(
  registros: EstadoDatos['auditoria'],
): EstadoDatos['auditoria'] {
  const lista = Object.values(registros)
  if (lista.length <= TOPE_REGISTROS) return registros
  const conservados = lista
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, TOPE_REGISTROS)
  return Object.fromEntries(conservados.map((r) => [r.id, r]))
}

/**
 * Nombres de campo en lenguaje humano.
 *
 * El registro mostraba la clave cruda del objeto: "estadoId", "proximoPago",
 * "clienteIds". Para leer una auditoría hay que entenderla sin conocer el
 * modelo de datos.
 */
export const ETIQUETA_CAMPO: Record<string, string> = {
  nombre: 'Nombre',
  titulo: 'Título',
  concepto: 'Concepto',
  descripcion: 'Descripción',
  notas: 'Notas',
  estado: 'Estado',
  estadoId: 'Estado',
  prioridad: 'Prioridad',
  clienteId: 'Cliente',
  clienteIds: 'Clientes',
  proyectoId: 'Proyecto',
  proyectoIds: 'Proyectos',
  responsables: 'Responsables',
  responsablePrincipalId: 'Responsable principal',
  creadorId: 'Creada por',
  aprobadorId: 'Aprobador',
  apruebaEn: 'Fase que traba',
  requiereAprobacion: 'Requiere aprobación',
  aprobadaPor: 'Aprobada por',
  aprobadaEn: 'Fecha de aprobación',
  vence: 'Vence',
  fecha: 'Fecha',
  fechas: 'Fechas',
  progreso: 'Progreso',
  tagIds: 'Etiquetas',
  etiquetas: 'Etiquetas',
  modulos: 'Módulos',
  moneda: 'Moneda',
  precio: 'Precio',
  precioUnitario: 'Precio unitario',
  lineas: 'Líneas',
  plan: 'Plan de cobro',
  condiciones: 'Condiciones',
  impuesto: 'Impuesto',
  descuentoGlobal: 'Descuento global',
  aceptadoEn: 'Fecha de aceptación',
  validezDias: 'Validez (días)',
  monto: 'Monto',
  equivalente: 'Equivalente',
  tasa: 'Tasa',
  medio: 'Medio de pago',
  referencia: 'Referencia',
  cuotaId: 'Cuota',
  proximoPago: 'Próximo pago',
  ultimoPago: 'Último pago',
  ciclo: 'Ciclo de pago',
  metodoPago: 'Método de pago',
  propietario: 'Propietario',
  correo: 'Correo',
  contrasena: 'Contraseña',
  telefono: 'Teléfono',
  telefonos: 'Teléfonos',
  url: 'Sitio',
  activa: 'Activa',
  activo: 'Activo',
  ubicacion: 'Ubicación',
  documento: 'Documento',
  tipoDocumento: 'Tipo de documento',
  cargo: 'Cargo',
  cedula: 'Cédula',
  rol: 'Rol',
  permisos: 'Permisos',
  logo: 'Logotipo',
  pie: 'Pie de página',
  tema: 'Combinación de color',
  unidades: 'Unidades de cobro',
  finanzas: 'Parámetros de costeo',
  metodosCobro: 'Métodos de cobro',
  hojaPendientes: 'Pie de la hoja de pendientes',
  puntajes: 'Evaluación',
  plantillaId: 'Plantilla',
  entrevistadorId: 'Entrevistador',
  entrevistadoEn: 'Fecha de entrevista',
  conclusion: 'Conclusión',
  adjuntos: 'Documentos',
  bloques: 'Bloques de preguntas',
  criterios: 'Criterios',
  reparto: 'Reparto del costo',
  medioPago: 'Medio de pago',
  instrucciones: 'Instrucciones',
  modulo: 'Módulo',
}

/** Nombre legible de un campo; si no está en el diccionario, se embellece. */
export function etiquetaCampo(campo: string): string {
  const conocido = ETIQUETA_CAMPO[campo]
  if (conocido) return conocido
  // camelCase → "Camel case"
  const suelto = campo.replace(/([A-Z])/g, ' $1').toLowerCase().trim()
  return suelto.charAt(0).toUpperCase() + suelto.slice(1)
}
