import { useState } from 'react'
import {
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  Check,
  Mail,
  KeyRound,
  CalendarClock,
  Wallet,
  BadgeCheck,
} from 'lucide-react'
import { useConfirmar } from '@/core/ui'
import type { HerramientaVista } from '../hooks/useHerramientas'

interface Props {
  herramienta: HerramientaVista
  onEditar: () => void
  onBorrar: () => void
  onPagar: () => void
}

function etiquetaEstado(h: HerramientaVista) {
  if (h.estadoPago === 'sin_fecha') return 'Sin fecha'
  if (h.estadoPago === 'vencida') return `Vencida · ${Math.abs(h.dias ?? 0)}d`
  if (h.estadoPago === 'por_vencer') return h.dias === 0 ? 'Vence hoy' : `En ${h.dias}d`
  return 'Al día'
}

export function HerramientaCard({ herramienta: h, onEditar, onBorrar, onPagar }: Props) {
  const [ver, setVer] = useState(false)
  const [copiado, setCopiado] = useState('')
  const confirmar = useConfirmar()

  function copiar(texto: string, cual: string) {
    navigator.clipboard?.writeText(texto).then(() => {
      setCopiado(cual)
      setTimeout(() => setCopiado(''), 1200)
    })
  }

  return (
    <article className={'hrr-card hrr-' + h.estadoPago}>
      <div className="hrr-card__head">
        <div className="hrr-card__id">
          <h3 className="cl-card__nombre">{h.nombre}</h3>
          <span className={'hrr-prop hrr-prop--' + (h.propietario === 'sd' ? 'sd' : 'cli')}>
            {h.propietario === 'sd' ? 'Propia (SD)' : 'Cliente'}
          </span>
        </div>
        <div className="cl-card__acciones">
          <button className="icono-btn" onClick={onEditar} aria-label="Editar">
            <Pencil size={15} />
          </button>
          <button className="icono-btn icono-btn--peligro" onClick={onBorrar} aria-label="Eliminar">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {(h.clienteNombre || h.proyectoNombre) && (
        <p className="hrr-asoc">
          {h.cuantosClientes > 1 && (
            <span className="hrr-compartida">compartida · {h.cuantosClientes}</span>
          )}
          {h.clienteNombre}
          {h.proyectoNombre ? ` · ${h.proyectoNombre}` : ''}
        </p>
      )}

      {h.url && (
        <a className="hrr-url" href={h.url} target="_blank" rel="noreferrer">
          <ExternalLink size={13} /> {h.url}
        </a>
      )}

      <div className="hrr-cred">
        {h.correo && (
          <div className="hrr-cred__row">
            <Mail size={13} />
            <span className="hrr-cred__val">{h.correo}</span>
            <button className="hrr-mini" onClick={() => copiar(h.correo!, 'correo')} title="Copiar">
              {copiado === 'correo' ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        )}
        {h.contrasena && (
          <div className="hrr-cred__row">
            <KeyRound size={13} />
            <span className="hrr-cred__val hrr-pass">{ver ? h.contrasena : '••••••••'}</span>
            <button className="hrr-mini" onClick={() => setVer((v) => !v)} title="Mostrar/ocultar">
              {ver ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
            <button className="hrr-mini" onClick={() => copiar(h.contrasena!, 'pass')} title="Copiar">
              {copiado === 'pass' ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        )}
      </div>

      <div className="hrr-pago">
        {h.precio != null && (
          <span className="hrr-precio">
            {h.precio} {h.moneda ?? ''} <small>/ {h.ciclo === 'mensual' ? 'mes' : 'año'}</small>
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

      <div className="hrr-card__foot">
        <span className="hrr-venc">
          <CalendarClock size={13} />
          {h.proximoPago
            ? new Date(h.proximoPago + 'T00:00:00').toLocaleDateString('es-VE', {
                dateStyle: 'medium',
              })
            : '—'}
        </span>
        <span className={'hrr-estado hrr-estado--' + h.estadoPago}>{etiquetaEstado(h)}</span>
      </div>

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
          {new Date(h.ultimoPago + 'T00:00:00').toLocaleDateString('es-VE', { dateStyle: 'medium' })}
        </span>
      )}
    </article>
  )
}
