-- Conserva la forma de los accesos para que el cliente pueda leer datos anteriores.
create schema if not exists vault;
create extension if not exists supabase_vault with schema vault;
create schema if not exists sd_privado;
revoke all on schema sd_privado from public, anon, authenticated;

alter table public.herramientas
  add column if not exists tipo_herramienta text,
  add column if not exists dia_pago_mes integer,
  add column if not exists accesos jsonb default '[]'::jsonb;

create table sd_privado.accesos_herramienta (
  herramienta_id text primary key references public.herramientas(id) on delete cascade,
  secreto_id uuid not null unique
);

create function sd_privado.guardar_accesos(herramienta text, contenido jsonb)
returns void language plpgsql set search_path = '' as $$
declare secreto uuid;
begin
  select secreto_id into secreto
  from sd_privado.accesos_herramienta where herramienta_id = herramienta;
  if secreto is null then
    insert into sd_privado.accesos_herramienta (herramienta_id, secreto_id)
    values (herramienta, vault.create_secret(contenido::text));
  else
    perform vault.update_secret(secreto, contenido::text);
  end if;
end;
$$;

create function sd_privado.eliminar_accesos()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  delete from vault.secrets where id = old.secreto_id;
  return old;
end;
$$;

create trigger eliminar_accesos_herramienta
after delete on sd_privado.accesos_herramienta
for each row execute function sd_privado.eliminar_accesos();

create function public.leer_herramientas_seguras(desde integer, cantidad integer)
returns setof jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.es_admin() then return; end if;
  return query
  select to_jsonb(h) || coalesce(s.decrypted_secret::jsonb, '{}'::jsonb)
  from public.herramientas h
  left join sd_privado.accesos_herramienta a on a.herramienta_id = h.id
  left join vault.decrypted_secrets s on s.id = a.secreto_id
  order by h.id
  offset greatest(desde, 0) limit least(greatest(cantidad, 1), 500);
end;
$$;

create function public.guardar_herramienta_segura(datos jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare h public.herramientas;
begin
  if not public.es_admin() then
    raise exception 'Se requiere rol administrador' using errcode = '42501';
  end if;
  h := jsonb_populate_record(null::public.herramientas, datos);
  -- El bloqueo de la fila por el upsert serializa los cambios a su secreto.
  insert into public.herramientas (
    id, codigo, nombre, url, propietario, cliente_ids, proyecto_ids, reparto,
    ciclo, precio, moneda, metodo_pago, proximo_pago, ultimo_pago, notas, activa, creado_en
  ) values (
    h.id, h.codigo, h.nombre, h.url, coalesce(h.propietario, 'sd'),
    coalesce(h.cliente_ids, '[]'::jsonb), coalesce(h.proyecto_ids, '[]'::jsonb),
    coalesce(h.reparto, 'solo_sd'), coalesce(h.ciclo, 'mensual'), h.precio, h.moneda, h.metodo_pago,
    h.proximo_pago, h.ultimo_pago,
    nullif(btrim(regexp_replace(coalesce(h.notas, ''), '<!--SD_VAULT:.*?-->', '', 'gs')), ''),
    coalesce(h.activa, true), coalesce(h.creado_en, now())
  )
  on conflict (id) do update set
    codigo = excluded.codigo, nombre = excluded.nombre, url = excluded.url,
    propietario = excluded.propietario, cliente_ids = excluded.cliente_ids,
    proyecto_ids = excluded.proyecto_ids, reparto = excluded.reparto,
    ciclo = excluded.ciclo, precio = excluded.precio, moneda = excluded.moneda,
    metodo_pago = excluded.metodo_pago, proximo_pago = excluded.proximo_pago,
    ultimo_pago = excluded.ultimo_pago, notas = excluded.notas, activa = excluded.activa;
  perform sd_privado.guardar_accesos(h.id, jsonb_build_object(
    'correo', h.correo, 'contrasena', h.contrasena, 'accesos', h.accesos,
    'notas', h.notas
  ));
end;
$$;

revoke all on function public.leer_herramientas_seguras(integer, integer) from public, anon, authenticated;
revoke all on function public.guardar_herramienta_segura(jsonb) from public, anon, authenticated;
grant execute on function public.leer_herramientas_seguras(integer, integer) to authenticated;
grant execute on function public.guardar_herramienta_segura(jsonb) to authenticated;

-- Mueve los registros existentes dentro de la transaccion de migracion.
lock table public.herramientas in share row exclusive mode;
select sd_privado.guardar_accesos(id, jsonb_build_object(
  'correo', correo, 'contrasena', contrasena, 'accesos', accesos, 'notas', notas
)) from public.herramientas
where correo is not null or contrasena is not null
   or coalesce(accesos, '[]'::jsonb) <> '[]'::jsonb or notas like '%<!--SD_VAULT:%';

update public.herramientas set correo = null, contrasena = null, accesos = '[]'::jsonb,
  notas = nullif(btrim(regexp_replace(coalesce(notas, ''), '<!--SD_VAULT:.*?-->', '', 'gs')), '')
where correo is not null or contrasena is not null
   or coalesce(accesos, '[]'::jsonb) <> '[]'::jsonb or notas like '%<!--SD_VAULT:%';

alter table public.herramientas add constraint herramientas_accesos_en_vault check (
  correo is null and contrasena is null and coalesce(accesos, '[]'::jsonb) = '[]'::jsonb
  and strpos(coalesce(notas, ''), '<!--SD_VAULT:') = 0
);

-- Las escrituras del cliente pasan por la funcion que actualiza ambos registros.
drop policy sd_insert on public.herramientas;
drop policy sd_update on public.herramientas;
