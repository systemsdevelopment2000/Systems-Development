-- ============================================================
-- SD Sistema — migración inicial
-- Tabla `usuarios` sincronizada con auth.users + RLS segura.
-- ============================================================

-- 1) Enum de roles -------------------------------------------------
create type public.rol_usuario as enum ('admin', 'operador', 'lectura');

-- 2) Tabla de perfiles de usuario ---------------------------------
create table public.usuarios (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null unique,
  nombre     text,
  rol        public.rol_usuario not null default 'lectura',
  creado_en  timestamptz not null default now()
);

comment on table public.usuarios is 'Perfil de aplicación por cada cuenta de auth.users.';

-- 3) Habilitar Row Level Security ---------------------------------
alter table public.usuarios enable row level security;

-- 4) Helper SECURITY DEFINER para evitar recursión en las policies -
--    (consultar usuarios dentro de una policy de usuarios recurre;
--     esta función corre como owner y SALTA RLS de forma segura).
create or replace function public.es_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.usuarios u
    where u.id = auth.uid() and u.rol = 'admin'
  );
$$;

-- 5) Políticas RLS -------------------------------------------------
-- Lectura: cada quien ve su fila; los admin ven todas.
create policy "usuarios_select"
  on public.usuarios for select
  to authenticated
  using (id = auth.uid() or public.es_admin());

-- Actualización: cada quien edita su propia fila (sin cambiar su rol
-- a mano se controla a nivel de app / futura policy de admin).
create policy "usuarios_update_propio"
  on public.usuarios for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Los admin pueden actualizar cualquier fila.
create policy "usuarios_update_admin"
  on public.usuarios for update
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- 6) Alta automática de perfil al registrarse en auth.users --------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.usuarios (id, email, nombre)
  values (new.id, new.email, new.raw_user_meta_data ->> 'nombre');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
