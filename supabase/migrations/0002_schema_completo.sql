-- ============================================================
-- SD Sistema — Migración 0002: Esquema completo con RLS
-- Monolito modular (Clientes, Proyectos, Tablero, Finanzas, RRHH)
-- ============================================================

-- Extensiones necesarias
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. EMPRESA / CONFIGURACIÓN (Membrete, Finanzas globales)
-- ------------------------------------------------------------
create table if not exists public.empresa (
  id               text primary key default 'sd_empresa',
  nombre           text not null default 'Systems Development',
  telefonos        text default '0414-8983663 / 0412-4249441',
  ubicacion        text default 'Puerto Ordaz, Bolívar',
  correo           text default 'systemsdevelopment2000@gmail.com',
  logo             text default '/logo-sd.png',
  pie              text default '',
  unidades         jsonb default '["módulo","componente","característica","global","h","día","mes","año","und","sesión","licencia"]'::jsonb,
  hoja_pendientes  jsonb default '{"firmaIzquierda":"Asigna por SD","firmaDerecha":"Recibe / responsable","nota":"El orden indica la secuencia de realización esperada."}'::jsonb,
  finanzas         jsonb default '{"tarifaHora":12,"moneda":"USD","margen":35,"indirectos":10,"descuento":0}'::jsonb,
  actualizado_en   timestamptz not null default now()
);

