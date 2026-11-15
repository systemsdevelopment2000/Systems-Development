import { useEffect, useState } from 'react'
import { Download, Copy, Check } from 'lucide-react'
import { Button } from './Button'

interface Props {
  /** Texto que se codifica en el QR. */
  contenido: string
  /** Nombre del archivo al descargar. */
  nombre?: string
  /** Texto legible que se muestra bajo el QR (y se puede copiar). */
  resumen?: string
}

/**
 * Genera y muestra un QR a partir de un texto. Se usa para compartir datos de
 * cobro: quien paga lo escanea y carga los datos en su app bancaria.
 */
export function CodigoQR({ contenido, nombre = 'codigo-qr', resumen }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    let vivo = true
    async function generar() {
      try {
        const QR = await import('qrcode')
        const dataUrl = await QR.toDataURL(contenido, {
          width: 320,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: { dark: '#040404', light: '#FFFFFF' },
        })
        if (vivo) setUrl(dataUrl)
      } catch {
        if (vivo) setError('No se pudo generar el código QR.')
      }
    }
    void generar()
    return () => {
      vivo = false
    }
  }, [contenido])

  function descargar() {
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `${nombre}.png`
    a.click()
  }

  function copiar() {
    navigator.clipboard?.writeText(resumen ?? contenido).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1400)
    })
  }

  return (
    <div className="qr">
      {error ? (
        <p className="form__error">{error}</p>
      ) : url ? (
        <img className="qr__img" src={url} alt="Código QR con los datos de pago" />
      ) : (
        <div className="qr__cargando">Generando…</div>
      )}

      {resumen && <pre className="qr__resumen">{resumen}</pre>}

      <p className="field__hint">
        Escanea con la app del banco o con la cámara. Verifica siempre los datos antes de pagar.
      </p>

      <div className="form-acciones">
        <Button type="button" variant="ghost" onClick={copiar}>
          {copiado ? <Check size={15} /> : <Copy size={15} />} {copiado ? 'Copiado' : 'Copiar datos'}
        </Button>
        <Button type="button" onClick={descargar} disabled={!url}>
          <Download size={15} /> Descargar QR
        </Button>
      </div>
    </div>
  )
}
