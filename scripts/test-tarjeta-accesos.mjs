/**
 * Regresión: la tarjeta de la herramienta muestra su nombre y el número de
 * accesos; al hacer clic se despliegan los accesos DENTRO de la tarjeta.
 * El clic ya no abre el modal ancho.
 *
 * Se corre con: node scripts/test-tarjeta-accesos.mjs
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync('src/modules/herramientas/styles/herramientas.css', 'utf8')
const tarjeta = readFileSync('src/modules/herramientas/components/HerramientaCard.tsx', 'utf8')
const tabla = readFileSync('src/modules/herramientas/components/HerramientaTabla.tsx', 'utf8')
const boveda = readFileSync('src/modules/herramientas/components/BovedaAccesosModal.tsx', 'utf8')
const pagina = readFileSync('src/modules/herramientas/pages/HerramientasPage.tsx', 'utf8')

function bloque(texto, selector) {
  const i = texto.indexOf(selector)
  assert.ok(i >= 0, `Falta el bloque ${selector}`)
  const fin = texto.indexOf('}', i)
  return texto.slice(i, fin)
}

// Cabecera clicable con nombre + cantidad de accesos.
assert.match(tarjeta, /className="hrr-card__titulo-btn"/, 'Falta la cabecera clicable de la tarjeta')
assert.match(
  tarjeta,
  /hrr-card__titulo-btn[\s\S]{0,300}onClick=\{\(\) => setAbiertoAccesos\(\(v\) => !v\)\}/,
  'El clic en la cabecera debe desplegar los accesos',
)
assert.match(tarjeta, /aria-expanded=\{abiertoAccesos\}/, 'La cabecera debe anunciar si está desplegada')
assert.match(
  tarjeta,
  /hrr-card__num-accesos[\s\S]{0,200}listaAccesos\.length === 1 \? 'acceso' : 'accesos'/,
  'La tarjeta debe indicar el número de accesos',
)
assert.doesNotMatch(
  tarjeta,
  /hrr-card__titulo-btn[\s\S]{0,400}onClick=\{onVerAccesos\}/,
  'El clic en la tarjeta ya no debe abrir el modal',
)
assert.match(
  tarjeta,
  /\{abiertoAccesos && \(\s*<div className="hrr-acc-desplegable">/,
  'Los accesos deben aparecer dentro de la tarjeta al desplegar',
)

// Accesos uno al lado del otro dentro de la tarjeta.
const lista = bloque(css, '.hrr-acc-lista {')
const item = bloque(css, '.hrr-acc-item {')
const titulo = bloque(css, '.hrr-card__titulo-btn {')
const numero = bloque(css, '.hrr-card__num-accesos {')

assert.match(lista, /flex-direction:\s*row/, 'Los accesos deben ir uno al lado del otro')
assert.match(lista, /overflow-x:\s*auto/, 'Si no caben, debe haber scroll horizontal')
assert.match(item, /flex:\s*0 0 190px/, 'Cada acceso debe ser una tarjeta con ancho fijo')
assert.match(titulo, /cursor:\s*pointer/, 'La cabecera debe ser claramente clicable')
assert.ok(numero.includes('color:'), 'El contador debe ser visible')

// En la tabla el nombre vuelve a ser texto simple (no abre modal).
assert.match(tabla, /<span className="hrt__nombre">\{h\.nombre\}<\/span>/, 'La tabla no debe abrir el modal desde el nombre')
assert.doesNotMatch(tabla, /hrr-nombre-link/, 'Debe desaparecer el viejo enlace de la tabla')

// La bóveda ampliada sigue disponible por el botón de llave.
assert.match(boveda, /bov-modal__lista/, 'La bóveda ampliada debe seguir existiendo')
assert.match(pagina, /onVerAccesos=\{\(\) => setViendoAccesos\(h\)\}/, 'El botón de llave debe seguir abriendo la bóveda')

console.log('OK: tarjeta con nombre + número de accesos que se despliegan dentro')
