/** Tipos del dominio SD Sistema (fuente de verdad del store local). */

export type ID = string

export type MedioComunicacion = 'whatsapp' | 'correo' | 'llamada' | 'otro'

export interface Contacto {
  telefono?: string
  correo?: string
  medio?: MedioComunicacion
}

/** Persona responsable/contacto de un cliente (dueño, gerente, enlace). */
export interface ResponsableCliente {
  nombre: string
  cargo?: string
  telefono?: string
  correo?: string
}

export interface Cliente {
  id: ID
  /** Código correlativo (CLI-AAAA-NNNN). */
  codigo?: string
  tipoDocumento: 'cedula' | 'rif'
  documento: string
  nombre: string
  logo?: string // data URL (base64)
  ubicacion?: string
  contacto: Contacto
  /** Persona de contacto (sobre todo si el cliente es empresa). */
  responsable?: ResponsableCliente
  medioPago?: string
  notas?: string
  creadoEn: string
}

export type RolSistema = 'admin' | 'editor' | 'lectura'

/** Nivel de acceso general de un módulo (vista "sencilla" de permisos). */
export type NivelModulo = 'ninguno' | 'ver' | 'editar' | 'admin'

/**
 * Permisos de un módulo. `nivel` es el control sencillo (acceso general);
 * `acciones` son overrides avanzados y, cuando existen, mandan sobre el nivel
 * para esas acciones puntuales.
 */
export interface PermisoModulo {
  nivel: NivelModulo
  acciones?: Record<string, boolean>
}

/** Mapa de permisos por id de módulo. */
export type Permisos = Record<string, PermisoModulo>

export interface Colaborador {
  id: ID
  /** Código correlativo (COL-AAAA-NNNN). */
  codigo?: string
  nombre: string
  fotoPerfil?: string
  cedula?: string
  titulo?: string
  rol?: string
  contacto: Contacto
  activo: boolean
  /** Si tiene cuenta de usuario del sistema. No todo colaborador es usuario. */
  esUsuario: boolean
  /** Rol de acceso al sistema (si es usuario). */
  rolSistema?: RolSistema
  /** Permisos detallados por módulo (si es usuario). */
  permisos?: Permisos
  /** Cuenta deshabilitada: conserva el usuario pero bloquea el acceso. */
  cuentaDeshabilitada?: boolean
  /** Clave temporal (fase front; se reemplaza por Supabase Auth en backend). */
  claveTemporal?: string
  /** Fecha ISO del último restablecimiento de contraseña. */
  claveActualizada?: string
  creadoEn: string
}

export interface EstadoProyecto {
  id: ID
  nombre: string
  orden: number
  color: string
  esFinal: boolean
}

export interface Tag {
  id: ID
  nombre: string
  color: string
}

/** No todo proyecto es de desarrollo (también charlas, cursos, consultorías). */
export type CategoriaProyecto = 'desarrollo' | 'charla' | 'curso' | 'consultoria' | 'otro'

/** Si es de desarrollo, qué clase de producto es. */
export type TipoDesarrollo =
  | 'erp'
  | 'ecommerce'
  | 'landing'
  | 'saas'
  | 'web'
  | 'app_movil'
  | 'a_medida'
  | 'otro'

/**
 * Un módulo del proyecto. Los `estandar` son los que el tipo de producto
 * necesita mínimamente; los `adicional` (integraciones, extras) se suman aparte.
 * Más módulos ⇒ más horas ⇒ más costo ⇒ mayor precio para sostener el margen.
 */
export type ClaseModulo = 'estandar' | 'adicional'

export interface ModuloProyecto {
  id: ID
  nombre: string
  clase: ClaseModulo
  /** Horas de desarrollo estimadas. */
  horas: number
  incluido: boolean
}

export interface Proyecto {
  id: ID
  /** Código correlativo (PRY-AAAA-NNNN). */
  codigo?: string
  /** Naturaleza del proyecto (desarrollo, charla, curso…). */
  categoria?: CategoriaProyecto
  /** Clase de desarrollo, solo si `categoria === 'desarrollo'`. */
  tipoDesarrollo?: TipoDesarrollo
  /** Módulos que componen el alcance. */
  modulos?: ModuloProyecto[]
  nombre: string
  clienteId: ID
  descripcion?: string
  estadoId: ID
  tagIds: ID[]
  responsablePrincipalId?: ID
  progreso: number
  fechas?: { inicio?: string; entregaEstim?: string; cierre?: string }
  medioPago?: string
  /** Notas / puntos clave capturados al crear; insumo para contratos y documentos. */
  notas?: string
  chatAbierto: boolean
  creadoEn: string
}

