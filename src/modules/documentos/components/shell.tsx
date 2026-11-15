import type { ReactNode } from 'react'
import { CabeceraSD, PieSD } from '@/core/ui'

/** Campo editable en línea o en bloque (contentEditable). Se ajusta antes de imprimir. */
export function Editable({ children, bloque }: { children: ReactNode; bloque?: boolean }) {
  if (bloque) {
    return (
      <div className="doc-edit doc-edit--bloque" contentEditable suppressContentEditableWarning>
        {children}
      </div>
    )
  }
  return (
    <span className="doc-edit" contentEditable suppressContentEditableWarning>
      {children}
    </span>
  )
}

/** Hoja del documento con identidad SD (cabecera de marca compartida + pie). */
export function DocumentoShell({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <article className="doc">
      <CabeceraSD />
      <h1 className="doc__titulo">{titulo}</h1>
      <div className="doc__cuerpo">{children}</div>
      <PieSD />
    </article>
  )
}

/** Bloque de firmas (cliente + Systems Development). */
export function FirmaDoble({ cliente }: { cliente?: string }) {
  return (
    <div className="doc-firmas">
      <div className="doc-firma">
        <span className="doc-firma__linea" />
        <span className="doc-firma__rol">Por el cliente</span>
        <span className="doc-firma__nombre">{cliente ?? 'Nombre y firma'}</span>
      </div>
      <div className="doc-firma">
        <span className="doc-firma__linea" />
        <span className="doc-firma__rol">Por Systems Development</span>
        <span className="doc-firma__nombre">Nombre y firma</span>
      </div>
    </div>
  )
}
