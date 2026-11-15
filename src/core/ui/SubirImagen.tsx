import { useRef, type ChangeEvent } from 'react'
import { ImagePlus, X } from 'lucide-react'

interface Props {
  valor?: string
  onCambio: (dataUrl: string | undefined) => void
  etiqueta?: string
  forma?: 'circulo' | 'cuadrado'
}

/**
 * Carga una imagen desde el equipo, la reescala (máx. 320px) y la entrega
 * como data URL (base64). En la fase front se guarda en el store local;
 * al conectar backend se subirá a Supabase Storage.
 */
export function SubirImagen({ valor, onCambio, etiqueta = 'Imagen', forma = 'cuadrado' }: Props) {
  const ref = useRef<HTMLInputElement>(null)

  function onArchivo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const lector = new FileReader()
    lector.onload = () => {
      const img = new Image()
      img.onload = () => {
        const max = 320
        const escala = Math.min(1, max / Math.max(img.width, img.height))
        const w = Math.round(img.width * escala)
        const h = Math.round(img.height * escala)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          onCambio(typeof lector.result === 'string' ? lector.result : undefined)
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        onCambio(canvas.toDataURL('image/webp', 0.85))
      }
      img.src = typeof lector.result === 'string' ? lector.result : ''
    }
    lector.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="subir">
      <button
        type="button"
        className={`subir__preview subir__preview--${forma}`}
        onClick={() => ref.current?.click()}
        aria-label={`Subir ${etiqueta.toLowerCase()}`}
      >
        {valor ? <img src={valor} alt={etiqueta} /> : <ImagePlus size={20} />}
      </button>
      <div className="subir__acciones">
        <span className="subir__etiqueta">{etiqueta}</span>
        <div className="subir__botones">
          <button type="button" className="subir__btn" onClick={() => ref.current?.click()}>
            {valor ? 'Cambiar' : 'Subir'}
          </button>
          {valor && (
            <button
              type="button"
              className="subir__btn subir__btn--quitar"
              onClick={() => onCambio(undefined)}
            >
              <X size={12} /> Quitar
            </button>
          )}
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={onArchivo} />
    </div>
  )
}