export type RolAsignacion = 'responsable' | 'colaborador'
export type EstadoAsignacion = 'activa' | 'reasignada' | 'rescindida'

export interface Asignacion {
  id: ID
  proyectoId: ID
  colaboradorId: ID
  rol: RolAsignacion
  estado: EstadoAsignacion
  desde: string
  hasta?: string
  motivo?: string
}

export type EstadoActividad = 'backlog' | 'por_hacer' | 'en_curso' | 'revision' | 'hecho'
export type Prioridad = 'baja' | 'media' | 'alta' | 'critica'

export interface Actividad {
  id: ID
  /** Código correlativo (TAR-AAAA-NNNN). */
  codigo?: string
  /** Id del proyecto asociado; opcional (una tarea puede ser general o existir sin proyecto). */
  proyectoId?: ID
  titulo: string
  estado: EstadoActividad
  prioridad: Prioridad
  responsables: ID[]
  etiquetas: string[]
  /** Orden dentro de su columna del tablero. */
  orden?: number
  /** Quién creó/asignó la tarea. */
  creadorId?: ID
  /**
   * Casos excepcionales: la tarea necesita el visto bueno de un superior y no
   * puede avanzar hasta que se apruebe. No es un estado nuevo: es una traba
   * sobre una fase concreta.
   */
  requiereAprobacion?: boolean
  /**
   * Fase en la que se traba. La tarea puede llegar hasta aquí libremente, pero
   * no sale de esta columna sin el visto bueno. Por defecto, 'revision'.
   */
  apruebaEn?: EstadoActividad
  /** Quién debe dar el visto bueno. Vacío = cualquiera con permiso. */
  aprobadorId?: ID
  /** Quién dio la aprobación (vacío = pendiente). */
  aprobadaPor?: ID
  /** Fecha ISO de la aprobación. */
  aprobadaEn?: string
  checklist?: { total: number; hechos: number }
  comentarios?: number
  vence?: string
  /** Módulo del proyecto al que pertenece (nombre, no id). */
  modulo?: string
  /** Instrucciones / descripción detallada de la tarea. */
  instrucciones?: string
  /** Links de referencia. */
  enlaces?: string[]
  /** Imágenes de referencia (data URL). */
  imagenes?: string[]
}

export interface MensajeChat {
  id: ID
  proyectoId: ID
  autorId: ID
  texto: string
  fecha: string
}

/** Criterios con que se evalúa a un colaborador (cada uno 0–100). */
export interface CriteriosColaborador {
  cumplimiento: number
  calidad: number
  comunicacion: number
  autonomia: number
}

export interface EvaluacionColaborador {
  id: ID
  asignacionId: ID
  colaboradorId: ID
  proyectoId: ID
  /** Promedio de los criterios (0–100). */
  porcentaje: number
  /** Desglose por criterio; permite ver *qué* se evaluó, no solo el total. */
  criterios?: CriteriosColaborador
  notas?: string
  fecha: string
}

export interface EvaluacionCliente {
  id: ID
  proyectoId: ID
  clienteId: ID
  amigabilidad: number // 0–100
  puntualidadPago: number
  estabilidadAlcance: number
  comunicacion: number
  notas?: string
  fecha: string
}

export type OrigenNota = 'escrita' | 'voz'

/** Archivo adjunto (imagen o PDF) guardado como data URL en la fase front. */
export interface Adjunto {
  id: ID
  nombre: string
  /** MIME type: image/* o application/pdf. */
  tipo: string
  dataUrl: string
}

/** Reunión con el cliente; pertenece a un proyecto. Nota escrita o por voz. */
export interface Reunion {
  id: ID
  /** Código correlativo (REU-AAAA-NNNN). */
  codigo?: string
  proyectoId: ID
  fecha: string
  titulo?: string
  participantes: ID[]
  notas: string
  origen: OrigenNota
  /** data URL de la nota de voz (opcional). */
  audio?: string
  /** Imágenes o PDF adjuntos a la reunión. */
  adjuntos?: Adjunto[]
  /** Participantes externos no registrados (dueño, secretaria, abogado, asesor…). */
  participantesExternos?: string[]
  /** Fecha/hora agendada (ISO) si la reunión se programa a futuro. */
  fechaProgramada?: string
  /** Marca que ya se emitió el aviso de una reunión programada. */
  avisada?: boolean
}

