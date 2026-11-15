/**
 * Combinaciones de color de SD.
 *
 * El estilo de diseño NO cambia: se mantiene el caparazón actual (base oscura
 * con resplandor, radios de 12px, elevación difusa). Lo único que varía es el
 * color. Los valores de aquí son para dibujar las muestras y para el resumen
 * que se copia; los que mandan en pantalla son los de `src/styles/paletas.css`.
 */

/** El estilo de diseño vigente, común a todas las combinaciones. */
export const ESTILO = {
  nombre: 'Dark Mode (OLED) con acentos metálicos',
  familia: 'Dark Mode (OLED) · azul eléctrico, cian y plata',
  base: 'oscura',
  radio: '12px (sm 9 · xs 4 · lg 16)',
  trazo: '1px',
  sombra: 'elevación difusa + resplandor del primario',
  titulos: 'peso 650 · tracking −0.015em',
  tipografia: 'IBM Plex Sans (interfaz) · JetBrains Mono (datos)',
}

export interface Paleta {
  id: string
  nombre: string
  /** Qué transmite, en los términos que pidió la marca. */
  atributos: string[]
  /** Por qué funciona para SD. */
  razon: string
  /** El costo concreto, no uno genérico. */
  riesgo: string
  primario: { base: string; luz: string; sombra: string; sobre: string }
  secundario: { base: string; luz: string; sombra: string }
  fondo: string
  panel: string
  panel2: string
  borde: string
  texto: string
  textoApagado: string
  textoTenue: string
  estados: { peligro: string; exito: string; alerta: string }
  /** Contraste del primario sobre su panel, ya verificado. */
  contrastePrimario: number
}

