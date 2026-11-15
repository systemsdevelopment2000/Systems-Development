import type {
  LineaPresupuesto,
  Presupuesto,
  TipoDesarrollo,
  TipoPresupuesto,
} from '@/core/datos'
import {
  ADICIONALES_SUGERIDOS,
  MODULOS_BASE,
  MODULOS_POR_TIPO,
  TIPOS_DESARROLLO,
} from '@/core/lib/modulos'

export { totalizar, importeLinea, money } from '@/core/lib/dinero'
export type { TotalesPresupuesto } from '@/core/lib/dinero'

/**
 * Unidades de cobro. Cada una dice QUÉ se multiplica por el precio unitario,
 * porque "h" servía de comodín y terminaba midiendo en horas cosas que no se
 * miden en horas: un dominio se cobra por año y un landing a precio cerrado.
 */
export const UNIDADES: { valor: string; etiqueta: string; mide: string }[] = [
  { valor: 'módulo', etiqueta: 'módulo', mide: 'Bloque funcional completo: login, catálogo, inventario' },
  { valor: 'componente', etiqueta: 'componente', mide: 'Pieza dentro de un módulo: portada, buscador, panel' },
  { valor: 'característica', etiqueta: 'característica', mide: 'Capacidad añadida: cupones, calculadora, exportar' },
  { valor: 'global', etiqueta: 'global', mide: 'Precio cerrado por el entregable completo' },
  { valor: 'h', etiqueta: 'h', mide: 'Horas de trabajo' },
  { valor: 'día', etiqueta: 'día', mide: 'Jornadas de trabajo' },
  { valor: 'mes', etiqueta: 'mes', mide: 'Servicio mensual recurrente' },
  { valor: 'año', etiqueta: 'año', mide: 'Servicio anual: dominio, hosting, licencia' },
  { valor: 'und', etiqueta: 'und', mide: 'Unidades contables: equipos, usuarios, pantallas' },
  { valor: 'sesión', etiqueta: 'sesión', mide: 'Encuentros: capacitación, charla, asesoría' },
  { valor: 'licencia', etiqueta: 'licencia', mide: 'Licencias de un tercero' },
]

/**
 * Sugerencia de unidad a partir del concepto. No cambia nada por su cuenta:
 * el editor ofrece el cambio y quien cotiza decide.
 */
const PISTAS: { unidad: string; palabras: string[] }[] = [
  { unidad: 'característica', palabras: ['cupón', 'cupon', 'descuento', 'calculadora', 'buscador', 'filtro', 'exportar', 'notificación', 'notificacion', 'chat', 'favorito', 'valoración', 'valoracion', 'multimoneda'] },
  { unidad: 'módulo', palabras: ['login', 'autenticación', 'autenticacion', 'usuario', 'rol', 'permiso', 'inventario', 'catálogo', 'catalogo', 'carrito', 'checkout', 'pedido', 'compra', 'venta', 'facturación', 'facturacion', 'contabilidad', 'reporte', 'cliente', 'proveedor', 'envío', 'envio', 'suscripción', 'suscripcion', 'onboarding', 'auditoría', 'auditoria', 'respaldo', 'configuración', 'configuracion', 'analítica', 'analitica', 'portada', 'blog', 'perfil'] },
  { unidad: 'año', palabras: ['dominio', 'hosting', 'certificado', 'ssl', 'renovación'] },
  { unidad: 'mes', palabras: ['mantenimiento', 'soporte', 'suscripción', 'marketing', 'community', 'publicidad', 'nube', 'servidor'] },
  { unidad: 'sesión', palabras: ['capacitación', 'curso', 'charla', 'taller', 'asesoría', 'consultoría'] },
  { unidad: 'licencia', palabras: ['licencia', 'office', 'adobe', 'plan '] },
  { unidad: 'und', palabras: ['usuario', 'equipo', 'punto', 'sucursal', 'pantalla', 'terminal'] },
  { unidad: 'componente', palabras: ['landing', 'portada', 'sección', 'seccion', 'formulario', 'pantalla', 'vista'] },
  { unidad: 'global', palabras: ['sitio', 'migración', 'migracion', 'diseño', 'logo', 'sistema completo', 'llave en mano'] },
]

export function sugerirUnidad(concepto: string): string | null {
  const t = concepto.trim().toLowerCase()
  if (!t) return null
  for (const p of PISTAS) {
    if (p.palabras.some((w) => t.includes(w))) return p.unidad
  }
  return null
}

export const TIPOS_PRESUPUESTO: { valor: TipoPresupuesto; etiqueta: string }[] = [
  { valor: 'inicial', etiqueta: 'Inicial' },
  { valor: 'ampliacion', etiqueta: 'Ampliación' },
]

export const ESTADOS_PRESUPUESTO: { valor: Presupuesto['estado']; etiqueta: string }[] = [
  { valor: 'borrador', etiqueta: 'Borrador' },
  { valor: 'enviado', etiqueta: 'Enviado' },
  { valor: 'aceptado', etiqueta: 'Aceptado' },
  { valor: 'rechazado', etiqueta: 'Rechazado' },
]


/** Presupuesto vacío listo para ensamblar. */
export function presupuestoVacio(
  moneda = 'USD',
  opciones?: { tipo?: TipoPresupuesto; proyectoId?: string; clienteId?: string; titulo?: string },
): Omit<Presupuesto, 'id'> {
  const tipo = opciones?.tipo ?? 'inicial'
  return {
    titulo: opciones?.titulo ?? (tipo === 'ampliacion' ? 'Ampliación de alcance' : 'Nuevo presupuesto'),
    tipo,
    proyectoId: opciones?.proyectoId,
    clienteId: opciones?.clienteId,
    estado: 'borrador',
    moneda,
    lineas: [],
    descuentoGlobal: 0,
    impuesto: 0,
    validezDias: 15,
    fecha: new Date().toISOString(),
  }
}

