-- ------------------------------------------------------------
-- 0005: Columnas para tipos de herramienta, dia de pago y accesos
-- ------------------------------------------------------------

alter table public.herramientas
  add column if not exists tipo_herramienta text,
  add column if not exists dia_pago_mes integer,
  add column if not exists accesos jsonb default '[]'::jsonb;

-- Asegurar RLS en public.herramientas
alter table public.herramientas enable row level security;
drop policy if exists "herramientas_all" on public.herramientas;
create policy "herramientas_all" on public.herramientas for all to authenticated using (true) with check (true);
drop policy if exists "herramientas_anon" on public.herramientas;
create policy "herramientas_anon" on public.herramientas for all to anon using (true) with check (true);
