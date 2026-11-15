/**
 * Motor de sonido de SD. Sintetiza los efectos con Web Audio (sin archivos):
 * cada acción tiene un timbre propio y un carácter metálico/anguloso acorde a
 * la identidad (monograma metálico + naranja), en vez de pitidos genéricos.
 */

export type SonidoNombre =
  | 'tap' // pulsación genérica
  | 'abrir' // abrir panel/modal
  | 'cerrar' // cerrar panel/modal
  | 'exito' // guardar / crear
  | 'error' // validación fallida
  | 'eliminar' // acción destructiva
  | 'copiar' // copiar al portapapeles
  | 'aviso' // notificación / recordatorio
  | 'mover' // tomar una tarjeta
  | 'soltar' // soltar una tarjeta

const CLAVE = 'sd:sonido'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let activo = leerPreferencia()

function leerPreferencia(): boolean {
  try {
    return localStorage.getItem(CLAVE) !== '0'
  } catch {
    return true
  }
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!ctx) {
      const AC: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
      master = ctx.createGain()
      master.gain.value = 0.22
      master.connect(ctx.destination)
    }
    // El navegador exige un gesto del usuario para arrancar el audio.
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

interface Tono {
  /** Frecuencia inicial (Hz). */
  f: number
  tipo?: OscillatorType
  /** Retardo desde ahora (s). */
  inicio?: number
  dur?: number
  vol?: number
  /** Si se indica, hace glissando hasta esta frecuencia. */
  f2?: number
  /** Índice de FM inarmónica: da el brillo metálico (0 = puro). */
  metal?: number
}

function tono(c: AudioContext, destino: AudioNode, t: Tono) {
  const t0 = c.currentTime + (t.inicio ?? 0)
  const dur = t.dur ?? 0.08
  const vol = t.vol ?? 0.3

  const osc = c.createOscillator()
  osc.type = t.tipo ?? 'triangle'
  osc.frequency.setValueAtTime(t.f, t0)
  if (t.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(40, t.f2), t0 + dur)

  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.linearRampToValueAtTime(vol, t0 + 0.006) // ataque seco
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur) // caída corta

  // Modulador inarmónico → timbre metálico (como el monograma del logo).
  if (t.metal) {
    const mod = c.createOscillator()
    mod.type = 'square'
    mod.frequency.setValueAtTime(t.f * 2.37, t0)
    const mg = c.createGain()
    mg.gain.setValueAtTime(t.f * t.metal, t0)
    mg.gain.exponentialRampToValueAtTime(1, t0 + dur)
    mod.connect(mg)
    mg.connect(osc.frequency)
    mod.start(t0)
    mod.stop(t0 + dur + 0.02)
  }

  osc.connect(g)
  g.connect(destino)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

type Receta = (c: AudioContext, d: AudioNode) => void

const RECETAS: Record<SonidoNombre, Receta> = {
  // Tick seco y muy breve: acompaña sin molestar.
  tap: (c, d) => tono(c, d, { f: 1760, dur: 0.035, vol: 0.16 }),

  // Apertura: intervalo ascendente con brillo metálico.
  abrir: (c, d) => tono(c, d, { f: 523, f2: 784, dur: 0.11, vol: 0.26, metal: 0.4 }),

  // Cierre: el mismo gesto, invertido.
  cerrar: (c, d) => tono(c, d, { f: 784, f2: 466, dur: 0.1, vol: 0.22 }),

  // Éxito: arpegio de tres notas, firma sonora de SD.
  exito: (c, d) => {
    tono(c, d, { f: 587, dur: 0.09, vol: 0.26, metal: 0.6 })
    tono(c, d, { f: 880, inicio: 0.07, dur: 0.1, vol: 0.26, metal: 0.6 })
    tono(c, d, { f: 1175, inicio: 0.14, dur: 0.2, vol: 0.24, metal: 0.8 })
  },

  // Error: dos cuadradas graves desafinadas entre sí (batido áspero).
  error: (c, d) => {
    tono(c, d, { f: 170, tipo: 'square', dur: 0.17, vol: 0.2 })
    tono(c, d, { f: 163, tipo: 'square', dur: 0.19, vol: 0.16 })
  },

  // Eliminar: caída grave y rasposa.
  eliminar: (c, d) => tono(c, d, { f: 392, f2: 98, tipo: 'sawtooth', dur: 0.22, vol: 0.2, metal: 0.3 }),

  // Copiar: doble tick agudo y limpio.
  copiar: (c, d) => {
    tono(c, d, { f: 2093, dur: 0.03, vol: 0.15 })
    tono(c, d, { f: 2637, inicio: 0.055, dur: 0.035, vol: 0.15 })
  },

  // Aviso: motivo ascendente más brillante y largo que el éxito.
  aviso: (c, d) => {
    tono(c, d, { f: 880, dur: 0.09, vol: 0.24, metal: 0.7 })
    tono(c, d, { f: 1175, inicio: 0.08, dur: 0.09, vol: 0.24, metal: 0.7 })
    tono(c, d, { f: 1568, inicio: 0.16, dur: 0.24, vol: 0.22, metal: 0.9 })
  },

  mover: (c, d) => tono(c, d, { f: 660, dur: 0.04, vol: 0.14 }),
  soltar: (c, d) => tono(c, d, { f: 330, f2: 220, dur: 0.09, vol: 0.18, metal: 0.3 }),
}

/** Reproduce un sonido (no hace nada si el usuario los desactivó). */
export function reproducir(nombre: SonidoNombre) {
  if (!activo) return
  const c = audio()
  if (!c || !master) return
  try {
    RECETAS[nombre]?.(c, master)
  } catch {
    /* audio no disponible */
  }
}

export function sonidoActivo(): boolean {
  return activo
}

export function setSonidoActivo(v: boolean) {
  activo = v
  try {
    localStorage.setItem(CLAVE, v ? '1' : '0')
  } catch {
    /* almacenamiento no disponible */
  }
  if (v) reproducir('exito')
}

/** Nombres válidos, para validar el atributo `data-sonido`. */
export const NOMBRES: SonidoNombre[] = [
  'tap',
  'abrir',
  'cerrar',
  'exito',
  'error',
  'eliminar',
  'copiar',
  'aviso',
  'mover',
  'soltar',
]
