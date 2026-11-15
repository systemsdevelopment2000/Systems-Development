import type { CategoriaProyecto, ModuloProyecto, TipoDesarrollo } from '@/core/datos'

export const CATEGORIAS: { valor: CategoriaProyecto; etiqueta: string }[] = [
  { valor: 'desarrollo', etiqueta: 'Desarrollo' },
  { valor: 'charla', etiqueta: 'Charla' },
  { valor: 'curso', etiqueta: 'Curso' },
  { valor: 'consultoria', etiqueta: 'Consultoría' },
  { valor: 'otro', etiqueta: 'Otro' },
]

export const TIPOS_DESARROLLO: { valor: TipoDesarrollo; etiqueta: string }[] = [
  { valor: 'erp', etiqueta: 'ERP' },
  { valor: 'ecommerce', etiqueta: 'E-commerce' },
  { valor: 'landing', etiqueta: 'Landing Page' },
  { valor: 'saas', etiqueta: 'SaaS' },
  { valor: 'web', etiqueta: 'Sitio web' },
  { valor: 'app_movil', etiqueta: 'App móvil' },
  { valor: 'a_medida', etiqueta: 'A medida' },
  { valor: 'otro', etiqueta: 'Otro' },
]

interface Plantilla {
  id: string
  nombre: string
  horas: number
}

/**
 * Módulos que todo desarrollo necesita, sin importar su tipo: no mutan.
 */
export const MODULOS_BASE: Plantilla[] = [
  { id: 'auth', nombre: 'Login y autenticación', horas: 16 },
  { id: 'usuarios', nombre: 'Usuarios, roles y permisos', horas: 24 },
  { id: 'configuracion', nombre: 'Configuración del sistema', horas: 10 },
  { id: 'analitica', nombre: 'Panel de analítica', horas: 18 },
  { id: 'respaldo', nombre: 'Respaldo y restauración', horas: 10 },
  { id: 'auditoria', nombre: 'Auditoría y trazabilidad', horas: 14 },
]

/** Módulos mínimos propios de cada tipo de producto. */
export const MODULOS_POR_TIPO: Record<TipoDesarrollo, Plantilla[]> = {
  erp: [
    { id: 'inventario', nombre: 'Inventario', horas: 40 },
    { id: 'compras', nombre: 'Compras y proveedores', horas: 32 },
    { id: 'ventas', nombre: 'Ventas y facturación', horas: 40 },
    { id: 'clientes', nombre: 'Clientes', horas: 20 },
    { id: 'contabilidad', nombre: 'Contabilidad básica', horas: 36 },
    { id: 'reportes', nombre: 'Reportes operativos', horas: 24 },
  ],
  ecommerce: [
    { id: 'catalogo', nombre: 'Catálogo de productos', horas: 32 },
    { id: 'carrito', nombre: 'Carrito y checkout', horas: 28 },
    { id: 'pagos', nombre: 'Pasarela de pagos', horas: 24 },
    { id: 'pedidos', nombre: 'Gestión de pedidos', horas: 24 },
    { id: 'envios', nombre: 'Envíos y despacho', horas: 18 },
  ],
  landing: [
    { id: 'secciones', nombre: 'Secciones de contenido', horas: 14 },
    { id: 'contacto', nombre: 'Formulario de contacto', horas: 6 },
    { id: 'seo', nombre: 'SEO y metadatos', horas: 6 },
  ],
  saas: [
    { id: 'tenants', nombre: 'Multi-inquilino (aislamiento por cliente)', horas: 44 },
    { id: 'planes', nombre: 'Planes y límites de uso', horas: 24 },
    { id: 'suscripcion', nombre: 'Suscripción y cobro recurrente', horas: 32 },
    { id: 'onboarding', nombre: 'Alta y onboarding autoservicio', horas: 20 },
    { id: 'facturacion_rec', nombre: 'Facturación automática', horas: 26 },
    { id: 'uso', nombre: 'Medición de consumo', horas: 18 },
  ],
  web: [
    { id: 'paginas', nombre: 'Páginas institucionales', horas: 20 },
    { id: 'blog', nombre: 'Blog / noticias', horas: 18 },
    { id: 'contacto', nombre: 'Formulario de contacto', horas: 6 },
    { id: 'seo', nombre: 'SEO y metadatos', horas: 6 },
  ],
  app_movil: [
    { id: 'navegacion', nombre: 'Navegación y shell', horas: 20 },
    { id: 'offline', nombre: 'Modo sin conexión', horas: 24 },
    { id: 'push', nombre: 'Notificaciones push', horas: 16 },
    { id: 'perfil', nombre: 'Perfil de usuario', horas: 14 },
  ],
  a_medida: [{ id: 'core', nombre: 'Núcleo funcional a medida', horas: 60 }],
  otro: [],
}

/** Extras típicos que no entran en el mínimo: se cobran aparte. */
export const ADICIONALES_SUGERIDOS: Plantilla[] = [
  { id: 'integracion_api', nombre: 'Integración con API externa', horas: 20 },
  { id: 'facturacion_fiscal', nombre: 'Facturación fiscal', horas: 28 },
  { id: 'multimoneda', nombre: 'Multimoneda y tasas', horas: 16 },
  { id: 'multisucursal', nombre: 'Multisucursal', horas: 24 },
  { id: 'whatsapp', nombre: 'Integración WhatsApp', horas: 14 },
  { id: 'migracion', nombre: 'Migración de datos', horas: 20 },
  { id: 'capacitacion', nombre: 'Capacitación del personal', horas: 12 },
  { id: 'pasarela_local', nombre: 'Pago móvil / transferencia local', horas: 16 },
  { id: 'correo', nombre: 'Correos transaccionales', horas: 10 },
  { id: 'roles_avanzados', nombre: 'Permisos granulares por módulo', horas: 18 },
  { id: 'dominio', nombre: 'Dominio y despliegue', horas: 8 },
]

/**
 * Propone el alcance de un proyecto: módulos base + los propios de su tipo
 * (marcados como estándar e incluidos) y los adicionales (no incluidos).
 */
export function modulosSugeridos(tipo?: TipoDesarrollo): ModuloProyecto[] {
  const estandar = [...MODULOS_BASE, ...(tipo ? MODULOS_POR_TIPO[tipo] : [])].map((m) => ({
    id: m.id,
    nombre: m.nombre,
    horas: m.horas,
    clase: 'estandar' as const,
    incluido: true,
  }))
  const adicionales = ADICIONALES_SUGERIDOS.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    horas: m.horas,
    clase: 'adicional' as const,
    incluido: false,
  }))
  return [...estandar, ...adicionales]
}

/** Horas totales del alcance incluido. */
export function horasTotales(modulos?: ModuloProyecto[]): number {
  return (modulos ?? []).filter((m) => m.incluido).reduce((s, m) => s + m.horas, 0)
}

/** ¿La categoría implica desarrollo de software? */
export function esDesarrollo(categoria?: CategoriaProyecto): boolean {
  return categoria === 'desarrollo'
}
