import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as EventoTecla,
} from 'react'
import { Send, Smile, Bold, Italic, Strikethrough, Code, List, Quote } from 'lucide-react'

const EMOJIS = [
  '😀', '😁', '😂', '🤣', '😊', '😍', '😎', '🤔', '👍', '👎',
  '🙌', '👏', '🙏', '🔥', '✅', '❌', '⚠️', '💡', '📌', '📎',
  '📅', '⏰', '🚀', '🎉', '💰', '📊', '📈', '🐾', '🛠️', '🤝',
  '👋', '💪', '❤️', '⭐', '✨', '📝', '📁', '🔗', '💬', '🚩',
]

const MENCION = /(^|\s)@([\wáéíóúñ]*)$/i
const REF = /(^|\s)#([\wáéíóúñ]*)$/i

interface Props {
  texto: string
  setTexto: (v: string) => void
  colaboradores: { id: string; nombre: string }[]
  referencias: string[]
  onEnviar: (texto: string) => void
}

export function ChatInput({ texto, setTexto, colaboradores, referencias, onEnviar }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [emoji, setEmoji] = useState(false)
  const [sug, setSug] = useState<{ tipo: '@' | '#'; opciones: string[] } | null>(null)

  useEffect(() => {
    if (!emoji) return
    const onDoc = (e: MouseEvent) => {
      const cont = ref.current?.closest('.chat__compose')
      if (cont && !cont.contains(e.target as Node)) setEmoji(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [emoji])

  function calcSug(val: string, pos: number) {
    const antes = val.slice(0, pos)
    const m1 = antes.match(MENCION)
    const m2 = antes.match(REF)
    if (m1) {
      const q = m1[2].toLowerCase()
      const ops = [...new Set(colaboradores.map((c) => c.nombre.split(' ')[0]))].filter((n) =>
        n.toLowerCase().includes(q),
      )
      setSug(ops.length ? { tipo: '@', opciones: ops.slice(0, 6) } : null)
    } else if (m2) {
      const q = m2[2].toLowerCase()
      const ops = [...new Set(referencias)].filter((r) => r.toLowerCase().includes(q))
      setSug(ops.length ? { tipo: '#', opciones: ops.slice(0, 6) } : null)
    } else {
      setSug(null)
    }
  }

  function onChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setTexto(e.target.value)
    calcSug(e.target.value, e.target.selectionStart ?? e.target.value.length)
  }

  function elegir(op: string) {
    const el = ref.current
    if (!el) return
    const pos = el.selectionStart
    const antes = texto.slice(0, pos)
    const despues = texto.slice(pos)
    const re = sug?.tipo === '#' ? REF : MENCION
    const simbolo = sug?.tipo ?? '@'
    const handle = op.replace(/\s+/g, '')
    const nuevoAntes = antes.replace(re, (_m, pre) => `${pre}${simbolo}${handle} `)
    setTexto(nuevoAntes + despues)
    setSug(null)
    setTimeout(() => el.focus(), 0)
  }

  function insertarEmoji(em: string) {
    const el = ref.current
    const pos = el?.selectionStart ?? texto.length
    setTexto(texto.slice(0, pos) + em + texto.slice(pos))
    setEmoji(false)
    setTimeout(() => el?.focus(), 0)
  }

  function envolver(sym: string) {
    const el = ref.current
    if (!el) return
    const s = el.selectionStart
    const e = el.selectionEnd
    const sel = texto.slice(s, e) || 'texto'
    setTexto(texto.slice(0, s) + sym + sel + sym + texto.slice(e))
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(s + sym.length, s + sym.length + sel.length)
    }, 0)
  }

  function prefijoLinea(pref: string) {
    const el = ref.current
    if (!el) return
    const s = el.selectionStart
    const ini = texto.lastIndexOf('\n', s - 1) + 1
    setTexto(texto.slice(0, ini) + pref + texto.slice(ini))
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(s + pref.length, s + pref.length)
    }, 0)
  }

  function enviar() {
    if (!texto.trim()) return
    onEnviar(texto)
    setTexto('')
    setSug(null)
  }

  function onKey(e: EventoTecla) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (sug && sug.opciones[0]) elegir(sug.opciones[0])
      else enviar()
    } else if (e.key === 'Escape') {
      setSug(null)
    }
  }

  return (
    <div className="chat__compose">
      {sug && (
        <div className="chat-sug">
          {sug.opciones.map((op) => (
            <button type="button" key={op} className="chat-sug__op" onClick={() => elegir(op)}>
              <span className="chat-sug__sim">{sug.tipo}</span>
              {op}
            </button>
          ))}
        </div>
      )}

      {emoji && (
        <div className="chat-emojis">
          {EMOJIS.map((em) => (
            <button type="button" key={em} onClick={() => insertarEmoji(em)}>
              {em}
            </button>
          ))}
        </div>
      )}

      <div className="chat-tools">
        <button type="button" onClick={() => envolver('*')} title="Negrita">
          <Bold size={14} />
        </button>
        <button type="button" onClick={() => envolver('_')} title="Cursiva">
          <Italic size={14} />
        </button>
        <button type="button" onClick={() => envolver('~')} title="Tachado">
          <Strikethrough size={14} />
        </button>
        <button type="button" onClick={() => envolver('`')} title="Código">
          <Code size={14} />
        </button>
        <button type="button" onClick={() => prefijoLinea('- ')} title="Viñeta">
          <List size={14} />
        </button>
        <button type="button" onClick={() => prefijoLinea('> ')} title="Cita">
          <Quote size={14} />
        </button>
      </div>

      <div className="chat__input">
        <button
          type="button"
          className="chat__emoji-btn"
          onClick={() => setEmoji((o) => !o)}
          aria-label="Emojis"
        >
          <Smile size={18} />
        </button>
        <textarea
          ref={ref}
          className="field__input chat__ta"
          rows={1}
          value={texto}
          onChange={onChange}
          onKeyDown={onKey}
          placeholder="Escribe un mensaje…  @ menciona · # referencia"
        />
        <button
          type="button"
          className="btn btn--primary btn--icono"
          onClick={enviar}
          aria-label="Enviar"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
