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
 * Ambas librerías se cargan de forma diferida (lazy) para no inflar el bundle.
 */

type DocPdf = Awaited<ReturnType<typeof construirDoc>>

/**
 * Lleva la altura de la hoja al siguiente múltiplo de página antes de
 * rasterizar. Sin esto, el contenido termina a media página y el pie se
 * imprime flotando en mitad del papel: el documento pierde formalidad.
 * Devuelve una función que restaura el estilo original.
 */
/** Margen del papel, en puntos (~8 mm): zona que la impresora no alcanza. */
const MARGEN_PDF = 22
const TOLERANCIA_PDF = 1

/**
 * Proporción alto/ancho del área útil de una A4 con ese margen. NO es 1.4142:
 * al descontar el margen por los cuatro lados, el rectángulo imprimible es
 * más alargado. La hoja debe medirse con esta relación o sobran páginas.
 */
export const RELACION_PAGINA = (841.89 - MARGEN_PDF * 2) / (595.28 - MARGEN_PDF * 2)

function ajustarAPaginas(elemento: HTMLElement): () => void {
  const anterior = elemento.style.minHeight
  const ancho = elemento.getBoundingClientRect().width
  if (!ancho) return () => undefined

  const restaurar = () => {
    elemento.style.minHeight = anterior
  }

  // La hoja trae en CSS una altura mínima de página calculada sobre su ancho
  // máximo (880px). Si en pantalla renderiza más angosta, esa altura ya no
  // equivale a una página y al medirla saldrían páginas de más, en blanco.
  // Por eso se anula antes de medir y se recalcula sobre el ancho REAL.
  elemento.style.minHeight = '0px'
  const alto = elemento.scrollHeight

  const altoPagina = ancho * RELACION_PAGINA
  const paginas = Math.max(1, Math.ceil(alto / altoPagina - 0.02))
  elemento.style.minHeight = `${paginas * altoPagina}px`

  return restaurar
}

async function construirDoc(elemento: HTMLElement) {
  const [htmlToImage, jspdf] = await Promise.all([import('html-to-image'), import('jspdf')])
  const { toPng } = htmlToImage
  const JsPDF = jspdf.jsPDF

  const restaurar = ajustarAPaginas(elemento)

  // `skipFonts: true` evita que la librería intente leer las hojas de estilo
  // de Google Fonts (cross-origin → SecurityError y consola sucia). La marca
  // vive en el logo, los colores y el layout, no en la fuente del cuerpo.
  let dataUrl: string
  try {
    dataUrl = await toPng(elemento, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true,
    })
  } finally {
    restaurar()
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

  // La hoja se dibujaba a sangre, pegada al borde del papel. Casi ninguna
  // impresora imprime hasta el borde, así que recortaba justo la franja de
  // abajo: el pie de página desaparecía en el papel aunque se viera bien en
  // la vista previa. Con margen, todo cae dentro del área imprimible.
  const anchoImg = anchoPag - MARGEN_PDF * 2
  const altoUtil = altoPag - MARGEN_PDF * 2
  const altoImg = (img.height / img.width) * anchoImg

  // Si el contenido se pasa de una página por poco, se reduce para que entre:
  // abrir una segunda hoja casi vacía se ve peor que un 6% menos de tamaño.
  // Es lo mismo que hace el "ajustar a la página" de cualquier impresora.
  const HOLGURA = 1.07
  if (altoImg > altoUtil && altoImg <= altoUtil * HOLGURA) {
    const escala = altoUtil / altoImg
    const ancho = anchoImg * escala
    pdf.addImage(dataUrl, 'PNG', MARGEN_PDF + (anchoImg - ancho) / 2, MARGEN_PDF, ancho, altoUtil)
  } else if (altoImg <= altoUtil + TOLERANCIA_PDF) {
    pdf.addImage(dataUrl, 'PNG', MARGEN_PDF, MARGEN_PDF, anchoImg, altoImg)
  } else {
    // Hoja larga: se repite la misma imagen desplazada hacia arriba por página.
    // La tolerancia evita que un resto de décimas agregue una página vacía.
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
