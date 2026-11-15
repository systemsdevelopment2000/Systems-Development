import { useState } from 'react'
import { Quote, Copy } from 'lucide-react'
import type { Colaborador, MensajeChat } from '@/core/datos'
import { ChatInput } from './ChatInput'
import { TextoFormateado } from './formatoChat'

interface Props {
  mensajes: MensajeChat[]
  colaboradores: Colaborador[]
  referencias: string[]
  nombreColaborador: (id?: string) => string
  onEnviar: (texto: string) => void
}

export function TabChat({ mensajes, colaboradores, referencias, nombreColaborador, onEnviar }: Props) {
  const [texto, setTexto] = useState('')

  function citar(m: MensajeChat) {
    const resumen = m.texto.replace(/\n/g, ' ').slice(0, 90)
    setTexto((prev) => `> ${nombreColaborador(m.autorId)}: ${resumen}\n` + prev)
  }
  function copiar(m: MensajeChat) {
    navigator.clipboard?.writeText(m.texto)
  }

  return (
    <div className="chat">
      <div className="chat__msgs">
        {mensajes.length === 0 && <p className="muted">Sin mensajes. Inicia la conversación.</p>}
        {mensajes.map((m) => (
          <div key={m.id} className="chat__msg">
            <div className="chat__msg-top">
              <span className="chat__autor">{nombreColaborador(m.autorId)}</span>
              <span className="chat__hora">
                {new Date(m.fecha).toLocaleString('es-VE', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </span>
              <div className="chat__acc">
                <button type="button" onClick={() => citar(m)} title="Citar">
                  <Quote size={13} />
                </button>
                <button type="button" onClick={() => copiar(m)} title="Copiar">
                  <Copy size={13} />
                </button>
              </div>
            </div>
            <TextoFormateado texto={m.texto} />
          </div>
        ))}
      </div>

      <ChatInput
        texto={texto}
        setTexto={setTexto}
        colaboradores={colaboradores}
        referencias={referencias}
        onEnviar={onEnviar}
      />
    </div>
  )
}