export const PALETAS: Paleta[] = [
  {
    id: 'sd',
    nombre: 'SD 2026 (oficial)',
    atributos: ['tecnología', 'precisión', 'confianza'],
    razon:
      'La identidad corporativa vigente, tomada del logotipo y de la camisa: azul eléctrico y cian en la "S", negro metálico y plata en la "D". El azul eléctrico oficial (#14409F) da solo 2.01:1 sobre el panel, así que queda como relleno de botón y como sombra; el color de acción es el punto medio del degradado del logo, que la propia guía autoriza.',
    riesgo:
      'El cian es muy luminoso: si se usa como relleno grande cansa. Está reservado al realce, el foco y el resplandor.',
    primario: { base: '#1f6fe0', luz: '#01d3fe', sombra: '#14409f', sobre: '#ffffff' },
    secundario: { base: '#c0c0c0', luz: '#e6e6e7', sombra: '#7b7b7c' },
    fondo: '#040404',
    panel: '#0b1128',
    panel2: '#141c3c',
    borde: 'rgba(192,192,192,0.14)',
    texto: '#e8eaf0',
    textoApagado: '#8e96ac',
    textoTenue: '#646c84',
    estados: { peligro: '#ff6b72', exito: '#22c55e', alerta: '#eab308' },
    contrastePrimario: 3.92,
  },
  {
    id: 'naranja',
    nombre: 'Naranja (anterior)',
    atributos: ['energía', 'cercanía'],
    razon:
      'La identidad anterior a noviembre de 2026. Se conserva solo para comparar o para material viejo que aún la use.',
    riesgo: 'Ya no corresponde a la marca: no debe usarse en nada nuevo.',
    primario: { base: '#f47920', luz: '#ff9a4d', sombra: '#b95410', sobre: '#1c1c1e' },
    secundario: { base: '#8b8f99', luz: '#b9bdc6', sombra: '#5f636d' },
    fondo: '#0b0b0e',
    panel: '#121217',
    panel2: '#1a1a20',
    borde: 'rgba(255,255,255,0.08)',
    texto: '#ececf0',
    textoApagado: '#8b8f99',
    textoTenue: '#5f636d',
    estados: { peligro: '#ff6b72', exito: '#22c55e', alerta: '#eab308' },
    contrastePrimario: 6.76,
  },
  {
    id: 'oro',
    nombre: 'Oro',
    atributos: ['lujo', 'elegancia', 'pulcritud'],
    razon:
      'Oro apagado sobre grafito cálido: el código visual del lujo discreto. Es la transición más suave desde el naranja actual porque conserva la familia cálida — el cambio no se siente como otra empresa, pero sube de categoría. El metal pasa a plata fría, que contrasta con el oro sin pelearse. Es además la de mejor contraste de las seis.',
    riesgo:
      'Con el fondo más claro de lo previsto el oro se lee como mostaza. Hay que mantener el panel por debajo de #14 de luminosidad.',
    primario: { base: '#d4a541', luz: '#efc46b', sombra: '#9a7421', sobre: '#17130a' },
    secundario: { base: '#b8bcc4', luz: '#dcdfe4', sombra: '#6e737c' },
    fondo: '#0b0a07',
    panel: '#13110d',
    panel2: '#1c1a14',
    borde: 'rgba(255,246,224,0.09)',
    texto: '#f2efe9',
    textoApagado: '#9c968a',
    textoTenue: '#6b665c',
    estados: { peligro: '#e8716b', exito: '#76b36a', alerta: '#d9a521' },
    contrastePrimario: 8.31,
  },
  {
    id: 'marino',
    nombre: 'Marino',
    atributos: ['seguridad', 'confianza', 'profesionalismo'],
    razon:
      'El azul es el color con el que la banca y las aseguradoras compran confianza: dice "sus datos están a salvo". Es la opción más segura para vender sistemas a empresas y la que más se aleja del naranja.',
    riesgo:
      'Es también la más genérica: es el azul de medio mercado de software. Gana confianza y pierde distinción.',
    primario: { base: '#3b82f6', luz: '#6ba5fa', sombra: '#1d4ed8', sobre: '#061021' },
    secundario: { base: '#a9b6cc', luz: '#d2dae7', sombra: '#64748b' },
    fondo: '#080b12',
    panel: '#0f131c',
    panel2: '#171c28',
    borde: 'rgba(214,231,255,0.09)',
    texto: '#e8edf7',
    textoApagado: '#94a3b8',
    textoTenue: '#64748b',
    estados: { peligro: '#f2717c', exito: '#34d399', alerta: '#fbbf24' },
    contrastePrimario: 5.05,
  },
  {
    id: 'esmeralda',
    nombre: 'Esmeralda',
    atributos: ['pulcritud', 'confianza', 'orden'],
    razon:
      'Verde azulado sobre verde muy oscuro: lee limpio y ordenado, y le sienta a un sistema de gestión donde todo el día se marca "listo".',
    riesgo:
      'El verde ya significa "completado" en el tablero, los estados de proyecto y las cuotas pagadas. Adoptarla obliga a recolorear esos estados o el usuario leerá acciones como confirmaciones.',
    primario: { base: '#14b8a6', luz: '#49d6c6', sombra: '#0c7a6e', sobre: '#041513' },
    secundario: { base: '#afbdb9', luz: '#d6dedb', sombra: '#6b7a76' },
    fondo: '#06100e',
    panel: '#0c1917',
    panel2: '#142422',
    borde: 'rgba(214,255,247,0.09)',
    texto: '#e6f1ee',
    textoApagado: '#90a5a0',
    textoTenue: '#637671',
    estados: { peligro: '#f2717c', exito: '#4ade80', alerta: '#eab308' },
    contrastePrimario: 7.23,
  },
  {
    id: 'borgona',
    nombre: 'Borgoña',
    atributos: ['elegancia', 'lujo', 'carácter'],
    razon:
      'Vino sobre casi negro, con champaña como metal. Es la más distintiva: nadie en el rubro de software de la zona usa esto.',
    riesgo:
      'El rojo compite con las alertas. Por eso aquí el rojo de peligro se corrió a coral y el primario se aclaró hasta alcanzar contraste sobre el panel.',
    primario: { base: '#d13a57', luz: '#e86d84', sombra: '#8e2240', sobre: '#ffffff' },
    secundario: { base: '#d9c6a3', luz: '#ede0c7', sombra: '#9a8864' },
    fondo: '#0c0709',
    panel: '#150d11',
    panel2: '#1f1419',
    borde: 'rgba(255,232,229,0.09)',
    texto: '#f3eae8',
    textoApagado: '#a89396',
    textoTenue: '#76666a',
    estados: { peligro: '#ff8a72', exito: '#79bd7a', alerta: '#e0b252' },
    contrastePrimario: 4.06,
  },
  {
    id: 'carbon',
    nombre: 'Carbón',
    atributos: ['lujo', 'elegancia', 'pulcritud'],
    razon:
      'Casi negro y hueso. El primario de acción es el hueso — botón claro sobre negro, el gesto del lujo contenido — y el color sólido queda reservado al significado: vencido, en mora, crítico. Es la respuesta a que el color decore en vez de informar.',
    riesgo:
      'Exige que cada estado tenga además un ícono o una etiqueta, porque el color deja de estar disponible para decorar.',
    primario: { base: '#edebe6', luz: '#ffffff', sombra: '#b8b5ae', sobre: '#0a0a0c' },
    secundario: { base: '#e5435c', luz: '#f07a8c', sombra: '#c8102e' },
    fondo: '#08080a',
    panel: '#101014',
    panel2: '#17171c',
    borde: 'rgba(245,244,241,0.10)',
    texto: '#f5f4f1',
    textoApagado: '#9a9894',
    textoTenue: '#6a6864',
    estados: { peligro: '#e5435c', exito: '#4ade80', alerta: '#e0b252' },
    contrastePrimario: 15.93,
  },
]

