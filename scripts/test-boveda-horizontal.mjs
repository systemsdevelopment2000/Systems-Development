/**
 * Regresión: la bóveda debe mostrar la herramienta y sus accesos en fila
 * horizontal (uno al lado del otro), y el nombre de la herramienta debe abrirla.
 *
 * Se corre con: node scripts/test-boveda-horizontal.mjs
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync('src/modules/herramientas/styles/herramientas.css', 'utf8')
const boveda = readFileSync('src/modules/herramientas/components/BovedaAccesosModal.tsx', 'utf8')
const tarjeta = readFileSync('src/modules/herramientas/components/HerramientaCard.tsx', 'utf8')
const tabla = readFileSync('src/modules/herramientas/components/HerramientaTabla.tsx', 'utf8')
const pagina = readFileSync('src/modules/herramientas/pages/HerramientasPage.tsx', 'utf8')

function bloque(texto, selector) {
  const i = texto.indexOf(selector)
  assert.ok(i >= 0, `Falta el bloque ${selector}`)
  const fin = texto.indexOf('}', i)
  return texto.slice(i, fin)
}

const lista = bloque(css, '.bov-modal__lista {')
const item = bloque(css, '.bov-modal__item {')

assert.match(lista, /flex-direction:\s*row/, 'Los accesos deben ir uno al lado del otro')
assert.match(lista, /overflow-x:\s*auto/, 'Si no caben, debe haber scroll horizontal')
assert.match(item, /flex:\s*0 0 288px/, 'Cada acceso debe ser una tarjeta con ancho fijo')

assert.match(
  boveda,
  /bov-modal__seccion-tit bov-modal__flujo[\s\S]{0,300}\{h\.nombre\}[\s\S]{0,200}ArrowRight/,
  'La cabecera debe mostrar: herramienta → accesos',
)
assert.match(
  boveda,
  /className="bov-modal__lista"/,
  'La bóveda debe usar el contenedor horizontal',
)

assert.match(
  tarjeta,
  /hrr-nombre-link[\s\S]{0,200}onClick=\{onVerAccesos\}/,
  'En tarjetas, el nombre de la herramienta debe abrir la bóveda',
)
assert.match(
  tabla,
  /hrr-nombre-link[\s\S]{0,200}onClick=\{\(\) => onVerAccesos\(h\)\}/,
  'En la tabla, el nombre de la herramienta debe abrir la bóveda',
)

const inicioBoveda = pagina.indexOf('titulo={`Bóveda de Accesos:')
const finBoveda = pagina.indexOf('{/* Modal para editar UNA credencial')
assert.ok(inicioBoveda >= 0 && finBoveda > inicioBoveda, 'No se encontró el modal de bóveda')
assert.match(
  pagina.slice(inicioBoveda, finBoveda),
  /ancho=\{980\}/,
  'La bóveda debe ser más ancha para mostrar varios accesos en fila',
)

console.log('OK: bóveda horizontal con herramienta -> accesos y nombre clicable')