export function lineaVacia(grupo = 'Desarrollo'): LineaPresupuesto {
  return {
    id: crypto.randomUUID(),
    grupo,
    concepto: '',
    cantidad: 1,
    unidad: 'global',
    precioUnitario: 0,
    descuento: 0,
  }
}

/**
 * Líneas de presupuesto a partir de un tipo de sistema.
 *
 * Lo que se cotiza no son horas sino lo que el cliente recibe: cada módulo es
 * una línea con unidad `módulo` y cantidad 1. Las horas del catálogo solo
 * sirven para proponer un precio (horas × tarifa); quedan fuera del documento,
 * porque el cliente compra funcionalidad, no tiempo.
 */
export function lineasDeTipo(
  tipo: TipoDesarrollo,
  tarifaHora: number,
  opciones?: { incluirAdicionales?: boolean },
): LineaPresupuesto[] {
  const etiqueta = TIPOS_DESARROLLO.find((t) => t.valor === tipo)?.etiqueta ?? 'Desarrollo'

  const linea = (m: { nombre: string; horas: number }, grupo: string): LineaPresupuesto => ({
    id: crypto.randomUUID(),
    grupo,
    concepto: m.nombre,
    cantidad: 1,
    unidad: 'módulo',
    // Precio propuesto desde las horas estimadas; es editable como cualquier otro.
    precioUnitario: Math.round(m.horas * tarifaHora),
    descuento: 0,
  })

  const base = MODULOS_BASE.map((m) => linea(m, 'Producto base'))
  const propios = MODULOS_POR_TIPO[tipo].map((m) => linea(m, etiqueta))
  const extras = opciones?.incluirAdicionales
    ? ADICIONALES_SUGERIDOS.map((m) => linea(m, 'Adicionales'))
    : []

  return [...base, ...propios, ...extras]
}

/** Lista por defecto, usada como semilla y como respaldo si no hay configurada. */
export const UNIDADES_POR_DEFECTO = UNIDADES.map((u) => u.valor)

/** Qué mide una unidad, si es una de las conocidas. */
export function queMide(unidad: string): string | undefined {
  return UNIDADES.find((u) => u.valor === unidad)?.mide
}

/**
 * Textos de uso frecuente para los campos libres del presupuesto.
 *
 * Se insertan con un clic y después se editan: la idea es no reescribir cada
 * vez lo mismo, no imponer una redacción. Si el campo ya tiene texto, el
 * preset se añade en una línea nueva en lugar de pisarlo.
 */
export interface Preset {
  etiqueta: string
  texto: string
}

export const PRESETS_MORA: Preset[] = [
  {
    etiqueta: 'Recargo simple',
    texto:
      'Pasados los días de gracia, el saldo vencido genera el recargo por mora indicado, por cada período de 30 días de atraso.',
  },
  {
    etiqueta: 'Suspensión del trabajo',
    texto:
      'Si una cuota no se cancela dentro de los días de gracia, el desarrollo se suspende hasta regularizar el pago. La fecha de entrega se corre por el mismo tiempo que dure la suspensión.',
  },
  {
    etiqueta: 'Retención de la entrega',
    texto:
      'El sistema, su código y sus credenciales se entregan una vez cancelado el total. Un saldo pendiente mantiene la entrega retenida sin generar derecho a reclamo.',
  },
  {
    etiqueta: 'Pago parcial',
    texto:
      'Un abono parcial se imputa primero a la mora acumulada y luego al capital de la cuota más antigua.',
  },
]

export const PRESETS_OBSERVACIONES: Preset[] = [
  {
    etiqueta: 'Tasa del día',
    texto: 'Los montos en bolívares se calculan a la tasa del día en que se realice el pago.',
  },
  {
    etiqueta: 'Medios de pago',
    texto:
      'Se aceptan divisas en efectivo, Zelle, Binance, pago móvil y transferencia. Los datos de cobro se envían al confirmar la cotización.',
  },
  {
    etiqueta: 'Comprobante',
    texto:
      'Cada pago debe reportarse con su comprobante y número de referencia para ser imputado a la cuota correspondiente.',
  },
  {
    etiqueta: 'Precios en divisas',
    texto:
      'Los precios están expresados en divisas y no incluyen comisiones bancarias ni de plataformas de pago, que corren por cuenta del cliente.',
  },
]

export const PRESETS_NOTAS: Preset[] = [
  {
    etiqueta: 'Qué no incluye',
    texto:
      'No incluye: dominio, hosting, licencias de terceros, contenidos (textos e imágenes) ni servicios no listados en esta cotización.',
  },
  {
    etiqueta: 'Garantía',
    texto:
      'Incluye 30 días de garantía desde la entrega para corrección de fallas sobre lo acordado. No cubre funcionalidades nuevas ni errores por carga incorrecta de datos.',
  },
  {
    etiqueta: 'Insumos del cliente',
    texto:
      'El cronograma asume que el cliente entrega a tiempo los datos, accesos y contenidos requeridos. Las demoras en estos insumos corren la fecha de entrega.',
  },
  {
    etiqueta: 'Capacitación',
    texto:
      'Incluye una sesión de capacitación al personal y la entrega de credenciales de administración.',
  },
  {
    etiqueta: 'Validez',
    texto:
      'Esta cotización pierde vigencia al cumplirse su validez. Después de esa fecha los precios pueden ser revisados.',
  },
]

/** Inserta un preset sin pisar lo ya escrito. */
export function aplicarPreset(actual: string | undefined, texto: string): string {
  const base = (actual ?? '').trim()
  if (!base) return texto
  if (base.includes(texto)) return base
  return `${base}\n${texto}`
}
