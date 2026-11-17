/**
 * Generación de PDF a partir de un nodo del DOM ya renderizado (la hoja con
 * identidad SD). Rasteriza el nodo con `html-to-image` (usa el motor del
 * navegador, respetando degradados y tipografías) y lo coloca en un A4 con
 * `jspdf`, paginando en vertical si la hoja es más alta que una página.
 *
 * Ventaja frente a `window.print()`: el PDF se produce directo y SIEMPRE
 * refleja lo que se ve en pantalla (membrete, logo, colores de marca), sin
 * depender de reglas `@media print`.
 *
 * Soporte Multiplataforma (Escritorio y Móvil):
 * En teléfonos y pantallas angostas, clona el documento en un lienzo fuera de
 * pantalla con ancho estándar A4 de escritorio (800px / 850px) para que
 * NUNCA se exporte con el layout estrecho de smartphone, garantizando
 * proporción A4 formal y fidedigna en cualquier dispositivo.
 */

type DocPdf = Awaited<ReturnType<typeof construirDoc>>

/** Margen del papel, en puntos (~8 mm): zona que la impresora no alcanza. */
const MARGEN_PDF = 22
const TOLERANCIA_PDF = 1

/**
 * Proporción alto/ancho del área útil de una A4 con ese margen. NO es 1.4142:
 * al descontar el margen por los cuatro lados, el rectángulo imprimible es
 * más alargado. La hoja debe medirse con esta relación o sobran páginas.
 */
export const RELACION_PAGINA = (841.89 - MARGEN_PDF * 2) / (595.28 - MARGEN_PDF * 2)

/**
 * Clona un elemento transfiriendo los valores actuales de inputs, textareas,
 * selects y el estado de canvas (que cloneNode(true) nativo no transfiere).
 */
function clonarElementoParaImpresion(elemento: HTMLElement): HTMLElement {
  const clon = elemento.cloneNode(true) as HTMLElement

  // Sincronizar inputs / textareas / selects
  const origInputs = elemento.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input, textarea, select',
  )
  const clonInputs = clon.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input, textarea, select',
  )
  origInputs.forEach((orig, idx) => {
    const dest = clonInputs[idx]
    if (!dest) return
    if (orig instanceof HTMLInputElement && (orig.type === 'checkbox' || orig.type === 'radio')) {
      (dest as HTMLInputElement).checked = orig.checked
    } else {
      dest.value = orig.value
    }
  })

  // Sincronizar canvas
  const origCanvas = elemento.querySelectorAll<HTMLCanvasElement>('canvas')
  const clonCanvas = clon.querySelectorAll<HTMLCanvasElement>('canvas')
  origCanvas.forEach((orig, idx) => {
    const dest = clonCanvas[idx]
    if (!dest) return
    const ctx = dest.getContext('2d')
    if (ctx) ctx.drawImage(orig, 0, 0)
  })

  return clon
}

