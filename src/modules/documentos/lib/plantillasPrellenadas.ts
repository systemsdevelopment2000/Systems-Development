import type { Proyecto } from '@/core/datos'

export interface ModuloItem {
  id: string
  nombre: string
  detalle?: string
  horas: number
  incluido: boolean
}

export interface AlcanceItem {
  id: string
  texto: string
  incluido: boolean
}

export interface PlantillaPrellenada {
  id: string
  nombre: string
  icono: string
  categoria: string
  objeto: string
  modulos: ModuloItem[]
  herramientas: string[]
  alcances: AlcanceItem[]
  plazoEstimado: string
  formaPago: string
}

export interface ContenidoPersonalizado {
  plantillaId: string
  objeto: string
  modulos: ModuloItem[]
  herramientas: string[]
  alcances: AlcanceItem[]
  plazoEstimado: string
  formaPago: string
}

/** Catálogo de tecnologías y herramientas frecuentes para selección rápida. */
export const HERRAMIENTAS_CATALOGO_SUGERIDAS = [
  'React',
  'TypeScript',
  'Vite',
  'TailwindCSS',
  'Node.js',
  'Supabase',
  'PostgreSQL',
  'Google Calendar API',
  'WhatsApp Cloud API',
  'Binance Pay',
  'Stripe',
  'PayPal',
  'Pago Móvil',
  'Next.js',
  'Express',
  'NestJS',
  'Firebase',
  'Docker',
  'Redis',
  'PWA',
  'AWS',
  'Vercel',
]

