/**
 * Exporta filas (array de objetos) a un archivo .xlsx y dispara la descarga.
 * `xlsx` (SheetJS) se carga de forma dinámica: solo pesa cuando se exporta,
 * no en el bundle principal.
 */
export async function exportarExcel(
  nombreArchivo: string,
  hoja: string,
  filas: Record<string, unknown>[],
): Promise<void> {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(filas)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, hoja.slice(0, 31))
  XLSX.writeFile(wb, `${nombreArchivo}.xlsx`)
}
