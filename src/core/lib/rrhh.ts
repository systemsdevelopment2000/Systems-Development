import type {
  Candidato,
  CriterioEntrevista,
  EstadoCandidato,
  PlantillaEntrevista,
} from '@/core/datos'

/**
 * Recursos humanos: plantillas de entrevista y evaluación de candidatos.
 *
 * El objetivo no es un ATS: es que dos personas de SD entrevisten parecido y
 * que lo conversado quede escrito. Por eso cada criterio trae qué se está
 * midiendo — sin eso, un "4 en comunicación" no significa lo mismo para dos
 * entrevistadores distintos.
 */

export const ESTADOS_CANDIDATO: { valor: EstadoCandidato; etiqueta: string; color: string }[] = [
  { valor: 'recibido', etiqueta: 'Recibido', color: '#89898a' },
  { valor: 'preseleccion', etiqueta: 'Preselección', color: '#b9b8ba' },
  { valor: 'entrevista', etiqueta: 'Entrevista', color: '#05e4fd' },
  { valor: 'prueba', etiqueta: 'Prueba técnica', color: '#025ff5' },
  { valor: 'oferta', etiqueta: 'Oferta', color: '#8b5cf6' },
  { valor: 'contratado', etiqueta: 'Contratado', color: '#22c55e' },
  { valor: 'descartado', etiqueta: 'Descartado', color: '#ef4444' },
]

/** Escala de puntuación, con su significado. Evita el "4 porque sí". */
export const ESCALA = [
  { valor: 1, etiqueta: 'No cumple', detalle: 'No alcanza lo mínimo para el cargo' },
  { valor: 2, etiqueta: 'Por debajo', detalle: 'Le falta; necesitaría acompañamiento constante' },
  { valor: 3, etiqueta: 'Cumple', detalle: 'Hace el trabajo con supervisión normal' },
  { valor: 4, etiqueta: 'Por encima', detalle: 'Resuelve solo y aporta criterio' },
  { valor: 5, etiqueta: 'Destaca', detalle: 'Puede marcar la pauta y enseñar al resto' },
]

function id(n: string): string {
  return n
}

/** Criterios que se evalúan en cualquier cargo de SD. */
const CRITERIOS_COMUNES: CriterioEntrevista[] = [
  {
    id: id('comunicacion'),
    nombre: 'Comunicación',
    descripcion: 'Explica lo que hizo de forma que se entienda, sin adornar',
    peso: 1,
  },
  {
    id: id('responsabilidad'),
    nombre: 'Responsabilidad',
    descripcion: 'Cumple lo que promete y avisa a tiempo cuando no va a poder',
    peso: 1.5,
  },
  {
    id: id('aprendizaje'),
    nombre: 'Capacidad de aprender',
    descripcion: 'Ha aprendido algo difícil por su cuenta y puede contar cómo',
    peso: 1.5,
  },
  {
    id: id('trato'),
    nombre: 'Trato con el cliente',
    descripcion: 'Sabría pararse frente a un cliente molesto sin empeorarlo',
    peso: 1,
  },
]