/** Plantillas prellenadas listas para usar y personalizar. */
export const PLANTILLAS_PRELLENADAS: Record<string, PlantillaPrellenada> = {
  citas: {
    id: 'citas',
    nombre: 'Citas y Agenda Online',
    icono: 'Calendar',
    categoria: 'Salud y Servicios',
    objeto:
      'Desarrollo e implementación de una plataforma integral de gestión de citas, consultas y pacientes, con agendamiento interactivo en tiempo real, sincronización de calendario y pasarela de cobro digital.',
    modulos: [
      {
        id: 'c1',
        nombre: 'Autenticación y perfiles de pacientes/especialistas',
        detalle: 'Registro seguro, inicio de sesión, historial clínico básico y datos de contacto.',
        horas: 18,
        incluido: true,
      },
      {
        id: 'c2',
        nombre: 'Agenda interactiva y calendario en tiempo real',
        detalle: 'Vista diaria, semanal y mensual con bloqueo de franjas horarias y disponibilidad dinámica.',
        horas: 26,
        incluido: true,
      },
      {
        id: 'c3',
        nombre: 'Flujo de reserva y confirmación de citas online',
        detalle: 'Selección de motivo de consulta, especialista, fecha y hora con validación de cupos.',
        horas: 22,
        incluido: true,
      },
      {
        id: 'c4',
        nombre: 'Notificaciones automáticas (WhatsApp y Correo)',
        detalle: 'Recordatorios previos a la cita, confirmaciones de pago y avisos de reprogramación.',
        horas: 18,
        incluido: true,
      },
      {
        id: 'c5',
        nombre: 'Integración con Google Calendar',
        detalle: 'Sincronización bidireccional automática de citas con la cuenta de Google del especialista.',
        horas: 16,
        incluido: true,
      },
      {
        id: 'c6',
        nombre: 'Pasarela de pagos y cobro de consultas',
        detalle: 'Recepción de pagos mediante Binance Pay, Pago Móvil y transferencias con validación.',
        horas: 20,
        incluido: true,
      },
      {
        id: 'c7',
        nombre: 'Panel administrativo y reportes de atención',
        detalle: 'Métricas de citas atendidas, ingresos generados, cancelaciones y tasa de asistencia.',
        horas: 16,
        incluido: true,
      },
    ],
    herramientas: [
      'React',
      'TypeScript',
      'Vite',
      'TailwindCSS',
      'Supabase',
      'PostgreSQL',
      'Google Calendar API',
      'WhatsApp Cloud API',
      'Binance Pay',
    ],
    alcances: [
      {
        id: 'ca1',
        texto: 'Diseño de interfaz UI/UX responsiva y moderna optimizada para teléfonos móviles y computadoras.',
        incluido: true,
      },
      {
        id: 'ca2',
        texto: 'Configuración de base de datos relacional y políticas de seguridad RLS para resguardo confidencial de historiales.',
        incluido: true,
      },
      {
        id: 'ca3',
        texto: 'Automatización de recordatorios por WhatsApp y correo para reducir el ausentismo de pacientes.',
        incluido: true,
      },
      {
        id: 'ca4',
        texto: 'Sincronización en tiempo real con Google Calendar del profesional.',
        incluido: true,
      },
      {
        id: 'ca5',
        texto: 'Pruebas de aseguramiento de calidad (QA), despliegue en servidor en la nube y certificado SSL.',
        incluido: true,
      },
      {
        id: 'ca6',
        texto: 'Capacitación al personal en el uso del panel y 30 días de garantía y soporte técnico post-lanzamiento.',
        incluido: true,
      },
    ],
    plazoEstimado: '4 a 5 semanas hábiles',
    formaPago:
      '50% de anticipo al inicio de actividades, 30% a la presentación de la versión funcional (beta) y 20% al despliegue final y entrega formal.',
  },

  ecommerce: {
    id: 'ecommerce',
    nombre: 'E-Commerce & Tienda Online',
    icono: 'ShoppingCart',
    categoria: 'Comercio Digital',
    objeto:
      'Desarrollo de tienda virtual moderna y de alto rendimiento para exhibición de catálogo, gestión de compras en línea, pasarelas de pago multimoneda y despacho de pedidos.',
    modulos: [
      {
        id: 'e1',
        nombre: 'Catálogo de productos interactivo y filtros avanzados',
        detalle: 'Búsqueda instantánea, categorías, variantes (talla, color) y control de stock.',
        horas: 28,
        incluido: true,
      },
      {
        id: 'e2',
        nombre: 'Carrito de compras y flujo de checkout rápido',
        detalle: 'Proceso de compra optimizado en 2 pasos para maximizar la tasa de conversión.',
        horas: 22,
        incluido: true,
      },
      {
        id: 'e3',
        nombre: 'Pasarelas de pago multimoneda',
        detalle: 'Integración de Stripe, PayPal, Binance Pay y Pago Móvil nacional con validación.',
        horas: 24,
        incluido: true,
      },
      {
        id: 'e4',
        nombre: 'Administrador de pedidos y estados de despacho',
        detalle: 'Panel de control de pedidos: pendiente, pagado, en preparación y enviado.',
        horas: 20,
        incluido: true,
      },
      {
        id: 'e5',
        nombre: 'Notificaciones transaccionales por WhatsApp / Correo',
        detalle: 'Avisos automáticos al comprador con el recibo y guía de rastreo.',
        horas: 14,
        incluido: true,
      },
      {
        id: 'e6',
        nombre: 'Módulo de cupones de descuento y promociones',
        detalle: 'Códigos promocionales por porcentaje o monto fijo con fecha de vigencia.',
        horas: 12,
        incluido: true,
      },
      {
        id: 'e7',
        nombre: 'Reportes de ventas y productos más demandados',
        detalle: 'Gráficas de ingresos, ticket promedio y rotación de inventario.',
        horas: 16,
        incluido: true,
      },
    ],
    herramientas: [
      'React',
      'Vite',
      'TailwindCSS',
      'Node.js',
      'Supabase',
      'PostgreSQL',
      'Stripe',
      'Binance Pay',
      'WhatsApp Cloud API',
    ],
    alcances: [
      {
        id: 'ea1',
        texto: 'Diseño mobile-first enfocado en conversión con tiempos de carga inferiores a 1.5 segundos.',
        incluido: true,
      },
      {
        id: 'ea2',
        texto: 'Configuración de pasarelas de pago seguras con cifrado SSL y tokenización.',
        incluido: true,
      },
      {
        id: 'ea3',
        texto: 'Panel administrativo intuitivo para carga y modificación masiva de productos.',
        incluido: true,
      },
      {
        id: 'ea4',
        texto: 'Carga inicial de productos de muestra y configuración de zonas de despacho.',
        incluido: true,
      },
      {
        id: 'ea5',
        texto: 'Despliegue en producción y 30 días de garantía y soporte técnico.',
        incluido: true,
      },
    ],
    plazoEstimado: '4 a 6 semanas hábiles',
    formaPago:
      '50% de anticipo al inicio, 30% a la entrega de la tienda funcional y 20% al lanzamiento comercial.',
  },

  erp: {
    id: 'erp',
    nombre: 'Sistema Web Administrativo & ERP',
    icono: 'Building2',
    categoria: 'Gestión Empresarial',
    objeto:
      'Desarrollo de plataforma administrativa y operativa a la medida para centralizar la gestión de ventas, compras, inventario, clientes y finanzas con trazabilidad total.',
    modulos: [
      {
        id: 'er1',
        nombre: 'Usuarios, roles y permisos de acceso granulares',
        detalle: 'Control de accesos por departamento (administración, almacén, ventas, contabilidad).',
        horas: 24,
        incluido: true,
      },
      {
        id: 'er2',
        nombre: 'Inventario y control de existencias multialmacén',
        detalle: 'Entradas, salidas, transferencias y alertas de stock mínimo.',
        horas: 32,
        incluido: true,
      },
      {
        id: 'er3',
        nombre: 'Facturación, cobranzas y cuentas por cobrar',
        detalle: 'Emisión de facturas y notas de entrega, control de pagos parciales y saldos pendientes.',
        horas: 30,
        incluido: true,
      },
      {
        id: 'er4',
        nombre: 'Gestión de compras y directorio de proveedores',
        detalle: 'Registro de órdenes de compra, recepción de mercancía y cuentas por pagar.',
        horas: 26,
        incluido: true,
      },
      {
        id: 'er5',
        nombre: 'Directorio de clientes y ficha comercial (CRM)',
        detalle: 'Historial de operaciones, límites de crédito y datos de contacto.',
        horas: 18,
        incluido: true,
      },
      {
        id: 'er6',
        nombre: 'Reportes ejecutivos y exportación de datos (PDF/Excel)',
        detalle: 'Balances, flujos de caja y ventas por período con exportación directa.',
        horas: 20,
        incluido: true,
      },
      {
        id: 'er7',
        nombre: 'Auditoría y registro de actividades',
        detalle: 'Trazabilidad completa de operaciones con usuario, fecha y cambios efectuados.',
        horas: 16,
        incluido: true,
      },
    ],
    herramientas: [
      'React',
      'TypeScript',
      'Node.js',
      'PostgreSQL',
      'Supabase',
      'TailwindCSS',
      'XLSX',
    ],
    alcances: [
      {
        id: 'era1',
        texto: 'Arquitectura modular escalable con separación clara de roles y módulos operativos.',
        incluido: true,
      },
      {
        id: 'era2',
        texto: 'Sincronización en tiempo real entre múltiples sucursales o terminales de trabajo.',
        incluido: true,
      },
      {
        id: 'era3',
        texto: 'Sistema de respaldo automatizado periódico de la base de datos.',
        incluido: true,
      },
      {
        id: 'era4',
        texto: 'Exportación de todos los reportes a formatos estándar Excel y PDF.',
        incluido: true,
      },
      {
        id: 'era5',
        texto: 'Manual de usuario, sesiones de inducción al equipo y 45 días de garantía y soporte.',
        incluido: true,
      },
    ],
    plazoEstimado: '6 a 8 semanas hábiles',
    formaPago:
      '40% de anticipo inicial, 30% a la entrega del módulo de ventas e inventario, y 30% a la entrega final.',
  },

  app_movil: {
    id: 'app_movil',
    nombre: 'App Móvil Multiplataforma',
    icono: 'Smartphone',
    categoria: 'Aplicaciones Móviles',
    objeto:
      'Desarrollo de aplicación móvil de alto rendimiento para Android e iOS orientada a una experiencia de usuario rápida, fluida y con capacidad de funcionamiento offline.',
    modulos: [
      {
        id: 'ap1',
        nombre: 'Arquitectura de aplicación móvil y navegación nativa',
        detalle: 'Estructura de navegación fluida, transiciones optimizadas y soporte modo oscuro.',
        horas: 22,
        incluido: true,
      },
      {
        id: 'ap2',
        nombre: 'Autenticación y perfil de usuario con biometría',
        detalle: 'Inicio de sesión con correo, teléfono o huella/FaceID con resguardo biométrico.',
        horas: 18,
        incluido: true,
      },
      {
        id: 'ap3',
        nombre: 'Módulo operativo principal (servicios / transacciones)',
        detalle: 'Funcionalidad central de interacción, catálogo de servicios o panel operativo.',
        horas: 36,
        incluido: true,
      },
      {
        id: 'ap4',
        nombre: 'Notificaciones push en tiempo real',
        detalle: 'Envío de alertas de eventos, estados de pedidos y recordatorios al dispositivo.',
        horas: 18,
        incluido: true,
      },
      {
        id: 'ap5',
        nombre: 'Soporte offline y sincronización inteligente',
        detalle: 'Persistencia de datos local cuando no hay conexión y sincronización al reconectar.',
        horas: 24,
        incluido: true,
      },
      {
        id: 'ap6',
        nombre: 'Panel de administración web para control de la app',
        detalle: 'Gestión de contenidos, usuarios registrados y estadísticas de uso de la app.',
        horas: 26,
        incluido: true,
      },
    ],
    herramientas: [
      'React Native / PWA',
      'TypeScript',
      'TailwindCSS',
      'Supabase',
      'PostgreSQL',
      'Firebase',
    ],
    alcances: [
      {
        id: 'apa1',
        texto: 'Desarrollo de interfaz móvil fluida (60 FPS) compatible con smartphones Android e iOS.',
        incluido: true,
      },
      {
        id: 'apa2',
        texto: 'Preparación de recursos gráficos, íconos adaptativos y pantallas splash de inicio.',
        incluido: true,
      },
      {
        id: 'apa3',
        texto: 'Configuración del backend en la nube con API segura y base de datos relacional.',
        incluido: true,
      },
      {
        id: 'apa4',
        texto: 'Pruebas de usabilidad en dispositivos físicos y soporte para publicación en tiendas / PWA.',
        incluido: true,
      },
      {
        id: 'apa5',
        texto: '30 días de garantía y acompañamiento técnico post-lanzamiento.',
        incluido: true,
      },
    ],
    plazoEstimado: '5 a 7 semanas hábiles',
    formaPago:
      '50% de anticipo inicial, 30% a la entrega de la versión de prueba en dispositivos y 20% al despliegue final.',
  },

  landing: {
    id: 'landing',
    nombre: 'Sitio Web Corporativo & Landing Page',
    icono: 'Globe',
    categoria: 'Presencia Web',
    objeto:
      'Diseño y desarrollo de sitio web institucional de alta conversión con identidad corporativa, catálogo de servicios, optimización de velocidad (Core Web Vitals) y SEO.',
    modulos: [
      {
        id: 'l1',
        nombre: 'Diseño de identidad digital y sección principal (Hero)',
        detalle: 'Propuesta de valor clara, llamados a la acción destacados e identidad visual SD.',
        horas: 16,
        incluido: true,
      },
      {
        id: 'l2',
        nombre: 'Secciones de servicios y catálogo interactivo',
        detalle: 'Exhibición estructurada de servicios, ventajas competitivas y testimonios.',
        horas: 14,
        incluido: true,
      },
      {
        id: 'l3',
        nombre: 'Formularios inteligentes y botón directo de WhatsApp',
        detalle: 'Recepción directa de consultas y prospectos a la bandeja de entrada y al WhatsApp comercial.',
        horas: 8,
        incluido: true,
      },
      {
        id: 'l4',
        nombre: 'Optimización SEO y posicionamiento en Google',
        detalle: 'Estructuración semántica de etiquetas, meta tags, OpenGraph y sitemap XML.',
        horas: 8,
        incluido: true,
      },
      {
        id: 'l5',
        nombre: 'Panel ligero para actualización de contenidos',
        detalle: 'Permite editar textos, imágenes y testimonios sin conocimientos de código.',
        horas: 14,
        incluido: true,
      },
    ],
    herramientas: ['React', 'Vite', 'TailwindCSS', 'TypeScript', 'WhatsApp Cloud API', 'Vercel'],
    alcances: [
      {
        id: 'la1',
        texto: 'Diseño ultra responsive adaptado a cualquier tamaño de pantalla.',
        incluido: true,
      },
      {
        id: 'la2',
        texto: 'Puntuación superior a 90 en Google PageSpeed Insights con carga ultrarrápida.',
        incluido: true,
      },
      {
        id: 'la3',
        texto: 'Integración de analítica web para seguimiento de visitas y conversiones.',
        incluido: true,
      },
      {
        id: 'la4',
        texto: 'Despliegue en hosting de alto rendimiento con certificado SSL gratuito.',
        incluido: true,
      },
      {
        id: 'la5',
        texto: 'Garantía técnica de 30 días.',
        incluido: true,
      },
    ],
    plazoEstimado: '2 a 3 semanas hábiles',
    formaPago: '50% de anticipo y 50% a la entrega del sitio publicado en su dominio final.',
  },

  saas: {
    id: 'saas',
    nombre: 'SaaS / Plataforma Multi-inquilino',
    icono: 'Cloud',
    categoria: 'Software as a Service',
    objeto:
      'Desarrollo de plataforma de software como servicio (SaaS) con arquitectura multi-inquilino (multi-tenant), suscripciones recurrentes, paneles analíticos y autoservicio.',
    modulos: [
      {
        id: 's1',
        nombre: 'Aislamiento multi-inquilino y seguridad de datos',
        detalle: 'Separación estricta de datos por organización o cliente con esquemas seguros.',
        horas: 36,
        incluido: true,
      },
      {
        id: 's2',
        nombre: 'Onboarding y registro autoservicio de clientes',
        detalle: 'Flujo de registro guiado, configuración inicial y creación automática del espacio de trabajo.',
        horas: 20,
        incluido: true,
      },
      {
        id: 's3',
        nombre: 'Planes de suscripción y pasarela de cobro recurrente',
        detalle: 'Integración de cobros automáticos periódicos con Stripe y control de límites.',
        horas: 30,
        incluido: true,
      },
      {
        id: 's4',
        nombre: 'Módulo funcional núcleo del servicio',
        detalle: 'Lógica central del software adaptada al modelo de negocio de la plataforma.',
        horas: 44,
        incluido: true,
      },
      {
        id: 's5',
        nombre: 'Panel de métricas y medición de consumo (Usage Metrics)',
        detalle: 'Gráficas de uso de recursos, usuarios activos y límites contratados.',
        horas: 20,
        incluido: true,
      },
      {
        id: 's6',
        nombre: 'API RESTful y webhooks para integraciones',
        detalle: 'Endpoints documentados para que los clientes del SaaS puedan conectar sus propios sistemas.',
        horas: 24,
        incluido: true,
      },
    ],
    herramientas: [
      'React',
      'TypeScript',
      'Next.js',
      'Node.js',
      'PostgreSQL',
      'Supabase',
      'Redis',
      'Stripe',
      'Docker',
    ],
    alcances: [
      {
        id: 'sa1',
        texto: 'Arquitectura escalable en la nube con soporte para miles de usuarios concurrentes.',
        incluido: true,
      },
      {
        id: 'sa2',
        texto: 'Facturación recurrente y portal de cliente para gestión de tarjetas y recibos.',
        incluido: true,
      },
      {
        id: 'sa3',
        texto: 'Sistema de monitoreo de actividad, errores y tiempos de respuesta.',
        incluido: true,
      },
      {
        id: 'sa4',
        texto: 'Despliegue automatizado con pipelines CI/CD.',
        incluido: true,
      },
      {
        id: 'sa5',
        texto: 'Garantía técnica de 60 días post-lanzamiento.',
        incluido: true,
      },
    ],
    plazoEstimado: '8 a 10 semanas hábiles',
    formaPago:
      '35% de anticipo inicial, 35% a la entrega del núcleo funcional y 30% al lanzamiento comercial.',
  },

  api: {
    id: 'api',
    nombre: 'API & Microservicios Backend',
    icono: 'Server',
    categoria: 'Infraestructura & Backend',
    objeto:
      'Desarrollo de arquitectura backend robusta, segura y documentada para proveer servicios de datos, lógica de negocio e integraciones externas a aplicaciones móviles y web.',
    modulos: [
      {
        id: 'api1',
        nombre: 'Diseño de endpoints RESTful y arquitectura de base de datos',
        detalle: 'Modelado relacional optimizado, normalización y consultas indexadas.',
        horas: 24,
        incluido: true,
      },
      {
        id: 'api2',
        nombre: 'Autenticación centralizada JWT y autorización por roles',
        detalle: 'Tokens de acceso seguros, refresh tokens y validación de permisos en middleware.',
        horas: 18,
        incluido: true,
      },
      {
        id: 'api3',
        nombre: 'Lógica de negocio y controladores del servicio',
        detalle: 'Implementación de reglas de negocio, validación de esquemas y filtros de datos.',
        horas: 32,
        incluido: true,
      },
      {
        id: 'api4',
        nombre: 'Documentación interactiva con Swagger / OpenAPI',
        detalle: 'Especificación estándar que permite probar cada endpoint directamente desde el navegador.',
        horas: 12,
        incluido: true,
      },
      {
        id: 'api5',
        nombre: 'Seguridad, rate limiting y protección contra ataques',
        detalle: 'Protección contra inyección SQL, CORS, límites de peticiones y headers seguros Helmet.',
        horas: 14,
        incluido: true,
      },
      {
        id: 'api6',
        nombre: 'Pruebas unitarias y de integración automatizadas',
        detalle: 'Suite de tests automáticos para garantizar estabilidad en cada actualización.',
        horas: 18,
        incluido: true,
      },
    ],
    herramientas: ['Node.js', 'TypeScript', 'Express', 'NestJS', 'PostgreSQL', 'Redis', 'Docker'],
    alcances: [
      {
        id: 'apia1',
        texto: 'Documentación completa en OpenAPI 3.0 para fácil integración con clientes.',
        incluido: true,
      },
      {
        id: 'apia2',
        texto: 'Contenerización completa en Docker para despliegue reproducible.',
        incluido: true,
      },
      {
        id: 'apia3',
        texto: 'Configuración de base de datos con respaldos automáticos y pool de conexiones.',
        incluido: true,
      },
      {
        id: 'apia4',
        texto: '45 días de soporte técnico y mantenimiento correctivo.',
        incluido: true,
      },
    ],
    plazoEstimado: '4 a 5 semanas hábiles',
    formaPago: '50% de anticipo y 50% contra entrega de la API desplegada y documentada.',
  },

  a_medida: {
    id: 'a_medida',
    nombre: 'Desarrollo a Medida Personalizado',
    icono: 'Wrench',
    categoria: 'A Medida',
    objeto:
      'Desarrollo de solución tecnológica integral diseñada exclusivamente para satisfacer los requerimientos operativos y estratégicos del cliente.',
    modulos: [
      {
        id: 'm1',
        nombre: 'Fase de levantamiento y arquitectura del sistema',
        detalle: 'Diseño de wireframes, arquitectura de información y diagramas de flujo operativo.',
        horas: 20,
        incluido: true,
      },
      {
        id: 'm2',
        nombre: 'Autenticación y seguridad de usuarios',
        detalle: 'Control de accesos, recuperación de claves y perfiles asignados.',
        horas: 16,
        incluido: true,
      },
      {
        id: 'm3',
        nombre: 'Módulo operativo principal a la medida',
        detalle: 'Implementación de los requerimientos y reglas particulares del negocio.',
        horas: 40,
        incluido: true,
      },
      {
        id: 'm4',
        nombre: 'Integración con APIs externas y pasarelas de pago',
        detalle: 'Conexión con servicios de terceros acordados en la propuesta.',
        horas: 20,
        incluido: true,
      },
      {
        id: 'm5',
        nombre: 'Módulo de reportes y exportación de información',
        detalle: 'Visualización y exportación de datos en tablas y formatos estándar.',
        horas: 18,
        incluido: true,
      },
    ],
    herramientas: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Supabase', 'TailwindCSS'],
    alcances: [
      {
        id: 'ma1',
        texto: 'Diseño 100% original adaptado a las necesidades específicas del cliente.',
        incluido: true,
      },
      {
        id: 'ma2',
        texto: 'Desarrollo en código limpio y modular para facilitar ampliaciones futuras.',
        incluido: true,
      },
      {
        id: 'ma3',
        texto: 'Despliegue en la infraestructura acordada con certificado SSL.',
        incluido: true,
      },
      {
        id: 'ma4',
        texto: 'Capacitación presencial/virtual al equipo de trabajo y 30 días de garantía.',
        incluido: true,
      },
    ],
    plazoEstimado: '4 a 6 semanas hábiles',
    formaPago:
      '50% de anticipo inicial, 30% a la entrega del prototipo funcional y 20% al despliegue final.',
  },
}

