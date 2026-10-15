# La Viella Glamping

Sitio web para reservas de domos glamping, construido con Next.js 16 y Payload CMS (embebido en la misma app).

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/agrojas-projects/v0-domos-landing-page)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

## 📚 Documentación

La documentación del proyecto está organizada en el directorio [`docs/`](./docs/):

- **[Seguridad](./docs/security/)** - Análisis de seguridad OWASP, vulnerabilidades y correcciones
- **[Despliegue](./docs/deployment/)** - Guías de configuración para Vercel y variables de entorno
- **[Desarrollo](./docs/development/)** - Documentación para desarrolladores

## 🚀 Inicio Rápido

```bash
pnpm install

# Configurar variables de entorno
cp env.local.example .env.local
# Editar .env.local con tus valores

pnpm dev
```

- Sitio: [http://localhost:3000](http://localhost:3000)
- Admin (Payload): [http://localhost:3000/cms](http://localhost:3000/cms)

Comandos de Payload:

```bash
pnpm generate:types                # regenera cms/payload-types.ts tras cambiar colecciones
pnpm payload migrate:create <nombre>  # crea una migración para producción
pnpm payload migrate               # aplica migraciones (Vercel lo hace en el build)
STRAPI_BACKUP_DIR=../_backup-strapi-2026-10-15 pnpm payload run scripts/import-strapi.ts  # importa el contenido de Strapi
```

> ⚠️ Para correr cualquier comando de Payload contra la base de **producción**, usá siempre `NODE_ENV=production`.
> Sin eso Payload arranca en modo dev, sincroniza el esquema solo y deja una marca que bloquea las migraciones siguientes.
> El desarrollo local usa Postgres en Docker: `docker compose up -d`.

## 📋 Documentos Importantes

- **Variables de Entorno**: Ver [docs/deployment/VERCEL_ENV_VARS.md](./docs/deployment/VERCEL_ENV_VARS.md)
- **Análisis de Seguridad**: Ver [docs/security/OWASP_SECURITY_ANALYSIS.md](./docs/security/OWASP_SECURITY_ANALYSIS.md)
- **Correcciones de Seguridad**: Ver [docs/security/SECURITY_FIXES.md](./docs/security/SECURITY_FIXES.md)

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **CMS**: Payload 3 (`payload.config.ts`, colecciones en `cms/`) sobre Postgres (Neon) + Vercel Blob
- **UI**: Tailwind CSS + Shadcn UI
- **Deployment**: Vercel

## 📝 Notas

Payload gestiona domos, reservas, temporadas, testimonios, páginas, mensajes de contacto, huéspedes y la página de inicio.

- Lectura de datos: `lib/cms.ts` (Local API, solo servidor)
- Mutaciones desde el sitio: `lib/actions.ts` (server actions)
- Lógica de reservas (solapamiento, emails, Google Calendar): `cms/hooks/reservations.ts`
- Tareas programadas: `cms/tasks.ts`, expuestas en `/api/cron` (protegido con `CRON_SECRET`)
- Las páginas son estáticas y se invalidan solas al editar contenido (`cms/hooks/revalidate.ts`)
