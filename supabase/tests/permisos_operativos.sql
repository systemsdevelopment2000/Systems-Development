-- Ejecutar con psql como postgres en una base local con las migraciones aplicadas.
begin;

insert into auth.users (id, email, raw_user_meta_data) values
  ('10000000-0000-4000-8000-000000000001', 'rls-lectura@example.invalid', '{}'),
  ('10000000-0000-4000-8000-000000000002', 'rls-operador@example.invalid', '{}'),
  ('10000000-0000-4000-8000-000000000003', 'rls-admin@example.invalid', '{}');

update public.usuarios set rol = 'operador' where email = 'rls-operador@example.invalid';
update public.usuarios set rol = 'admin' where email = 'rls-admin@example.invalid';
insert into public.tags (id, nombre) values ('rls-prueba', 'Etiqueta de prueba');
insert into public.herramientas (id, nombre) values ('rls-prueba', 'Herramienta de prueba');

set local role anon;
do $$
begin
  if exists (select from public.tags where id = 'rls-prueba')
     or exists (select from public.herramientas where id = 'rls-prueba') then
    raise exception 'La sesion anonima puede leer datos operativos';
  end if;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
do $$
begin
  if not exists (select from public.tags where id = 'rls-prueba')
     or exists (select from public.herramientas where id = 'rls-prueba') then
    raise exception 'Permisos incorrectos para el rol lectura';
  end if;
  update public.tags set nombre = 'Cambio' where id = 'rls-prueba';
  if found then raise exception 'El rol lectura puede editar etiquetas'; end if;
  update public.usuarios set nombre = 'Perfil propio' where id = auth.uid();
  if not found then raise exception 'No se pudo editar el perfil propio'; end if;
  begin
    update public.usuarios set rol = 'admin' where id = auth.uid();
    raise exception 'El usuario pudo cambiar su propio rol';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
do $$
begin
  update public.tags set nombre = 'Etiqueta editada' where id = 'rls-prueba';
  if not found then raise exception 'El operador no puede editar etiquetas'; end if;
  delete from public.tags where id = 'rls-prueba';
  if found then raise exception 'El operador puede borrar etiquetas'; end if;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', true);
do $$
begin
  if not exists (select from public.herramientas where id = 'rls-prueba') then
    raise exception 'El administrador no puede leer herramientas';
  end if;
  update public.usuarios set rol = 'operador' where email = 'rls-lectura@example.invalid';
  if not found then raise exception 'El administrador no puede gestionar roles'; end if;
  delete from public.tags where id = 'rls-prueba';
  if not found then raise exception 'El administrador no puede borrar etiquetas'; end if;
end;
$$;

rollback;