/** Plantillas de fábrica. Son editables: están para no arrancar en blanco. */
export function plantillasBase(): Record<string, PlantillaEntrevista> {
  const hoy = new Date().toISOString()

  const plantillas: PlantillaEntrevista[] = [
    {
      id: 'pe-desarrollo',
      nombre: 'Entrevista técnica · Desarrollo',
      cargo: 'Desarrollador',
      descripcion: 'Para perfiles de programación, junior o semi senior.',
      creadoEn: hoy,
      bloques: [
        {
          id: 'trayecto',
          titulo: 'Trayectoria',
          preguntas: [
            '¿Qué has construido que te enorgullezca? Cuéntame qué hacía.',
            '¿Qué parte de ese proyecto hiciste tú y qué hizo el resto?',
            '¿Con qué tecnologías trabajas hoy y cuáles has dejado?',
            '¿Estudias o trabajas actualmente? ¿Qué horario tienes disponible?',
          ],
        },
        {
          id: 'tecnico',
          titulo: 'Criterio técnico',
          preguntas: [
            'Cuéntame un error tuyo que haya llegado a producción. ¿Qué pasó y qué hiciste?',
            '¿Cómo decides si algo está listo para entregarse?',
            'Si recibes un sistema de otro y no entiendes el código, ¿cómo procedes?',
            '¿Qué haces cuando un requerimiento del cliente te parece una mala idea?',
          ],
        },
        {
          id: 'equipo',
          titulo: 'Trabajo en equipo',
          preguntas: [
            '¿Has trabajado con alguien con quien te costara entenderte? ¿Cómo lo resolviste?',
            '¿Prefieres que te digan qué hacer o que te den el problema?',
            '¿Cómo pides ayuda cuando estás trancado?',
          ],
        },
        {
          id: 'cierre',
          titulo: 'Cierre',
          preguntas: [
            '¿Qué esperas de este trabajo que no hayas tenido antes?',
            '¿Cuál es tu pretensión salarial?',
            '¿Desde cuándo podrías empezar?',
            '¿Qué dudas tienes sobre nosotros?',
          ],
        },
      ],
      criterios: [
        ...CRITERIOS_COMUNES,
        {
          id: id('tecnica'),
          nombre: 'Solidez técnica',
          descripcion: 'Entiende lo que escribe; no solo copia y pega',
          peso: 2,
        },
        {
          id: id('autonomia'),
          nombre: 'Autonomía',
          descripcion: 'Puede avanzar con un requerimiento incompleto sin bloquearse',
          peso: 1.5,
        },
      ],
    },
    {
      id: 'pe-comercial',
      nombre: 'Entrevista · Comercial',
      cargo: 'Ventas / Comercial',
      descripcion: 'Para quien va a buscar y atender clientes.',
      creadoEn: hoy,
      bloques: [
        {
          id: 'experiencia',
          titulo: 'Experiencia',
          preguntas: [
            '¿Qué has vendido antes y a quién?',
            'Cuéntame una venta que se te cayó. ¿Por qué fue?',
            '¿Cómo consigues un primer contacto con alguien que no te conoce?',
          ],
        },
        {
          id: 'situaciones',
          titulo: 'Situaciones',
          preguntas: [
            'Un cliente dice que estamos caros. ¿Qué respondes?',
            'Un cliente pide algo que sabemos que no le conviene. ¿Qué haces?',
            'Un proyecto se atrasó por nuestra culpa y el cliente está molesto. ¿Cómo lo manejas?',
          ],
        },
        {
          id: 'cierre',
          titulo: 'Cierre',
          preguntas: [
            '¿Cómo te gusta que te paguen: fijo, comisión o mixto?',
            '¿Cuál es tu pretensión?',
            '¿Desde cuándo podrías empezar?',
          ],
        },
      ],
      criterios: [
        ...CRITERIOS_COMUNES,
        {
          id: id('escucha'),
          nombre: 'Escucha',
          descripcion: 'Pregunta antes de ofrecer; no vende por encima del problema',
          peso: 2,
        },
        {
          id: id('persistencia'),
          nombre: 'Persistencia',
          descripcion: 'Da seguimiento sin volverse molesto',
          peso: 1.5,
        },
      ],
    },
    {
      id: 'pe-general',
      nombre: 'Entrevista general',
      cargo: 'Cualquier cargo',
      descripcion: 'Base mínima cuando el cargo no encaja en las otras plantillas.',
      creadoEn: hoy,
      bloques: [
        {
          id: 'persona',
          titulo: 'La persona',
          preguntas: [
            'Cuéntame de ti, en lo laboral.',
            '¿Por qué dejaste tu último trabajo?',
            '¿Qué sabes de Systems Development?',
          ],
        },
        {
          id: 'trabajo',
          titulo: 'Forma de trabajar',
          preguntas: [
            'Descríbeme un día tuyo de trabajo típico.',
            '¿Qué te saca de quicio en un trabajo?',
            '¿Cómo organizas lo que tienes que hacer?',
          ],
        },
        {
          id: 'condiciones',
          titulo: 'Condiciones',
          preguntas: [
            '¿Pretensión salarial?',
            '¿Disponibilidad de horario y de traslado?',
            '¿Desde cuándo podrías empezar?',
          ],
        },
      ],
      criterios: CRITERIOS_COMUNES,
    },
  ]

  return Object.fromEntries(plantillas.map((p) => [p.id, p]))
}

export interface ResultadoEvaluacion {
  /** Nota ponderada de 1 a 5, o null si no se puntuó nada. */
  nota: number | null
  /** Cuántos criterios se puntuaron de los que tiene la plantilla. */
  evaluados: number
  total: number
}

/** Nota final: promedio ponderado por el peso de cada criterio. */
export function evaluar(
  candidato: Candidato,
  plantilla: PlantillaEntrevista | undefined,
): ResultadoEvaluacion {
  const criterios = plantilla?.criterios ?? []
  const puntajes = candidato.puntajes ?? []

  let suma = 0
  let pesos = 0
  let evaluados = 0

  for (const c of criterios) {
    const p = puntajes.find((x) => x.criterioId === c.id)
    if (!p || !p.valor) continue
    suma += p.valor * c.peso
    pesos += c.peso
    evaluados++
  }

  return {
    nota: pesos ? Math.round((suma / pesos) * 10) / 10 : null,
    evaluados,
    total: criterios.length,
  }
}

/** Lectura de la nota, para no dejar el número solo. */
export function lecturaNota(nota: number | null): string {
  if (nota === null) return 'Sin evaluar'
  if (nota >= 4.5) return 'Destaca'
  if (nota >= 3.5) return 'Por encima de lo pedido'
  if (nota >= 2.8) return 'Cumple'
  if (nota >= 2) return 'Por debajo'
  return 'No cumple'
}
