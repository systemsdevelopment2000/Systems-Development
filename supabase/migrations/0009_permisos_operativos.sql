-- Sustituye las pol?ticas de las tablas operativas sin modificar los datos.
create function public.puede_editar_datos()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.usuarios
    where id = auth.uid() and rol in ('admin', 'operador')
  );
$$;

revoke execute on function public.puede_editar_datos() from public;
grant execute on function public.puede_editar_datos() to authenticated;

create function public.proteger_rol_usuario()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.rol is distinct from old.rol
     and current_user in ('anon', 'authenticated')
     and not public.es_admin() then
    raise exception 'Solo un administrador puede cambiar el rol' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger proteger_rol_usuario
before update of rol on public.usuarios
for each row execute function public.proteger_rol_usuario();

do $$
declare
  tabla text;
  politica record;
  lectura text;
  escritura text;
begin
  foreach tabla in array array[
    'empresa', 'clientes', 'colaboradores', 'estados_proyecto', 'tags',
    'proyectos', 'asignaciones', 'actividades', 'mensajes_chat', 'reuniones',
    'hechos', 'herramientas', 'tasas_cambio', 'presupuestos', 'pagos',
    'evaluaciones_colaborador', 'evaluaciones_cliente', 'plantillas_entrevista',
    'candidatos', 'auditoria', 'metodologias'
  ] loop
    for politica in
      select policyname from pg_catalog.pg_policies
      where schemaname = 'public' and tablename = tabla
    loop
      execute format('drop policy %I on public.%I', politica.policyname, tabla);
    end loop;

    lectura := case
      when tabla in ('herramientas', 'auditoria') then 'public.es_admin()'
      when tabla in ('candidatos', 'plantillas_entrevista', 'pagos', 'presupuestos',
                     'evaluaciones_colaborador', 'evaluaciones_cliente') then 'public.puede_editar_datos()'
      else 'auth.uid() is not null'
    end;
    escritura := case
      when tabla in ('empresa', 'estados_proyecto', 'herramientas', 'auditoria') then 'public.es_admin()'
      else 'public.puede_editar_datos()'
    end;

    execute format('create policy sd_select on public.%I for select to authenticated using (%s)', tabla, lectura);
    if tabla <> 'auditoria' then
      execute format('create policy sd_insert on public.%I for insert to authenticated with check (%s)', tabla, escritura);
      execute format('create policy sd_update on public.%I for update to authenticated using (%s) with check (%s)', tabla, escritura, escritura);
      execute format('create policy sd_delete on public.%I for delete to authenticated using (public.es_admin())', tabla);
    end if;
  end loop;
end;
$$;
