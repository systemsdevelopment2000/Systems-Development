-- ------------------------------------------------------------
-- 0008: Tabla de Metodologías de Trabajo con RLS y Realtime
-- ------------------------------------------------------------

create table if not exists public.metodologias (
  id text primary key,
  codigo text unique,
  titulo text not null,
  subtitulo text,
  tipo text not null default 'desarrollo',
  descripcion text not null default '',
  objetivo text,
  alcance text,
  logo text,
  mostrar_logo_sd boolean not null default true,
  mostrar_datos_sd boolean not null default true,
  mostrar_firma_sd boolean not null default true,
  datos_contacto_sd jsonb default '{}'::jsonb,
  logo_cliente text,
  tamano_logo_cliente text default 'grande',
  cliente_id text,
  cliente_nombre text,
  fases jsonb not null default '[]'::jsonb,
  imagenes jsonb not null default '[]'::jsonb,
  principios jsonb not null default '[]'::jsonb,
  firmas jsonb not null default '[]'::jsonb,
  mostrar_firmas boolean not null default true,
  version text default '1.0',
  activa boolean not null default true,
  creado_en text not null default now()::text
);

-- Habilitar Row Level Security (RLS)
alter table public.metodologias enable row level security;

-- Políticas de acceso para usuarios autenticados y clave pública (anon)
drop policy if exists "metodologias_all" on public.metodologias;
create policy "metodologias_all" on public.metodologias
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists "metodologias_anon" on public.metodologias;
create policy "metodologias_anon" on public.metodologias
  for all to anon
  using (true)
  with check (true);

-- Agregar a publicación realtime si no está
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'metodologias'
  ) then
    alter publication supabase_realtime add table public.metodologias;
  end if;
exception when others then
  -- Continuar si supabase_realtime no está configurado en este entorno
  null;
end $$;