/** Detecta la plantilla más adecuada según el nombre, descripción y etiquetas del proyecto. */
export function detectarPlantillaSugerida(proyecto: Proyecto, tags: string[] = []): string {
  const texto = `${proyecto.nombre} ${proyecto.descripcion ?? ''} ${tags.join(' ')}`.toLowerCase()

  if (
    texto.includes('cita') ||
    texto.includes('agenda') ||
    texto.includes('psicolog') ||
    texto.includes('medic') ||
    texto.includes('doctor') ||
    texto.includes('reserva')
  ) {
    return 'citas'
  }
  if (
    texto.includes('tienda') ||
    texto.includes('shop') ||
    texto.includes('ecommerce') ||
    texto.includes('e-commerce') ||
    texto.includes('producto') ||
    texto.includes('carrito')
  ) {
    return 'ecommerce'
  }
  if (
    texto.includes('erp') ||
    texto.includes('administrativ') ||
    texto.includes('gestion') ||
    texto.includes('inventario') ||
    texto.includes('factura')
  ) {
    return 'erp'
  }
  if (
    texto.includes('app') ||
    texto.includes('movil') ||
    texto.includes('móvil') ||
    texto.includes('android') ||
    texto.includes('ios')
  ) {
    return 'app_movil'
  }
  if (
    texto.includes('saas') ||
    texto.includes('multi-tenant') ||
    texto.includes('inquilino') ||
    texto.includes('suscrip')
  ) {
    return 'saas'
  }
  if (
    texto.includes('landing') ||
    texto.includes('pagina') ||
    texto.includes('página') ||
    texto.includes('web') ||
    texto.includes('sitio')
  ) {
    return 'landing'
  }
  if (
    texto.includes('api') ||
    texto.includes('backend') ||
    texto.includes('microservicio') ||
    texto.includes('servidor')
  ) {
    return 'api'
  }

  return 'citas'
}
