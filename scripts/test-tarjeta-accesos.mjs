/**
 * Regresión: la tarjeta de la herramienta muestra nombre + número de accesos.
 * El botón "Ampliar" cambia la tarjeta a la vista de accesos (dentro de la
 * misma tarjeta, sin modal ni acordeón) y "Volver" regresa a la herramienta.
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

// Cabecera con nombre + cantidad de accesos, que cambia entre las dos vistas.
assert.match(tarjeta, /className="hrr-card__titulo-btn"/, 'Falta la cabecera de la tarjeta')
assert.match(
  tarjeta,
  /hrr-card__titulo-btn[\s\S]{0,300}onClick=\{\(\) => setVista\(vista === 'accesos' \? 'herramienta' : 'accesos'\)\}/,
  'El clic en la cabecera debe cambiar entre herramienta y accesos',
)
assert.match(tarjeta, /aria-expanded=\{vista === 'accesos'\}/, 'Debe anunciar la vista activa')
assert.match(
  tarjeta,
  /hrr-card__num-accesos[\s\S]{0,200}listaAccesos\.length === 1 \? 'acceso' : 'accesos'/,
  'La tarjeta debe indicar el número de accesos',
)
assert.doesNotMatch(tarjeta, /abiertoAccesos/, 'Ya no debe quedar el viejo acordeón')

// Botón "Ampliar" directo en la cabecera de acciones.
assert.ok(
  tarjeta.includes('aria-label={`Ampliar accesos de ${h.nombre}`}'),
  'Debe existir el botón Ampliar',
)
assert.ok(
  tarjeta.includes("onClick={() => setVista('accesos')}"),
  'El botón Ampliar debe mostrar la vista de accesos directamente',
)

// Vista de accesos dentro de la misma tarjeta, con botón Volver.
assert.match(
  tarjeta,
  /\{vista === 'accesos' && \(\s*<div className="hrr-acc-desplegable">/,
  'Los accesos deben renderizarse como vista dentro de la tarjeta',
)
assert.match(
  tarjeta,
  /<ChevronLeft size=\{11\} \/> Volver/,
  'La vista de accesos debe tener botón para volver',
)
assert.match(
  tarjeta,
  /<Maximize2 size=\{11\} \/> Ver en grande/,
  'La vista de accesos debe permitir abrir la bóveda completa',
)
assert.equal(
  (tarjeta.match(/\{vista === 'herramienta' && \(/g) || []).length,
  2,
  'El resto de la tarjeta debe pertenecer solo a la vista herramienta',
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

// La bóveda ampliada sigue disponible desde la vista de accesos.
assert.match(boveda, /bov-modal__lista/, 'La bóveda ampliada debe seguir existiendo')
assert.match(pagina, /onVerAccesos=\{\(\) => setViendoAccesos\(h\)\}/, 'La página debe seguir abriendo la bóveda')

console.log('OK: Ampliar muestra la vista de accesos dentro de la misma tarjeta')