export type TipoHecho =
  | 'creacion'
  | 'estado'
  | 'reunion'
  | 'nota'
  | 'asignacion'
  | 'evaluacion'
  | 'documento'

/** Hecho del historial (timeline) de un proyecto. */
export interface Hecho {
  id: ID
  proyectoId: ID
  tipo: TipoHecho
  descripcion: string
  fecha: string
  autorId?: ID
  refId?: ID
}

export type PropietarioHerramienta = 'sd' | 'cliente'
export type CicloPago = 'mensual' | 'anual'

/** Herramienta/servicio (propia de SD o de un cliente), con pago y credenciales. */
export interface Herramienta {
  id: ID
  /** Código correlativo (HER-AAAA-NNNN). */
  codigo?: string
  nombre: string
  url?: string
  propietario: PropietarioHerramienta
  /**
   * Una misma herramienta puede servir a VARIOS clientes: una cuenta de
   * hosting, una organización de Supabase o una licencia que SD reparte. Por
   * eso son listas. Los campos en singular quedan solo para leer datos
   * anteriores a este cambio.
   */
  clienteIds?: ID[]
  proyectoIds?: ID[]
  /** @deprecated usar `clienteIds`. */
  clienteId?: ID
  /** @deprecated usar `proyectoIds`. */
  proyectoId?: ID
  /**
   * Cómo se reparte el costo cuando la comparten varios clientes.
   * `partes_iguales` divide el precio entre todos; `solo_sd` lo asume SD.
   */
  reparto?: 'partes_iguales' | 'solo_sd'
  correo?: string
  contrasena?: string
  ciclo: CicloPago
  precio?: number
  moneda?: string
  metodoPago?: string
  /** Próxima fecha de pago (YYYY-MM-DD); base de los recordatorios. */
  proximoPago?: string
  /** Fecha (YYYY-MM-DD) en que se registró el último pago. */
  ultimoPago?: string
  notas?: string
  activa: boolean
  creadoEn: string
}

export type TipoCobro = 'pago_movil' | 'transferencia'

/**
 * Datos de cobro de SD. Se comparten como QR para que el pagador los cargue en
 * su app bancaria (aplica a Pago Móvil y Transferencia).
 */
export interface MetodoCobro {
  id: ID
  tipo: TipoCobro
  banco: string
  /** Pago Móvil: teléfono. Transferencia: número de cuenta. */
  numero: string
  /** Cédula o RIF del titular. */
  documento: string
  titular: string
}

/** Parámetros de costeo para presupuestar proyectos. */
export interface ParametrosFinanzas {
  /** Costo directo de una hora de desarrollo. */
  tarifaHora: number
  /** Moneda en que se expresa el presupuesto. */
  moneda: string
  /** Margen de contribución deseado (%), sobre el costo. */
  margen: number
  /** Gastos indirectos imputados al proyecto (%). */
  indirectos: number
  /** Descuento comercial aplicado al precio (%). */
  descuento: number
}

/** Datos de la empresa que encabezan reportes y documentos (membrete). */
/* ── Recursos humanos: plantillas de entrevista y candidatos ── */

export type EstadoCandidato =
  | 'recibido'
  | 'preseleccion'
  | 'entrevista'
  | 'prueba'
  | 'oferta'
  | 'contratado'
  | 'descartado'

/** Un bloque de preguntas dentro de una plantilla de entrevista. */
export interface BloqueEntrevista {
  id: ID
  titulo: string
  preguntas: string[]
}

/** Criterio puntuable del 1 al 5, con su peso en la nota final. */
export interface CriterioEntrevista {
  id: ID
  nombre: string
  /** Qué se está midiendo, para que dos entrevistadores puntúen igual. */
  descripcion?: string
  /** Peso relativo; si todos valen 1, es un promedio simple. */
  peso: number
}

export interface PlantillaEntrevista {
  id: ID
  nombre: string
  /** Cargo al que apunta: "Frontend junior", "Vendedor"… */
  cargo: string
  descripcion?: string
  bloques: BloqueEntrevista[]
  criterios: CriterioEntrevista[]
  creadoEn: string
}

