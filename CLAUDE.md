# SD Sistema — instrucciones del proyecto

Proyecto **independiente y autocontenido**. Su configuración, código y
entregables viven **únicamente en este repositorio**, que es la única fuente de
verdad. No se rige por las convenciones ni las carpetas de otros proyectos o
clientes, y no se guarda nada de este proyecto fuera de aquí.

> Estas instrucciones de proyecto tienen prioridad sobre cualquier regla global
> al trabajar dentro de esta carpeta.

## Qué es

Plataforma interna de **Systems Development** (Puerto Ordaz).
Monolito modular orientado a **PWA**.

## Stack

- React 19 + Vite 6 + **TypeScript** estricto · npm.
- **Supabase** (Postgres + Auth + Storage) en modo **client-only**: el front
  habla directo con Supabase y la seguridad vive en las **políticas RLS**. La
  `service_role` nunca va al cliente ni al repositorio.
- `@tanstack/react-query` para datos · `react-router-dom` 7 para ruteo.
- PWA con `vite-plugin-pwa` · despliegue en **Vercel**.

## Arquitectura

Monolito modular en 3 capas, con dependencias en una sola dirección
(`app → modules → core`). Cada módulo de dominio expone su API pública en
`index.ts`; nada lo importa por rutas internas. Detalle en
`docs/ARQUITECTURA.md` y `docs/MODULOS.md`.

## Convenciones de trabajo

- Responder en **español**.
- **Prohibido crear artifacts.** Todo el trabajo se queda en **local** (archivos
  de este repo) hasta que Chris indique explícitamente lo contrario. No publicar
  nada en claude.ai.
- Guardar siempre como **archivo dentro de este repo**, no solo inline en el chat.
- Preguntar antes de asumir cuando la decisión cambia el resultado.
- Al cerrar un entregable, separar explícitamente **supuestos** de **pendientes**.

## Identidad de marca

Azul eléctrico `#14409F` · cian `#01D3FE` · azul marino `#0B1128` · negro
metálico `#040404` · plata `#C0C0C0`. Logo: `public/logo-sd.png` (papel) y
`public/marca-sd.png` (interfaz). Detalle en `design/MARCA.md`.
Contacto: systemsdevelopment2000@gmail.com · 0414-8983663 / 0412-4249441.
