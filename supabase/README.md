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
3. En el **SQL Editor**, pega y ejecuta `migrations/0001_init.sql`.
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
npx supabase gen types typescript --linked > src/core/types/database.types.ts
```

## Seguridad (importante)

- Toda tabla tiene **RLS activada**: sin políticas, nadie lee ni escribe.
- La clave `anon` es pública y segura en el navegador **porque** RLS protege los datos.
- La `service_role` **nunca** va al cliente ni al repo: omite RLS.
- La función `es_admin()` es `SECURITY DEFINER` para evitar recursión de policies.
