# Variables de Entorno para Vercel

## Variables Requeridas

### 1. NEXT_PUBLIC_STRAPI_URL (Obligatoria)

**Descripción:** URL base del backend Strapi

**Valor para producción:**
```
https://tu-backend-strapi.herokuapp.com
```
o
```
https://strapi.tudominio.com
```

**Valor para preview/staging (si usas):**
```
https://staging-strapi.tudominio.com
```

**Dónde se usa:**
- `lib/strapi.ts` - Para construir URLs de API
- `lib/utils/strapi.ts` - Para construir URLs de imágenes/media

**Cómo configurar en Vercel:**
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - **Name:** `NEXT_PUBLIC_STRAPI_URL`
   - **Value:** URL de tu backend Strapi en producción
   - **Environment:** Production, Preview, Development (marca todas)

---

### 2. NEXT_PUBLIC_STRAPI_API_TOKEN (Recomendada)

**Descripción:** Token de API de Strapi para autenticar requests desde el frontend

**Cómo obtener:**
1. Ve a Strapi Admin → Settings → Global settings → API Tokens
2. Create new API Token
3. Configura:
   - **Name:** Frontend Production (o el nombre que prefieras)
   - **Token type:** Read-only (para solo lectura) o Full access
   - **Token duration:** Unlimited
4. Copia el token generado

**Valor:**
```
tu_token_de_strapi_aqui
```

**Dónde se usa:**
- `lib/strapi.ts` - Se envía en el header `Authorization: Bearer {token}`

**Cómo configurar en Vercel:**
1. Settings → Environment Variables
2. Agrega:
   - **Name:** `NEXT_PUBLIC_STRAPI_API_TOKEN`
   - **Value:** Tu token de Strapi
   - **Environment:** Production, Preview, Development (marca todas)
   - ⚠️ **IMPORTANTE:** Marca como "Sensitive" (ocultará el valor)

**Alternativa sin token:**
Si prefieres NO usar token (menos seguro), asegúrate de configurar permisos públicos en Strapi:
- Settings → Roles → Public → Permissions
- Activa `find` y `findOne` para todos los content types

---

## Variables Opcionales

### 3. NEXT_PUBLIC_SITE_URL (Opcional)

**Descripción:** URL base del sitio frontend (usado para generar URLs absolutas)

**Valor:**
```
https://laviella.vercel.app
```
o tu dominio personalizado:
```
https://www.laviellaglamping.com
```

**Dónde se usa:**
- Actualmente no se usa en el código, pero es útil para SEO y metadata

**Cómo configurar en Vercel:**
- Se puede configurar, pero Vercel generalmente maneja esto automáticamente
- Solo necesitas si generas URLs absolutas manualmente

---

## Configuración en Vercel - Paso a Paso

### Opción A: Desde el Dashboard de Vercel

1. **Ve a tu proyecto en Vercel**
   - https://vercel.com/dashboard
   - Selecciona tu proyecto `laviella`

2. **Settings → Environment Variables**

3. **Agrega cada variable:**

   **Variable 1: NEXT_PUBLIC_STRAPI_URL**
   ```
   Name: NEXT_PUBLIC_STRAPI_URL
   Value: https://tu-backend-strapi.com
   Environment: ☑ Production ☑ Preview ☑ Development
   ```

   **Variable 2: NEXT_PUBLIC_STRAPI_API_TOKEN**
   ```
   Name: NEXT_PUBLIC_STRAPI_API_TOKEN
   Value: tu_token_aqui
   Environment: ☑ Production ☑ Preview ☑ Development
   ☑ Sensitive (marca esto para ocultar el valor)
   ```

4. **Haz clic en "Save"**

5. **Redeploy:**
   - Ve a Deployments
   - Haz clic en los 3 puntos (...) del último deploy
   - Selecciona "Redeploy"
   - O simplemente haz un nuevo push a main

---

### Opción B: Desde Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Agregar variables
vercel env add NEXT_PUBLIC_STRAPI_URL production
# Pega el valor cuando te lo pida

vercel env add NEXT_PUBLIC_STRAPI_API_TOKEN production
# Pega el token cuando te lo pida

