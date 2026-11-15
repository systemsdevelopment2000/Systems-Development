import './subirAdjuntos.css'
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Upload, FileText, Image as ImagenIc, X, Download } from 'lucide-react'
import { nuevoId, type Adjunto } from '@/core/datos'
import { aDataUrl, archivoADataUrl } from '@/core/lib/imagen'

const MAX_MB = 4

interface Props {
  adjuntos: Adjunto[]
  onCambio: (a: Adjunto[]) => void
  /** Texto del área de carga. */
  etiqueta?: string
  /** Un solo archivo (reemplaza) en vez de acumular. */
  unico?: boolean
}

/**
 * Carga de documentos: imágenes **y PDF**.
 *
 * `SubirImagen` solo acepta imágenes y además las reescala, así que no sirve
 * para un currículum o una cédula escaneada en PDF. Este componente admite los
 * dos, acepta arrastrar y soltar, y deja descargar lo cargado.
 *
 * En la fase front los archivos viven como data URL en el almacenamiento local
 * del navegador; por eso el tope de 4 MB por archivo. Al conectar Supabase irán
 * a Storage.
 */
export function SubirAdjuntos({ adjuntos, onCambio, etiqueta, unico }: Props) {
  const entrada = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [encima, setEncima] = useState(false)

  async function procesar(files: File[]) {
    setError(null)
    const nuevos: Adjunto[] = []

    for (const f of files) {
      const esImg = f.type.startsWith('image/')
      const esPdf = f.type === 'application/pdf'
      if (!esImg && !esPdf) {
        setError(`"${f.name}" no es imagen ni PDF.`)
        continue
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        setError(`"${f.name}" supera ${MAX_MB} MB.`)
        continue
      }
      try {
        // Las imágenes se reescalan para no reventar el almacenamiento;
        // el PDF se guarda tal cual, porque recomprimirlo lo dañaría.
        const dataUrl = esImg ? await aDataUrl(f, 1600) : await archivoADataUrl(f)
        nuevos.push({
          id: nuevoId(),
          nombre: f.name,
          tipo: esImg ? 'image/webp' : 'application/pdf',
          dataUrl,
        })
      } catch {
        setError(`No se pudo leer "${f.name}".`)
      }
    }

    if (nuevos.length) onCambio(unico ? [nuevos[0]] : [...adjuntos, ...nuevos])
  }

  async function onInput(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    await procesar(files)
  }

  async function onSoltar(e: DragEvent) {
    e.preventDefault()
    setEncima(false)
    await procesar(Array.from(e.dataTransfer.files ?? []))
  }

  function quitar(id: string) {
    onCambio(adjuntos.filter((a) => a.id !== id))
  }

  function descargar(a: Adjunto) {
    const el = document.createElement('a')
    el.href = a.dataUrl
    el.download = a.nombre
    el.click()
  }

  return (
    <div className="adj">
      <button
        type="button"
        className={'adj__zona' + (encima ? ' is-encima' : '')}
        onClick={() => entrada.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setEncima(true)
        }}
        onDragLeave={() => setEncima(false)}
        onDrop={(e) => void onSoltar(e)}
      >
        <Upload size={16} />
        <span>
          {etiqueta ?? 'Subir documentos'}
          <em>Arrastra aquí o haz clic · imágenes y PDF · hasta {MAX_MB} MB</em>
        </span>
      </button>

      <input
        ref={entrada}
        type="file"
        accept="image/*,application/pdf"
        multiple={!unico}
        hidden
        onChange={(e) => void onInput(e)}
      />

      {error && (
        <p className="adj__error" role="alert">
          {error}
        </p>
      )}

      {adjuntos.length > 0 && (
        <ul className="adj__lista">
          {adjuntos.map((a) => {
            const esPdf = a.tipo === 'application/pdf'
            return (
              <li className="adj__item" key={a.id}>
                {esPdf ? (
                  <span className="adj__ic adj__ic--pdf">
                    <FileText size={15} />
                  </span>
                ) : (
                  <img className="adj__miniatura" src={a.dataUrl} alt="" />
                )}

                <a
                  className="adj__nombre"
                  href={a.dataUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Abrir en una pestaña nueva"
                >
                  {a.nombre}
                  <em>{esPdf ? 'PDF' : 'Imagen'}</em>
                </a>

                <button
                  type="button"
                  className="icono-btn"
                  onClick={() => descargar(a)}
                  aria-label={`Descargar ${a.nombre}`}
                  title="Descargar"
                >
                  <Download size={13} />
                </button>
                <button
                  type="button"
                  className="icono-btn icono-btn--peligro"
                  onClick={() => quitar(a.id)}
                  aria-label={`Quitar ${a.nombre}`}
                >
                  <X size={13} />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {!adjuntos.length && (
        <p className="adj__nada">
          <ImagenIc size={12} /> Sin documentos cargados.
        </p>
      )}
    </div>
  )
}