/** Puntaje dado a un criterio durante una entrevista. */
export interface PuntajeCriterio {
  criterioId: ID
  /** 1 a 5. */
  valor: number
  nota?: string
}

/* ── Ficha de personal ───────────────────────────────────────── */

export type Parentesco = 'hijo' | 'conyuge' | 'padre' | 'madre' | 'otro'

/** Carga familiar: define beneficios (HCM, guardería, bono de alimentación). */
export interface Dependiente {
  id: ID
  nombre: string
  parentesco: Parentesco
  fechaNacimiento?: string
  /** Estudia actualmente: afecta la beca o el bono escolar. */
  estudia?: boolean
  /** Tiene discapacidad certificada: afecta beneficios y protección especial. */
  discapacidad?: boolean
}

/** Cuenta donde se deposita la nómina. */
export interface DatosBancarios {
  banco?: string
  tipoCuenta?: 'corriente' | 'ahorro'
  numeroCuenta?: string
  /** Si la cuenta no está a nombre del trabajador. */
  titular?: string
  documentoTitular?: string
  pagoMovil?: string
}

/**
 * Datos de salud. Se recogen SOLO para lo que la ley y la operación exigen:
 * atender una emergencia, adaptar el puesto de trabajo y cumplir con la
 * normativa de seguridad laboral. No es un historial clínico y no debe
 * usarse para decidir una contratación.
 */
export interface DatosSalud {
  tipoSangre?: string
  alergias?: string
  /** Condición que el puesto deba contemplar. */
  condicion?: string
  /** Discapacidad declarada (certificado CONAPDIS si lo hay). */
  discapacidad?: string
  /** Qué adaptación necesita el puesto para esa condición. */
  adaptacion?: string
  emergenciaNombre?: string
  emergenciaParentesco?: string
  emergenciaTelefono?: string
}

export interface FichaPersonal {
  fechaNacimiento?: string
  lugarNacimiento?: string
  estadoCivil?: 'soltero' | 'casado' | 'divorciado' | 'viudo' | 'concubinato'
  nacionalidad?: string
  direccion?: string
  rif?: string
  nivelEducativo?: string
  profesion?: string
  licenciaConducir?: string
  /** Número de asegurado del IVSS. */
  ivss?: string
  /** Cuenta FAOV (Banavih). */
  faov?: string
  dependientes?: Dependiente[]
  salud?: DatosSalud
  banco?: DatosBancarios
  fechaIngreso?: string
  tipoContrato?: string
  salario?: string
  horario?: string
  /** Fecha en que la persona autorizó el tratamiento de estos datos. */
  consentimientoEn?: string
}

export interface Candidato {
  id: ID
  /** Código correlativo (CAN-AAAA-NNNN). */
  codigo?: string
  nombre: string
  cedula?: string
  telefono?: string
  correo?: string
  ubicacion?: string
  /** Cargo al que aspira. */
  cargo: string
  /** Cómo llegó: referido, anuncio, universidad… */
  fuente?: string
  estado: EstadoCandidato
  /** Plantilla usada en la entrevista. */
  plantillaId?: ID
  /** Fecha de la entrevista (ISO). */
  entrevistadoEn?: string
  /** Quién entrevistó. */
  entrevistadorId?: ID
  puntajes?: PuntajeCriterio[]
  /** Notas de la entrevista, por bloque o libres. */
  notas?: string
  /** Conclusión del entrevistador. */
  conclusion?: string
  /** CV y otros documentos. */
  adjuntos?: Adjunto[]
  /** Pretensión salarial declarada. */
  pretension?: string
  /** Datos de ingreso. Se llenan al contratar, no al entrevistar. */
  ficha?: FichaPersonal
  creadoEn: string
}

export type AccionAuditoria = 'crear' | 'editar' | 'eliminar' | 'config' | 'restaurar'

export interface CambioAuditoria {
  campo: string
  antes?: string
  despues?: string
}

/**
 * Un asiento de auditoría. Se escribe desde el reducer del store, así que
 * cubre toda escritura venga del formulario que venga.
 */
