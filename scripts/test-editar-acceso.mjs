/**
 * Regresión: editar una credencial desde la bóveda/tarjetas/tabla debe tocar
 * SOLO ese acceso. Los demás deben conservarse enteros y no se puede borrar nada.
 *
 * Se corre con: node scripts/test-editar-acceso.mjs
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const ARCHIVO = 'src/modules/herramientas/lib/accesos.ts'
const fuente = readFileSync(ARCHIVO, 'utf8')
const transpilado = ts.transpileModule(fuente, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText

const modulo = { exports: {} }
vm.runInNewContext(
  transpilado,
  { module: modulo, exports: modulo.exports, require: () => ({}), console },
  { filename: ARCHIVO },
)
const { normalizarAcceso, reemplazarAcceso } = modulo.exports

assert.equal(typeof normalizarAcceso, 'function', 'Falta normalizarAcceso en lib/accesos.ts')
assert.equal(typeof reemplazarAcceso, 'function', 'Falta reemplazarAcceso en lib/accesos.ts')

const accesos = [
  { id: 'a1', nombre: 'Principal', usuario: 'uno@sd.dev', contrasena: 'clave1' },
  { id: 'a2', nombre: 'Token', token: 'abc', vinculaGit: true },
  { id: 'a3', nombre: 'Lectura', notas: 'solo lectura' },
]

const editado = normalizarAcceso({
  ...accesos[1],
  nombre: '  Token nuevo  ',
  usuario: '  dos@sd.dev  ',
  token: '  xyz  ',
  notas: '  rotado  ',
})

assert.equal(editado.nombre, 'Token nuevo')
assert.equal(editado.usuario, 'dos@sd.dev')
assert.equal(editado.token, 'xyz')
assert.equal(editado.notas, 'rotado')
assert.equal(editado.vinculaGit, true, 'El toggle Git debe conservarse')
assert.equal(editado.id, 'a2', 'El id no debe cambiar: es la clave para reemplazar')

const resultado = reemplazarAcceso(accesos, editado)
assert.equal(resultado.length, 3, 'No se agrega ni se quita ningún acceso')
assert.deepEqual(resultado.map((a) => a.id), ['a1', 'a2', 'a3'], 'Se conserva el orden')
assert.equal(resultado[0], accesos[0], 'El acceso anterior no debe ser modificado')
assert.equal(resultado[2], accesos[2], 'El acceso posterior no debe ser modificado')
assert.equal(resultado[1].nombre, 'Token nuevo')
assert.equal(resultado[1].usuario, 'dos@sd.dev')

assert.deepEqual(
  reemplazarAcceso(accesos, { ...editado, id: 'no-existe' }),
  accesos,
  'Si no coincide el id, no se cambia nada',
)

// La bóveda y la tabla ofrecen edición individual; la tarjeta abre la bóveda.
const boveda = readFileSync('src/modules/herramientas/components/BovedaAccesosModal.tsx', 'utf8')
const tarjeta = readFileSync('src/modules/herramientas/components/HerramientaCard.tsx', 'utf8')
const tabla = readFileSync('src/modules/herramientas/components/HerramientaTabla.tsx', 'utf8')
const pagina = readFileSync('src/modules/herramientas/pages/HerramientasPage.tsx', 'utf8')
const editor = readFileSync('src/modules/herramientas/components/EditarAccesoModal.tsx', 'utf8')

for (const [nombre, texto] of [
  ['bóveda', boveda],
  ['tabla', tabla],
]) {
  assert.match(
    texto,
    /onEditarAcceso\((acc|h, acc)\)/,
    `${nombre} debe tener botón para editar solo la credencial`,
  )
  assert.match(texto, /type="button"[\s\S]{0,200}onEditarAcceso/, `${nombre}: el botón no debe enviar un formulario`)
}

assert.match(
  tarjeta,
  /<article[\s\S]{0,300}onClick=\{abrirModal\}/,
  'La tarjeta completa debe abrir el modal de accesos',
)
assert.match(
  tarjeta,
  /hrr-card__titulo-btn[\s\S]{0,200}onClick=\{onVerAccesos\}/,
  'El nombre de la tarjeta debe abrir el modal',
)
assert.doesNotMatch(tarjeta, /onEditarAcceso/, 'La tarjeta ya no edita accesos en línea: los muestra el modal')

assert.match(pagina, /onEditarAcceso=\{\(h, acc\) => editarAcceso\(h, acc\)\}/, 'La tabla debe conectar el editor')
assert.match(
  pagina,
  /onEditarAcceso=\{\(acc\) => editarAcceso\(viendoAccesos, acc\)\}/,
  'La bóveda debe conectar el editor',
)
assert.match(pagina, /<EditarAccesoModal/, 'Debe renderizarse el modal del editor individual')
assert.match(pagina, /reemplazarAcceso\(h\.accesosNormalizados, accesoEditado\)/, 'Debe reemplazarse solo el acceso elegido')
const inicioGuardar = pagina.indexOf('function onGuardarAcceso')
const finGuardar = pagina.indexOf('async function onBorrar')
assert.ok(inicioGuardar >= 0 && finGuardar > inicioGuardar, 'No se encontró onGuardarAcceso')
const bloqueGuardar = pagina.slice(inicioGuardar, finGuardar)
assert.doesNotMatch(bloqueGuardar, /\bborrar\(/, 'Editar una credencial no debe borrar nada')
assert.match(editor, /type="submit"[^>]*>[\s\S]{0,80}Guardar credencial/, 'El guardado del editor debe ser explícito')

console.log('OK: editar una credencial no altera las demás; la tarjeta abre la bóveda')