async function construirDoc(elemento: HTMLElement) {
  const [htmlToImage, jspdf] = await Promise.all([import('html-to-image'), import('jspdf')])
  const { toPng } = htmlToImage
  const JsPDF = jspdf.jsPDF

  // Determinar ancho A4 óptimo según el tipo de documento (.mb membrete o .doc contrato/propuesta)
  const esMb = elemento.classList.contains('mb') || Boolean(elemento.querySelector('.mb'))
  const anchoA4 = esMb ? 850 : 800

  // Crear contenedor de renderizado aislado fuera de pantalla (directamente en body,
  // fuera de cualquier clase .movil o limitaciones de viewport de teléfonos móviles).
  const contenedor = document.createElement('div')
  contenedor.className = 'sd-lienzo-export-pdf'
  contenedor.style.position = 'fixed'
  contenedor.style.top = '0'
  contenedor.style.left = '0'
  contenedor.style.width = `${anchoA4}px`
  contenedor.style.minWidth = `${anchoA4}px`
  contenedor.style.maxWidth = `${anchoA4}px`
  contenedor.style.zIndex = '-9999'
  contenedor.style.pointerEvents = 'none'
  contenedor.style.background = '#ffffff'
  contenedor.style.margin = '0'
  contenedor.style.padding = '0'
  contenedor.style.boxSizing = 'border-box'
  contenedor.style.overflow = 'hidden'

  const clon = clonarElementoParaImpresion(elemento)
  clon.style.width = `${anchoA4}px`
  clon.style.minWidth = `${anchoA4}px`
  clon.style.maxWidth = `${anchoA4}px`
  clon.style.margin = '0'
  clon.style.boxSizing = 'border-box'
  clon.classList.add('doc--exportando', 'doc--imprimiendo')

  contenedor.appendChild(clon)
  document.body.appendChild(contenedor)

  let dataUrl: string
  try {
    // Esperar a que las fuentes y las imágenes estén completamente listas
    if (document.fonts?.ready) {
      await document.fonts.ready
    }

    const imagenes = Array.from(clon.querySelectorAll('img'))
    if (imagenes.length > 0) {
      await Promise.all(
        imagenes.map(
          (img) =>
            new Promise<void>((resolver) => {
              if (img.complete && img.naturalWidth !== 0) {
                resolver()
              } else {
                img.onload = () => resolver()
                img.onerror = () => resolver()
              }
            }),
        ),
      )
    }

    // Medir altura real del contenido en formato escritorio A4
    clon.style.minHeight = '0px'
    const altoReal = clon.scrollHeight
    const altoPagina = anchoA4 * RELACION_PAGINA
    const paginas = Math.max(1, Math.ceil(altoReal / altoPagina - 0.02))
    const altoTotal = Math.round(paginas * altoPagina)
    clon.style.minHeight = `${altoTotal}px`

    // Rasterizar a imagen de alta definición (pixelRatio: 2)
    dataUrl = await toPng(clon, {
      width: anchoA4,
      height: altoTotal,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true,
    })
  } finally {
    if (contenedor.parentNode) {
      contenedor.parentNode.removeChild(contenedor)
    }
  }

  const img = new Image()
  await new Promise<void>((resolver, rechazar) => {
    img.onload = () => resolver()
    img.onerror = () => rechazar(new Error('No se pudo rasterizar la hoja para el PDF.'))
    img.src = dataUrl
  })

  const pdf = new JsPDF({ unit: 'pt', format: 'a4', compress: true })
  const anchoPag = pdf.internal.pageSize.getWidth()
  const altoPag = pdf.internal.pageSize.getHeight()

  const anchoImg = anchoPag - MARGEN_PDF * 2
  const altoUtil = altoPag - MARGEN_PDF * 2
  const altoImg = (img.height / img.width) * anchoImg

  const HOLGURA = 1.07
  if (altoImg > altoUtil && altoImg <= altoUtil * HOLGURA) {
    const escala = altoUtil / altoImg
    const ancho = anchoImg * escala
    pdf.addImage(dataUrl, 'PNG', MARGEN_PDF + (anchoImg - ancho) / 2, MARGEN_PDF, ancho, altoUtil)
  } else if (altoImg <= altoUtil + TOLERANCIA_PDF) {
    pdf.addImage(dataUrl, 'PNG', MARGEN_PDF, MARGEN_PDF, anchoImg, altoImg)
  } else {
    // Hoja multipágina: se divide exactamente por área útil A4
    let posicion = MARGEN_PDF
    let restante = altoImg
    pdf.addImage(dataUrl, 'PNG', MARGEN_PDF, posicion, anchoImg, altoImg)
    restante -= altoUtil
    while (restante > TOLERANCIA_PDF) {
      posicion -= altoUtil
      pdf.addPage()
      pdf.addImage(dataUrl, 'PNG', MARGEN_PDF, posicion, anchoImg, altoImg)
      restante -= altoUtil
    }
  }

  return pdf
}

/** PDF ya generado, listo para previsualizar, imprimir o descargar. */
export interface PdfGenerado {
  /** URL de blob para mostrar en un visor/iframe. */
  url: string
  nombre: string
  descargar: () => void
  /** Libera la URL de blob al cerrar la vista previa. */
  revocar: () => void
}

/** Genera el PDF y devuelve una URL para previsualizarlo antes de descargar. */
export async function generarPdf(
  elemento: HTMLElement,
  nombreArchivo: string,
): Promise<PdfGenerado> {
  const pdf: DocPdf = await construirDoc(elemento)
  const url = URL.createObjectURL(pdf.output('blob'))
  return {
    url,
    nombre: nombreArchivo,
    descargar: () => pdf.save(`${nombreArchivo}.pdf`),
    revocar: () => URL.revokeObjectURL(url),
  }
}

/** Descarga directa (sin vista previa). */
export async function exportarPdf(elemento: HTMLElement, nombreArchivo: string): Promise<void> {
  const pdf = await construirDoc(elemento)
  pdf.save(`${nombreArchivo}.pdf`)
}
