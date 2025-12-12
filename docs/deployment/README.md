# Documentación de Despliegue

Este directorio contiene documentación relacionada con el despliegue y configuración del proyecto.

## Documentos Disponibles

### 🌐 [Variables de Entorno para Vercel](./VERCEL_ENV_VARS.md)
Guía completa para configurar las variables de entorno en Vercel:
- Variables requeridas y opcionales
- Instrucciones paso a paso
- Configuración por ambiente (Production, Preview, Development)
- Troubleshooting común

## Configuración Rápida

### Variables Requeridas en Vercel

1. `NEXT_PUBLIC_STRAPI_URL` - URL del backend Strapi
2. `NEXT_PUBLIC_STRAPI_API_TOKEN` - Token de API de Strapi

Para más detalles, ver [VERCEL_ENV_VARS.md](./VERCEL_ENV_VARS.md).

## Checklist de Despliegue

Antes de hacer deploy:

- [ ] Variables de entorno configuradas en Vercel
- [ ] Backend Strapi accesible desde internet
- [ ] CORS configurado en Strapi
- [ ] Registros publicados en Strapi
- [ ] Permisos del rol Public configurados
- [ ] Dominio personalizado configurado (opcional)
