# SD Sistema

Plataforma interna de **Systems Development** (Puerto Ordaz).
Monolito modular orientado a **PWA**: React + Vite + TypeScript, backend en
Supabase y despliegue en Vercel.

> **Arquitectura:** un solo despliegue, el código dividido en módulos de dominio
> con fronteras claras. Detalles en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md)
> y [`docs/MODULOS.md`](docs/MODULOS.md).

## Stack

| Capa        | Tecnología                                  |
| ----------- | ------------------------------------------- |
| UI          | React 19 + Vite 6 + TypeScript              |
| Datos       | @tanstack/react-query                       |
| Backend     | Supabase (Postgres + Auth + Storage, RLS)   |
| Ruteo       | react-router-dom 7                          |
| PWA         | vite-plugin-pwa (service worker + manifest) |
| Deploy      | Vercel                                      |
| Calidad     | ESLint 9 (flat) + Prettier                  |

## Requisitos

- Node **>= 20.19** (ver `.nvmrc`)
- npm 10+
- Una cuenta de Supabase (y, opcional, Vercel CLI para desplegar)

## Puesta en marcha

```bash
# 1) Instalar dependencias
npm install

# 2) Configurar entorno
cp .env.example .env.local      # en PowerShell: Copy-Item .env.example .env.local
#    -> rellena VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

# 3) Aplicar todas las migraciones en una instancia de desarrollo
npx supabase start
npx supabase db reset
# Para una instancia remota, consulta supabase/README.md.

# 4) Arrancar en desarrollo
npm run dev            # http://localhost:5173
```

> Primer acceso: regístrate/crea un usuario en Supabase Auth. Para volverlo admin:
> `update public.usuarios set rol = 'admin' where email = 'tu@correo.com';`

## Scripts

| Script                        | Para qué                                      |
| ----------------------------- | --------------------------------------------- |
| `npm run dev`                 | Servidor de desarrollo (HMR)                  |
| `npm run build`               | Typecheck + build de producción a `dist/`     |
| `npm run preview`             | Previsualizar el build                        |
| `npm run lint`                | ESLint                                        |
| `npm run format`              | Prettier (escribe)                            |
| `npm run typecheck`           | Chequeo de tipos sin emitir                   |
| `npm run generate-pwa-assets` | Generar íconos PWA desde el logo              |

## Estructura

```
SD Sistema/
├── public/                  Estáticos (favicon, robots, íconos PWA)
├── src/
│   ├── app/                 Shell: router, providers, layouts, guards
│   ├── core/                Infra transversal: supabase, config, ui, hooks
│   ├── modules/             Dominios: auth, dashboard, usuarios, configuracion
│   ├── styles/              globals.css (design tokens de marca)
│   ├── App.tsx  main.tsx
│   └── vite-env.d.ts
├── supabase/                Migraciones + config + RLS
├── docs/                    Arquitectura y guía de módulos
├── vite.config.ts           Vite + PWA + alias @/
├── vercel.json              Config de despliegue (SPA + caché)
└── .env.example             Plantilla de variables
```

Alias de imports: `@/` → `src/` (ej. `import { Button } from '@/core/ui'`).

## Despliegue en Vercel

1. Sube el repo a GitHub e **Import Project** en Vercel (detecta Vite solo).
2. En **Settings → Environment Variables** agrega `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` (para Production y Preview).
3. Cada push genera un Preview; `main` publica a Production.
   Alternativa por CLI: `npx vercel` y `npx vercel --prod`.

## Verificación

Ejecuta `npm run lint`, `npm test` y `npm run build`. El flujo de GitHub Actions ejecuta los mismos comandos. Para verificar las políticas por rol, consulta la guía de Supabase.

## Íconos PWA

El favicon SVG ya trae el monograma SD. Para los PNG instalables, coloca un logo
cuadrado con fondo transparente en `public/brand-logo.png` y ejecuta
`npm run generate-pwa-assets`.

---

### Datos y permisos

- La SPA llama directamente a Supabase. La migración `0009` aplica permisos por rol en la base de datos.
- Se usa el rol de `public.usuarios` para autorizar operaciones en Supabase. Los ajustes de colaboradores en la pantalla Usuarios aún son metadatos de la aplicación.
- La caché se separa por cuenta y excluye la bóveda. La versión previa se conserva para recuperación local y se limpia de registros de la bóveda. Como esa caché carece de identificador de cuenta, la aplicación carga los datos de cada cuenta por separado.
