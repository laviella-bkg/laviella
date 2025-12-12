# La Viella Glamping

Sitio web para reservas de domos glamping, construido con Next.js 15 y integrado con Strapi CMS.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/agrojas-projects/v0-domos-landing-page)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

## 📚 Documentación

La documentación del proyecto está organizada en el directorio [`docs/`](./docs/):

- **[Seguridad](./docs/security/)** - Análisis de seguridad OWASP, vulnerabilidades y correcciones
- **[Despliegue](./docs/deployment/)** - Guías de configuración para Vercel y variables de entorno
- **[Desarrollo](./docs/development/)** - Documentación para desarrolladores

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install
# o
pnpm install

# Configurar variables de entorno
cp env.local.example .env.local
# Editar .env.local con tus valores

# Ejecutar en desarrollo
npm run dev
# o
pnpm dev
```

Visita [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 📋 Documentos Importantes

- **Variables de Entorno**: Ver [docs/deployment/VERCEL_ENV_VARS.md](./docs/deployment/VERCEL_ENV_VARS.md)
- **Análisis de Seguridad**: Ver [docs/security/OWASP_SECURITY_ANALYSIS.md](./docs/security/OWASP_SECURITY_ANALYSIS.md)
- **Correcciones de Seguridad**: Ver [docs/security/SECURITY_FIXES.md](./docs/security/SECURITY_FIXES.md)

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **CMS Backend**: Strapi 5.29.0
- **UI**: Tailwind CSS + Shadcn UI
- **Deployment**: Vercel

## 📝 Notas

Este proyecto se integra con un backend Strapi para gestionar:
- Domos y disponibilidad
- Reservas
- Temporadas y precios
- Testimonios
- Páginas dinámicas

Para más detalles sobre la integración, ver la documentación en [`docs/`](./docs/).
