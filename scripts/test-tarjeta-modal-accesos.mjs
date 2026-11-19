/**
 * Regresión: al hacer clic en la tarjeta de la herramienta se abre el modal
 * de accesos. La tarjeta solo muestra nombre, número de accesos y sus datos.
 *
 * Se corre con: node scripts/test-tarjeta-modal-accesos.mjs
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync('src/modules/herramientas/styles/herramientas.css', 'utf8')
const tarjeta = readFileSync('src/modules/herramientas/components/HerramientaCard.tsx', 'utf8')
const pagina = readFileSync('src/modules/herramientas/pages/HerramientasPage.tsx', 'utf8')
const boveda = readFileSync('src/modules/herramientas/components/BovedaAccesosModal.tsx', 'utf8')

// La tarjeta completa abre el modal.
assert.match(
  tarjeta,
  /<article[\s\S]{0,300}onClick=\{abrirModal\}/,
  'La tarjeta debe abrir el modal al hacer clic',
)
assert.match(
  tarjeta,
  /function abrirModal[\s\S]{0,300}closest\('button, a, input, textarea, select, label'\)[\s\S]{0,120}onVerAccesos\?\.\(\)/,
  'El clic debe ignorar botones y enlaces internos',
)
assert.match(
  tarjeta,
  /hrr-card__titulo-btn[\s\S]{0,200}onClick=\{onVerAccesos\}/,
  'El nombre también debe abrir el modal',
)
assert.match(css, /\.hrr-card--clicable\s*\{[\s\S]{0,100}cursor:\s*pointer/, 'La tarjeta debe verse clicable')

// La URL es texto: si fuera un enlace, su clic abriría la web y no el modal.
assert.match(
  tarjeta,
  /<span className="hrr-url"[^>]*>[\s\S]{0,120}\{h\.url\}/,
  'La URL debe mostrarse como texto dentro de la tarjeta',
)
assert.doesNotMatch(
  tarjeta,
  /<a className="hrr-url"/,
  'La tarjeta no debe tener un enlace que se coma el clic',
)

// Nombre + número de accesos siguen visibles en la tarjeta.
assert.match(tarjeta, /className="cl-card__nombre"/, 'Debe mostrarse el nombre de la herramienta')
assert.match(
  tarjeta,
  /hrr-card__num-accesos[\s\S]{0,200}listaAccesos\.length === 1 \? 'acceso' : 'accesos'/,
  'Debe mostrarse el número de accesos',
)

// La cabecera queda solo con el nombre y la cantidad de accesos.
assert.doesNotMatch(
  tarjeta,
  /hrr-tipo-badge|hrr-prop|hrr-card__badges|obtenerDefTipoHerramienta/,
  'La tarjeta no debe mostrar etiquetas adicionales junto al contador',
)
assert.match(
  css,
  /\.hrr-card__titulo-btn \.cl-card__nombre\s*\{[\s\S]{0,120}flex:\s*1 1 auto/,
  'El nombre debe encogerse con puntos suspensivos antes de chocar con el contador',
)
assert.match(
  css,
  /\.hrr-card__num-accesos\s*\{[\s\S]{0,180}white-space:\s*nowrap/,
  'El contador de accesos no debe partirse en dos líneas',
)

// Ya no hay vistas internas ni acordeón dentro de la tarjeta.
assert.doesNotMatch(tarjeta, /vista ===|setVista|abiertoAccesos|hrr-acc-desplegable|Ampliar/, 'La tarjeta debe quedar simple')

// La página abre la bóveda con los accesos.
assert.match(
  pagina,
  /onVerAccesos=\{\(\) => setViendoAccesos\(h\)\}/,
  'La página debe abrir la bóveda al hacer clic en la tarjeta',
)
assert.match(
  pagina,
  /titulo=\{`Bóveda de Accesos: \$\{viendoAccesos\?\.nombre \?\? ''\}`\}/,
  'El modal debe mostrar la herramienta',
)
assert.match(boveda, /bov-modal__lista/, 'El modal debe mostrar los accesos')
assert.match(boveda, /onEditarAcceso\(acc\)/, 'El modal debe permitir editar cada credencial')

console.log('OK: clic en la tarjeta abre el modal con los accesos')
