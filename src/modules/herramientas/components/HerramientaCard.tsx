import type { MouseEvent } from 'react'
import {
  Pencil,
  Trash2,
  ExternalLink,
  KeyRound,
  CalendarClock,
  Wallet,
  BadgeCheck,
  GitBranch,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'
import { useConfirmar } from '@/core/ui'
import type { HerramientaVista } from '../hooks/useHerramientas'

interface Props {
  herramienta: HerramientaVista
  onEditar: () => void
  onBorrar: () => void
  onPagar: () => void
  onVerAccesos?: () => void
}

function etiquetaEstado(h: HerramientaVista) {
  if (h.estadoPago === 'sin_fecha') return 'Sin fecha'
  if (h.estadoPago === 'vencida') return `Vencida · ${Math.abs(h.dias ?? 0)}d`
  if (h.estadoPago === 'por_vencer') return h.dias === 0 ? 'Vence hoy' : `En ${h.dias}d`
  return 'Al día'
}

export function HerramientaCard({
  herramienta: h,
  onEditar,
  onBorrar,
  onPagar,
  onVerAccesos,
}: Props) {
  const confirmar = useConfirmar()

  const listaAccesos = h.accesosNormalizados || []
  const tieneGit = listaAccesos.some((a) => a.vinculaGit)

  /** Clic en cualquier parte de la tarjeta abre el modal con los accesos. */
  function abrirModal(e: MouseEvent<HTMLElement>) {
    const destino = e.target as HTMLElement
    if (destino.closest('button, a, input, textarea, select, label')) return
    onVerAccesos?.()
  }

  return (
    <article
      className={
        'hrr-card hrr-' + h.estadoPago + (onVerAccesos ? ' hrr-card--clicable' : '')
      }
      onClick={abrirModal}
    >
      {/* ── ENCABEZADO ── */}
      <div className="hrr-card__head">
        <div className="hrr-card__id">
          <button
            type="button"
            className="hrr-card__titulo-btn"
            onClick={onVerAccesos}
            title={`Ver accesos y contraseñas de ${h.nombre}`}
          >
            <span className="cl-card__nombre">{h.nombre}</span>
            <span className="hrr-card__num-accesos">
              <ShieldCheck size={12} />
              {listaAccesos.length} {listaAccesos.length === 1 ? 'acceso' : 'accesos'}
            </span>
            {tieneGit && (
              <span className="hrr-git-badge-mini" title="Vinculado con Git">
                <GitBranch size={10} /> Git
              </span>
            )}
            <ChevronRight size={14} className="hrr-card__titulo-flecha" />
          </button>
        </div>
        <div className="cl-card__acciones">
          {onVerAccesos && (
            <button
              className="icono-btn"
              onClick={onVerAccesos}
              aria-label="Abrir bóveda de accesos"
              title="Abrir bóveda de accesos y contraseñas"
            >
              <KeyRound size={15} />
            </button>
          )}
          <button className="icono-btn" onClick={onEditar} aria-label="Editar herramienta">
            <Pencil size={15} />
          </button>
          <button
            className="icono-btn icono-btn--peligro"
            onClick={onBorrar}
            aria-label="Eliminar herramienta"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* ── CLIENTE / PROYECTO ASOCIADO ── */}
      {(h.clienteNombre || h.proyectoNombre) && (
        <p className="hrr-asoc">
          {h.cuantosClientes > 1 && (
            <span className="hrr-compartida">compartida · {h.cuantosClientes}</span>
          )}
          {h.clienteNombre}
          {h.proyectoNombre ? ` · ${h.proyectoNombre}` : ''}
        </p>
      )}

      {/* ── ENLACE OFICIAL DE LA HERRAMIENTA ──
          Se muestra como texto para que el clic en toda la tarjeta abra el
          modal de accesos. El enlace real está dentro de la bóveda. */}
      {h.url && (
        <span className="hrr-url" title="Haz clic en la tarjeta para ver los accesos">
          <ExternalLink size={13} /> {h.url}
        </span>
      )}

      {/* ── DATOS DE PAGO Y COSTOS ── */}
      <div className="hrr-pago">
        {h.precio != null && (
          <span className="hrr-precio">
            {h.precio} {h.moneda ?? ''}{' '}
            <small>/ {h.ciclo === 'mensual' ? 'mes' : 'año'}</small>
            {h.cuantosClientes > 1 && h.precioPorCliente != null && (
              <small className="hrr-precio__reparto">
                {h.precioPorCliente === 0
                  ? ' · lo asume SD'
                  : ` · ${h.precioPorCliente} por cliente`}
              </small>
            )}
          </span>
        )}
        {h.metodoPago && (
          <span className="hrr-metodo">
            <Wallet size={12} /> {h.metodoPago}
          </span>
        )}
      </div>

      {/* ── VENCIMIENTO / FECHA DE PAGO ── */}
      <div className="hrr-card__foot">
        <span className="hrr-venc">
          <CalendarClock size={13} />
          {h.diaPagoMes ? (
            <span>
              <strong>Día {h.diaPagoMes}</strong> de cada mes ·{' '}
              {h.proximoPago
                ? new Date(h.proximoPago + 'T00:00:00').toLocaleDateString('es-VE', {
                    dateStyle: 'medium',
                  })
                : '—'}
            </span>
          ) : h.proximoPago ? (
            new Date(h.proximoPago + 'T00:00:00').toLocaleDateString('es-VE', {
              dateStyle: 'medium',
            })
          ) : (
            '—'
          )}
        </span>
        <span className={'hrr-estado hrr-estado--' + h.estadoPago}>{etiquetaEstado(h)}</span>
      </div>

      {/* ── REGISTRAR PAGO ── */}
      <button
        className="hrr-pagar"
        onClick={async () => {
          const sig = h.ciclo === 'mensual' ? 'un mes' : 'un año'
          const ok = await confirmar({
            titulo: `¿Registrar el pago de "${h.nombre}"?`,
            mensaje: `El próximo vencimiento se moverá ${sig} adelante y se guardará la fecha de pago.`,
            textoConfirmar: 'Registrar pago',
          })
          if (ok) onPagar()
        }}
        title="Registrar pago y reprogramar el próximo vencimiento"
      >
        <BadgeCheck size={14} /> Marcar pagada
      </button>

      {h.ultimoPago && (
        <span className="hrr-ultimo">
          Último pago:{' '}
          {new Date(h.ultimoPago + 'T00:00:00').toLocaleDateString('es-VE', {
            dateStyle: 'medium',
          })}
        </span>
      )}
    </article>
  )
}