-- Fila por defecto
insert into public.empresa (id) values ('sd_empresa') on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 2. CLIENTES
-- ------------------------------------------------------------
create table if not exists public.clientes (
  id              text primary key,
  codigo          text unique,
  tipo_documento  text not null default 'rif',
  documento       text not null,
  nombre          text not null,
  logo            text,
  ubicacion       text,
  contacto        jsonb not null default '{}'::jsonb,
  responsable     jsonb,
  medio_pago      text,
  notas           text,
  creado_en       timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. COLABORADORES
-- ------------------------------------------------------------
create table if not exists public.colaboradores (
  id                   text primary key,
  codigo               text unique,
  nombre               text not null,
  foto_perfil          text,
  cedula               text,
  titulo               text,
  rol                  text,
  contacto             jsonb not null default '{}'::jsonb,
  activo               boolean not null default true,
  es_usuario           boolean not null default false,
  usuario_id           uuid references auth.users(id) on delete set null,
  rol_sistema          text default 'lectura',
  permisos             jsonb default '{}'::jsonb,
  cuenta_deshabilitada boolean not null default false,
  creado_en            timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. ESTADOS DE PROYECTO & TAGS
-- ------------------------------------------------------------
create table if not exists public.estados_proyecto (
  id       text primary key,
  nombre   text not null,
  orden    integer not null default 1,
  color    text not null default '#89898a',
  es_final boolean not null default false
);

create table if not exists public.tags (
  id     text primary key,
  nombre text not null unique,
  color  text not null default '#025ff5'
);

-- Semilla de estados oficiales
insert into public.estados_proyecto (id, nombre, orden, color, es_final) values
  ('prospecto', 'Prospecto', 1, '#89898a', false),
  ('propuesta', 'Propuesta', 2, '#38bdf8', false),
  ('aprobado', 'Aprobado', 3, '#025ff5', false),
  ('en_curso', 'En curso', 4, '#05e4fd', false),
  ('revision', 'En revisión', 5, '#8b5cf6', false),
  ('entregado', 'Entregado', 6, '#2dd4bf', false),
  ('cerrado', 'Cerrado', 7, '#22c55e', true),
  ('pausado', 'Pausado', 8, '#e0b252', false),
  ('cancelado', 'Cancelado', 9, '#ef4444', true)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 5. PROYECTOS & ASIGNACIONES
-- ------------------------------------------------------------
create table if not exists public.proyectos (
  id                      text primary key,
  codigo                  text unique,
  categoria               text default 'desarrollo',
  tipo_desarrollo         text default 'web',
  modulos                 jsonb default '[]'::jsonb,
  nombre                  text not null,
  cliente_id              text not null references public.clientes(id) on delete cascade,
  descripcion             text,
  estado_id               text not null references public.estados_proyecto(id) on delete restrict default 'prospecto',
  tag_ids                 jsonb default '[]'::jsonb,
  responsable_principal_id text references public.colaboradores(id) on delete set null,
  progreso                numeric not null default 0,
  fechas                  jsonb default '{}'::jsonb,
  medio_pago              text,
  notas                   text,
  chat_abierto            boolean not null default false,
  creado_en               timestamptz not null default now()
);

create table if not exists public.asignaciones (
  id             text primary key,
  proyecto_id    text not null references public.proyectos(id) on delete cascade,
  colaborador_id text not null references public.colaboradores(id) on delete cascade,
  rol            text not null default 'colaborador',
  estado         text not null default 'activa',
  desde          timestamptz not null default now(),
  hasta          timestamptz,
  motivo         text
);

-- ------------------------------------------------------------
-- 6. ACTIVIDADES (TABLERO KANBAN / TAREAS)
-- ------------------------------------------------------------
create table if not exists public.actividades (
  id                  text primary key,
  codigo              text unique,
  proyecto_id         text not null references public.proyectos(id) on delete cascade,
  titulo              text not null,
  estado              text not null default 'backlog',
  prioridad           text not null default 'media',
  responsables        jsonb default '[]'::jsonb,
  etiquetas           jsonb default '[]'::jsonb,
  orden               integer not null default 0,
  creador_id          text,
  requiere_aprobacion boolean not null default false,
  aprueba_en          text,
  aprobador_id        text,
  aprobada_por        text,
  aprobada_en         timestamptz,
  checklist           jsonb default '{"total":0,"hechos":0}'::jsonb,
  comentarios         integer not null default 0,
  vence               text,
  modulo              text,
  instrucciones       text,
  enlaces             jsonb default '[]'::jsonb,
  imagenes            jsonb default '[]'::jsonb,
  creado_en           timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 7. CHAT, REUNIONES & HISTORIAL (HECHOS)
-- ------------------------------------------------------------
create table if not exists public.mensajes_chat (
  id          text primary key,
  proyecto_id text not null references public.proyectos(id) on delete cascade,
  autor_id    text not null,
  texto       text not null,
  fecha       timestamptz not null default now()
);

create table if not exists public.reuniones (
  id                     text primary key,
  codigo                 text unique,
  proyecto_id            text not null references public.proyectos(id) on delete cascade,
  fecha                  text not null,
  titulo                 text,
  participantes          jsonb default '[]'::jsonb,
  notas                  text,
  origen                 text not null default 'escrita',
  audio                  text,
  adjuntos               jsonb default '[]'::jsonb,
  participantes_externos jsonb default '[]'::jsonb,
  fecha_programada       text,
  avisada                boolean not null default false,
  creado_en              timestamptz not null default now()
);

create table if not exists public.hechos (
  id          text primary key,
  proyecto_id text not null references public.proyectos(id) on delete cascade,
  tipo        text not null,
  descripcion text not null,
  fecha       timestamptz not null default now(),
  autor_id    text,
  ref_id      text
);

-- ------------------------------------------------------------
-- 8. HERRAMIENTAS / SERVICIOS
-- ------------------------------------------------------------
create table if not exists public.herramientas (
  id           text primary key,
  codigo       text unique,
  nombre       text not null,
  url          text,
  propietario  text not null default 'sd',
  cliente_ids  jsonb default '[]'::jsonb,
  proyecto_ids jsonb default '[]'::jsonb,
  reparto      text default 'solo_sd',
  correo       text,
  contrasena   text,
  ciclo        text not null default 'mensual',
  precio       numeric default 0,
  moneda       text default 'USD',
  metodo_pago  text,
  proximo_pago text,
  ultimo_pago  text,
  notas        text,
  activa       boolean not null default true,
  creado_en    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 9. FINANZAS: TASAS, PRESUPUESTOS & PAGOS
-- ------------------------------------------------------------
create table if not exists public.tasas_cambio (
  id       text primary key,
  fecha    timestamptz not null default now(),
  base     text not null default 'USD',
  destino  text not null default 'VES',
  valor    numeric not null,
  fuente   text not null default 'manual',
  nota     text
);

create table if not exists public.presupuestos (
  id                   text primary key,
  codigo               text unique,
  proyecto_id          text references public.proyectos(id) on delete set null,
  cliente_id           text references public.clientes(id) on delete set null,
  titulo               text not null,
  items                jsonb not null default '[]'::jsonb,
  parametros           jsonb,
  subtotal             numeric not null default 0,
  indirectos           numeric not null default 0,
  margen               numeric not null default 0,
  subtotal_con_margen  numeric not null default 0,
  descuento            numeric not null default 0,
  total                numeric not null default 0,
  plan                 jsonb,
  fecha                text not null,
  aceptado_en          text,
  creado_en            timestamptz not null default now()
);

create table if not exists public.pagos (
  id             text primary key,
  codigo         text unique,
  presupuesto_id text references public.presupuestos(id) on delete set null,
  proyecto_id    text references public.proyectos(id) on delete set null,
  cliente_id     text references public.clientes(id) on delete set null,
  cuota_id       text,
  fecha          text not null,
  monto          numeric not null,
  moneda         text not null default 'USD',
  medio          text not null,
  tasa           numeric,
  equivalente    numeric not null,
  referencia     text,
  nota           text,
  creado_en      timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 10. EVALUACIONES & RECURSOS HUMANOS (RRHH)
-- ------------------------------------------------------------
create table if not exists public.evaluaciones_colaborador (
  id             text primary key,
  asignacion_id  text,
  colaborador_id text not null references public.colaboradores(id) on delete cascade,
  proyecto_id    text not null references public.proyectos(id) on delete cascade,
  porcentaje     numeric not null,
  criterios      jsonb,
  notas          text,
  fecha          text not null
);

create table if not exists public.evaluaciones_cliente (
  id                  text primary key,
  proyecto_id         text not null references public.proyectos(id) on delete cascade,
  cliente_id          text not null references public.clientes(id) on delete cascade,
  amigabilidad        numeric not null default 100,
  puntualidad_pago    numeric not null default 100,
  estabilidad_alcance numeric not null default 100,
  comunicacion        numeric not null default 100,
  notas               text,
  fecha               text not null
);

create table if not exists public.plantillas_entrevista (
  id          text primary key,
  nombre      text not null,
  cargo       text not null,
  descripcion text,
  bloques     jsonb not null default '[]'::jsonb,
  criterios   jsonb not null default '[]'::jsonb,
  creado_en   timestamptz not null default now()
);

create table if not exists public.candidatos (
  id               text primary key,
  codigo           text unique,
  nombre           text not null,
  cargo_aspirado   text not null,
  estado           text not null default 'recibido',
  contacto         jsonb not null default '{}'::jsonb,
  datos_personales jsonb not null default '{}'::jsonb,
  evaluacion       jsonb not null default '{}'::jsonb,
  creado_en        timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 11. AUDITORÍA DEL SISTEMA
-- ------------------------------------------------------------
create table if not exists public.auditoria (
  id         text primary key,
  fecha      timestamptz not null default now(),
  actor      text not null,
  accion     text not null,
  ambito     text not null,
  entidad_id text,
  detalle    text,
  cambios    jsonb
);

-- ------------------------------------------------------------
-- 12. HABILITAR ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
-- ------------------------------------------------------------
alter table public.empresa enable row level security;
alter table public.clientes enable row level security;
alter table public.colaboradores enable row level security;
alter table public.estados_proyecto enable row level security;
alter table public.tags enable row level security;
alter table public.proyectos enable row level security;
alter table public.asignaciones enable row level security;
alter table public.actividades enable row level security;
alter table public.mensajes_chat enable row level security;
alter table public.reuniones enable row level security;
alter table public.hechos enable row level security;
alter table public.herramientas enable row level security;
alter table public.tasas_cambio enable row level security;
alter table public.presupuestos enable row level security;
alter table public.pagos enable row level security;
alter table public.evaluaciones_colaborador enable row level security;
alter table public.evaluaciones_cliente enable row level security;
alter table public.plantillas_entrevista enable row level security;
alter table public.candidatos enable row level security;
alter table public.auditoria enable row level security;

-- ------------------------------------------------------------
-- 13. POLÍTICAS RLS (Acceso seguro para usuarios autenticados)
-- ------------------------------------------------------------

-- Empresa
drop policy if exists "empresa_all" on public.empresa;
create policy "empresa_all" on public.empresa for all to authenticated using (true) with check (true);

-- Clientes
drop policy if exists "clientes_all" on public.clientes;
create policy "clientes_all" on public.clientes for all to authenticated using (true) with check (true);

-- Colaboradores
drop policy if exists "colaboradores_all" on public.colaboradores;
create policy "colaboradores_all" on public.colaboradores for all to authenticated using (true) with check (true);

-- Estados Proyecto & Tags
drop policy if exists "estados_proyecto_all" on public.estados_proyecto;
create policy "estados_proyecto_all" on public.estados_proyecto for all to authenticated using (true) with check (true);

drop policy if exists "tags_all" on public.tags;
create policy "tags_all" on public.tags for all to authenticated using (true) with check (true);

-- Proyectos & Asignaciones
drop policy if exists "proyectos_all" on public.proyectos;
create policy "proyectos_all" on public.proyectos for all to authenticated using (true) with check (true);

drop policy if exists "asignaciones_all" on public.asignaciones;
create policy "asignaciones_all" on public.asignaciones for all to authenticated using (true) with check (true);

-- Actividades
drop policy if exists "actividades_all" on public.actividades;
create policy "actividades_all" on public.actividades for all to authenticated using (true) with check (true);

-- Mensajes Chat, Reuniones & Hechos
drop policy if exists "mensajes_chat_all" on public.mensajes_chat;
create policy "mensajes_chat_all" on public.mensajes_chat for all to authenticated using (true) with check (true);

drop policy if exists "reuniones_all" on public.reuniones;
create policy "reuniones_all" on public.reuniones for all to authenticated using (true) with check (true);

drop policy if exists "hechos_all" on public.hechos;
create policy "hechos_all" on public.hechos for all to authenticated using (true) with check (true);

-- Herramientas
drop policy if exists "herramientas_all" on public.herramientas;
create policy "herramientas_all" on public.herramientas for all to authenticated using (true) with check (true);

-- Finanzas
drop policy if exists "tasas_cambio_all" on public.tasas_cambio;
create policy "tasas_cambio_all" on public.tasas_cambio for all to authenticated using (true) with check (true);

drop policy if exists "presupuestos_all" on public.presupuestos;
create policy "presupuestos_all" on public.presupuestos for all to authenticated using (true) with check (true);

drop policy if exists "pagos_all" on public.pagos;
create policy "pagos_all" on public.pagos for all to authenticated using (true) with check (true);

-- Evaluaciones & RRHH
drop policy if exists "evaluaciones_colaborador_all" on public.evaluaciones_colaborador;
create policy "evaluaciones_colaborador_all" on public.evaluaciones_colaborador for all to authenticated using (true) with check (true);

drop policy if exists "evaluaciones_cliente_all" on public.evaluaciones_cliente;
create policy "evaluaciones_cliente_all" on public.evaluaciones_cliente for all to authenticated using (true) with check (true);

drop policy if exists "plantillas_entrevista_all" on public.plantillas_entrevista;
create policy "plantillas_entrevista_all" on public.plantillas_entrevista for all to authenticated using (true) with check (true);

drop policy if exists "candidatos_all" on public.candidatos;
create policy "candidatos_all" on public.candidatos for all to authenticated using (true) with check (true);

-- Auditoría
drop policy if exists "auditoria_all" on public.auditoria;
create policy "auditoria_all" on public.auditoria for all to authenticated using (true) with check (true);
