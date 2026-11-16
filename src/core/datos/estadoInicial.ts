import type { EstadoDatos } from './tipos'

/** Genera un id único (uuid si está disponible). */
export function nuevoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'id_' + Math.random().toString(36).slice(2, 10)
}

/** Catálogo de estados de proyecto (flujo completo confirmado). */
const ESTADOS_PROYECTO = [
  { id: 'prospecto', nombre: 'Prospecto', orden: 1, color: '#89898a', esFinal: false },
  { id: 'propuesta', nombre: 'Propuesta', orden: 2, color: '#38bdf8', esFinal: false },
  { id: 'aprobado', nombre: 'Aprobado', orden: 3, color: '#025ff5', esFinal: false },
  { id: 'en_curso', nombre: 'En curso', orden: 4, color: '#05e4fd', esFinal: false },
  { id: 'revision', nombre: 'En revisión', orden: 5, color: '#8b5cf6', esFinal: false },
  { id: 'entregado', nombre: 'Entregado', orden: 6, color: '#2dd4bf', esFinal: false },
  { id: 'cerrado', nombre: 'Cerrado', orden: 7, color: '#22c55e', esFinal: true },
  { id: 'pausado', nombre: 'Pausado', orden: 8, color: '#e0b252', esFinal: false },
  { id: 'cancelado', nombre: 'Cancelado', orden: 9, color: '#ef4444', esFinal: true },
]

export function estadoInicial(): EstadoDatos {
  return {
    empresa: {
      nombre: 'Systems Development',
      telefonos: '0414-8983663 / 0412-4249441',
      ubicacion: 'Puerto Ordaz, Bolívar',
      correo: 'systemsdevelopment2000@gmail.com',
      logo: '/logo-sd.png',
      // Vacío a propósito: se arma solo con nombre, ubicación y correo.
      pie: '',
      unidades: [
        'módulo',
        'componente',
        'característica',
        'global',
        'h',
        'día',
        'mes',
        'año',
        'und',
        'sesión',
        'licencia',
      ],
      hojaPendientes: {
        firmaIzquierda: 'Asigna por SD',
        firmaDerecha: 'Recibe / responsable',
        nota: 'El orden indica la secuencia de realización esperada. Una tarea marcada como pendiente de aprobación no avanza de estado hasta recibir el visto bueno.',
      },
      finanzas: {
        tarifaHora: 12,
        moneda: 'USD',
        margen: 35,
        indirectos: 10,
        descuento: 0,
      },
    },
    tasas: {},
    presupuestos: {},
    pagos: {},
    clientes: {},
    colaboradores: {
      admin: {
        id: 'admin',
        nombre: 'Systems Development',
        titulo: 'Administrador',
        rol: 'Administrador',
        contacto: { correo: 'systemsdevelopment2000@gmail.com' },
        activo: true,
        esUsuario: true,
        rolSistema: 'admin',
        creadoEn: '2026-11-15',
      },
    },
    proyectos: {},
    estadosProyecto: ESTADOS_PROYECTO,
    tags: {},
    asignaciones: {},
    actividades: {},
    mensajes: {},
    reuniones: {},
    hechos: {},
    auditoria: {},
    candidatos: {},
    plantillasEntrevista: {},
    herramientas: {},
    evalColaborador: {},
    evalCliente: {},
  }
}
