import { useState } from 'react'
import {
  Coins,
  KanbanSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  KeyRound,
  Lock,
  Server,
  Terminal,
  Activity,
  DollarSign,
  Cpu,
  Layers,
} from 'lucide-react'

// ----------------------------------------------------------------------------
// 1. HERO SHOWCASE: ESTACIÓN DE MANDO INDUSTRIAL (16:9)
// ----------------------------------------------------------------------------
export function MaquetaHeroWorkstation() {
  const [tabActivo, setTabActivo] = useState<'kanban' | 'finanzas' | 'pwa'>('kanban')

  return (
    <div className="op-hero-station">
      {/* Barra superior de la ventana */}
      <div className="op-hero-station__bar">
        <div className="op-hero-station__dots">
          <span style={{ background: '#ff5f56' }} />
          <span style={{ background: '#ffbd2e' }} />
          <span style={{ background: '#27c93f' }} />
        </div>
        <div className="op-hero-station__title">
          <Activity size={12} color="#05e4fd" className="pulse-fast" />
          <span>sd-workstation.live · Puerto Ordaz, VE · Consola de Operaciones</span>
        </div>
        <div className="op-hero-station__pills">
          <span className="station-pill station-pill--ok">
            <span className="station-dot-live" /> Sistema Activo
          </span>
        </div>
      </div>

      {/* Franja de Métricas en Vivo */}
      <div className="op-hero-station__ticker">
        <div className="ticker-item">
          <DollarSign size={13} color="#05e4fd" />
          <span className="ticker-lbl">Tasa BCV:</span>
          <span className="ticker-val">Bs. 48.20 / USD</span>
        </div>
        <div className="ticker-item">
          <Cpu size={13} color="#025ff5" />
          <span className="ticker-lbl">Latencia:</span>
          <span className="ticker-val">&lt; 18ms</span>
        </div>
        <div className="ticker-item">
          <Layers size={13} color="#05e4fd" />
          <span className="ticker-lbl">Arquitectura:</span>
          <span className="ticker-val">Monolito Modular</span>
        </div>
        <div className="ticker-item">
          <ShieldCheck size={13} color="#22c55e" />
          <span className="ticker-lbl">Seguridad:</span>
          <span className="ticker-val">Supabase RLS Estricto</span>
        </div>
      </div>

      {/* Contenido interactivo simulado */}
      <div className="op-hero-station__body">
        {/* Selector de módulos en la barra lateral simulada */}
        <div className="station-sidebar">
          <div className="station-brand-mini">
            <div className="station-brand-ico">SD</div>
            <span>SD Sistema</span>
          </div>

          <button
            type="button"
            className={'station-side-btn' + (tabActivo === 'kanban' ? ' is-active' : '')}
            onClick={() => setTabActivo('kanban')}
          >
            <KanbanSquare size={14} /> Tablero Kanban
          </button>
          <button
            type="button"
            className={'station-side-btn' + (tabActivo === 'finanzas' ? ' is-active' : '')}
            onClick={() => setTabActivo('finanzas')}
          >
            <Coins size={14} /> Finanzas BCV
          </button>
          <button
            type="button"
            className={'station-side-btn' + (tabActivo === 'pwa' ? ' is-active' : '')}
            onClick={() => setTabActivo('pwa')}
          >
            <Server size={14} /> PWA &amp; Bóveda
          </button>
        </div>

        {/* Panel principal dinámico según el tab */}
        <div className="station-canvas">
          {tabActivo === 'kanban' && (
            <div className="station-kanban-preview">
              <div className="sk-col">
                <div className="sk-col__head">Propuestas (1)</div>
                <div className="sk-card">
                  <div className="sk-card__tag">Comercial</div>
                  <div className="sk-card__title">Levantamiento de Alcance ERP</div>
                  <div className="sk-card__meta">
                    <span className="sk-card__cur">$2,400</span>
                    <span className="sk-avatar">CG</span>
                  </div>
                </div>
              </div>

              <div className="sk-col">
                <div className="sk-col__head">En Desarrollo (2)</div>
                <div className="sk-card sk-card--active">
                  <div className="sk-card__tag sk-card__tag--cyan">Alta Prioridad</div>
                  <div className="sk-card__title">Sincronizador PWA &amp; Web Audio FM</div>
                  <div className="sk-prog">
                    <div className="sk-prog__bar" style={{ width: '82%' }} />
                  </div>
                  <div className="sk-card__meta">
                    <span className="sk-card__cur">82% completado</span>
                    <span className="sk-avatar sk-avatar--cyan">AQ</span>
                  </div>
                </div>

                <div className="sk-card">
                  <div className="sk-card__tag">Seguridad</div>
                  <div className="sk-card__title">Bóveda Criptográfica AES-256</div>
                  <div className="sk-card__meta">
                    <span className="sk-card__cur">65% completado</span>
                    <span className="sk-avatar">DV</span>
                  </div>
                </div>
              </div>

              <div className="sk-col">
                <div className="sk-col__head">Aprobado / Entregado (1)</div>
                <div className="sk-card sk-card--done">
                  <div className="sk-card__tag sk-card__tag--ok">Conforme ✓</div>
                  <div className="sk-card__title">Membrete Oficial Vectorial &amp; QR</div>
                  <div className="sk-card__meta">
                    <span className="sk-card__cur">Certificado</span>
                    <span className="sk-avatar sk-avatar--ok">SD</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tabActivo === 'finanzas' && (
            <div className="station-finanzas-preview">
              <div className="sf-header">
                <div>
                  <div className="sf-title">Control Financiero &amp; Conversión Dual</div>
                  <div className="sf-sub">Presupuestos y cobranzas sincronizados a la tasa oficial del día</div>
                </div>
                <div className="sf-bcv-badge">
                  <span>BCV Oficial</span>
                  <strong>Bs. 48.20 / USD</strong>
                </div>
              </div>

              <div className="sf-table">
                <div className="sf-row sf-row--head">
                  <span>Concepto</span>
                  <span>Monto USD</span>
                  <span>Equivalente VES</span>
                  <span>Estado</span>
                </div>
                <div className="sf-row">
                  <span>Anticipo Inicial (30%)</span>
                  <strong>$720.00</strong>
                  <span className="sf-ves">Bs. 34,704.00</span>
                  <span className="sf-badge-ok">Cobrado ✓</span>
                </div>
                <div className="sf-row">
                  <span>Sprint de Ingeniería (40%)</span>
                  <strong>$960.00</strong>
                  <span className="sf-ves">Bs. 46,272.00</span>
                  <span className="sf-badge-proc">En Verificación</span>
                </div>
                <div className="sf-row">
                  <span>Entrega Certificada (30%)</span>
                  <strong>$720.00</strong>
                  <span className="sf-ves">Bs. 34,704.00</span>
                  <span className="sf-badge-wait">Custodia</span>
                </div>
              </div>
            </div>
          )}

          {tabActivo === 'pwa' && (
            <div className="station-pwa-preview">
              <div className="sp-grid">
                <div className="sp-card">
                  <Server size={18} color="#05e4fd" />
                  <h4>PWA Offline-First</h4>
                  <p>Caché reactivo en IndexedDB con soporte para cortes de red en Guayana.</p>
                  <div className="sp-status">● Service Worker Activo</div>
                </div>
                <div className="sp-card">
                  <Lock size={18} color="#025ff5" />
                  <h4>Bóveda de Credenciales</h4>
                  <p>Llaves de servidor, licencias y accesos compartidos cifrados en reposo.</p>
                  <div className="sp-status">● AES-256 GCM</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pie informativo de la maqueta */}
      <div className="op-hero-station__footer">
        <span className="station-foot-tag">[ Maqueta Interactiva de Operaciones · Systems Development Puerto Ordaz ]</span>
        <span className="station-foot-sub">Brandbook en preparación · Prototipo funcional de alta fidelidad</span>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// 2. CAPÍTULO 01: EL REQUERIMIENTO & DESGLOSE MULTIMONEDA
// ----------------------------------------------------------------------------
export function MaquetaPresupuesto() {
  const [moneda, setMoneda] = useState<'USD' | 'VES'>('USD')
  const tasaBCV = 48.2

  const items = [
    { nombre: 'Módulo Tablero Kanban & Orquestación', hrs: 40, usd: 1200 },
    { nombre: 'Bóveda de Herramientas Criptográfica (AES-256)', hrs: 24, usd: 720 },
    { nombre: 'Motor Membrete Oficial & Certificación QR', hrs: 16, usd: 480 },
  ]

  const subtotalUSD = items.reduce((acc, it) => acc + it.usd, 0)
  const ivaUSD = subtotalUSD * 0.16
  const totalUSD = subtotalUSD + ivaUSD

  const formatMonto = (usdVal: number) => {
    if (moneda === 'USD') {
      return `$ ${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    const bsVal = usdVal * tasaBCV
    return `Bs. ${bsVal.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="mq-presupuesto">
      {/* Cabecera con selector interactivo de divisa */}
      <div className="mq-presupuesto__top">
        <div className="mq-presupuesto__title">
          <Coins size={16} color="#05e4fd" />
          <span>Cotización &amp; Desglose Multimoneda</span>
        </div>

        <div className="mq-currency-toggle">
          <button
            type="button"
            className={'mq-cur-btn' + (moneda === 'USD' ? ' is-active' : '')}
            onClick={() => setMoneda('USD')}
          >
            USD ($)
          </button>
          <button
            type="button"
            className={'mq-cur-btn' + (moneda === 'VES' ? ' is-active' : '')}
            onClick={() => setMoneda('VES')}
          >
            VES (Bs.)
          </button>
        </div>
      </div>

      {/* Indicador de Tasa BCV */}
      <div className="mq-rate-pill">
        <span className="mq-rate-live">● Tasa Oficial BCV:</span>
        <strong className="mq-rate-val">Bs. {tasaBCV.toFixed(2)} por Dólar</strong>
        <span className="mq-rate-sync">(Sincronización en vivo)</span>
      </div>

      {/* Filas de conceptos del requerimiento */}
      <div className="mq-presupuesto__items">
        {items.map((it, idx) => (
          <div key={idx} className="mq-presupuesto__item">
            <div className="mq-item__desc">
              <span className="mq-item__name">{it.nombre}</span>
              <span className="mq-item__hrs">{it.hrs} horas estimadas</span>
            </div>
            <div className="mq-item__monto">{formatMonto(it.usd)}</div>
          </div>
        ))}
      </div>

      {/* Totales y desglose de condiciones */}
      <div className="mq-presupuesto__totals">
        <div className="mq-tot-row">
          <span>Subtotal estimado:</span>
          <span>{formatMonto(subtotalUSD)}</span>
        </div>
        <div className="mq-tot-row">
          <span>IVA Legal (16%):</span>
          <span>{formatMonto(ivaUSD)}</span>
        </div>
        <div className="mq-tot-row mq-tot-row--final">
          <span>Total Presupuestado:</span>
          <span className="mq-tot-highlight">{formatMonto(totalUSD)}</span>
        </div>
      </div>

      {/* Hitos acordados */}
      <div className="mq-presupuesto__terms">
        <span className="mq-term-chip">30% Anticipo</span>
        <span className="mq-term-chip">40% Hito de Avance</span>
        <span className="mq-term-chip">30% Entrega Certificada</span>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// 3. CAPÍTULO 02: ORQUESTACIÓN EN TABLERO KANBAN DINÁMICO
// ----------------------------------------------------------------------------
export function MaquetaKanban() {
  return (
    <div className="mq-kanban">
      <div className="mq-kanban__head">
        <div className="mq-kanban__title">
          <KanbanSquare size={16} color="#025ff5" />
          <span>Tablero de Ingeniería en Tiempo Real</span>
        </div>
        <div className="mq-kanban__status">
          <span className="station-dot-live" /> 3 Sprints Activos
        </div>
      </div>

      <div className="mq-kanban__cols">
        {/* Columna Análisis */}
        <div className="mq-kcol">
          <div className="mq-kcol__badge">Requerimiento</div>
          <div className="mq-kcard">
            <div className="mq-kcard__tag">Financiero</div>
            <div className="mq-kcard__text">Integración API Tasas BCV</div>
            <div className="mq-kcard__foot">
              <span className="sk-avatar sk-avatar--cyan">AD</span>
              <span className="mq-kcard__time">12h est.</span>
            </div>
          </div>
        </div>

        {/* Columna Desarrollo */}
        <div className="mq-kcol">
          <div className="mq-kcol__badge mq-kcol__badge--active">En Desarrollo (82%)</div>
          <div className="mq-kcard mq-kcard--glow">
            <div className="mq-kcard__tag mq-kcard__tag--cyan">Alta Prioridad</div>
            <div className="mq-kcard__text">Motor Web Audio &amp; Cache PWA</div>
            <div className="mq-kprog">
              <div className="mq-kprog__fill" style={{ width: '82%' }} />
            </div>
            <div className="mq-kcard__foot">
              <span className="sk-avatar">CG</span>
              <span className="mq-kcard__status-txt">Compilando...</span>
            </div>
          </div>
        </div>

        {/* Columna QA / Listo */}
        <div className="mq-kcol">
          <div className="mq-kcol__badge mq-kcol__badge--done">Conforme ✓</div>
          <div className="mq-kcard mq-kcard--done">
            <div className="mq-kcard__tag mq-kcard__tag--green">Validado</div>
            <div className="mq-kcard__text">Matriz de Roles Supabase RLS</div>
            <div className="mq-kcard__foot">
              <span className="sk-avatar sk-avatar--ok">QA</span>
              <span className="mq-kcard__time">0 fallos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal log auditado */}
      <div className="mq-kanban__terminal">
        <Terminal size={12} color="#05e4fd" />
        <span>[VITE 6] 184ms build · [AUDITORÍA] Registro #8241 inmutable en log</span>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// 4. CAPÍTULO 03: COBRANZA POR HITOS & BÓVEDA DE CLAVES
// ----------------------------------------------------------------------------
export function MaquetaCobranzaBoveda() {
  const [claveRevelada, setClaveRevelada] = useState(false)

  return (
    <div className="mq-fin-vault">
      <div className="mq-fv__head">
        <div className="mq-fv__title">
          <ShieldCheck size={16} color="#05e4fd" />
          <span>Garantía Financiera &amp; Bóveda Criptográfica</span>
        </div>
        <div className="mq-fv__badge">AES-256 GCM</div>
      </div>

      <div className="mq-fv__grid">
        {/* Lado Hitos de Cobranza */}
        <div className="mq-fv__col">
          <div className="mq-fv__sub">
            <Clock size={13} color="#025ff5" /> Hitos de Pago Conciliados
          </div>

          <div className="mq-milestone is-paid">
            <div className="mq-milestone__dot">✓</div>
            <div className="mq-milestone__body">
              <div className="mq-milestone__name">Anticipo de Inicio (30%)</div>
              <div className="mq-milestone__ref">Ref: BDV-89210 · Conciliado en Bs.</div>
            </div>
            <span className="mq-status-tag mq-status-tag--ok">Cobrado</span>
          </div>

          <div className="mq-milestone is-progress">
            <div className="mq-milestone__dot">⌛</div>
            <div className="mq-milestone__body">
              <div className="mq-milestone__name">Sprint de Ingeniería (40%)</div>
              <div className="mq-milestone__ref">Comprobante Pago Móvil adjunto</div>
            </div>
            <span className="mq-status-tag mq-status-tag--cyan">En Verificación</span>
          </div>

          <div className="mq-milestone is-custody">
            <div className="mq-milestone__dot">🔒</div>
            <div className="mq-milestone__body">
              <div className="mq-milestone__name">Cierre &amp; Entrega Final (30%)</div>
              <div className="mq-milestone__ref">Liberación contra Acta Conforme</div>
            </div>
            <span className="mq-status-tag">En Custodia</span>
          </div>
        </div>

        {/* Lado Bóveda de Claves */}
        <div className="mq-fv__col mq-fv__col--vault">
          <div className="mq-fv__sub">
            <KeyRound size={13} color="#05e4fd" /> Bóveda de Credenciales
          </div>

          <div className="mq-vault-entry">
            <div className="mq-ve__top">
              <Server size={13} color="#025ff5" />
              <span>Servidor Cloud AWS RDS PostgreSQL</span>
            </div>
            <div className="mq-ve__key">
              <code>{claveRevelada ? 'sd_prod_db_98a7c2#secure' : '••••••••••••••••••••••••'}</code>
              <button
                type="button"
                className="mq-ve__btn"
                onClick={() => setClaveRevelada(!claveRevelada)}
              >
                {claveRevelada ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          <div className="mq-vault-entry">
            <div className="mq-ve__top">
              <Lock size={13} color="#05e4fd" />
              <span>API Key Pasarela de Pago Bancario</span>
            </div>
            <div className="mq-ve__key">
              <code>••••••••••••••••••••••••</code>
              <span className="mq-ve__badge">Cifrado</span>
            </div>
          </div>

          <div className="mq-vault-footer">
            <ShieldCheck size={12} color="#22c55e" />
            <span>Accesos restringidos por rol con bitácora de auditoría</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// 5. CAPÍTULO 04: MEMBRETE OFICIAL, QR & CERTIFICACIÓN LEGAL
// ----------------------------------------------------------------------------
export function MaquetaMembreteDoc() {
  return (
    <div className="mq-doc-sheet">
      {/* Cabecera membretada vectorial */}
      <div className="mq-doc__header">
        <div className="mq-doc__brand">
          <img src="/marca-sd.png" alt="SD" className="mq-doc__logo" />
          <div className="mq-doc__brand-text">
            <strong>SYSTEMS DEVELOPMENT, C.A.</strong>
            <span>RIF: J-40192849-0 · PUERTO ORDAZ, ESTADO BOLÍVAR</span>
          </div>
        </div>
        <div className="mq-doc__num">
          <span>ACTA #SD-2026-084</span>
          <small>Documento Oficial</small>
        </div>
      </div>

      {/* Título y cuerpo del documento */}
      <div className="mq-doc__body">
        <h4 className="mq-doc__tit">ACTA DE CONFORMIDAD &amp; ENTREGA TÉCNICA</h4>
        <p className="mq-doc__txt">
          Por medio de la presente, <strong>Systems Development</strong> hace entrega formal
          de los módulos de software contratados bajo los estándares de trazabilidad,
          conciliación multimoneda y seguridad arquitectónica acordados.
        </p>

        {/* Tabla resumen del acta */}
        <div className="mq-doc__table">
          <div className="mq-doc__row">
            <span>Cliente Receptor:</span>
            <strong>Corporación Industrial Guayana, C.A.</strong>
          </div>
          <div className="mq-doc__row">
            <span>Entregable:</span>
            <span>ERP Monolítico Modular v2.4 + Bóveda Criptográfica</span>
          </div>
          <div className="mq-doc__row">
            <span>Estado de Pago:</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>100% Conciliado en Bs. y USD</span>
          </div>
        </div>
      </div>

      {/* Pie con QR dinámico y firmas */}
      <div className="mq-doc__footer">
        {/* QR Vectorial estilizado */}
        <div className="mq-doc__qr">
          <svg viewBox="0 0 60 60" width="48" height="48" fill="none">
            <rect width="60" height="60" rx="6" fill="#0B1026" stroke="#05E4FD" strokeWidth="1.5" />
            <rect x="6" y="6" width="16" height="16" rx="2" fill="#05E4FD" />
            <rect x="9" y="9" width="10" height="10" fill="#0B1026" />
            <rect x="12" y="12" width="4" height="4" fill="#05E4FD" />
            <rect x="38" y="6" width="16" height="16" rx="2" fill="#05E4FD" />
            <rect x="41" y="9" width="10" height="10" fill="#0B1026" />
            <rect x="44" y="12" width="4" height="4" fill="#05E4FD" />
            <rect x="6" y="38" width="16" height="16" rx="2" fill="#05E4FD" />
            <rect x="9" y="41" width="10" height="10" fill="#0B1026" />
            <rect x="12" y="44" width="4" height="4" fill="#05E4FD" />
            <rect x="26" y="10" width="8" height="4" fill="#025FF5" />
            <rect x="26" y="18" width="4" height="8" fill="#05E4FD" />
            <rect x="28" y="30" width="6" height="6" fill="#05E4FD" />
            <rect x="38" y="38" width="16" height="16" rx="2" fill="#025FF5" />
          </svg>
          <span className="mq-qr-txt">Verificar Autenticidad</span>
        </div>

        <div className="mq-doc__signatures">
          <div className="mq-sig-block">
            <div className="mq-sig-line" />
            <span>Director de Arquitectura</span>
            <small>Systems Development</small>
          </div>
          <div className="mq-sig-block">
            <div className="mq-sig-line" />
            <span>Representante Legal</span>
            <small>Cliente Aceptante</small>
          </div>
        </div>

        <div className="mq-doc__seal">
          <div className="mq-seal-circle">
            <CheckCircle2 size={16} color="#05e4fd" />
            <span>AUDITADO</span>
          </div>
        </div>
      </div>
    </div>
  )
}

