import '../styles/whatsapp.css'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Copy, Check, MessageCircle } from 'lucide-react'
import type { Cliente, Proyecto } from '@/core/datos'
import { PLANTILLAS, telefonoWa } from '../lib/plantillas'

interface Props {
  proyecto: Proyecto
  cliente?: Cliente
  estadoNombre?: string
}

/** Renderiza el formato WhatsApp (*negrita*, _cursiva_) para la vista previa. */
function formatear(texto: string): ReactNode {
  return texto.split('\n').map((linea, i) => <div key={i}>{parseInline(linea) || ' '}</div>)
}
function parseInline(linea: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const regex = /(\*[^*\n]+\*|_[^_\n]+_)/g
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = regex.exec(linea)) !== null) {
    if (m.index > last) nodes.push(linea.slice(last, m.index))
    const tok = m[0]
    if (tok.startsWith('*')) nodes.push(<strong key={key++}>{tok.slice(1, -1)}</strong>)
    else nodes.push(<em key={key++}>{tok.slice(1, -1)}</em>)
    last = m.index + tok.length
  }
  if (last < linea.length) nodes.push(linea.slice(last))
  return nodes
}

export function EnsamblaWhatsapp({ proyecto, cliente, estadoNombre }: Props) {
  const [plantillaId, setPlantillaId] = useState(PLANTILLAS[0].id)
  const [texto, setTexto] = useState('')
  const [copiado, setCopiado] = useState(false)

  const base = useMemo(() => {
    const p = PLANTILLAS.find((x) => x.id === plantillaId) ?? PLANTILLAS[0]
    return p.construir({ proyecto, cliente, estadoNombre })
  }, [plantillaId, proyecto, cliente, estadoNombre])

  useEffect(() => {
    setTexto(base)
  }, [base])

  function copiar() {
    navigator.clipboard?.writeText(texto).then(
      () => {
        setCopiado(true)
        setTimeout(() => setCopiado(false), 1600)
      },
      () => {},
    )
  }

  const tel = telefonoWa(cliente?.contacto.telefono)
  const waLink = tel ? `https://wa.me/${tel}?text=${encodeURIComponent(texto)}` : undefined

  return (
    <div className="wa">
      <div className="wa-plantillas">
        {PLANTILLAS.map((p) => (
          <button
            key={p.id}
            className={'wa-tpl' + (plantillaId === p.id ? ' is-on' : '')}
            onClick={() => setPlantillaId(p.id)}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      <div className="wa-grid">
        <textarea
          className="field__input wa-text"
          rows={12}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <div className="wa-chat">
          <div className="wa-burbuja">{formatear(texto)}</div>
        </div>
      </div>

      <div className="wa-acciones">
        <button className="btn btn--ghost btn--icono" onClick={copiar}>
          {copiado ? <Check size={15} /> : <Copy size={15} />} {copiado ? 'Copiado' : 'Copiar'}
        </button>
        {waLink ? (
          <a className="btn btn--primary btn--icono" href={waLink} target="_blank" rel="noreferrer">
            <MessageCircle size={15} /> Abrir en WhatsApp
          </a>
        ) : (
          <span className="field__hint">El cliente no tiene teléfono cargado.</span>
        )}
      </div>

      <p className="field__hint">
        Formato WhatsApp: *negrita*, _cursiva_. Edita el texto antes de copiar o enviar.
      </p>
    </div>
  )
}
