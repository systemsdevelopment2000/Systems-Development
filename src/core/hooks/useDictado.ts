import { useEffect, useRef, useState } from 'react'

/** Interfaz mínima de la Web Speech API (no está en los tipos estándar del DOM). */
interface Reconocimiento {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult:
    | ((e: {
        resultIndex: number
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>
      }) => void)
    | null
  onend: (() => void) | null
  onerror: (() => void) | null
}
type Ctor = new () => Reconocimiento

/**
 * Dictado por voz (voz→texto) con la Web Speech API.
 * Llama a `onTexto` con cada fragmento final reconocido.
 */
export function useDictado(onTexto: (texto: string) => void) {
  const [soportado, setSoportado] = useState(false)
  const [escuchando, setEscuchando] = useState(false)
  const ref = useRef<Reconocimiento | null>(null)
  const onTextoRef = useRef(onTexto)
  onTextoRef.current = onTexto

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: Ctor; webkitSpeechRecognition?: Ctor }
    const C = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!C) {
      setSoportado(false)
      return
    }
    setSoportado(true)
    const r = new C()
    r.lang = 'es-ES'
    r.continuous = true
    r.interimResults = false
    r.onresult = (e) => {
      let txt = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) txt += res[0].transcript
      }
      if (txt) onTextoRef.current(txt)
    }
    r.onend = () => setEscuchando(false)
    r.onerror = () => setEscuchando(false)
    ref.current = r
    return () => {
      try {
        r.stop()
      } catch {
        /* ya detenido */
      }
    }
  }, [])

  function alternar() {
    const r = ref.current
    if (!r) return
    if (escuchando) {
      r.stop()
      setEscuchando(false)
    } else {
      try {
        r.start()
        setEscuchando(true)
      } catch {
        setEscuchando(false)
      }
    }
  }

  return { soportado, escuchando, alternar }
}
