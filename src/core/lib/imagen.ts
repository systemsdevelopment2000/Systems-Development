/**
 * Convierte un archivo de imagen en data URL (base64), reescalado a `max` px
 * por el lado mayor. En la fase front se guarda en el store local.
 */
export function aDataUrl(file: File, max = 640): Promise<string> {
  return new Promise((resolve) => {
    const lector = new FileReader()
    lector.onload = () => {
      const base = typeof lector.result === 'string' ? lector.result : ''
      const img = new Image()
      img.onload = () => {
        const escala = Math.min(1, max / Math.max(img.width, img.height))
        const w = Math.round(img.width * escala)
        const h = Math.round(img.height * escala)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(base)
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/webp', 0.85))
      }
      img.onerror = () => resolve(base)
      img.src = base
    }
    lector.readAsDataURL(file)
  })
}

/** Lee cualquier archivo (p. ej. PDF) como data URL sin reescalar. */
export function archivoADataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => resolve(typeof lector.result === 'string' ? lector.result : '')
    lector.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    lector.readAsDataURL(file)
  })
}
