/**
 * Regresión: un gesto que empieza dentro de un modal NO debe activar el
 * "volver" de la cáscara móvil. Antes del arreglo, un deslizamiento involuntario
 * al tocar "Siguiente" cerraba el formulario y devolvía a la lista.
 *
 * Se corre con: node scripts/test-gestos-modal.mjs
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const ARCHIVO = 'src/core/hooks/useGestos.ts'
const fuente = readFileSync(ARCHIVO, 'utf8')

const transpilado = ts.transpileModule(fuente, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText

const modulo = { exports: {} }
vm.runInNewContext(
  transpilado,
  {
    module: modulo,
    exports: modulo.exports,
    require: (id) => (id === 'react' ? { useEffect() {}, useRef() {} } : {}),
    console,
  },
  { filename: ARCHIVO },
)

const { esDentroDeDialogo } = modulo.exports

assert.equal(typeof esDentroDeDialogo, 'function', 'Falta esDentroDeDialogo en useGestos.ts')

// Un toque dentro del modal (el Modal real usa role="dialog") se ignora.
assert.equal(
  esDentroDeDialogo({ closest: (sel) => (sel.includes('[role="dialog"]') ? {} : null) }),
  true,
  'Un toque dentro de role="dialog" debe considerarse parte del modal',
)
assert.equal(
  esDentroDeDialogo({ closest: (sel) => (sel.includes('.modal') ? {} : null) }),
  true,
  'Un toque dentro de .modal debe considerarse parte del modal',
)

// El contenido normal de la pantalla sí sigue permitiendo gestos.
assert.equal(esDentroDeDialogo({ closest: () => null }), false)
assert.equal(esDentroDeDialogo(null), false)
assert.equal(esDentroDeDialogo({}), false)

// Y el detector debe usarlo al iniciar el gesto, no solo estar declarado.
assert.match(
  fuente,
  /function onInicio[\s\S]*esDentroDeDialogo\(e\.target\)/,
  'onInicio debe ignorar los toques que empiezan dentro de un modal',
)

const modal = readFileSync('src/core/ui/Modal.tsx', 'utf8')
assert.match(modal, /role="dialog"/, 'El Modal debe marcar su panel con role="dialog"')

console.log('OK: gestos dentro de modal no cierran el formulario')
