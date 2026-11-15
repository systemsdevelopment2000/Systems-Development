import { useState } from 'react'
import { Eye, EyeOff, Copy, Check, ExternalLink, Pencil, Trash2, KeyRound } from 'lucide-react'
import type { HerramientaVista } from '../hooks/useHerramientas'

interface Props {
  herramientas: HerramientaVista[]
  onEditar: (h: HerramientaVista) => void
  onBorrar: (h: HerramientaVista) => void
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

/**
 * Vista de lista: la bóveda de credenciales de SD.
 *
 * Las tarjetas sirven para mirar vencimientos; esta vista sirve para lo otro:
 * encontrar un acceso rápido y copiarlo. Densa, con una fila por servicio y la
 * contraseña oculta hasta que se pide verla.
 *
 * Nota honesta: en la fase front las contraseñas viven en el almacenamiento
 * local del navegador, en texto plano. Esto se sostiene porque es un entorno
 * de desarrollo; al pasar a Supabase deben ir cifradas y tras políticas RLS.
 */
export function HerramientaTabla({ herramientas, onEditar, onBorrar }: Props) {
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
            <th>Servicio</th>
            <th>Usuario / correo</th>
            <th>Contraseña</th>
            <th className="hrt__due">De quién</th>
            <th className="hrt__pago">Próximo pago</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {herramientas.map((h) => {
            const visible = visibles.includes(h.id)
            return (
              <tr key={h.id} className={h.activa ? '' : 'is-inactiva'}>
                <td>
                  <span className="hrt__nombre">{h.nombre}</span>
                  {h.url && (
                    <a className="hrt__url" href={h.url} target="_blank" rel="noreferrer">
                      <ExternalLink size={11} /> {h.url.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </td>

                <td>
                  {h.correo ? (
                    <span className="hrt__dato">
                      <span className="mono">{h.correo}</span>
                      <BotonCopiar valor={h.correo} que="el correo" />
                    </span>
                  ) : (
                    <span className="hrt__nada">—</span>
                  )}
                </td>

                <td>
                  {h.contrasena ? (
                    <span className="hrt__dato">
                      <span className="mono">
                        {visible ? h.contrasena : '•'.repeat(Math.min(12, h.contrasena.length))}
                      </span>
                      <button
                        type="button"
                        className="hrt-copiar"
                        onClick={() => alternar(h.id)}
                        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        title={visible ? 'Ocultar' : 'Mostrar'}
                      >
                        {visible ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <BotonCopiar valor={h.contrasena} que="la contraseña" />
                    </span>
                  ) : (
                    <span className="hrt__nada">
                      <KeyRound size={11} /> sin clave
                    </span>
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
