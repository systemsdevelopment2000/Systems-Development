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
  GitBranch,
  ShieldCheck,
} from 'lucide-react'
import { useConfirmar } from '@/core/ui'
import type { HerramientaVista } from '../hooks/useHerramientas'
import { obtenerDefTipoHerramienta } from '../lib/categoriasHerramientas'

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
  const [verPassMap, setVerPassMap] = useState<Record<string, boolean>>({})
  const [copiado, setCopiado] = useState('')
  const confirmar = useConfirmar()

  const tipoDef = obtenerDefTipoHerramienta(h.tipoHerramienta)
  const listaAccesos = h.accesosNormalizados || []

  function copiar(texto: string, cual: string) {
    if (!texto) return
    navigator.clipboard?.writeText(texto).then(() => {
      setCopiado(cual)
      setTimeout(() => setCopiado(''), 1400)
    })
  }

  function toggleVerPass(id: string) {
    setVerPassMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <article className={'hrr-card hrr-' + h.estadoPago}>
      <div className="hrr-card__head">
        <div className="hrr-card__id">
          <h3 className="cl-card__nombre">{h.nombre}</h3>
          <span
            className="hrr-tipo-badge"
            style={{ color: tipoDef.color, borderColor: colorMix(tipoDef.color, 35) }}
            title={tipoDef.descripcion}
          >
            {tipoDef.etiqueta}
          </span>
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

      {/* ── DATOS DE PAGO Y FECHAS ── */}
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

      {/* ── CONTRASEÑAS O ACCESOS QUE PARTEN DE LA HERRAMIENTA ── */}
      <div className="hrr-accesos-box">
        <div className="hrr-accesos-box__head">
          <span>
            <ShieldCheck size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Accesos y Contraseñas ({listaAccesos.length})
          </span>
        </div>

        {listaAccesos.length === 0 ? (
          <span className="field__hint" style={{ fontSize: 11.5 }}>
            Sin accesos ni credenciales registradas.
          </span>
        ) : (
          listaAccesos.map((acc, idx) => {
            const verPass = Boolean(verPassMap[acc.id])
            const keyCorreo = `${acc.id}-usr`
            const keyPass = `${acc.id}-pass`
            const keyToken = `${acc.id}-token`

            return (
              <div key={acc.id || idx} className="hrr-acc-card-item">
                <div className="hrr-acc-card-item__top">
                  <span style={{ fontWeight: 600 }}>{acc.nombre || `Acceso #${idx + 1}`}</span>
                  {acc.vinculaGit ? (
                    <span className="hrr-git-badge" title="Vinculado con repositorio Git / GitHub">
                      <GitBranch size={11} /> Vincula Git
                    </span>
                  ) : null}
                </div>

                {acc.usuario && (
                  <div className="hrr-cred__row">
                    <Mail size={12} />
                    <span className="hrr-cred__val" title={acc.usuario}>{acc.usuario}</span>
                    <button
                      type="button"
                      className="hrr-mini"
                      onClick={() => copiar(acc.usuario!, keyCorreo)}
                      title="Copiar usuario o correo"
                    >
                      {copiado === keyCorreo ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                  </div>
                )}

                {acc.contrasena && (
                  <div className="hrr-cred__row">
                    <KeyRound size={12} />
                    <span className="hrr-cred__val hrr-pass">
                      {verPass ? acc.contrasena : '••••••••'}
                    </span>
                    <button
                      type="button"
                      className="hrr-mini"
                      onClick={() => toggleVerPass(acc.id)}
                      title={verPass ? 'Ocultar' : 'Ver'}
                    >
                      {verPass ? <EyeOff size={11} /> : <Eye size={11} />}
                    </button>
                    <button
                      type="button"
                      className="hrr-mini"
                      onClick={() => copiar(acc.contrasena!, keyPass)}
                      title="Copiar contraseña"
                    >
                      {copiado === keyPass ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                  </div>
                )}

                {acc.token && (
                  <div className="hrr-acc-card-item__token">
                    <KeyRound size={11} style={{ flexShrink: 0 }} />
                    <span className="hrr-acc-card-item__token-val" title={acc.token}>
                      {acc.token}
                    </span>
                    <button
                      type="button"
                      className="hrr-mini"
                      onClick={() => copiar(acc.token!, keyToken)}
                      title="Copiar Access Token"
                    >
                      {copiado === keyToken ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                  </div>
                )}

                {acc.notas && (
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-faint)' }}>
                    {acc.notas}
                  </p>
                )}
              </div>
            )
          })
        )}
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

function colorMix(hex: string, alpha: number): string {
  return `color-mix(in srgb, ${hex} ${alpha}%, transparent)`
}
