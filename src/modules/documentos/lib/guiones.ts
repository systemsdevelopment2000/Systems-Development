import type { TipoDesarrollo } from '@/core/datos'

/**
 * Guiones de entrevista para las reuniones con clientes.
 *
 * No son un cuestionario para leer de corrido: son el piso mínimo de lo que no
 * se puede salir de una reunión sin saber. Un colaborador nuevo que entra a una
 * reunión solo necesita poder guiarla sin dejar huecos que después cuestan
 * retrabajo o discusiones de alcance.
 */

export interface BloqueGuion {
  id: string
  titulo: string
  /**
   * Bloque de apuntes libres: en vez de preguntas, N renglones en blanco.
   * Sirve para la minuta que se usa solo para tomar nota.
   */
  renglones?: number
  /** Por qué se pregunta esto: ayuda a improvisar si la conversación se desvía. */
  proposito: string
  preguntas: string[]
}

export interface Guion {
  id: string
  nombre: string
  /** Cuándo se usa esta reunión. */
  cuando: string
  bloques: BloqueGuion[]
}

export const GUIONES: Guion[] = [
  {
    id: 'libre',
    nombre: 'Notas libres (sin preguntas)',
    cuando: 'Para anotar sin guion: la reunión ya tiene su propio rumbo.',
    bloques: [
      {
        id: 'apuntes',
        titulo: 'Apuntes',
        proposito: 'Espacio en blanco para escribir lo que surja.',
        preguntas: [],
        renglones: 16,
      },
    ],
  },
  {
    id: 'descubrimiento',
    nombre: 'Levantamiento inicial',
    cuando: 'Primera reunión. Todavía no hay propuesta ni precio.',
    bloques: [
      {
        id: 'negocio',
        titulo: 'El negocio',
        proposito: 'Saber con quién se trata y quién decide, antes de hablar de software.',
        preguntas: [
          '¿A qué se dedica la empresa y desde cuándo?',
          '¿Cuántas personas usarían el sistema y en qué cargos?',
          '¿Quién decide la compra y quién firma el contrato?',
          '¿Han contratado desarrollo antes? ¿Cómo les fue?',
        ],
      },
      {
        id: 'problema',
        titulo: 'El problema',
        proposito: 'Sin un dolor concreto y medible no hay proyecto, hay una lista de deseos.',
        preguntas: [
          '¿Qué están haciendo hoy y con qué herramienta?',
          '¿Qué parte del día les quita más tiempo?',
          '¿Qué errores se repiten y qué cuestan cuando pasan?',
          '¿Qué pasa si esto no se resuelve este año?',
        ],
      },
      {
        id: 'proceso',
        titulo: 'Cómo trabajan hoy',
        proposito: 'El proceso real casi nunca es el que describen: hay que verlo.',
        preguntas: [
          '¿Me pueden mostrar el proceso completo, de principio a fin?',
          '¿Dónde viven los datos hoy (cuaderno, Excel, otro sistema)?',
          '¿Qué formatos o planillas usan y quién los llena?',
          '¿Hay información vieja que deba migrarse? ¿Cuánta y en qué formato?',
        ],
      },
      {
        id: 'limites',
        titulo: 'Alcance y límites',
        proposito: 'Lo que queda fuera evita la discusión de "yo pensé que incluía".',
        preguntas: [
          'Si solo pudiéramos resolver una cosa, ¿cuál sería?',
          '¿Qué NO debe hacer el sistema?',
          '¿Qué puede esperar a una segunda etapa?',
        ],
      },
      {
        id: 'restricciones',
        titulo: 'Restricciones reales',
        proposito: 'Fecha, plata y equipos definen la solución tanto como los requisitos.',
        preguntas: [
          '¿Hay una fecha límite? ¿Por qué esa fecha?',
          '¿Tienen un rango de inversión en mente?',
          '¿Con qué equipos e internet cuentan? ¿Hay que trabajar sin conexión?',
          '¿Usarían el sistema desde el teléfono?',
        ],
      },
      {
        id: 'integraciones',
        titulo: 'Integraciones y terceros',
        proposito: 'Es lo que más se subestima al cotizar.',
        preguntas: [
          '¿Debe conectarse con facturación, banco o impresora fiscal?',
          '¿Necesitan avisos por WhatsApp o correo?',
          '¿Manejan varias monedas o tasa del día?',
          '¿Quién administra su dominio y su hosting?',
        ],
      },
      {
        id: 'cierre',
        titulo: 'Cierre de la reunión',
        proposito: 'Salir con el siguiente paso acordado, no con un "les aviso".',
        preguntas: [
          '¿Quién más debe ver la propuesta antes de decidir?',
          '¿Qué tendría que incluir para que sea un sí?',
          '¿Para cuándo quedamos en enviarla y cuándo la revisamos juntos?',
        ],
      },
    ],
  },
  {
    id: 'alcance',
    nombre: 'Definición de alcance',
    cuando: 'Ya hay interés. Se está armando el presupuesto y los módulos.',
    bloques: [
      {
        id: 'modulos',
        titulo: 'Módulos, uno por uno',
        proposito: 'Cada módulo confirmado es una línea del presupuesto y horas estimadas.',
        preguntas: [
          'De los módulos propuestos, ¿cuáles son imprescindibles para arrancar?',
          '¿Cuáles pueden entrar en una segunda entrega?',
          '¿Falta algo que no esté en la lista?',
        ],
      },
      {
        id: 'roles',
        titulo: 'Usuarios y permisos',
        proposito: 'Define el módulo de usuarios y buena parte de la seguridad.',
        preguntas: [
          '¿Qué perfiles de usuario existen?',
          '¿Qué puede ver y hacer cada perfil? ¿Qué no debe ver nadie más?',
          '¿Quién será el administrador del sistema?',
        ],
      },
      {
        id: 'reglas',
        titulo: 'Reglas del negocio',
        proposito: 'Son las validaciones que, si se descubren tarde, rompen el diseño.',
        preguntas: [
          '¿Qué validaciones no se pueden saltar nunca?',
          '¿Qué pasa cuando algo sale mal (anulación, devolución, error de carga)?',
          '¿Algo requiere aprobación de un superior antes de continuar?',
          '¿Hay numeraciones o correlativos que deban respetarse?',
        ],
      },
      {
        id: 'reportes',
        titulo: 'Reportes y salidas',
        proposito: 'Lo que el cliente imprime o entrega a un tercero es lo que más mira.',
        preguntas: [
          '¿Qué reportes necesitan y cada cuánto?',
          '¿Alguno se entrega a un tercero (banco, SENIAT, socio)?',
          '¿Deben llevar logo, firma o formato específico?',
        ],
      },
      {
        id: 'entrega',
        titulo: 'Entrega y pago',
        proposito: 'Alimenta directamente el plan de cobro del presupuesto.',
        preguntas: [
          '¿En cuántas entregas les sirve recibirlo?',
          '¿Cómo y en qué moneda pagarían cada parte?',
          '¿Qué tiene que estar listo para que aprueben una entrega?',
        ],
      },
    ],
  },
  {
    id: 'avance',
    nombre: 'Revisión de avance / demo',
    cuando: 'Proyecto en curso. Se muestra lo construido y se desbloquea lo pendiente.',
    bloques: [
      {
        id: 'mostrado',
        titulo: 'Lo que se mostró',
        proposito: 'Deja por escrito qué se vio, para que la conformidad no sea de palabra.',
        preguntas: [
          '¿Qué se presentó en esta sesión?',
          '¿Qué quedó aprobado tal cual?',
          '¿Qué hay que ajustar y con qué prioridad?',
        ],
      },
      {
        id: 'bloqueos',
        titulo: 'Qué falta del lado del cliente',
        proposito: 'La mayoría de los retrasos son insumos que el cliente no entregó.',
        preguntas: [
          '¿Qué datos, accesos o contenidos faltan de su parte?',
          '¿Quién los entrega y para cuándo?',
          '¿Hay alguien de su equipo que deba revisar antes?',
        ],
      },
      {
        id: 'cambios',
        titulo: 'Cambios pedidos',
        proposito: 'Separa el ajuste incluido del trabajo nuevo que se cotiza aparte.',
        preguntas: [
          '¿Este cambio estaba en el alcance acordado?',
          'Si es nuevo, ¿lo cotizamos aparte o entra en una segunda etapa?',
          '¿Afecta la fecha de entrega?',
        ],
      },
    ],
  },
  {
    id: 'entrega',
    nombre: 'Entrega y conformidad',
    cuando: 'Se entrega el sistema y se firma la conformidad.',
    bloques: [
      {
        id: 'conformidad',
        titulo: 'Conformidad',
        proposito: 'Es lo que cierra el proyecto y libera la última cuota.',
        preguntas: [
          '¿Se revisó cada módulo acordado?',
          '¿Queda algún pendiente menor? ¿Con qué fecha?',
          '¿Quién firma la conformidad?',
        ],
      },
      {
        id: 'traspaso',
        titulo: 'Traspaso',
        proposito: 'Lo que se entrega además del sistema, para que no vuelvan a pedirlo.',
        preguntas: [
          '¿Se entregaron credenciales, código y accesos?',
          '¿Se hizo la capacitación? ¿A quiénes?',
          '¿Quedó configurado el respaldo y quién lo supervisa?',
        ],
      },
      {
        id: 'garantia',
        titulo: 'Garantía y continuidad',
        proposito: 'Define qué se atiende gratis y qué abre un nuevo cobro.',
        preguntas: [
          '¿Qué cubre la garantía y por cuánto tiempo?',
          '¿Qué NO cubre (cambios nuevos, datos mal cargados, terceros)?',
          '¿Les interesa un plan de mantenimiento mensual?',
        ],
      },
    ],
  },
  {
    id: 'soporte',
    nombre: 'Mantenimiento y soporte',
    cuando: 'Sistema entregado. Revisión periódica del servicio contratado.',
    bloques: [
      {
        id: 'periodo',
        titulo: 'El período',
        proposito: 'Demuestra el valor del plan con hechos, no con sensaciones.',
        preguntas: [
          '¿Qué incidencias hubo y cómo se resolvieron?',
          '¿El sistema estuvo caído alguna vez? ¿Cuánto?',
          '¿Los tiempos de respuesta fueron los acordados?',
        ],
      },
      {
        id: 'mejoras',
        titulo: 'Mejoras y cambios',
        proposito: 'Es la fuente natural de nuevos presupuestos.',
        preguntas: [
          '¿Qué les está costando hoy que antes no?',
          '¿Qué cambiaron en el negocio que el sistema no refleja?',
          '¿Qué pedirían si no hubiera límite?',
        ],
      },
      {
        id: 'renovacion',
        titulo: 'Renovación',
        proposito: 'Se habla antes de que venza, no después.',
        preguntas: [
          '¿Renuevan el plan en las mismas condiciones?',
          '¿Hay servicios por vencer (dominio, hosting, licencias)?',
        ],
      },
    ],
  },
]

