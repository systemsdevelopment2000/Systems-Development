import type { Cliente, Proyecto } from '@/core/datos'

export interface DatosMensaje {
  proyecto: Proyecto
  cliente?: Cliente
  estadoNombre?: string
}

export interface PlantillaWA {
  id: string
  nombre: string
  construir: (d: DatosMensaje) => string
}

function primerNombre(n?: string) {
  return n ? n.split(' ')[0] : ''
}
function saludo(c?: Cliente) {
  const n = primerNombre(c?.nombre)
  return `Hola${n ? ` ${n}` : ''} 👋`
}

/** Plantillas de WhatsApp (formato *negrita*, _cursiva_, viñetas, emoji de tema). */
export const PLANTILLAS: PlantillaWA[] = [
  {
    id: 'bienvenida',
    nombre: 'Bienvenida / Propuesta',
    construir: (d) =>
      `${saludo(d.cliente)}

Soy del equipo de *Systems Development*. Te escribo por el proyecto *${d.proyecto.nombre}*.

Te enviamos la propuesta con el alcance y la inversión. Cuando la revises me dices y arrancamos.

¿Quedó clara o te explico algún punto?`,
  },
  {
    id: 'avance',
    nombre: 'Avance',
    construir: (d) =>
      `*Avance · ${d.proyecto.nombre}* 📊

Vamos en *${d.proyecto.progreso}%*${d.estadoNombre ? ` (${d.estadoNombre})` : ''}.

• Lo hecho esta semana: _…_
• Lo que sigue: _…_

Cualquier duda, por aquí estoy.`,
  },
  {
    id: 'pago',
    nombre: 'Recordatorio de pago',
    construir: (d) =>
      `${saludo(d.cliente)}

Te recuerdo el pago pendiente del proyecto *${d.proyecto.nombre}*${
        d.proyecto.medioPago ? ` por *${d.proyecto.medioPago}*` : ''
      }.

Cuando lo tengas, me pasas el comprobante y seguimos. ¡Gracias! 🙌`,
  },
  {
    id: 'entrega',
    nombre: 'Entrega',
    construir: (d) =>
      `${saludo(d.cliente)}

¡Buenas noticias! El proyecto *${d.proyecto.nombre}* está listo para entrega ✅.

Coordinamos una llamada para mostrártelo y cerrar los detalles. ¿Qué día te viene bien?`,
  },
  {
    id: 'reunion',
    nombre: 'Agendar reunión',
    construir: (d) =>
      `${saludo(d.cliente)}

Quiero agendar una reunión corta por el proyecto *${d.proyecto.nombre}* para revisar avances y dudas.

¿Te viene bien esta semana? Pásame un día y una hora y lo cuadro. 🗓️`,
  },
]

/** Normaliza un teléfono venezolano a formato internacional para wa.me. */
export function telefonoWa(tel?: string): string | undefined {
  if (!tel) return undefined
  const limpio = tel.replace(/\D/g, '')
  if (!limpio) return undefined
  if (limpio.startsWith('58')) return limpio
  if (limpio.startsWith('0')) return '58' + limpio.slice(1)
  return limpio
}
