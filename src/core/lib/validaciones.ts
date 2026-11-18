/**
 * Utilidades centrales de validación y saneamiento de entradas en tiempo real.
 * Garantiza que los campos de números solo admitan números, los de letras solo letras,
 * y que por defecto en todos los formularios la primera letra sea mayúscula.
 */

/** Pone la primera letra alfabética en mayúscula por defecto (respetando espacios o símbolos iniciales). */
export function primeraMayuscula(val: string): string {
  if (!val) return val
  const idx = val.search(/[a-záéíóúñü]/i)
  if (idx === -1) return val
  return val.slice(0, idx) + val.charAt(idx).toUpperCase() + val.slice(idx + 1)
}

/** Sanitiza texto general garantizando que la primera letra sea mayúscula. */
export function textoConMayuscula(val: string): string {
  return primeraMayuscula(val)
}

/** Filtra caracteres dejando únicamente letras, espacios, acentos y signos de puntuación, con primera letra mayúscula. */
export function soloLetras(val: string): string {
  const limpio = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]/g, '')
  return primeraMayuscula(limpio)
}

/** Filtra caracteres para cargos, títulos o profesiones (letras, espacios, comas, barras), con primera letra mayúscula. */
export function soloLetrasTexto(val: string): string {
  const limpio = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,./-]/g, '')
  return primeraMayuscula(limpio)
}

/** Filtra estrictamente dígitos numéricos enteros (0-9). */
export function soloNumeros(val: string): string {
  return val.replace(/\D/g, '')
}

/** Filtra números permitiendo decimales positivos (con punto o coma). */
export function soloDecimal(val: string): string {
  // Limpia cualquier caracter que no sea número o separador decimal
  const limpio = val.replace(/[^0-9.,]/g, '').replace(',', '.')
  const partes = limpio.split('.')
  if (partes.length <= 1) return limpio
  return `${partes[0]}.${partes.slice(1).join('')}`
}

/** Filtra caracteres de formato telefónico (+, números, guiones y espacios). */
export function soloTelefono(val: string): string {
  return val.replace(/[^\d+-\s]/g, '')
}

/** Filtra números de cédula venezolana (V-, E-, números y guión). */
export function formatoCedula(val: string): string {
  return val.replace(/[^vVeEpP0-9-]/g, '').toUpperCase()
}

/** Filtra número de RIF (J-, V-, G-, E-, números y guión). */
export function formatoRif(val: string): string {
  return val.replace(/[^jvgJvGeE0-9-]/g, '').toUpperCase()
}

/** Valida si una cadena tiene estructura básica de email. */
export function esEmailValido(correo: string): boolean {
  if (!correo || !correo.trim()) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())
}
