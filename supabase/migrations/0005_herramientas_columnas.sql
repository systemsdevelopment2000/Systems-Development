-- ------------------------------------------------------------
-- 0005: Columnas para tipos de herramienta, dia de pago y accesos
-- ------------------------------------------------------------

alter table public.herramientas
  add column if not exists tipo_herramienta text,
  add column if not exists dia_pago_mes integer,
  add column if not exists accesos jsonb default '[]'::jsonb;
