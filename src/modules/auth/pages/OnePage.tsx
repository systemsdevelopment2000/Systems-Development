import '../styles/onepage.css'
import { useRef, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  KanbanSquare,
  ShieldCheck,
  Calculator,
  FileText,
  Lock,
  ArrowUpRight,
  Sparkles,
  LogIn,
  Play,
  Pause,
  Coins,
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
} from 'lucide-react'
import { useDatos } from '@/core/datos'
import { useSonido } from '@/core/sonido'
import { Button } from '@/core/ui'
import { LoginForm } from '../components/LoginForm'
import { RegisterForm } from '../components/RegisterForm'
import { ForgotForm } from '../components/ForgotForm'
import {
  MaquetaHeroWorkstation,
  MaquetaPresupuesto,
  MaquetaKanban,
  MaquetaCobranzaBoveda,
  MaquetaMembreteDoc,
} from '../components/StorytellingVisuals'

type AuthModo = 'login' | 'registro' | 'recuperar'

const CAPITULOS = [
  {
    id: 'cap-01',
    num: '01',
    navTit: '01 · Alcance & Finanzas',
    tag: 'Fase 01 · Alcance Comercial',
    tit: 'El Requerimiento & Desglose Multimoneda',
    resumen:
      'Cada proyecto comienza con el levantamiento riguroso de módulos, estimación de horas y fijación de condiciones en Bolívares y Dólares con respaldo continuo de la tasa oficial BCV.',
    reto: 'Eliminar la fricción inflacionaria y asegurar un cálculo transparente y predecible para el cliente.',
    solucion:
      'El motor financiero desglosa el presupuesto en vivo, con equivalencias exactas en VES/USD y esquema de hitos acordado (30% Anticipo, 40% Avance, 30% Entrega).',
    stack: ['Tasas BCV en Vivo', 'Conversión Dual', 'Hitos 30/40/30'],
  },
  {
    id: 'cap-02',
    num: '02',
    navTit: '02 · Tablero Kanban',
    tag: 'Fase 02 · Ingeniería Activa',
    tit: 'Orquestación en Tablero Kanban Dinámico',
    resumen:
      'Los compromisos se materializan en un tablero de 9 estados rigurosos: desde requerimientos y propuesta técnica, hasta desarrollo activo, pruebas QA y despliegue auditado.',
    reto: 'Evitar cuellos de botella en la fábrica de software y mantener al cliente informado del avance real sin reuniones innecesarias.',
    solucion:
      'Visualización integral con porcentaje de avance, asignación de arquitectos/programadores y chat técnico con trazabilidad inmutable.',
    stack: ['React 19', 'Tablero Dinámico', 'Bitácora en Tiempo Real'],
  },
  {
    id: 'cap-03',
    num: '03',
    navTit: '03 · Cobranza & Bóveda',
    tag: 'Fase 03 · Garantía Operativa',
    tit: 'Cobranza por Hitos & Bóveda de Claves Criptográficas',
    resumen:
      'Ninguna entrega queda en el aire: cada desembolso se concilia con comprobante bancario verificable y las credenciales críticas de servidores quedan custodiadas bajo cifrado AES-256.',
    reto: 'Garantizar que los accesos a servidores de producción y pasarelas bancarias no se filtren ni se pierdan al finalizar el desarrollo.',
    solucion:
      'Bóveda de Herramientas con matriz de permisos por rol y liberación progresiva de hitos financieros contra entregables tangibles.',
    stack: ['AES-256 GCM', 'Conciliación Bancaria', 'Control de Mora'],
  },
  {
    id: 'cap-04',
    num: '04',
    navTit: '04 · Certificación Legal',
    tag: 'Fase 04 · Cierre Institucional',
    tit: 'Membrete Oficial, Código QR & Certificación Legal',
    resumen:
      'La ingeniería se formaliza mediante actas de entrega, minutas de reunión y hojas de pendientes impresas con el membrete vectorial oficial de Systems Development y código QR de autenticidad.',
    reto: 'Dar respaldo jurídico e institucional a cada software desarrollado para empresas e industrias de la región.',
    solucion:
      'Generación de documentos vectoriales con firmas de conformidad de las partes, sello digital y enlace criptográfico de validación.',
    stack: ['Membrete Vectorial', 'QR Dinámico', 'Firma y Conformidad'],
  },
]

