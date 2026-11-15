import { useState } from 'react'
import { QrCode, Plus, Trash2, Check, Landmark } from 'lucide-react'
import { Button, Combobox, Modal, CodigoQR, useConfirmar } from '@/core/ui'
import { useDatos, nuevoId, type MetodoCobro, type TipoCobro } from '@/core/datos'
import { ETIQUETA_COBRO as ETIQUETA, textoCobro } from '@/core/lib/cobranza'

const TIPOS: { valor: TipoCobro; etiqueta: string }[] = [
  { valor: 'pago_movil', etiqueta: 'Pago Móvil' },
  { valor: 'transferencia', etiqueta: 'Transferencia' },
]

/** Métodos de cobro de SD, con QR para que el cliente pague. */
export function CobroCard() {
  const { estado, setEmpresa } = useDatos()
  const confirmar = useConfirmar()
  const metodos = estado.empresa.metodosCobro ?? []
  const [qr, setQr] = useState<MetodoCobro | null>(null)
  const [guardado, setGuardado] = useState(false)
  const [borrador, setBorrador] = useState<MetodoCobro>({
    id: '',
    tipo: 'pago_movil',
    banco: '',
    numero: '',
    documento: '',
    titular: estado.empresa.nombre,
  })

  function guardarLista(lista: MetodoCobro[]) {
    setEmpresa({ ...estado.empresa, metodosCobro: lista })
    setGuardado(true)
    setTimeout(() => setGuardado(false), 1600)
  }

  function agregar() {
    if (!borrador.banco.trim() || !borrador.numero.trim()) return
    guardarLista([...metodos, { ...borrador, id: nuevoId() }])
    setBorrador({
      id: '',
      tipo: 'pago_movil',
      banco: '',
      numero: '',
      documento: '',
      titular: estado.empresa.nombre,
    })
  }

  async function quitar(m: MetodoCobro) {
    const ok = await confirmar({
      titulo: `¿Quitar este ${ETIQUETA[m.tipo]}?`,
      mensaje: `${m.banco} · ${m.numero}`,
      textoConfirmar: 'Quitar',
      peligro: true,
    })
    if (ok) guardarLista(metodos.filter((x) => x.id !== m.id))
  }

  return (
    <div className="cfg-card cfg-card--ancha">
      <div className="cfg-card__head">
        <span className="cfg-card__icono">
          <Landmark size={18} />
        </span>
        <div>
          <h2 className="cfg-card__tit">Métodos de cobro</h2>
          <p className="cfg-card__sub">
            Datos para que el cliente pague. Cada uno genera un QR escaneable desde el móvil.
          </p>
        </div>
      </div>

      {metodos.length > 0 && (
        <div className="cob-lista">
          {metodos.map((m) => (
            <div className="cob-item" key={m.id}>
              <span className={'cob-tipo cob-tipo--' + m.tipo}>{ETIQUETA[m.tipo]}</span>
              <div className="cob-datos">
                <strong>{m.banco}</strong>
                <span>
                  {m.numero} · {m.documento}
                </span>
              </div>
              <button className="cob-qr" onClick={() => setQr(m)} title="Ver código QR">
                <QrCode size={15} /> QR
              </button>
              <button className="icono-btn icono-btn--peligro" onClick={() => quitar(m)} aria-label="Quitar">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="form-grid cob-form">
        <div className="field">
          <span className="field__label">Tipo</span>
          <Combobox
            opciones={TIPOS}
            valor={borrador.tipo}
            onCambio={(v) => setBorrador({ ...borrador, tipo: v as TipoCobro })}
            buscar={false}
          />
        </div>
        <label className="field">
          <span className="field__label">Banco</span>
          <input
            className="field__input"
            value={borrador.banco}
            onChange={(e) => setBorrador({ ...borrador, banco: e.target.value })}
            placeholder="0102 Banco de Venezuela"
          />
        </label>
        <label className="field">
          <span className="field__label">
            {borrador.tipo === 'pago_movil' ? 'Teléfono' : 'Número de cuenta'}
          </span>
          <input
            className="field__input"
            value={borrador.numero}
            onChange={(e) => setBorrador({ ...borrador, numero: e.target.value })}
            placeholder={borrador.tipo === 'pago_movil' ? '0414-8983663' : '0102-0000-00-0000000000'}
          />
        </label>
        <label className="field">
          <span className="field__label">Cédula / RIF</span>
          <input
            className="field__input"
            value={borrador.documento}
            onChange={(e) => setBorrador({ ...borrador, documento: e.target.value })}
            placeholder="J-12345678-9"
          />
        </label>
        <label className="field form-grid__full">
          <span className="field__label">Titular</span>
          <input
            className="field__input"
            value={borrador.titular}
            onChange={(e) => setBorrador({ ...borrador, titular: e.target.value })}
          />
        </label>
      </div>

      <div className="form-acciones">
        {guardado && <span className="reset__ok">Guardado</span>}
        <Button type="button" onClick={agregar}>
          {guardado ? <Check size={15} /> : <Plus size={15} />} Añadir método
        </Button>
      </div>

      <Modal abierto={!!qr} onCerrar={() => setQr(null)} titulo="QR de pago" ancho={420}>
        {qr && (
          <CodigoQR
            contenido={textoCobro(qr)}
            resumen={textoCobro(qr)}
            nombre={`cobro-${qr.tipo}-${qr.banco}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
          />
        )}
      </Modal>
    </div>
  )
}
