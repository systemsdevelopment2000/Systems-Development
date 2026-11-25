import type { MetodologiaTrabajo, TipoMetodologia } from '@/core/datos/tipos'
import { nuevoId } from '@/core/datos'

export interface PlantillaMetodologiaDef {
  titulo: string
  subtitulo: string
  tipo: TipoMetodologia
  descripcion: string
  objetivo: string
  alcance: string
  mostrarLogoSD: boolean
  fases: {
    nombre: string
    descripcion: string
    entregables: string[]
    roles: string[]
    herramientas: string[]
    duracionEstimada: string
  }[]
  principios: string[]
  version: string
}

export const PLANTILLAS_PREDEFINIDAS: PlantillaMetodologiaDef[] = [
  {
    titulo: 'Metodología Ágil SD — Desarrollo y Despliegue de Software',
    subtitulo: 'Marco iterativo de ingeniería de software con validación de ciclo completo',
    tipo: 'desarrollo',
    descripcion:
      'Metodología oficial de Systems Development orientada a la construcción ágil, modular y escalable de aplicaciones empresariales. Integra levantamiento de requisitos, arquitectura de base de datos con RLS, ciclos de desarrollo frontend y backend, aseguramiento de calidad y despliegue automatizado con verificación obligatoria en servidor Droplet.',
    objetivo:
      'Garantizar la entrega de software robusto, seguro y de alto impacto operacional, minimizando riesgos y acelerando el tiempo de puesta en producción con cero defectos críticos.',
    alcance:
      'Aplica a todos los proyectos de desarrollo de software, plataformas web, paneles administrativos y sistemas de gestión a la medida construidos por Systems Development para sus clientes corporativos.',
    mostrarLogoSD: true,
    version: '2.0',
    principios: [
      'Entrega continua de valor operacional verificable para el cliente.',
      'Arquitectura modular con TypeScript estricto, React y Supabase con RLS.',
      'Bóveda centralizada de accesos y credenciales con estricta confidencialidad.',
      'Validación obligatoria de compilación limpia y despliegue exitoso en Droplet.',
      'Transparencia total mediante auditoría y trazabilidad en cada fase.',
    ],
    fases: [
      {
        nombre: '1. Levantamiento & Especificación Técnica',
        descripcion:
          'Entrevistas con stakeholders, levantamiento de requerimientos de negocio, historias de usuario y matriz de alcance.',
        entregables: [
          'Documento de Requerimientos Funcionales y No Funcionales',
          'Matriz de Casos de Uso y Flujos de Usuario',
          'Cronograma inicial de entregas y estimación de fases',
        ],
        roles: ['Project Manager', 'Líder Técnico', 'Cliente Stakeholder'],
        herramientas: ['Reuniones SD', 'Google Docs', 'Buscador Global'],
        duracionEstimada: '1 a 2 semanas',
      },
      {
        nombre: '2. Arquitectura de Datos & Seguridad (RLS)',
        descripcion:
          'Diseño entidad-relación, esquemas relacionales en PostgreSQL/Supabase, políticas de seguridad por fila (RLS) y bóveda de accesos.',
        entregables: [
          'Diagrama Entidad-Relación y Migraciones SQL versionadas',
          'Políticas RLS activas para roles authenticated y anon',
          'Bóveda de credenciales asegurada en Herramientas',
        ],
        roles: ['Arquitecto de Software', 'Database Administrator'],
        herramientas: ['Supabase', 'PostgreSQL', 'Módulo Herramientas SD'],
        duracionEstimada: '1 semana',
      },
      {
        nombre: '3. Desarrollo Modular (Frontend & Backend)',
        descripcion:
          'Implementación iterativa de componentes UI reactivos, lógica de negocio centralizada, sincronización en tiempo real y persistencia local.',
        entregables: [
          'Módulos operativos integrados al menú de navegación',
          'Sincronización bidireccional en tiempo real con Supabase',
          'Diseño adaptable a escritorio, tablet y smartphone',
        ],
        roles: ['Frontend Developer', 'Backend Developer', 'UI/UX Designer'],
        herramientas: ['React 19', 'TypeScript', 'Vite', 'Lucide Icons'],
        duracionEstimada: '2 a 6 semanas (por sprints)',
      },
      {
        nombre: '4. Aseguramiento de Calidad (QA) & Pruebas',
        descripcion:
          'Validación exhaustiva de compilación limpia (tsc -b), suite de pruebas, verificación de integridad de datos y auditoría de seguridad.',
        entregables: [
          'Informe de pruebas y verificación de tipos TypeScript sin errores',
          'Validación de persistencia y protección contra pérdidas de datos',
          'Aprobación formal del entorno de pruebas',
        ],
        roles: ['QA Specialist', 'Líder Técnico'],
        herramientas: ['TypeScript Compiler', 'Audit Logger', 'Pruebas E2E'],
        duracionEstimada: '1 semana',
      },
      {
        nombre: '5. Despliegue en Droplet & Publicación Producción',
        descripcion:
          'Integración continua vía Git, compilación en pipeline, sincronización al servidor Droplet en la nube y verificación de respuesta de endpoints.',
        entregables: [
          'Commit y Push limpio a origin/main en GitHub',
          'Publicación exitosa en servidor Droplet (DigitalOcean)',
          'Verificación activa de versión pública (version.json) y certificados SSL',
        ],
        roles: ['DevOps Engineer', 'Líder Técnico'],
        herramientas: ['DigitalOcean Droplet', 'Git', 'Vercel', 'curl.exe'],
        duracionEstimada: '1 a 2 días',
      },
      {
        nombre: '6. Capacitación, Soporte & Mantenimiento',
        descripcion:
          'Inducción de usuarios finales, entrega de manuales o credenciales, monitoreo de rendimiento y servicio de soporte técnico continuo.',
        entregables: [
          'Sesión de inducción técnica para el equipo del cliente',
          'Entrega formal de credenciales y accesos de herramientas',
          'Canal de soporte y resolución de incidencias activo',
        ],
        roles: ['Project Manager', 'Soporte Técnico SD', 'Equipo del Cliente'],
        herramientas: ['Módulo de Herramientas & Accesos', 'Reuniones SD'],
        duracionEstimada: 'Continuo',
      },
    ],
  },
  {
    titulo: 'Metodología de Soporte e Infraestructura Operacional',
    subtitulo: 'Protocolo de mantenimiento preventivo, gestión de incidencias y uptime de servidores',
    tipo: 'soporte',
    descripcion:
      'Protocolo estandarizado de Systems Development para garantizar la disponibilidad continua, seguridad y rendimiento óptimo de las plataformas, servidores Droplet y bases de datos contratadas por clientes.',
    objetivo:
      'Mantener un uptime superior al 99.5% y dar respuesta a cualquier incidencia técnica con un tiempo de resolución acorde a SLAs empresariales.',
    alcance:
      'Aplica al monitoreo mensual de pagos de servidores (DigitalOcean, Supabase, Vercel), parches de seguridad, optimización de consultas SQL y respaldos.',
    mostrarLogoSD: true,
    version: '1.5',
    principios: [
      'Prevención proactiva antes que corrección reactiva.',
      'Control riguroso de fechas de vencimiento de herramientas y hosting.',
      'Respaldos periódicos de bases de datos antes de cualquier cambio crítico.',
      'Registro transparente de cada intervención en la bitácora del sistema.',
    ],
    fases: [
      {
        nombre: '1. Monitoreo & Control de Fechas de Pago',
        descripcion:
          'Supervisión continua de servicios de infraestructura (Droplet, dominios, Supabase) para evitar suspensiones de servicio.',
        entregables: [
          'Alertas preventivas de cobro registradas en Herramientas SD',
          'Pagos procesados y conciliados antes de la fecha límite',
        ],
        roles: ['Administrador de Infraestructura', 'Finanzas SD'],
        herramientas: ['Módulo Herramientas SD', 'DigitalOcean Panel'],
        duracionEstimada: 'Ciclo mensual programado',
      },
      {
        nombre: '2. Diagnóstico & Detección de Incidencias',
        descripcion:
          'Recepción del reporte del cliente o detección por monitoreo de logs, clasificación de severidad y aislamiento de la causa raíz.',
        entregables: [
          'Ticket de incidencia con clasificación de severidad',
          'Diagnóstico técnico preliminar',
        ],
        roles: ['Soporte Técnico SD', 'Líder Técnico'],
        herramientas: ['Logs de Servidor Droplet', 'Consola del Sistema'],
        duracionEstimada: '1 a 4 horas (según severidad)',
      },
      {
        nombre: '3. Aplicación de Hotfix y Verificación en Servidor',
        descripcion:
          'Corrección puntual del código o configuración, verificación de no regresión y despliegue al servidor con comprobación directa.',
        entregables: [
          'Parche de código comiteado y documentado',
          'Validación de respuesta 200 OK y version.json actualizado',
        ],
        roles: ['DevOps / Developer', 'Líder Técnico'],
        herramientas: ['Git', 'curl.exe', 'Droplet SSH'],
        duracionEstimada: '2 a 12 horas',
      },
      {
        nombre: '4. Cierre de Incidencia & Notificación al Cliente',
        descripcion:
          'Confirmación de resolución con el cliente, reporte de lecciones aprendidas y actualización de documentación si procede.',
        entregables: [
          'Notificación formal de resolución al cliente',
          'Actualización de bitácora y auditoría de la plataforma',
        ],
        roles: ['Project Manager', 'Cliente'],
        herramientas: ['Auditoría SD', 'Correo / WhatsApp'],
        duracionEstimada: 'Mismo día de resolución',
      },
    ],
  },
  {
    titulo: 'Metodología de Auditoría y Certificación de Calidad de Software',
    subtitulo: 'Inspección técnica integral de seguridad, código y arquitectura de datos',
    tipo: 'qa',
    descripcion:
      'Marco de trabajo especializado para auditar sistemas en producción: evaluación de políticas RLS, revisión de secretos y bóvedas de contraseñas, análisis estático de tipos y pruebas de carga.',
    objetivo:
      'Emitir un diagnóstico imparcial de la salud técnica de la solución y garantizar el cumplimiento de los estándares de Systems Development.',
    alcance:
      'Aplicable a auditorías previas a entregas finales, revisiones semestrales de seguridad o certificaciones de código para terceros.',
    mostrarLogoSD: true,
    version: '1.2',
    principios: [
      'Seguridad por defecto en cada capa del sistema.',
      'Cero credenciales sensibles expuestas en el código fuente.',
      'Persistencia de datos verificada ante desconexión o reinicio.',
      'Reporte ejecutivo claro con plan de remediación priorizado.',
    ],
    fases: [
      {
        nombre: '1. Auditoría de Seguridad & Bóveda de Accesos',
        descripcion:
          'Revisión de variables de entorno, políticas de base de datos Supabase RLS y almacenamiento seguro de contraseñas de clientes.',
        entregables: [
          'Matriz de revisión de políticas RLS por tabla',
          'Informe de credenciales vulnerables o expuestas',
        ],
        roles: ['Security Auditor', 'Database Administrator'],
        herramientas: ['Herramientas Bóveda', 'Supabase SQL Studio'],
        duracionEstimada: '3 a 5 días',
      },
      {
        nombre: '2. Análisis de Código & Compilación Estricta',
        descripcion:
          'Evaluación de código fuente con linter estricto, verificación de tipos TypeScript sin errores (tsc -b) y dependencias sin vulnerabilidades.',
        entregables: [
          'Reporte de análisis estático con cero errores de compilación',
          'Informe de dependencias obsoletas o riesgosas',
        ],
        roles: ['Code Reviewer', 'Líder Técnico'],
        herramientas: ['TypeScript', 'ESLint', 'npm audit'],
        duracionEstimada: '2 a 3 días',
      },
      {
        nombre: '3. Certificación & Emisión de Dictamen Formal',
        descripcion:
          'Generación del informe final con membrete oficial Systems Development, nivel de cumplimiento alcanzado y recomendaciones de optimización.',
        entregables: [
          'Dictamen Oficial de Auditoría en formato PDF membretado',
          'Plan de acción y mejoras recomendadas',
        ],
        roles: ['Director de Tecnología SD', 'Cliente'],
        herramientas: ['Exportador PDF SD', 'Módulo Metodología'],
        duracionEstimada: '2 días',
      },
    ],
  },
]

export function crearMetodologiaDesdePlantilla(
  plantilla: PlantillaMetodologiaDef,
  codigo?: string,
): MetodologiaTrabajo {
  return {
    id: nuevoId(),
    codigo: codigo ?? 'MET-001',
    titulo: plantilla.titulo,
    subtitulo: plantilla.subtitulo,
    tipo: plantilla.tipo,
    descripcion: plantilla.descripcion,
    objetivo: plantilla.objetivo,
    alcance: plantilla.alcance,
    mostrarLogoSD: plantilla.mostrarLogoSD,
    fases: plantilla.fases.map((f) => ({
      id: nuevoId(),
      nombre: f.nombre,
      descripcion: f.descripcion,
      entregables: [...f.entregables],
      roles: [...f.roles],
      herramientas: [...f.herramientas],
      duracionEstimada: f.duracionEstimada,
    })),
    imagenes: [],
    principios: [...plantilla.principios],
    version: plantilla.version,
    activa: true,
    creadoEn: new Date().toISOString(),
  }
}