export function OnePage() {
  const { estado } = useDatos()
  const e = estado.empresa
  const { sonar } = useSonido()
  const [modo, setModo] = useState<AuthModo>('login')

  const portalRef = useRef<HTMLDivElement>(null)

  // --------------------------------------------------------------------------
  // MOTOR DE AUTO-SCROLL CINEMÁTICO & CONTROL DE STORYTELLING
  // --------------------------------------------------------------------------
  const [autoScrollActivo, setAutoScrollActivo] = useState(true)
  const [velocidad, setVelocidad] = useState<number>(1) // 1x, 1.75x
  const [capituloActual, setCapituloActual] = useState(1)
  const [progreso, setProgreso] = useState(0)

  const pausaManualRef = useRef(false)
  const inactividadTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Comprobar si hay foco activo en algún input/formulario
  const hayFocoEnInput = useCallback(() => {
    const active = document.activeElement
    if (!active) return false
    const tag = active.tagName.toLowerCase()
    return (
      tag === 'input' ||
      tag === 'textarea' ||
      tag === 'select' ||
      active.getAttribute('contenteditable') === 'true'
    )
  }, [])

  // Actualizar el progreso visual del tour y el capítulo activo
  const actualizarProgresoYCapitulo = useCallback(() => {
    const movil = document.querySelector('.movil') as HTMLElement | null
    let scrollTop = 0
    let scrollHeight = 0
    let clientHeight = 0

    if (movil) {
      scrollTop = movil.scrollTop
      scrollHeight = movil.scrollHeight
      clientHeight = movil.clientHeight
    } else {
      scrollTop = window.scrollY || document.documentElement.scrollTop
      scrollHeight = document.documentElement.scrollHeight
      clientHeight = window.innerHeight
    }

    const maxScroll = scrollHeight - clientHeight
    if (maxScroll > 0) {
      const pct = Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)))
      setProgreso(pct)
    }

    // Detectar qué capítulo está a la vista
    const midPoint = clientHeight * 0.45
    for (let i = CAPITULOS.length - 1; i >= 0; i--) {
      const el = document.getElementById(CAPITULOS[i].id)
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= midPoint) {
          setCapituloActual(i + 1)
          break
        }
      }
    }
  }, [])

  // Pausa temporal ante interacción manual del usuario (clicks, teclas, rueda o touch)
  const pausarPorInteraccion = useCallback(() => {
    if (pausaManualRef.current) return

    setAutoScrollActivo(false)
    if (inactividadTimerRef.current) clearTimeout(inactividadTimerRef.current)

    // Reanudar tras 3.5 segundos de inactividad si no hay foco activo en un input
    inactividadTimerRef.current = setTimeout(() => {
      if (!pausaManualRef.current && !hayFocoEnInput()) {
        setAutoScrollActivo(true)
      }
    }, 3500)
  }, [hayFocoEnInput])

  // Alternar pausa manual con el botón flotante
  function alternarAutoScroll() {
    sonar('tap')
    if (autoScrollActivo) {
      pausaManualRef.current = true
      setAutoScrollActivo(false)
      if (inactividadTimerRef.current) clearTimeout(inactividadTimerRef.current)
    } else {
      pausaManualRef.current = false
      setAutoScrollActivo(true)
    }
  }

  // Cambiar velocidad de recorrido (1x o 1.75x)
  function cambiarVelocidad(nuevaVel: number) {
    sonar('tap')
    setVelocidad(nuevaVel)
    if (!autoScrollActivo && !pausaManualRef.current) {
      setAutoScrollActivo(true)
    }
  }

  // Navegación suave entre capítulos
  function irACapitulo(num: number) {
    sonar('tap')
    pausaManualRef.current = true
    setAutoScrollActivo(false)
    setCapituloActual(num)
    const target = CAPITULOS[num - 1]
    if (target) {
      const el = document.getElementById(target.id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  function siguienteCapitulo() {
    if (capituloActual < CAPITULOS.length) {
      irACapitulo(capituloActual + 1)
    } else {
      scrollToAuth('login')
    }
  }

  function anteriorCapitulo() {
    if (capituloActual > 1) {
      irACapitulo(capituloActual - 1)
    } else {
      scrollToSection('filosofia')
    }
  }

  function iniciarTourCinematico() {
    sonar('tap')
    pausaManualRef.current = false
    setAutoScrollActivo(true)
    scrollToSection('historia')
  }

  // Bucle de animación de auto-scroll suave con acumulador subpíxel
  useEffect(() => {
    let animId: number
    let ultimoTiempo = performance.now()
    let acumulador = 0

    const step = (tiempoActual: number) => {
      const deltaMs = Math.min(tiempoActual - ultimoTiempo, 64)
      ultimoTiempo = tiempoActual

      if (autoScrollActivo && !hayFocoEnInput()) {
        const movil = document.querySelector('.movil') as HTMLElement | null
        // Velocidad: 55px/s en 1x, ~96px/s en 1.75x
        const pxPorSegundo = velocidad * 55
        const avance = (pxPorSegundo * deltaMs) / 1000
        acumulador += avance

        if (acumulador >= 1) {
          const dy = Math.floor(acumulador)
          acumulador -= dy

          let scrollTop = 0
          let scrollHeight = 0
          let clientHeight = 0

          if (movil) {
            movil.scrollTop += dy
            scrollTop = movil.scrollTop
            scrollHeight = movil.scrollHeight
            clientHeight = movil.clientHeight
          } else {
            window.scrollBy({ top: dy, left: 0, behavior: 'instant' })
            scrollTop = window.scrollY || document.documentElement.scrollTop
            scrollHeight = document.documentElement.scrollHeight
            clientHeight = window.innerHeight
          }

          const maxScroll = scrollHeight - clientHeight
          if (maxScroll > 0 && scrollTop >= maxScroll - 6) {
            // Llegó al final (portal de acceso)
            setAutoScrollActivo(false)
          }
        }
      }

      actualizarProgresoYCapitulo()
      animId = requestAnimationFrame(step)
    }

    animId = requestAnimationFrame(step)

    // El autoscroll se detiene ÚNICAMENTE por interacción activa (teclas, clicks, rueda, touch o foco),
    // NUNCA por el movimiento libre del mouse por la pantalla.
    const onUserClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest('.op-story-player')) return
      pausarPorInteraccion()
    }
    const onKeyDown = () => pausarPorInteraccion()
    const onWheel = () => pausarPorInteraccion()
    const onTouch = () => pausarPorInteraccion()

    const onFocusIn = () => {
      if (hayFocoEnInput()) {
        setAutoScrollActivo(false)
      }
    }

    const onFocusOut = () => {
      setTimeout(() => {
        if (!pausaManualRef.current && !hayFocoEnInput()) {
          setAutoScrollActivo(true)
        }
      }, 250)
    }

    window.addEventListener('pointerdown', onUserClick)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('focusin', onFocusIn)
    window.addEventListener('focusout', onFocusOut)

    return () => {
      cancelAnimationFrame(animId)
      if (inactividadTimerRef.current) clearTimeout(inactividadTimerRef.current)
      window.removeEventListener('pointerdown', onUserClick)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('focusin', onFocusIn)
      window.removeEventListener('focusout', onFocusOut)
    }
  }, [
    autoScrollActivo,
    velocidad,
    hayFocoEnInput,
    pausarPorInteraccion,
    actualizarProgresoYCapitulo,
  ])

  function scrollToAuth(nuevoModo: AuthModo) {
    sonar('tap')
    pausaManualRef.current = true
    setAutoScrollActivo(false)
    setModo(nuevoModo)
    setTimeout(() => {
      portalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 40)
  }

  function scrollToSection(id: string) {
    sonar('tap')
    pausaManualRef.current = true
    setAutoScrollActivo(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="onepage">
      {/* ── BARRA SUPERIOR ONEPAGE (Sticky con navegación limpia) ── */}
      <header className="op-nav">
        <a
          href="#filosofia"
          className="op-nav__brand"
          onClick={(ev) => {
            ev.preventDefault()
            scrollToSection('filosofia')
          }}
        >
          <img
            src="/marca-sd.png"
            alt="SD Logo"
            className="brand__logo"
            style={{ width: 34, height: 34 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.2px' }}>
              {e.nombre}
            </span>
            <span
              style={{
                fontSize: 10,
                color: 'var(--brand-2)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Puerto Ordaz
            </span>
          </div>
        </a>

        <nav className="op-nav__links">
          <button type="button" className="op-nav__link" onClick={() => scrollToSection('filosofia')}>
            Ingeniería
          </button>
          <button type="button" className="op-nav__link" onClick={() => scrollToSection('ecosistema')}>
            Ecosistema
          </button>
          <button type="button" className="op-nav__link" onClick={() => scrollToAuth('login')}>
            Acceso Rápido
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button style={{ fontSize: 13, padding: '7px 14px' }}>
              <Lock size={14} /> Acceder al Sistema
            </Button>
          </Link>
        </div>
      </header>

      {/* ── ACTO I: PORTADA INDUSTRIAL DE ALTA FIDELIDAD ── */}
      <section id="filosofia" className="op-hero">
        <div className="op-hero__top-row">
          <div className="op-eyebrow">
            <Sparkles size={14} /> Systems Development · Factoría de Software en Guayana
          </div>
          <div className="op-hero__status-pill">
            <span className="op-hero__status-glow" />
            <span>Disponible para Despliegue Empresarial</span>
            <ArrowUpRight size={13} />
          </div>
        </div>

        <h1 className="op-hero__tit">
          Ingeniería de Software
          <span className="op-hero__tit-gradient"> &amp; Arquitectura Modular</span>
        </h1>

        <p className="op-hero__sub">
          Diseñado en Puerto Ordaz para orquestar proyectos de escala, finanzas multimoneda,
          talento técnico y documentación corporativa bajo un estándar riguroso de precisión industrial.
        </p>

        <div className="op-hero__cta">
          <Button onClick={iniciarTourCinematico} className="op-hero__btn-main">
            <Play size={15} /> Iniciar Recorrido Narrativo
          </Button>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" className="op-hero__btn-ghost">
              Acceder al Sistema <ArrowUpRight size={15} />
            </Button>
          </Link>
        </div>

        {/* ── BARRA DE MÉTRICAS BENTO INDUSTRIAL (Estilo Referencia) ── */}
        <div className="op-hero__stats-card">
          <div className="op-hero__stat-item">
            <div className="op-hero__stat-val">
              <span className="op-hero__stat-icon">✦</span> 15+
            </div>
            <div className="op-hero__stat-label">Años de Trayectoria</div>
          </div>
          <div className="op-hero__stat-div" />
          <div className="op-hero__stat-item">
            <div className="op-hero__stat-val">
              <span className="op-hero__stat-icon">⚡</span> 120+
            </div>
            <div className="op-hero__stat-label">Módulos &amp; Proyectos</div>
          </div>
          <div className="op-hero__stat-div" />
          <div className="op-hero__stat-item">
            <div className="op-hero__stat-val">
              <span className="op-hero__stat-icon">🛡️</span> 99.9%
            </div>
            <div className="op-hero__stat-label">Disponibilidad ERP</div>
          </div>
          <div className="op-hero__stat-div" />
          <div className="op-hero__stat-item">
            <div className="op-hero__stat-val">
              <span className="op-hero__stat-icon">📍</span> PZO
            </div>
            <div className="op-hero__stat-label">Factoría en Guayana</div>
          </div>
        </div>

        {/* ── MAQUETA HERO INTERACTIVA (16:9) ── */}
        <div style={{ width: '100%' }}>
          <MaquetaHeroWorkstation />
        </div>
      </section>

      {/* ── CITA EDITORIAL DEL STORYTELLING ── */}
      <div className="op-story-quote">
        <p>
          “En Guayana entendemos el peso del acero y la precisión del cálculo. Construir software aquí
          no es juntar librerías al azar: es forjar sistemas modulares con trazabilidad inquebrantable,
          capaces de operar con solidez sin importar la conectividad ni las complejidades monetarias.”
        </p>
        <cite>— Systems Development · Filosofía de Operaciones en Puerto Ordaz</cite>
      </div>

      {/* ── ACTO II: EL STORYTELLING (LOS 4 CAPÍTULOS DE LA CADENA DE VALOR) ── */}
      <section id="historia" className="op-sec">
        <div className="op-sec__head">
          <span className="op-eyebrow">RECORRIDO NARRATIVO · 4 FASES</span>
          <h2 className="op-sec__tit">Cómo transformamos requerimientos en sistemas en producción</h2>
          <p className="op-sec__sub">
            Acompaña el recorrido paso a paso de cada proyecto desde la primera reunión hasta la entrega auditada.
          </p>
        </div>

        {/* ── NAVEGADOR STEPPER DE CAPÍTULOS INTERACTIVO ── */}
        <div className="op-story-stepper" role="tablist">
          {CAPITULOS.map((cap, idx) => (
            <button
              key={cap.id}
              type="button"
              role="tab"
              aria-selected={capituloActual === idx + 1}
              className={'op-stepper-btn' + (capituloActual === idx + 1 ? ' is-active' : '')}
              onClick={() => irACapitulo(idx + 1)}
            >
              <span className="op-stepper-num">{cap.num}</span>
              <span className="op-stepper-txt">{cap.navTit}</span>
            </button>
          ))}
        </div>

        {/* ── TIMELINE CON VISUALES DE ALTA FIDELIDAD ── */}
        <div className="op-story-timeline">
          {/* Capítulo 01 */}
          <article id="cap-01" className="op-story-step">
            <div className="op-story-step__num">01</div>
            <div className="op-story-step__content">
              <span className="op-story-step__tag">{CAPITULOS[0].tag}</span>
              <h3 className="op-story-step__tit">{CAPITULOS[0].tit}</h3>
              <p className="op-story-step__desc">{CAPITULOS[0].resumen}</p>

              <div
                style={{
                  background: 'rgba(5, 5, 11, 0.4)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  fontSize: 12.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  marginTop: 6,
                }}
              >
                <div>
                  <strong style={{ color: '#05e4fd' }}>El Reto: </strong>
                  <span style={{ color: 'var(--text-muted)' }}>{CAPITULOS[0].reto}</span>
                </div>
                <div>
                  <strong style={{ color: '#22c55e' }}>Solución SD: </strong>
                  <span style={{ color: 'var(--text-muted)' }}>{CAPITULOS[0].solucion}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {CAPITULOS[0].stack.map((s, idx) => (
                  <span key={idx} className="op-mockup__tag">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="op-story-step__visual-wrap">
              <MaquetaPresupuesto />
            </div>
          </article>

          {/* Capítulo 02 */}
          <article id="cap-02" className="op-story-step">
            <div className="op-story-step__num">02</div>
            <div className="op-story-step__content">
              <span className="op-story-step__tag">{CAPITULOS[1].tag}</span>
              <h3 className="op-story-step__tit">{CAPITULOS[1].tit}</h3>
              <p className="op-story-step__desc">{CAPITULOS[1].resumen}</p>

              <div
                style={{
                  background: 'rgba(5, 5, 11, 0.4)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  fontSize: 12.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  marginTop: 6,
                }}
              >
                <div>
                  <strong style={{ color: '#05e4fd' }}>El Reto: </strong>
                  <span style={{ color: 'var(--text-muted)' }}>{CAPITULOS[1].reto}</span>
                </div>
                <div>
                  <strong style={{ color: '#22c55e' }}>Solución SD: </strong>
                  <span style={{ color: 'var(--text-muted)' }}>{CAPITULOS[1].solucion}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {CAPITULOS[1].stack.map((s, idx) => (
                  <span key={idx} className="op-mockup__tag">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="op-story-step__visual-wrap">
              <MaquetaKanban />
            </div>
          </article>

          {/* Capítulo 03 */}
          <article id="cap-03" className="op-story-step">
            <div className="op-story-step__num">03</div>
            <div className="op-story-step__content">
              <span className="op-story-step__tag">{CAPITULOS[2].tag}</span>
              <h3 className="op-story-step__tit">{CAPITULOS[2].tit}</h3>
              <p className="op-story-step__desc">{CAPITULOS[2].resumen}</p>

              <div
                style={{
                  background: 'rgba(5, 5, 11, 0.4)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  fontSize: 12.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  marginTop: 6,
                }}
              >
                <div>
                  <strong style={{ color: '#05e4fd' }}>El Reto: </strong>
                  <span style={{ color: 'var(--text-muted)' }}>{CAPITULOS[2].reto}</span>
                </div>
                <div>
                  <strong style={{ color: '#22c55e' }}>Solución SD: </strong>
                  <span style={{ color: 'var(--text-muted)' }}>{CAPITULOS[2].solucion}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {CAPITULOS[2].stack.map((s, idx) => (
                  <span key={idx} className="op-mockup__tag">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="op-story-step__visual-wrap">
              <MaquetaCobranzaBoveda />
            </div>
          </article>

          {/* Capítulo 04 */}
          <article id="cap-04" className="op-story-step">
            <div className="op-story-step__num">04</div>
            <div className="op-story-step__content">
              <span className="op-story-step__tag">{CAPITULOS[3].tag}</span>
              <h3 className="op-story-step__tit">{CAPITULOS[3].tit}</h3>
              <p className="op-story-step__desc">{CAPITULOS[3].resumen}</p>

              <div
                style={{
                  background: 'rgba(5, 5, 11, 0.4)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  fontSize: 12.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  marginTop: 6,
                }}
              >
                <div>
                  <strong style={{ color: '#05e4fd' }}>El Reto: </strong>
                  <span style={{ color: 'var(--text-muted)' }}>{CAPITULOS[3].reto}</span>
                </div>
                <div>
                  <strong style={{ color: '#22c55e' }}>Solución SD: </strong>
                  <span style={{ color: 'var(--text-muted)' }}>{CAPITULOS[3].solucion}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {CAPITULOS[3].stack.map((s, idx) => (
                  <span key={idx} className="op-mockup__tag">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="op-story-step__visual-wrap">
              <MaquetaMembreteDoc />
            </div>
          </article>
        </div>

        {/* Métricas de Impacto */}
        <div className="op-kpis">
          <div className="op-kpi">
            <span className="op-kpi__val">100%</span>
            <span className="op-kpi__lbl">Trazabilidad de compromisos</span>
          </div>
          <div className="op-kpi">
            <span className="op-kpi__val">0 Fricción</span>
            <span className="op-kpi__lbl">Conciliación cambiaria en Bs. y USD</span>
          </div>
          <div className="op-kpi">
            <span className="op-kpi__val">PWA</span>
            <span className="op-kpi__lbl">Capacidad de operación Offline-First</span>
          </div>
          <div className="op-kpi">
            <span className="op-kpi__val">&lt; 180ms</span>
            <span className="op-kpi__lbl">Velocidad con React 19 y Vite 6</span>
          </div>
        </div>
      </section>

      {/* ── ACTO III: ECOSISTEMA TECNOLÓGICO ── */}
      <section id="ecosistema" className="op-sec">
        <div className="op-sec__head">
          <span className="op-eyebrow">ARQUITECTURA DE DOMINIOS</span>
          <h2 className="op-sec__tit">Los Tres Pilares de Nuestra Plataforma</h2>
          <p className="op-sec__sub">
            Modularidad absoluta: cada subsistema opera de forma independiente y coordinada.
          </p>
        </div>

        <div className="op-pilares">
          {/* Pilar 1 */}
          <article className="op-pilar">
            <div className="op-pilar__ic">
              <KanbanSquare size={22} />
            </div>
            <h3 className="op-pilar__tit">Tablero &amp; Flujo de Trabajo</h3>
            <p className="op-pilar__desc">
              Control visual con drag-and-drop por estados del negocio, asignación de responsables,
              bloqueo selectivo por aprobación y chat técnico auditable.
            </p>
            <div className="op-pilar__live-badge">
              <KanbanSquare size={13} /> 9 Estados de Negocio · Drag &amp; Drop · Chat Integrado
            </div>
          </article>

          {/* Pilar 2 */}
          <article className="op-pilar">
            <div className="op-pilar__ic">
              <Calculator size={22} />
            </div>
            <h3 className="op-pilar__tit">Finanzas &amp; Cobranza Multimoneda</h3>
            <p className="op-pilar__desc">
              Presupuestos desglosados concepto a concepto, integración con tasas BCV oficiales,
              códigos QR bancarios inmediatos y control de mora por hito.
            </p>
            <div className="op-pilar__live-badge">
              <Coins size={13} /> Tasa BCV Oficial · Conciliación Bs. y USD · QR Bancario
            </div>
          </article>

          {/* Pilar 3 */}
          <article className="op-pilar">
            <div className="op-pilar__ic">
              <FileText size={22} />
            </div>
            <h3 className="op-pilar__tit">Documentación &amp; Membrete Oficial</h3>
            <p className="op-pilar__desc">
              Generación de contratos, propuestas ejecutivas y hojas de pendientes imprimibles
              con el membrete vectorial oficial y firmas de conformidad.
            </p>
            <div className="op-pilar__live-badge">
              <FileText size={13} /> Membrete Vectorial Oficial · Código QR · Conformidad Legal
            </div>
          </article>
        </div>
      </section>

      {/* ── ACTO IV: PORTAL DE ACCESO / AUTENTICACIÓN INTEGRADO ── */}
      <section id="portal-acceso" className="op-auth-sec" ref={portalRef}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span className="op-eyebrow">
            <ShieldCheck size={14} /> SEGURIDAD &amp; ACCESO
          </span>
          <h2 style={{ fontSize: 30, fontWeight: 800, margin: '10px 0 4px' }}>
            Consola de Acceso
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
            Inicia sesión o regístrate en Systems Development.
          </p>
        </div>

        <div className="op-auth-card">
          {/* Segmented Control */}
          <div className="op-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={modo === 'login'}
              className={'op-tab' + (modo === 'login' ? ' is-active' : '')}
              onClick={() => setModo('login')}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={modo === 'registro'}
              className={'op-tab' + (modo === 'registro' ? ' is-active' : '')}
              onClick={() => setModo('registro')}
            >
              Registro
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={modo === 'recuperar'}
              className={'op-tab' + (modo === 'recuperar' ? ' is-active' : '')}
              onClick={() => setModo('recuperar')}
            >
              Recuperar
            </button>
          </div>

          <div className="op-auth__header">
            <h3 className="op-auth__tit">
              {modo === 'login' && 'Iniciar Sesión'}
              {modo === 'registro' && 'Crear Cuenta de Usuario'}
              {modo === 'recuperar' && 'Recuperar Contraseña'}
            </h3>
            <p className="op-auth__sub">
              {modo === 'login' && 'Ingresa a la plataforma operativa de la empresa.'}
              {modo === 'registro' && 'Forma parte del equipo de Systems Development.'}
              {modo === 'recuperar' && 'Te enviaremos las instrucciones de recuperación.'}
            </p>
          </div>

          {/* Renderizado dinámico de los formularios sin autofoco que robe foco */}
          {modo === 'login' && (
            <LoginForm
              autoFocus={false}
              onIrARegistro={() => scrollToAuth('registro')}
              onIrARecuperar={() => scrollToAuth('recuperar')}
            />
          )}

          {modo === 'registro' && (
            <RegisterForm autoFocus={false} onIrALogin={() => scrollToAuth('login')} />
          )}

          {modo === 'recuperar' && (
            <ForgotForm autoFocus={false} onIrALogin={() => scrollToAuth('login')} />
          )}

          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12.5,
                color: 'var(--brand-2)',
                textDecoration: 'none',
              }}
            >
              <LogIn size={13} /> Ir a la página dedicada de Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER CORPORATIVO DENSO & ESTRUCTURADO (Inspirado en Referencia Visual) ── */}
      <footer className="op-footer-dense">
        <div className="op-footer-dense__card">
          {/* Columna Izquierda: Gran Titular Monumental */}
          <div className="op-footer-dense__hero">
            <h2 className="op-footer-dense__tit">
              CONSTRUYAMOS EL FUTURO ✦<br />
              <span className="op-footer-dense__tit-accent">DE TU OPERACIÓN</span>
            </h2>
            <p className="op-footer-dense__desc">
              Sistemas de misión crítica construidos con arquitectura modular, base de datos Postgres y sincronización offline PWA para empresas que demandan continuidad ininterrumpida.
            </p>
          </div>

          {/* Columna Central: Acción y Estatus */}
          <div className="op-footer-dense__cta">
            <div className="op-footer-dense__badge">
              <span className="op-footer-dense__status-dot" />
              <span>PLATAFORMA ACTIVA · SD 2026</span>
            </div>
            <p className="op-footer-dense__cta-sub">
              ¿Listo para transformar la gestión de proyectos, talento y tesorería en tu empresa?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button onClick={() => scrollToAuth('registro')} className="op-footer-dense__btn">
                <span>Crear Cuenta Corporativa</span>
                <ArrowUpRight size={16} />
              </Button>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="ghost" className="op-footer-dense__btn-ghost">
                  <LogIn size={13} /> Acceso al Sistema
                </Button>
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Coordenadas y Contacto Oficial */}
          <div className="op-footer-dense__contact">
            <div className="op-footer-dense__contact-title">COORDENADAS OFICIALES</div>
            <ul className="op-footer-dense__contact-list">
              <li>
                <Mail size={14} className="op-footer-dense__icon" />
                <a href="mailto:systemsdevelopment2000@gmail.com">systemsdevelopment2000@gmail.com</a>
              </li>
              <li>
                <Phone size={14} className="op-footer-dense__icon" />
                <span>0414-8983663 · 0412-4249441</span>
              </li>
              <li>
                <MapPin size={14} className="op-footer-dense__icon" />
                <span>Puerto Ordaz, Edo. Bolívar · Venezuela</span>
              </li>
              <li>
                <Building2 size={14} className="op-footer-dense__icon" />
                <span>Systems Development C.A. · RIF Jurídico</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Sub-barra de Copyright & Sellos Tecnológicos */}
        <div className="op-footer-dense__bottom">
          <div className="op-footer-dense__copy">
            <img src="/marca-sd.png" alt="SD" className="op-footer-dense__logo" />
            <span>© {new Date().getFullYear()} Systems Development. Todos los derechos reservados.</span>
          </div>

          <div className="op-footer-dense__pills">
            <span className="op-dense-pill">ARQUITECTURA MODULAR</span>
            <span className="op-dense-pill">POSTGRES + RLS</span>
            <span className="op-dense-pill">PWA OFFLINE-READY</span>
            <span className="op-dense-pill">PUERTO ORDAZ</span>
          </div>
        </div>
      </footer>

      {/* ── CONTROLADOR FLOTANTE DE STORYTELLING CINEMÁTICO (Ultra-compacto + Expansión en Hover) ── */}
      <aside
        className="op-story-player"
        role="region"
        aria-label="Control de Storytelling y Auto-scroll"
      >
        <button
          type="button"
          className="op-sp-btn-play"
          onClick={alternarAutoScroll}
          title={autoScrollActivo ? 'Pausar recorrido narrativo' : 'Iniciar auto-scroll narrativo'}
        >
          {autoScrollActivo ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 2 }} />}
        </button>

        <div className="op-sp-info">
          <div className="op-sp-title">
            <span
              className={
                'op-sp-status-dot ' + (autoScrollActivo ? 'is-active' : 'is-paused')
              }
            />
            <span className="op-sp-title-text">
              {autoScrollActivo ? 'Storytelling en Marcha' : 'Lectura en Pausa'}
            </span>
            <span className="op-sp-pct">{progreso}%</span>
          </div>
          <span className="op-sp-sub">
            {CAPITULOS[capituloActual - 1]?.navTit || 'Recorrido'}
          </span>
          <div className="op-sp-bar" aria-hidden="true">
            <div className="op-sp-bar-fill" style={{ width: `${progreso}%` }} />
          </div>
        </div>

        <div className="op-sp-controls">
          <div className="op-sp-nav">
            <button
              type="button"
              className="op-sp-nav-btn"
              onClick={anteriorCapitulo}
              title="Capítulo anterior"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              className="op-sp-nav-btn"
              onClick={siguienteCapitulo}
              title="Siguiente capítulo"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Selector de velocidad 1x y 1.75x */}
          <button
            type="button"
            className={'op-sp-speed-btn' + (velocidad === 1 ? ' is-active' : '')}
            onClick={() => cambiarVelocidad(1)}
            title="Velocidad normal (55px/s)"
          >
            1x
          </button>
          <button
            type="button"
            className={'op-sp-speed-btn' + (velocidad === 1.75 ? ' is-active' : '')}
            onClick={() => cambiarVelocidad(1.75)}
            title="Velocidad dinámica (96px/s)"
          >
            1.75x
          </button>
        </div>
      </aside>
    </div>
  )
}
