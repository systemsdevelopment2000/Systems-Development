/**
 * Colores categóricos del sistema (identidad 2026).
 *
 * Son los que distinguen cosas entre sí sin significar nada por sí mismos:
 * avatares, etiquetas, tarjetas de proyecto, columnas. Antes vivían copiados
 * en cinco archivos y arrancaban con el naranja de la marca anterior.
 *
 * El criterio es doble: separación de tono suficiente para distinguirlos de un
 * vistazo, y convivencia con el azul marino del panel (todos pasan 3:1 sobre
 * `--surface`). Las dos marcas corporativas —cian y azul SD— van primero,
 * porque son las que más se repiten.
 */
export const PALETA_CATEGORICA = [
  '#05e4fd', // cian brillante (marca)
  '#025ff5', // azul SD (marca)
  '#8b5cf6', // violeta
  '#2dd4bf', // turquesa
  '#b9b8ba', // plateado (marca)
  '#f472b6', // rosa
  '#e0b252', // oro metálico
  '#64748b', // pizarra
] as const

/** Color estable para una cadena: el mismo nombre da siempre el mismo color. */
export function colorDe(texto: string): string {
  let h = 0
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0
  return PALETA_CATEGORICA[h % PALETA_CATEGORICA.length]
}

/**
 * Colores semánticos: aquí el color SÍ significa algo y no se elige por
 * estética. Se mantienen separados de los categóricos para que un cambio de
 * marca no los arrastre.
 */
export const SEMANTICOS = {
  exito: '#22c55e',
  alerta: '#e0b252',
  peligro: '#ef4444',
  info: '#38bdf8',
  neutro: '#89898a',
} as const