export interface RegistroAuditoria {
  id: ID
  /** Fecha ISO del evento. */
  fecha: string
  /** Quién lo hizo. En la fase front es el correo de la sesión. */
  actor: string
  accion: AccionAuditoria
  /** Qué se tocó: clave de colección o 'empresa'/'estadosProyecto'. */
  ambito: string
  entidadId?: ID
  /** Línea legible: "Presupuesto PRE-2026-0001". */
  detalle: string
  /** Qué campos cambiaron. Las contraseñas nunca se guardan aquí. */
  cambios?: CambioAuditoria[]
}

export interface PieHoja {
  /** Rótulo de la firma de la izquierda. */
  firmaIzquierda: string
  /** Rótulo de la firma de la derecha. */
  firmaDerecha: string
  /** Nota legal / aclaratoria que cierra la hoja. */
  nota: string
}

export interface DatosEmpresa {
  /** Métodos de cobro para generar QR de pago. */
  metodosCobro?: MetodoCobro[]
  /** Parámetros de costeo y precio. */
  finanzas?: ParametrosFinanzas
  nombre: string
  telefonos: string
  ubicacion: string
  correo: string
  /** Logo del membrete: ruta pública o data URL. */
  logo: string
  /** Combinación de color activa (ver src/styles/paletas.css). */
  tema?: string
  /** Textos al pie de la hoja de pendientes, editables como el membrete. */
  hojaPendientes?: PieHoja
  /**
   * Unidades de cobro del presupuestador. Son editables porque ninguna lista
   * fija cubre todo lo que SD vende: un módulo, una característica, un año de
   * dominio o una sesión de capacitación no se miden igual.
   */
  unidades?: string[]
  /** Texto del pie de página de reportes y documentos. */
  pie: string
}

/* ---------------------------------------------------------------------------
 * Presupuestos
 * El presupuesto define cuánto vale/se cobra algo. La Propuesta puede
 * alimentarse de él (el precio allí es opcional) y el Contrato toma la cifra
 * del presupuesto ACEPTADO, quedando el texto legal editable.
 * ------------------------------------------------------------------------- */

export type EstadoPresupuesto = 'borrador' | 'enviado' | 'aceptado' | 'rechazado'

/**
 * `inicial` es la cotización que origina el proyecto; `ampliacion` cubre el
 * caso de un proyecto ya en curso al que el cliente le pide más módulos o
 * funcionalidades nuevas (se cotiza aparte y se acepta aparte).
 */
export type TipoPresupuesto = 'inicial' | 'ampliacion'

/** Línea libre de un presupuesto: se arma a mano, no se deriva. */
export interface LineaPresupuesto {
  id: ID
  /** Sección a la que pertenece (Desarrollo, Integraciones, Capacitación…). */
  grupo?: string
  concepto: string
  detalle?: string
  cantidad: number
  /** h, und, mes, sesión… */
  unidad: string
  precioUnitario: number
  /** Descuento de la línea (%). */
  descuento?: number
}

export interface Presupuesto {
  id: ID
  /** Código correlativo (PRE-AAAA-NNNN). */
  codigo?: string
  titulo: string
  tipo: TipoPresupuesto
  clienteId?: ID
  /** Opcional: un presupuesto puede existir sin proyecto todavía. */
  proyectoId?: ID
  estado: EstadoPresupuesto
  moneda: string
  lineas: LineaPresupuesto[]
  /** Descuento global (%). */
  descuentoGlobal: number
  /** Impuesto aplicado (%), p. ej. IVA. */
  impuesto: number
  /** Días de validez de la oferta. */
  validezDias?: number
  notas?: string
  /** Condiciones de pago en texto libre (complementa al plan). */
  condiciones?: string
  /** Plan de cobro estructurado: contado o crédito en cuotas/hitos. */
  plan?: PlanPago
  fecha: string
  aceptadoEn?: string
}


/* ---------------------------------------------------------------------------
 * Condiciones de pago y cobranza
 * Un presupuesto puede cobrarse de contado o a crédito en cuotas. Las cuotas
 * no siempre son por fecha: muchas veces se pactan por hito (enganche para
 * arrancar, saldo al aprobar o al recibir el proyecto).
 * ------------------------------------------------------------------------- */

export type ModalidadPago = 'contado' | 'credito'

/** Qué dispara el vencimiento de una cuota. */
export type DisparadorCuota = 'al_aceptar' | 'al_iniciar' | 'al_aprobar' | 'al_entregar' | 'fecha'

