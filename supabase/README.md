# Supabase — SD Sistema

Backend del sistema: base de datos Postgres, Auth y Storage.

## Estructura

- `config.toml` — configuración de la CLI para el stack local.
- `migrations/` — migraciones versionadas (orden por nombre).
- `seed.sql` — datos de ejemplo para desarrollo local.

## Flujo recomendado

### Opción A — Proyecto en la nube (lo más rápido)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **Project Settings → API** copia la `URL` y la clave `anon`
   a tu `.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
3. Desde el repositorio, ejecuta `npx supabase link --project-ref <TU_PROJECT_ID>`, revisa el historial remoto y aplica las migraciones pendientes con `npx supabase db push`. En una instancia existente, revisa en especial `0006`, que vacía herramientas, antes de aplicar migraciones históricas pendientes.
4. Genera los tipos TypeScript:
   ```bash
   npx supabase gen types typescript --project-id <TU_PROJECT_ID> \
     > src/core/types/database.types.ts
   ```

### Opción B — Stack local con la CLI

```bash
npx supabase init          # si no existe config
npx supabase start         # levanta Postgres + Studio local
npx supabase db reset      # aplica migraciones + seed
npx supabase gen types typescript --local > src/core/types/database.types.ts
```

## Seguridad (importante)

- `0009` retira las políticas anónimas de las tablas operativas. El rol `lectura` consulta datos operativos, `operador` puede escribir en los módulos operativos y `admin` gestiona la configuración, la bóveda y las eliminaciones. Finanzas y RR. HH. requieren un rol con edición.
- La bóveda queda restringida a administradores. La migración `0010` traslada las credenciales a Supabase Vault. Las credenciales anteriores deben rotarse también en cada proveedor.
- La clave `anon` es pública y segura en el navegador **porque** RLS protege los datos.
- La `service_role` **nunca** va al cliente ni al repo: omite RLS.
- La función `es_admin()` es `SECURITY DEFINER` para evitar recursión de policies.

## Prueba de permisos

Con las migraciones aplicadas a la instancia local, ejecuta este archivo con `psql` como `postgres`. La transacción termina con un rollback.

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -v ON_ERROR_STOP=1 -f supabase/tests/permisos_operativos.sql
```

## Despliegue de la bóveda

1. Publica el cliente que usa `leer_herramientas_seguras` y `guardar_herramienta_segura`. Ese cliente conserva compatibilidad con el esquema previo mientras las funciones no existan.
2. Aplica `0010_boveda_cifrada.sql` en una transacción. La versión anterior del cliente seguirá viendo los metadatos de herramientas, pero requerirá actualizarse para consultar y guardar accesos.
3. Verifica la lectura, edición y eliminación con un administrador. El archivo `tests/boveda_cifrada.sql` está diseñado para ejecutarse dentro de una transacción de prueba que termina en rollback. Usa datos sintéticos al probar.
