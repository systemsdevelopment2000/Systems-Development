import { useRef, useState } from 'react'

/**
 * Grabadora de nota de voz (MediaRecorder). Entrega el audio como data URL
 * (base64) al detener. En la fase front se guarda en el store local.
 */
export function useGrabadora(onAudio: (dataUrl: string) => void) {
  const soportado =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'

  const [grabando, setGrabando] = useState(false)
  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const onAudioRef = useRef(onAudio)
  onAudioRef.current = onAudio

  async function iniciar() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' })
        const fr = new FileReader()
        fr.onload = () => {
          if (typeof fr.result === 'string') onAudioRef.current(fr.result)
        }
        fr.readAsDataURL(blob)
        stream.getTracks().forEach((t) => t.stop())
      }
      rec.start()
      recRef.current = rec
      setGrabando(true)
    } catch {
      setGrabando(false)
    }
  }

  function detener() {
    const r = recRef.current
    if (r && r.state !== 'inactive') r.stop()
    setGrabando(false)
  }

  function alternar() {
    if (grabando) detener()
    else void iniciar()
  }

  return { soportado, grabando, alternar }
}
