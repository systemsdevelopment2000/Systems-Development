-- Migración 0003: Ajustes de esquema, Realtime y permisos para sincronización
-- -----------------------------------------------------------------------------

-- 1. Agregar tablas operativas a la publicación de realtime
alter publication supabase_realtime add table 
  public.proyectos,
  public.clientes,
  public.actividades,
  public.presupuestos,
  public.asignaciones,
  public.colaboradores,
  public.reuniones,
  public.mensajes_chat,
  public.pagos;

-- 2. Replica identity FULL para asegurar payloads completos en Realtime
alter table public.proyectos replica identity full;
alter table public.clientes replica identity full;
alter table public.actividades replica identity full;
alter table public.presupuestos replica identity full;
alter table public.asignaciones replica identity full;
alter table public.colaboradores replica identity full;
alter table public.reuniones replica identity full;
alter table public.mensajes_chat replica identity full;
alter table public.pagos replica identity full;

-- 3. Columnas completas en presupuestos
alter table public.presupuestos add column if not exists estado text not null default 'borrador';
alter table public.presupuestos add column if not exists tipo text not null default 'inicial';
alter table public.presupuestos add column if not exists moneda text not null default 'USD';
alter table public.presupuestos add column if not exists lineas jsonb not null default '[]'::jsonb;
alter table public.presupuestos add column if not exists descuento_global numeric not null default 0;
alter table public.presupuestos add column if not exists impuesto numeric not null default 0;
alter table public.presupuestos add column if not exists validez_dias integer default 15;
alter table public.presupuestos add column if not exists notas text;
alter table public.presupuestos add column if not exists condiciones text;

-- 4. Flexibilizar cliente_id en proyectos para permitir borradores
alter table public.proyectos alter column cliente_id drop not null;

-- 5. Políticas para anon (acceso controlado de respaldo y sincronización frontend)
create policy "proyectos_anon_select" on public.proyectos for select to anon using (true);
create policy "proyectos_anon_insert" on public.proyectos for insert to anon with check (true);
create policy "proyectos_anon_update" on public.proyectos for update to anon using (true);
create policy "proyectos_anon_delete" on public.proyectos for delete to anon using (true);

create policy "clientes_anon_select" on public.clientes for select to anon using (true);
create policy "clientes_anon_insert" on public.clientes for insert to anon with check (true);
create policy "clientes_anon_update" on public.clientes for update to anon using (true);

create policy "presupuestos_anon_select" on public.presupuestos for select to anon using (true);
create policy "presupuestos_anon_insert" on public.presupuestos for insert to anon with check (true);
create policy "presupuestos_anon_update" on public.presupuestos for update to anon using (true);
create policy "presupuestos_anon_delete" on public.presupuestos for delete to anon using (true);

create policy "actividades_anon_select" on public.actividades for select to anon using (true);
create policy "actividades_anon_insert" on public.actividades for insert to anon with check (true);
create policy "actividades_anon_update" on public.actividades for update to anon using (true);
create policy "actividades_anon_delete" on public.actividades for delete to anon using (true);

create policy "asignaciones_anon_select" on public.asignaciones for select to anon using (true);
create policy "asignaciones_anon_insert" on public.asignaciones for insert to anon with check (true);
create policy "asignaciones_anon_update" on public.asignaciones for update to anon using (true);

create policy "colaboradores_anon_select" on public.colaboradores for select to anon using (true);
create policy "colaboradores_anon_insert" on public.colaboradores for insert to anon with check (true);
create policy "colaboradores_anon_update" on public.colaboradores for update to anon using (true);

create policy "estados_proyecto_anon_select" on public.estados_proyecto for select to anon using (true);
create policy "tags_anon_select" on public.tags for select to anon using (true);
create policy "empresa_anon_select" on public.empresa for select to anon using (true);
