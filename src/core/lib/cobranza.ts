import type { CuotaPlan, MetodoCobro, Pago, PlanPago, Presupuesto, TipoCobro } from '@/core/datos'
import { totalizar } from './dinero'

export const MEDIOS_PAGO: { valor: Pago['medio']; etiqueta: string }[] = [
  { valor: 'divisa_efectivo', etiqueta: 'Divisas en efectivo' },
  { valor: 'divisa_binance', etiqueta: 'Divisas por Binance' },
  { valor: 'divisa_zelle', etiqueta: 'Divisas por Zelle' },
  { valor: 'bolivares_efectivo', etiqueta: 'Bolívares en efectivo' },
  { valor: 'pago_movil', etiqueta: 'Pago Móvil' },
  { valor: 'transferencia', etiqueta: 'Transferencia' },
  { valor: 'otro', etiqueta: 'Otro' },
]

export const DISPARADORES: { valor: CuotaPlan['disparador']; etiqueta: string }[] = [
  { valor: 'al_aceptar', etiqueta: 'Al aceptar el presupuesto' },
  { valor: 'al_iniciar', etiqueta: 'Para iniciar el desarrollo' },
  { valor: 'al_aprobar', etiqueta: 'Al aprobar en conformidad' },
  { valor: 'al_entregar', etiqueta: 'Al recibir el proyecto' },
  { valor: 'fecha', etiqueta: 'En una fecha (días tras aceptar)' },
]

export type EstadoCuota = 'pendiente' | 'parcial' | 'pagada' | 'vencida'

export interface CuotaCalculada {
  id: string
  numero: number
  concepto: string
  disparador: CuotaPlan['disparador']
  /** Monto que corresponde a la cuota, en la moneda del presupuesto. */
  monto: number
  /** Fecha de vencimiento (solo si el disparador es por fecha). */
  vence?: string
  pagado: number
  saldo: number
  estado: EstadoCuota
  /** Días de atraso más allá de la gracia (0 si no aplica). */
  diasAtraso: number
}

export interface EstadoCobranza {
  moneda: string
  /** Total del presupuesto, sin financiamiento. */
  base: number
  /** Recargo por pagar a crédito. */
  interes: number
  /** Lo que realmente debe cobrarse. */
  total: number
  cuotas: CuotaCalculada[]
  pagado: number
  saldo: number
  /** Saldo de cuotas ya vencidas. */
  vencido: number
  /** Recargo por mora estimado sobre lo vencido. */
  mora: number
}

function r2(n: number): number {
  return Math.round(n * 100) / 100
}

/** Plan por defecto: un solo pago de contado. */
export function planPorDefecto(): PlanPago {
  return {
    modalidad: 'contado',
    interes: 0,
    moraPorcentaje: 0,
    baseMora: 'cuota',
    diasGracia: 5,
    cuotas: [
      {
        id: crypto.randomUUID(),
        numero: 1,
        concepto: 'Pago único',
        porcentaje: 100,
        disparador: 'al_aceptar',
      },
    ],
  }
}

/** Cuota nueva lista para editar. */
export function cuotaNueva(numero: number): CuotaPlan {
  return {
    id: crypto.randomUUID(),
    numero,
    concepto: numero === 1 ? 'Enganche' : `Cuota ${numero}`,
    porcentaje: 0,
    disparador: numero === 1 ? 'al_iniciar' : 'fecha',
    diasDesdeAceptacion: numero === 1 ? 0 : (numero - 1) * 30,
  }
}

function sumarDias(iso: string, dias: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + dias)
  return d.toISOString()
}

/**
 * Estado de cobro de un presupuesto: cuánto corresponde a cada cuota, cuánto
 * se abonó (sumando pagos en cualquier moneda, ya convertidos) y qué está
 * vencido.
 */
export function calcularCobranza(p: Presupuesto, pagos: Pago[]): EstadoCobranza {
  const base = totalizar(p).total
  const plan = p.plan ?? planPorDefecto()
  const interes = plan.modalidad === 'credito' ? r2(base * (plan.interes / 100)) : 0
  const total = r2(base + interes)

  const propios = pagos.filter((x) => x.presupuestoId === p.id)
  const hoy = Date.now()

  const cuotas: CuotaCalculada[] = plan.cuotas
    .slice()
    .sort((a, b) => a.numero - b.numero)
    .map((c) => {
      const monto = r2(c.monto ?? total * ((c.porcentaje ?? 0) / 100))
      const vence =
        c.disparador === 'fecha' && p.aceptadoEn
          ? sumarDias(p.aceptadoEn, c.diasDesdeAceptacion ?? 0)
          : undefined

      const pagado = r2(
        propios.filter((x) => x.cuotaId === c.id).reduce((s, x) => s + x.equivalente, 0),
      )
      const saldo = r2(Math.max(0, monto - pagado))

      let estado: EstadoCuota = 'pendiente'
      let diasAtraso = 0
      if (saldo <= 0.009) estado = 'pagada'
      else if (pagado > 0) estado = 'parcial'

      if (saldo > 0.009 && vence) {
        const limite = new Date(vence).getTime() + plan.diasGracia * 86400000
        if (hoy > limite) {
          estado = 'vencida'
          diasAtraso = Math.floor((hoy - limite) / 86400000)
        }
      }

      return { id: c.id, numero: c.numero, concepto: c.concepto, disparador: c.disparador, monto, vence, pagado, saldo, estado, diasAtraso }
    })

  const pagado = r2(propios.reduce((s, x) => s + x.equivalente, 0))
  const saldo = r2(Math.max(0, total - pagado))
  const vencido = r2(cuotas.filter((c) => c.estado === 'vencida').reduce((s, c) => s + c.saldo, 0))
  // La mora se calcula sobre el saldo vencido o sobre el total del contrato,
  // según lo pactado. Si no hay nada vencido, no hay mora en ninguno de los dos
  // casos: la base cambia el monto, no el hecho de que haya incumplimiento.
  const baseMora = plan.baseMora === 'total' && vencido > 0 ? total : vencido
  const mora = r2(baseMora * (plan.moraPorcentaje / 100))

  return { moneda: p.moneda, base, interes, total, cuotas, pagado, saldo, vencido, mora }
}

/** Convierte un abono a la moneda del presupuesto con la tasa indicada. */
export function equivalenteDe(monto: number, monedaPago: string, monedaDestino: string, tasa?: number): number {
  if (monedaPago.toUpperCase() === monedaDestino.toUpperCase()) return r2(monto)
  if (!tasa || tasa <= 0) return 0
  // `tasa` = cuántas unidades de monedaPago equivalen a 1 de monedaDestino.
  return r2(monto / tasa)
}

/** Etiqueta legible de un método de cobro. */
export const ETIQUETA_COBRO: Record<TipoCobro, string> = {
  pago_movil: 'Pago Móvil',
  transferencia: 'Transferencia',
}

/**
 * Texto que se codifica en el QR y se copia: legible para quien paga, de modo
 * que pueda cargar los datos en su app bancaria sin tipearlos.
 */
export function textoCobro(m: MetodoCobro): string {
  const etiquetaNumero = m.tipo === 'pago_movil' ? 'Teléfono' : 'Cuenta'
  return [
    ETIQUETA_COBRO[m.tipo],
    `Banco: ${m.banco}`,
    `${etiquetaNumero}: ${m.numero}`,
    `CI/RIF: ${m.documento}`,
    `Titular: ${m.titular}`,
  ].join('\n')
}
