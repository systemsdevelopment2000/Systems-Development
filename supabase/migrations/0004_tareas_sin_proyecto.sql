-- Migración 0004: Permitir actividades/tareas sin proyecto asociado
-- -----------------------------------------------------------------------------

-- Hacer proyecto_id nullable en actividades
alter table public.actividades alter column proyecto_id drop not null;
