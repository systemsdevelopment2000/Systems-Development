import type { ReactNode } from 'react'

const INLINE =
  /(@[\wáéíóúñ]+|#[\wáéíóúñ]+|\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~|`[^`\n]+`)/g

function enLinea(linea: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = INLINE.exec(linea)) !== null) {
    if (m.index > last) out.push(linea.slice(last, m.index))
    const t = m[0]
    const cuerpo = t.slice(1, -1)
    if (t[0] === '@') out.push(<span key={k++} className="chat-men">{t}</span>)
    else if (t[0] === '#') out.push(<span key={k++} className="chat-ref">{t}</span>)
    else if (t[0] === '*') out.push(<strong key={k++}>{cuerpo}</strong>)
    else if (t[0] === '_') out.push(<em key={k++}>{cuerpo}</em>)
    else if (t[0] === '~') out.push(<s key={k++}>{cuerpo}</s>)
    else out.push(<code key={k++} className="chat-code">{cuerpo}</code>)
    last = m.index + t.length
  }
  if (last < linea.length) out.push(linea.slice(last))
  return out
}

/** Renderiza el texto del mensaje con formato tipo WhatsApp/Telegram. */
export function TextoFormateado({ texto }: { texto: string }) {
  const bloques: ReactNode[] = []
  let lista: ReactNode[] = []
  const vaciarLista = (key: string) => {
    if (lista.length) {
      bloques.push(
        <ul className="chat-lista" key={`ul-${key}`}>
          {lista}
        </ul>,
      )
      lista = []
    }
  }

  texto.split('\n').forEach((raw, i) => {
    const linea = raw.replace(/\r$/, '')
    if (/^\s*[-•]\s+/.test(linea)) {
      lista.push(<li key={i}>{enLinea(linea.replace(/^\s*[-•]\s+/, ''))}</li>)
      return
    }
    vaciarLista(String(i))
    if (linea.trimStart().startsWith('>')) {
      bloques.push(
        <div className="chat-cita" key={i}>
          {enLinea(linea.replace(/^\s*>\s?/, ''))}
        </div>,
      )
      return
    }
    if (linea.trim() === '') {
      bloques.push(<div className="chat-br" key={i} />)
      return
    }
    bloques.push(<div key={i}>{enLinea(linea)}</div>)
  })
  vaciarLista('fin')

  return <div className="chat__texto">{bloques}</div>
}