# Para todas las environments
vercel env add NEXT_PUBLIC_STRAPI_URL preview
vercel env add NEXT_PUBLIC_STRAPI_API_TOKEN preview
```

---

## Configuración por Environment

Puedes tener valores diferentes para cada environment:

### Production
```
NEXT_PUBLIC_STRAPI_URL=https://api.laviellaglamping.com
NEXT_PUBLIC_STRAPI_API_TOKEN=prod_token_aqui
```

### Preview (Pull Requests)
```
NEXT_PUBLIC_STRAPI_URL=https://staging-api.laviellaglamping.com
NEXT_PUBLIC_STRAPI_API_TOKEN=staging_token_aqui
```

### Development
```
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_TOKEN=dev_token_aqui
```

---

## Checklist de Deployment

Antes de hacer deploy, verifica:

- [ ] ✅ `NEXT_PUBLIC_STRAPI_URL` está configurada con la URL de producción
- [ ] ✅ `NEXT_PUBLIC_STRAPI_API_TOKEN` está configurada (si usas tokens)
- [ ] ✅ El backend Strapi está corriendo y accesible desde internet
- [ ] ✅ CORS está configurado en Strapi para permitir tu dominio de Vercel
- [ ] ✅ Los registros están publicados en Strapi
- [ ] ✅ Los permisos del rol Public están configurados (si no usas token)

---

## Verificar que Funciona

Después del deploy, verifica:

1. **Homepage carga domos:**
   ```
   https://tu-app.vercel.app
   ```
   Debe mostrar los domos desde Strapi

2. **Verifica en Network tab:**
   - Abre DevTools → Network
   - Busca requests a tu backend Strapi
   - Verifica que tienen el header `Authorization: Bearer ...`

3. **Test de API directo:**
   ```bash
   curl -H "Authorization: Bearer TU_TOKEN" \
        https://tu-backend-strapi.com/api/domos?populate=*
   ```

---

## CORS en Strapi

Asegúrate de que Strapi permite requests desde tu dominio de Vercel:

En Strapi (`config/middlewares.ts` o `config/server.ts`):

```typescript
cors: {
  enabled: true,
  origin: [
    'http://localhost:3000',
    'https://laviella.vercel.app',
    'https://*.vercel.app',  // Para preview deployments
    // Tu dominio personalizado si lo tienes
    'https://www.tudominio.com',
  ],
},
```

---

## Troubleshooting

### Error: "API call failed: 403"
- Verifica que `NEXT_PUBLIC_STRAPI_API_TOKEN` está configurada
- Verifica que el token tiene permisos correctos
- Verifica que los registros están publicados en Strapi

### Error: "Network error" o "CORS error"
- Verifica que `NEXT_PUBLIC_STRAPI_URL` es correcta
- Verifica que Strapi tiene CORS configurado para tu dominio de Vercel
- Verifica que el backend Strapi está accesible desde internet

### Las variables no se aplican
- Después de agregar variables, **debes hacer un nuevo deploy**
- Las variables se aplican solo en builds nuevos
- Ve a Deployments → Redeploy

---

## Ejemplo de Configuración Completa

En Vercel Dashboard → Settings → Environment Variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_STRAPI_URL` | `https://api.laviellaglamping.com` | Production, Preview, Development |
| `NEXT_PUBLIC_STRAPI_API_TOKEN` | `abc123...` (oculto) | Production, Preview, Development |

---

## Seguridad

⚠️ **IMPORTANTE:**

1. **NUNCA** commitees tokens en el código
2. **SIEMPRE** marca tokens como "Sensitive" en Vercel
3. Usa tokens diferentes para Production y Staging
4. Rota tokens periódicamente
5. Usa tokens con permisos mínimos necesarios (Read-only si es posible)

---

## Referencias

- Variables de entorno en Vercel: https://vercel.com/docs/concepts/projects/environment-variables
- Strapi API Tokens: https://docs.strapi.io/dev-docs/backend-customization/users-permissions#api-tokens
- Next.js Environment Variables: https://nextjs.org/docs/basic-features/environment-variables
