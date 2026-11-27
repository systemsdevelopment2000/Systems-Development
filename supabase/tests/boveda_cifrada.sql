-- Ejecutar dentro de una transaccion y hacer rollback.
do $$
begin
  if exists (
    select from public.herramientas
    where correo is not null or contrasena is not null or accesos <> '[]'::jsonb
      or notas like '%<!--SD_VAULT:%'
  ) then
    raise exception 'Quedaron accesos en la tabla publica';
  end if;
end;
$$;

insert into auth.users (id, email, raw_user_meta_data) values
  ('10000000-0000-4000-8000-000000000011', 'vault-lector@example.invalid', '{}'),
  ('10000000-0000-4000-8000-000000000012', 'vault-admin@example.invalid', '{}');
update public.usuarios set rol = 'admin' where email = 'vault-admin@example.invalid';

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000011', true);

do $$
begin
  if exists (select from public.leer_herramientas_seguras(0, 1)) then
    raise exception 'El rol lectura puede consultar la boveda';
  end if;
  begin
    perform public.guardar_herramienta_segura('{"id":"vault-test","nombre":"Vault test"}');
    raise exception 'El rol lectura puede escribir en la boveda';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000012', true);
do $$
declare fila jsonb;
begin
  perform public.guardar_herramienta_segura(
    '{"id":"vault-test","nombre":"Vault test","contrasena":"valor-sintetico","notas":"texto <!--SD_VAULT:{\"accesos\":[]}-->"}'
  );
  select dato into fila from public.leer_herramientas_seguras(0, 500) dato where dato->>'id' = 'vault-test';
  if fila->>'contrasena' is distinct from 'valor-sintetico' then
    raise exception 'No se pudo recuperar la credencial sintetica';
  end if;
  if exists (select from public.herramientas where id = 'vault-test' and (contrasena is not null or notas like '%SD_VAULT%')) then
    raise exception 'La escritura por RPC filtro datos a la tabla publica';
  end if;
  perform public.guardar_herramienta_segura(
    '{"id":"vault-test","nombre":"Vault test","contrasena":"valor-sintetico-editado"}'
  );
  select dato into fila from public.leer_herramientas_seguras(0, 500) dato where dato->>'id' = 'vault-test';
  if fila->>'contrasena' is distinct from 'valor-sintetico-editado' then
    raise exception 'No se pudo actualizar la credencial sintetica';
  end if;
  delete from public.herramientas where id = 'vault-test';
  if not found then raise exception 'No se pudo borrar la herramienta sintetica'; end if;
end;
$$;
reset role;