export const PALETA_POR_DEFECTO = 'sd'

/** Aplica una combinación al documento. `neon` es la base y no lleva atributo. */
export function aplicarPaleta(id: string | undefined) {
  const raiz = document.documentElement
  if (!id || id === PALETA_POR_DEFECTO) raiz.removeAttribute('data-paleta')
  else raiz.dataset.paleta = id
}

export function paletaDe(id: string | undefined): Paleta {
  return PALETAS.find((p) => p.id === (id ?? PALETA_POR_DEFECTO)) ?? PALETAS[0]
}

/**
 * Resumen legible de la combinación, para pegar en un chat o un correo.
 * Incluye el estilo de diseño aplicado, porque el color por sí solo no
 * describe cómo se ve el sistema.
 */
export function resumenDe(p: Paleta): string {
  const l = [
    `Systems Development · combinación de color "${p.nombre}"`,
    '',
    `Estilo de diseño aplicado: ${ESTILO.nombre}`,
    `  Familia      ${ESTILO.familia}`,
    `  Base         ${ESTILO.base}`,
    `  Forma        radio ${ESTILO.radio} · trazo ${ESTILO.trazo}`,
    `  Sombra       ${ESTILO.sombra}`,
    `  Títulos      ${ESTILO.titulos}`,
    `  Tipografía   ${ESTILO.tipografia}`,
    '',
    `Transmite: ${p.atributos.join(', ')}`,
    '',
    'PRIMARIO',
    `  Base         ${p.primario.base}`,
    `  Luz          ${p.primario.luz}   (hover, realce, foco)`,
    `  Sombra       ${p.primario.sombra}   (pulsado, profundidad)`,
    `  Texto encima ${p.primario.sobre}`,
    '',
    'SECUNDARIO',
    `  Base         ${p.secundario.base}`,
    `  Luz          ${p.secundario.luz}`,
    `  Sombra       ${p.secundario.sombra}`,
    '',
    'SUPERFICIES',
    `  Fondo        ${p.fondo}`,
    `  Panel        ${p.panel}`,
    `  Panel 2      ${p.panel2}`,
    `  Borde        ${p.borde}`,
    '',
    'TEXTO',
    `  Principal    ${p.texto}`,
    `  Secundario   ${p.textoApagado}`,
    `  Tenue        ${p.textoTenue}`,
    '',
    'ESTADOS',
    `  Peligro      ${p.estados.peligro}`,
    `  Éxito        ${p.estados.exito}`,
    `  Alerta       ${p.estados.alerta}`,
    '',
    `Contraste del primario sobre el panel: ${p.contrastePrimario.toFixed(2)}:1`,
    '',
    `Por qué: ${p.razon}`,
    `Lo que cuesta: ${p.riesgo}`,
  ]
  return l.join('\n')
}
