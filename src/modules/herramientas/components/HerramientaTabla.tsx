import { useState } from 'react'
import { Eye, EyeOff, Copy, Check, ExternalLink, Pencil, Trash2, GitBranch, KeyRound } from 'lucide-react'
import type { HerramientaVista } from '../hooks/useHerramientas'
import { obtenerDefTipoHerramienta } from '../lib/categoriasHerramientas'

interface Props {
  herramientas: HerramientaVista[]
  onEditar: (h: HerramientaVista) => void
  onBorrar: (h: HerramientaVista) => void
  onVerAccesos?: (h: HerramientaVista) => void
}

/** Copia al portapapeles con respaldo para contextos no seguros. */
async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = texto
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
}

function BotonCopiar({ valor, que }: { valor: string; que: string }) {
  const [listo, setListo] = useState(false)
  return (
    <button
      type="button"
      className="hrt-copiar"
      aria-label={`Copiar ${que}`}
      title={`Copiar ${que}`}
      onClick={async () => {
        await copiar(valor)
        setListo(true)
        setTimeout(() => setListo(false), 1400)
      }}
    >
      {listo ? <Check size={13} /> : <Copy size={13} />}
    </button>
  )
}

export function HerramientaTabla({ herramientas, onEditar, onBorrar, onVerAccesos }: Props) {
  const [visibles, setVisibles] = useState<string[]>([])

  function alternar(id: string) {
    setVisibles((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  if (!herramientas.length) {
    return <p className="field__hint">No hay herramientas que coincidan con el filtro.</p>
  }

  return (
    <div className="hrt-wrap">
      <table className="hrt">
        <thead>
          <tr>
            <th>Herramienta / Tipo</th>
            <th>Contraseñas y Accesos</th>
            <th className="hrt__due">De quién</th>
            <th className="hrt__pago">Pago / Vencimiento</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {herramientas.map((h) => {
            const visible = visibles.includes(h.id)
            const tipoDef = obtenerDefTipoHerramienta(h.tipoHerramienta)
            const accesos = h.accesosNormalizados || []

            return (
              <tr key={h.id} className={h.activa ? '' : 'is-inactiva'}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span className="hrt__nombre">{h.nombre}</span>
                    <span
                      className="hrr-tipo-badge"
                      style={{
                        alignSelf: 'flex-start',
                        color: tipoDef.color,
                        borderColor: `color-mix(in srgb, ${tipoDef.color} 30%, transparent)`,
                        fontSize: 9,
                        padding: '1px 6px',
                      }}
                    >
                      {tipoDef.etiqueta}
                    </span>
                    {h.url && (
                      <a className="hrt__url" href={h.url} target="_blank" rel="noreferrer">
                        <ExternalLink size={11} /> {h.url.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                </td>

                <td>
                  {accesos.length === 0 ? (
                    <span className="hrt__nada">—</span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {accesos.map((acc, idx) => {
                        const accVisible = visibles.includes(`${h.id}-${acc.id}`)

                        return (
                          <div
                            key={acc.id || idx}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 3,
                              padding: '5px 8px',
                              background: 'var(--surface-2)',
                              borderRadius: 'var(--radius-xs)',
                              border: '1px solid var(--border)',
                              fontSize: 12,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                              <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                                {acc.nombre || `Acceso #${idx + 1}`}
                              </span>
                              {acc.vinculaGit && (
                                <span className="hrr-git-badge" style={{ fontSize: 9, padding: '1px 5px' }}>
                                  <GitBranch size={10} /> Git ✓
                                </span>
                              )}
                            </div>

                            {acc.usuario && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                <span className="mono" style={{ color: 'var(--text-muted)' }}>{acc.usuario}</span>
                                <BotonCopiar valor={acc.usuario} que="el usuario" />
                              </div>
                            )}

                            {acc.contrasena && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                <span className="mono" style={{ color: 'var(--text)' }}>
                                  {accVisible || visible
                                    ? acc.contrasena
                                    : '•'.repeat(Math.min(10, acc.contrasena.length))}
                                </span>
                                <div style={{ display: 'flex', gap: 3 }}>
                                  <button
                                    type="button"
                                    className="hrt-copiar"
                                    onClick={() => alternar(`${h.id}-${acc.id}`)}
                                    title={accVisible ? 'Ocultar' : 'Mostrar'}
                                  >
                                    {accVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                                  </button>
                                  <BotonCopiar valor={acc.contrasena} que="la contraseña" />
                                </div>
                              </div>
                            )}

                            {acc.token && (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                <span
                                  className="mono"
                                  style={{
                                    color: 'var(--brand-2)',
                                    fontSize: 11,
                                    maxWidth: 180,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={acc.token}
                                >
                                  {acc.token}
                                </span>
                                <BotonCopiar valor={acc.token} que="el token" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </td>

                <td className="hrt__due">
                  {h.propietario === 'sd' ? (
                    <span className="hrt__pill hrt__pill--sd">SD</span>
                  ) : (
                    <>
                      <span className="hrt__pill">Cliente</span>
                      {h.clienteNombre && <span className="hrt__cli">{h.clienteNombre}</span>}
                    </>
                  )}
                </td>

                <td className={'hrt__pago is-' + h.estadoPago}>
                  {h.diaPagoMes && (
                    <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text)' }}>
                      Día {h.diaPagoMes} de cada mes
                    </span>
                  )}
                  {h.proximoPago ? (
                    <>
                      {new Date(h.proximoPago + 'T00:00:00').toLocaleDateString('es-VE', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit',
                      })}
                      {h.precio != null && (
                        <em>
                          {h.precio} {h.moneda ?? ''}
                        </em>
                      )}
                    </>
                  ) : (
                    <span className="hrt__nada">—</span>
                  )}
                </td>

                <td className="hrt__acc">
                  {onVerAccesos && (
                    <button
                      type="button"
                      className="icono-btn"
                      onClick={() => onVerAccesos(h)}
                      aria-label={`Ver accesos de ${h.nombre}`}
                      title="Ver todos los accesos y contraseñas"
                    >
                      <KeyRound size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="icono-btn"
                    onClick={() => onEditar(h)}
                    aria-label={`Editar ${h.nombre}`}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    className="icono-btn icono-btn--peligro"
                    onClick={() => onBorrar(h)}
                    aria-label={`Eliminar ${h.nombre}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