/**
 * Preguntas extra según el tipo de producto. Se suman al guion elegido porque
 * son las que suelen olvidarse y después aparecen como "eso no estaba".
 */
export const PREGUNTAS_POR_TIPO: Partial<Record<TipoDesarrollo, string[]>> = {
  erp: [
    '¿Manejan inventario? ¿Por lote, serial o vencimiento?',
    '¿Cuántas sucursales o depósitos?',
    '¿El costo se calcula por promedio, último o FIFO?',
    '¿Necesitan cierre contable o solo operativo?',
  ],
  ecommerce: [
    '¿Quién carga y actualiza los productos?',
    '¿Cómo cobran: pasarela, pago móvil, transferencia manual?',
    '¿Cómo calculan el envío y con qué empresa?',
    '¿Qué pasa con un pedido sin stock?',
  ],
  landing: [
    '¿Cuál es la acción que debe lograr la página?',
    '¿Quién entrega los textos y las fotos?',
    '¿A dónde deben llegar los contactos?',
    '¿Tienen manual de marca o hay que crearlo?',
  ],
  web: [
    '¿Quién actualizará el contenido después de entregado?',
    '¿Necesitan blog, catálogo o solo informativo?',
    '¿Tienen dominio y hosting, o los gestionamos nosotros?',
  ],
  app_movil: [
    '¿Android, iOS o ambos?',
    '¿Debe funcionar sin internet?',
    '¿Necesita cámara, GPS o notificaciones?',
    '¿Quién paga y administra las cuentas de las tiendas?',
  ],
  saas: [
    '¿Cada cliente ve solo sus datos o comparten información?',
    '¿Cómo se cobra: por usuario, por uso o plan fijo?',
    '¿Hay prueba gratis? ¿De cuánto tiempo?',
    '¿Quién da de alta a un cliente nuevo: ustedes o él solo?',
  ],
  a_medida: [
    '¿Hay un sistema existente que deba convivir con este?',
    '¿Qué parte del proceso es la más delicada si falla?',
    '¿Existe alguna norma o auditoría que deba cumplirse?',
  ],
}

export function guionDe(id: string): Guion {
  return GUIONES.find((g) => g.id === id) ?? GUIONES[0]
}
