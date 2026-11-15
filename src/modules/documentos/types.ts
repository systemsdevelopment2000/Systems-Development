import type { Cliente, Colaborador, Presupuesto, Proyecto } from '@/core/datos'

export type Plantilla = 'propuesta' | 'contrato'

export interface DatosDocumento {
  proyecto: Proyecto
  cliente?: Cliente
  responsables: Colaborador[]
  estadoNombre?: string
  tags: string[]
  /**
   * Presupuesto ACEPTADO del proyecto. El contrato toma de aquí la cifra
   * pactada (el texto legal sigue siendo editable) y la propuesta puede
   * mostrarlo de forma opcional.
   */
  presupuesto?: Presupuesto
}
