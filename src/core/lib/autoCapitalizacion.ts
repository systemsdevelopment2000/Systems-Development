import { primeraMayuscula } from './validaciones'

/**
 * Determina si un campo de entrada debe ser excluido de la autocapitalización
 * (contraseñas, correos, URLs, tokens, códigos, campos numéricos o sensibles).
 */
function esCampoExcluido(el: HTMLInputElement | HTMLTextAreaElement): boolean {
  if (el.tagName === 'INPUT') {
    const type = (el.type || 'text').toLowerCase()
    if (
      type === 'password' ||
      type === 'email' ||
      type === 'url' ||
      type === 'number' ||
      type === 'tel' ||
      type === 'file' ||
      type === 'checkbox' ||
      type === 'radio' ||
      type === 'color' ||
      type === 'date' ||
      type === 'datetime-local' ||
      type === 'time' ||
      type === 'month' ||
      type === 'week' ||
      type === 'hidden'
    ) {
      return true
    }
  }

  if (
    el.dataset.noCapitalize === 'true' ||
    el.classList.contains('no-capitalize') ||
    el.getAttribute('autocapitalize') === 'none' ||
    el.getAttribute('autocapitalize') === 'off'
  ) {
    return true
  }

  // Identificadores típicos de tokens, contraseñas, URLs y correos
  const identificadores = [
    el.name,
    el.id,
    el.className,
    el.getAttribute('placeholder') || '',
    el.getAttribute('autocomplete') || '',
    el.getAttribute('aria-label') || '',
    el.getAttribute('data-campo') || '',
    el.title || '',
  ]
    .join(' ')
    .toLowerCase()

  if (
    identificadores.includes('token') ||
    identificadores.includes('api_key') ||
    identificadores.includes('apikey') ||
    identificadores.includes('pass') ||
    identificadores.includes('clave') ||
    identificadores.includes('contrasena') ||
    identificadores.includes('contraseña') ||
    identificadores.includes('correo') ||
    identificadores.includes('email') ||
    identificadores.includes('url') ||
    identificadores.includes('http') ||
    identificadores.includes('link') ||
    identificadores.includes('repo') ||
    identificadores.includes('git') ||
    identificadores.includes('hash') ||
    identificadores.includes('slug') ||
    identificadores.includes('cedula') ||
    identificadores.includes('rif')
  ) {
    return true
  }

  // Comprobar contexto circundante en ancestros directos (hasta 4 niveles)
  let ancestro: HTMLElement | null = el.parentElement
  for (let i = 0; i < 4 && ancestro; i++) {
    const texto = (ancestro.textContent || '').toLowerCase()
    if (
      texto.includes('contrase') ||
      texto.includes('password') ||
      texto.includes('clave') ||
      texto.includes('token') ||
      texto.includes('api key') ||
      texto.includes('apikey')
    ) {
      return true
    }
    ancestro = ancestro.parentElement
  }

  return false
}

/** Establece el valor en el elemento respetando el descriptor nativo para notificar a React. */
function setValorNativo(el: HTMLInputElement | HTMLTextAreaElement, valor: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(el, 'value')?.set
  const prototype = Object.getPrototypeOf(el)
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(el, valor)
  } else if (valueSetter) {
    valueSetter.call(el, valor)
  } else {
    el.value = valor
  }
}

let inicializado = false

/**
 * Inicializa la autocapitalización por defecto en todos los formularios de la aplicación.
 * Garantiza que la primera letra siempre sea mayúscula.
 */
export function inicializarAutoCapitalizacion() {
  if (inicializado || typeof window === 'undefined') return
  inicializado = true

  // 1. Interceptor de entrada en fase de captura para que React reciba la primera letra en mayúscula
  document.addEventListener(
    'input',
    (e) => {
      const target = e.target
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return
      if (esCampoExcluido(target)) return

      const val = target.value
      if (!val) return

      const cap = primeraMayuscula(val)
      if (cap !== val) {
        const start = target.selectionStart
        const end = target.selectionEnd

        setValorNativo(target, cap)

        if (start !== null && end !== null) {
          try {
            target.setSelectionRange(start, end)
          } catch { /* El campo puede rechazar la selección. */ }
        }
      }
    },
    true,
  )

  // 2. Configura autocapitalize="sentences" para teclados virtuales en móviles/tablets
  document.addEventListener(
    'focusin',
    (e) => {
      const target = e.target
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return
      if (esCampoExcluido(target)) return

      if (!target.getAttribute('autocapitalize')) {
        target.setAttribute('autocapitalize', 'sentences')
      }
    },
    true,
  )
}