export interface CuotaPlan {
  id: ID
  numero: number
  /** "Enganche", "Cuota 2", "Contra entrega"… */
  concepto: string
  /** Porción del total (%). Si se fija `monto`, manda el monto. */
  porcentaje?: number
  /** Monto fijo en la moneda del presupuesto. */
  monto?: number
  disparador: DisparadorCuota
  /** Días tras la aceptación, cuando el disparador es por fecha. */
  diasDesdeAceptacion?: number
}

export interface PlanPago {
  modalidad: ModalidadPago
  cuotas: CuotaPlan[]
  /** Interés por financiar a crédito (%). */
  interes: number
  /** Recargo por mora (%). */
  moraPorcentaje: number
  /**
   * Sobre qué se calcula la mora: sobre el saldo de la cuota vencida, o sobre
   * el total del presupuesto. Lo segundo es mucho más duro y suele negociarse
   * aparte. Por defecto, la cuota.
   */
  baseMora?: 'cuota' | 'total'
  /** Días de gracia antes de aplicar mora. */
  diasGracia: number
  /** Qué ocurre si no paga o paga incompleto. */
  politicaMora?: string
}

/** Cómo entró el dinero. Admite divisas físicas, Binance y bolívares. */
export type MedioPagoRecibido =
  | 'divisa_efectivo'
  | 'divisa_binance'
  | 'divisa_zelle'
  | 'bolivares_efectivo'
  | 'pago_movil'
  | 'transferencia'
  | 'otro'

/**
 * Un abono recibido. Es la pieza que permite cobrar una misma cuota en varias
 * monedas o en varios pagos parciales: cada abono guarda su moneda, su tasa y
 * el equivalente en la moneda del presupuesto.
 */
export interface Pago {
  id: ID
  /** Código correlativo (PAG-AAAA-NNNN). */
  codigo?: string
  presupuestoId?: ID
  proyectoId?: ID
  clienteId?: ID
  /** Cuota del plan a la que se imputa el abono. */
  cuotaId?: ID
  fecha: string
  /** Monto tal como se recibió. */
  monto: number
  /** Moneda en que se recibió (USD, VES…). */
  moneda: string
  medio: MedioPagoRecibido
  /** Tasa aplicada para convertir a la moneda del presupuesto. */
  tasa?: number
  /** Equivalente en la moneda del presupuesto. */
  equivalente: number
  referencia?: string
  nota?: string
}

/** Origen del valor de una tasa de cambio. */
export type FuenteTasa = 'api' | 'manual'

/** Tasa de cambio registrada (historial ligero). */
export interface TasaCambio {
  id: ID
  /** Fecha ISO del registro. */
  fecha: string
  /** Moneda base (p. ej. USD). */
  base: string
  /** Moneda destino (p. ej. VES). */
  destino: string
  /** Cuántas unidades de `destino` equivale 1 de `base`. */
  valor: number
  fuente: FuenteTasa
  nota?: string
}

export interface EstadoDatos {
  /** Membrete editable (cabecera/pie de PDF). */
  empresa: DatosEmpresa
  /** Historial de tasas de cambio. */
  tasas: Record<ID, TasaCambio>
  /** Presupuestos ensamblados (cotizaciones). */
  presupuestos: Record<ID, Presupuesto>
  /** Abonos recibidos (multimoneda, parciales). */
  pagos: Record<ID, Pago>
  clientes: Record<ID, Cliente>
  colaboradores: Record<ID, Colaborador>
  proyectos: Record<ID, Proyecto>
  estadosProyecto: EstadoProyecto[]
  tags: Record<ID, Tag>
  asignaciones: Record<ID, Asignacion>
  actividades: Record<ID, Actividad>
  mensajes: Record<ID, MensajeChat>
  reuniones: Record<ID, Reunion>
  hechos: Record<ID, Hecho>
  auditoria: Record<ID, RegistroAuditoria>
  candidatos: Record<ID, Candidato>
  plantillasEntrevista: Record<ID, PlantillaEntrevista>
  herramientas: Record<ID, Herramienta>
  evalColaborador: Record<ID, EvaluacionColaborador>
  evalCliente: Record<ID, EvaluacionCliente>
}

/** Colecciones del store indexadas por id (todas menos el catálogo ordenado de estados). */
export type ColeccionRecord = Exclude<keyof EstadoDatos, 'estadosProyecto' | 'empresa'>
