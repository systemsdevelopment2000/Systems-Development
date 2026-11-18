import { useState } from 'react'
import {
  ExternalLink,
  ShieldCheck,
  KeyRound,
  Mail,
  Copy,
  Check,
  Eye,
  EyeOff,
  GitBranch,
  Pencil,
  CalendarClock,
  Wallet,
} from 'lucide-react'
import type { AccesoHerramienta } from '@/core/datos'
import type { HerramientaVista } from '../hooks/useHerramientas'
import { obtenerDefTipoHerramienta, IconoCategoria } from '../lib/categoriasHerramientas'

interface Props {
  herramienta: HerramientaVista
  onEditar: () => void
  onEditarAcceso: (acceso: AccesoHerramienta) => void
  onCerrar: () => void
}

export function BovedaAccesosModal({ herramienta: h, onEditar, onEditarAcceso, onCerrar }: Props) {
  const [verPassMap, setVerPassMap] = useState<Record<string, boolean>>({})
  const [copiado, setCopiado] = useState<string>('')

  const tipoDef = obtenerDefTipoHerramienta(h.tipoHerramienta)
  const listaAccesos = h.accesosNormalizados || []

  function copiar(texto: string, cual: string) {
    if (!texto) return
    navigator.clipboard?.writeText(texto).then(() => {
      setCopiado(cual)
      setTimeout(() => setCopiado(''), 1500)
    })
  }

  function toggleVerPass(id: string) {
    setVerPassMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="bov-modal">
      {/* ── CABECERA RESUMEN DE LA HERRAMIENTA ── */}
      <div className="bov-modal__head">
        <div className="bov-modal__icon-wrap" style={{ color: tipoDef.color }}>
          <IconoCategoria id={tipoDef.id} size={22} />
        </div>
        <div className="bov-modal__titulos">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h2 className="bov-modal__nombre">{h.nombre}</h2>
            <span
              className="hrr-tipo-badge"
              style={{ color: tipoDef.color, borderColor: `color-mix(in srgb, ${tipoDef.color} 30%, transparent)` }}
            >
              {tipoDef.etiqueta}
            </span>
            <span className={'hrr-prop hrr-prop--' + (h.propietario === 'sd' ? 'sd' : 'cli')}>
              {h.propietario === 'sd' ? 'Propia (SD)' : 'Cliente'}
            </span>
          </div>

          {(h.clienteNombre || h.proyectoNombre) && (
            <p className="hrr-asoc" style={{ marginTop: 3 }}>
              {h.cuantosClientes > 1 && (
                <span className="hrr-compartida">compartida · {h.cuantosClientes}</span>
              )}
              {h.clienteNombre}
              {h.proyectoNombre ? ` · ${h.proyectoNombre}` : ''}
            </p>
          )}

          {h.url && (
            <a className="hrr-url" href={h.url} target="_blank" rel="noreferrer" style={{ marginTop: 4 }}>
              <ExternalLink size={12} /> {h.url}
            </a>
          )}
        </div>
      </div>

      {/* ── DETALLES DE PAGO RECURRENTE ── */}
      <div className="bov-modal__pago-box">
        <div className="bov-modal__pago-item">
          <span className="bov-modal__pago-etiqueta">
            <CalendarClock size={13} /> Ciclo y Fecha de Pago
          </span>
          <span className="bov-modal__pago-valor">
            {h.diaPagoMes ? (
              <strong>Día {h.diaPagoMes} de cada mes</strong>
            ) : h.ciclo === 'mensual' ? (
              'Mensual'
            ) : (
              'Anual'
            )}
            {h.proximoPago && (
              <small style={{ marginLeft: 6, color: 'var(--text-muted)' }}>
                (Próx.{' '}
                {new Date(h.proximoPago + 'T00:00:00').toLocaleDateString('es-VE', {
                  dateStyle: 'medium',
                })}
                )
              </small>
            )}
          </span>
        </div>

        {h.precio != null && (
          <div className="bov-modal__pago-item">
            <span className="bov-modal__pago-etiqueta">
              <Wallet size={13} /> Costo
            </span>
            <span className="bov-modal__pago-valor">
              <strong>{h.precio} {h.moneda ?? 'USD'}</strong> <small>/ {h.ciclo === 'mensual' ? 'mes' : 'año'}</small>
              {h.metodoPago ? ` · ${h.metodoPago}` : ''}
            </span>
          </div>
        )}
      </div>

      {/* ── LISTA DE CONTRASEÑAS Y ACCESOS ── */}
      <div className="bov-modal__seccion-tit">
        <ShieldCheck size={16} />
        <span>Contraseñas y Accesos que parten de la herramienta ({listaAccesos.length})</span>
      </div>

      {listaAccesos.length === 0 ? (
        <div className="bov-modal__vacio">
          <p>No hay contraseñas ni tokens guardados para esta herramienta.</p>
          <button type="button" className="btn btn--secundario" onClick={onEditar}>
            <Pencil size={13} /> Añadir accesos ahora
          </button>
        </div>
      ) : (
        <div className="bov-modal__lista">
          {listaAccesos.map((acc, idx) => {
            const verPass = Boolean(verPassMap[acc.id])
            const keyCorreo = `${acc.id}-usr`
            const keyPass = `${acc.id}-pass`
            const keyToken = `${acc.id}-token`

            return (
              <div key={acc.id || idx} className="bov-modal__item">
                <div className="bov-modal__item-head">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="bov-modal__item-num">#{idx + 1}</span>
                    <strong className="bov-modal__item-nombre">
                      {acc.nombre || `Acceso #${idx + 1}`}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {acc.vinculaGit ? (
                      <span className="hrr-git-badge" title="Vinculado con repositorio Git / GitHub">
                        <GitBranch size={12} /> Vincula Git
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className="hrr-mini"
                      onClick={() => onEditarAcceso(acc)}
                      title="Editar solo esta credencial"
                      aria-label={`Editar credencial ${acc.nombre || `Acceso #${idx + 1}`}`}
                    >
                      <Pencil size={13} />
                    </button>
                  </div>
                </div>

                <div className="bov-modal__campos">
                  {acc.usuario ? (
                    <div className="bov-modal__campo">
                      <span className="bov-modal__campo-label">
                        <Mail size={12} /> Usuario / Correo
                      </span>
                      <div className="bov-modal__campo-val-wrap">
                        <span className="bov-modal__campo-val">{acc.usuario}</span>
                        <button
                          type="button"
                          className="hrr-mini"
                          onClick={() => copiar(acc.usuario!, keyCorreo)}
                          title="Copiar usuario o correo"
                        >
                          {copiado === keyCorreo ? <Check size={13} color="var(--brand-2)" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {acc.contrasena ? (
                    <div className="bov-modal__campo">
                      <span className="bov-modal__campo-label">
                        <KeyRound size={12} /> Contraseña
                      </span>
                      <div className="bov-modal__campo-val-wrap">
                        <span className="bov-modal__campo-val mono hrr-pass">
                          {verPass ? acc.contrasena : '••••••••••••'}
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            type="button"
                            className="hrr-mini"
                            onClick={() => toggleVerPass(acc.id)}
                            title={verPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                          >
                            {verPass ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button
                            type="button"
                            className="hrr-mini"
                            onClick={() => copiar(acc.contrasena!, keyPass)}
                            title="Copiar contraseña"
                          >
                            {copiado === keyPass ? <Check size={13} color="var(--brand-2)" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {acc.token ? (
                    <div className="bov-modal__campo bov-modal__campo--token">
                      <span className="bov-modal__campo-label">
                        <KeyRound size={12} /> Access Token / Clave API
                      </span>
                      <div className="bov-modal__campo-val-wrap">
                        <span className="bov-modal__campo-val mono bov-modal__token-text" title={acc.token}>
                          {acc.token}
                        </span>
                        <button
                          type="button"
                          className="hrr-mini"
                          onClick={() => copiar(acc.token!, keyToken)}
                          title="Copiar Access Token"
                        >
                          {copiado === keyToken ? <Check size={13} color="var(--brand-2)" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {acc.notas ? (
                    <div className="bov-modal__campo bov-modal__campo--notas">
                      <span className="bov-modal__campo-label">Notas</span>
                      <p className="bov-modal__notas-texto">{acc.notas}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── PIE DE ACCIONES ── */}
      <div className="bov-modal__foot">
        <button type="button" className="btn btn--primario" onClick={onEditar}>
          <Pencil size={14} /> Editar herramienta y accesos
        </button>
        <button type="button" className="btn btn--secundario" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    </div>
  )
}
