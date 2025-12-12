# Análisis de Seguridad OWASP ASVS

**Fecha:** 2024  
**Versión Analizada:** Current  
**Estándar:** OWASP Application Security Verification Standard (ASVS) v4.x

---

## Resumen Ejecutivo

Este documento identifica vulnerabilidades de seguridad y recomendaciones basadas en el estándar OWASP ASVS. Se encontraron **12 vulnerabilidades críticas y altas** que requieren atención inmediata.

### Niveles de Severidad
- 🔴 **CRÍTICA**: Requiere acción inmediata
- 🟠 **ALTA**: Debe corregirse en corto plazo
- 🟡 **MEDIA**: Debe planificarse su corrección
- 🟢 **BAJA**: Mejora recomendada

---

## 1. Autenticación (ASVS 2.0) - V2: Authentication

### 🔴 CRÍTICA: Almacenamiento de JWT en localStorage (V2.1.1, V2.1.2)

**Ubicación:** `lib/auth.ts:56-57, 84-85`

**Problema:**
Los tokens JWT se almacenan en `localStorage`, lo que los expone a ataques XSS (Cross-Site Scripting). Si un atacante logra ejecutar JavaScript malicioso, puede robar los tokens.

```typescript
// ❌ VULNERABLE
localStorage.setItem('jwt', data.jwt);
localStorage.setItem('user', JSON.stringify(data.user));
```

**Riesgo:**
- Robo de credenciales mediante XSS
- Ataques de session hijacking
- Acceso no autorizado a cuentas de usuario

**Recomendación:**
```typescript
// ✅ SEGURO: Usar httpOnly cookies (requiere servidor)
// Alternativa: Usar sessionStorage (menos seguro pero mejor que localStorage)
sessionStorage.setItem('jwt', data.jwt);
// O mejor: Implementar httpOnly cookies en el backend
```

**ASVS Reference:** V2.1.1, V2.1.2, V2.1.6

---

### 🟠 ALTA: Falta de Validación de Password (V2.1.7, V2.1.8)

**Ubicación:** `lib/auth.ts:29-33, 66-72`

**Problema:**
No hay validación de fortaleza de contraseña en el frontend antes de enviar al servidor.

```typescript
// ❌ Sin validación
export interface RegisterData {
  username: string;
  email: string;
  password: string; // Sin restricciones
}
```

**Recomendación:**
```typescript
// ✅ Agregar validación
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos una mayúscula' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos una minúscula' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos un número' };
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos un carácter especial' };
  }
  return { valid: true };
}
```

**ASVS Reference:** V2.1.7, V2.1.8

---

### 🟠 ALTA: Falta de Rate Limiting en Frontend (V2.1.9)

**Ubicación:** `lib/auth.ts:38-61, 66-89`

**Problema:**
No hay protección contra fuerza bruta en intentos de login/registro.

**Recomendación:**
```typescript
// ✅ Implementar rate limiting
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

function checkRateLimit(): boolean {
  const attempts = parseInt(localStorage.getItem('login_attempts') || '0');
  const lastAttempt = parseInt(localStorage.getItem('last_attempt') || '0');
  
  if (Date.now() - lastAttempt > LOCKOUT_TIME) {
    localStorage.setItem('login_attempts', '0');
    return true;
  }
  
  return attempts < MAX_ATTEMPTS;
}

function recordFailedAttempt(): void {
  const attempts = parseInt(localStorage.getItem('login_attempts') || '0');
  localStorage.setItem('login_attempts', String(attempts + 1));
  localStorage.setItem('last_attempt', String(Date.now()));
}
```

**Nota:** El rate limiting real debe implementarse en el backend. Esto es solo mitigación en el frontend.

**ASVS Reference:** V2.1.9, V2.2.1

---

### 🟡 MEDIA: Falta de Validación de Email (V2.1.5)

**Ubicación:** `lib/auth.ts`, `app/reservas/page.tsx:668-675`

**Problema:**
Solo se usa `type="email"` en HTML, pero no hay validación robusta en JavaScript.

**Recomendación:**
```typescript
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}
```

**ASVS Reference:** V2.1.5

---

## 2. Validación de Entrada (ASVS 3.0) - V3: Input Validation

### 🔴 CRÍTICA: Uso de dangerouslySetInnerHTML sin Sanitización (V3.5.1, V3.5.2)

**Ubicación:** 
- `app/[slug]/page.tsx:83`
- `app/domo/[slug]/page.tsx:242`

**Problema:**
El contenido HTML de Strapi se renderiza directamente sin sanitización, permitiendo XSS si el backend está comprometido.

```typescript
// ❌ VULNERABLE a XSS
<div dangerouslySetInnerHTML={{ __html: page.content }} />
```

**Riesgo:**
- Ejecución de JavaScript malicioso
- Robo de cookies/tokens
- Defacement del sitio

**Recomendación:**
```bash
npm install dompurify
npm install @types/dompurify --save-dev
```

```typescript
// ✅ SANITIZADO
import DOMPurify from 'dompurify';

// En componente Client
const sanitizedContent = DOMPurify.sanitize(page.content, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3'],
  ALLOWED_ATTR: ['href', 'title'],
  ALLOW_DATA_ATTR: false,
});

<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
```

**ASVS Reference:** V3.5.1, V3.5.2, V5.3.1

---

### 🟠 ALTA: Falta de Validación de Entrada en Formularios (V3.1.1, V3.1.2)

**Ubicación:** `app/reservas/page.tsx:217-229`

**Problema:**
Los datos del formulario se envían al backend con validación mínima (solo `required` en HTML).

```typescript
// ❌ Validación insuficiente
guestName: formData.guestName.trim(),
guestEmail: formData.guestEmail.trim().toLowerCase(),
guestPhone: formData.guestPhone.trim(),
```

**Recomendación:**
```typescript
// ✅ Validación robusta
function validateReservationForm(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Nombre: solo letras, espacios, y algunos caracteres especiales
  if (!/^[a-zA-ZÀ-ÿ\s'-]{2,50}$/.test(data.guestName)) {
    errors.push('El nombre debe contener entre 2 y 50 caracteres válidos');
  }
  
  // Email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.guestEmail)) {
    errors.push('Email inválido');
  }
  
  // Teléfono: formato internacional
  if (!/^\+?[1-9]\d{1,14}$/.test(data.guestPhone.replace(/\s/g, ''))) {
    errors.push('Teléfono inválido (formato: +34123456789)');
  }
  
  // Solicitudes especiales: limitar longitud y caracteres peligrosos
  if (data.specialRequests && data.specialRequests.length > 1000) {
    errors.push('Las solicitudes especiales no pueden exceder 1000 caracteres');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

**ASVS Reference:** V3.1.1, V3.1.2, V3.1.3

---

### 🟠 ALTA: Falta de Validación de URL/Endpoint (V3.4.1)

**Ubicación:** `lib/strapi.ts:79, 185`

**Problema:**
Los endpoints se construyen con concatenación de strings sin validación, permitiendo potenciales SSRF.

```typescript
// ❌ Potencial SSRF
const url = `${STRAPI_URL}/api${endpoint}`;
```

**Recomendación:**
```typescript
// ✅ Validación de endpoint
function validateEndpoint(endpoint: string): boolean {
  // Solo permitir rutas relativas que empiecen con /
  if (!endpoint.startsWith('/')) {
    return false;
  }
  // Prevenir caracteres peligrosos
  if (/[<>"']/.test(endpoint)) {
    return false;
  }
  // Prevenir protocolos peligrosos
  if (/^https?:\/\//i.test(endpoint)) {
    return false;
  }
  return true;
}

export async function fetchAPI<T>(endpoint: string, options: StrapiFetchOptions = {}): Promise<StrapiResponse<T>> {
  if (!validateEndpoint(endpoint)) {
    throw new Error('Invalid endpoint');
  }
  const url = `${STRAPI_URL}/api${endpoint}`;
  // ...
}
```

**ASVS Reference:** V3.4.1, V5.1.1

---

## 3. Manejo de Errores y Logging (ASVS 10.0) - V10: Error Handling & Logging

### 🟠 ALTA: Información Sensible en Mensajes de Error (V10.1.1, V10.1.2)

**Ubicación:** `lib/strapi.ts:137-152`, `lib/auth.ts:47-49`

**Problema:**
Los mensajes de error exponen información detallada que puede ayudar a atacantes.

```typescript
// ❌ Expone información interna
throw new Error(
  `Strapi API Error (403 Forbidden): ${errorText || 'Access denied'}\n` +
  `Debug: ${hasToken ? 'Token was sent' : 'No token configured'}\n` +
  `Please check: 1) API Token in .env.local, 2) Permissions in Strapi Admin, 3) Records are published`
);
```

**Recomendación:**
```typescript
// ✅ Mensajes genéricos en producción
const isProduction = process.env.NODE_ENV === 'production';

if (!response.ok) {
  if (isProduction) {
    // En producción: mensaje genérico
    if (response.status === 403) {
      throw new Error('No tienes permisos para realizar esta acción');
    }
    if (response.status === 401) {
      throw new Error('No autenticado. Por favor, inicia sesión');
    }
    throw new Error('Error al procesar la solicitud. Por favor, intenta de nuevo');
  } else {
    // En desarrollo: información detallada
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }
}
```

**ASVS Reference:** V10.1.1, V10.1.2

---

### 🟡 MEDIA: Debug Logging en Código de Producción (V10.2.1)

**Ubicación:** `lib/strapi.ts:112-127`

**Problema:**
Aunque hay un check de `NODE_ENV`, el código de debug sigue presente en producción.

**Recomendación:**
```typescript
// ✅ Remover completamente en producción o usar logger adecuado
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Usar un logger con niveles
  logger.debug('[Strapi API]', {
    url,
    hasToken: !!headers['Authorization'],
    // NO incluir el token real
  });
}
```

**ASVS Reference:** V10.2.1

---

## 4. Criptografía (ASVS 7.0) - V7: Cryptography

### 🟠 ALTA: Falta de Validación de Certificado SSL/TLS (V7.1.1)

**Ubicación:** `lib/strapi.ts`, `lib/auth.ts`

**Problema:**
No hay validación explícita de certificados SSL. Next.js usa el sistema por defecto, pero debería verificarse.

**Recomendación:**
- Asegurarse de que `STRAPI_URL` siempre use HTTPS en producción
- Implementar validación adicional si es necesario
- Usar variables de entorno diferentes para dev/prod

```typescript
// ✅ Validar URL en producción
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  if (!STRAPI_URL.startsWith('https://')) {
    throw new Error('STRAPI_URL must use HTTPS in production');
  }
}
```

**ASVS Reference:** V7.1.1

---

### 🟡 MEDIA: Tokens Expuestos en Client-Side (V7.2.1)

**Ubicación:** `lib/strapi.ts:43-46`

**Problema:**
El API Token está disponible en el cliente mediante `NEXT_PUBLIC_STRAPI_API_TOKEN`, exponiéndolo en el bundle de JavaScript.

**Riesgo:**
- El token puede ser extraído del código fuente
- Ataques de abuso de API si el token tiene permisos amplios

**Recomendación:**
- Usar tokens con permisos mínimos (read-only)
- Implementar rate limiting en Strapi
- Considerar usar API routes de Next.js como proxy para ocultar tokens

**ASVS Reference:** V7.2.1

---

## 5. Configuración de Seguridad (ASVS 14.0) - V14: Security Configuration

### 🔴 CRÍTICA: Falta de Security Headers (V14.4.1, V14.4.2)

**Ubicación:** `next.config.mjs`, `app/layout.tsx`

**Problema:**
No se configuran headers de seguridad como CSP, X-Frame-Options, HSTS, etc.

**Recomendación:**
Crear `middleware.ts` en la raíz:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Reducir unsafe-* si es posible
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' " + process.env.NEXT_PUBLIC_STRAPI_URL,
    "frame-ancestors 'none'",
  ].join('; ');

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // CSP
  response.headers.set('Content-Security-Policy', csp);
  
  // HSTS (solo en HTTPS)
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**ASVS Reference:** V14.4.1, V14.4.2, V14.4.3

---

### 🟡 MEDIA: Configuración de Build Sin Validaciones (V14.1.1)

**Ubicación:** `next.config.mjs:3-8`

**Problema:**
Se ignoran errores de ESLint y TypeScript durante el build.

```javascript
// ❌ Ignora errores
eslint: {
  ignoreDuringBuilds: true,
},
typescript: {
  ignoreBuildErrors: true,
},
```

**Recomendación:**
- Habilitar validaciones en producción
- Usar solo en desarrollo si es absolutamente necesario
- Corregir los errores en lugar de ignorarlos

**ASVS Reference:** V14.1.1

---

## 6. API Security (ASVS 5.0) - V5: Access Control

### 🟠 ALTA: Falta de Autorización en Operaciones CRUD (V5.1.2)

**Ubicación:** `lib/strapi.ts:253-261, 328-336, 342-351`

**Problema:**
Las operaciones de creación/actualización/eliminación de reservas pueden no estar verificando correctamente la autorización.

```typescript
// ❌ No verifica si el usuario puede modificar esta reserva
export async function updateReservation(id: number, updateData: Partial<Reservation>): Promise<Reservation> {
  const data = await fetchAPI<StrapiData<Reservation>>(`/reservations/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ data: updateData }),
  });
  return normalizeStrapiData<Reservation>(data.data);
}
```

**Recomendación:**
- Verificar en el backend que el usuario solo pueda modificar sus propias reservas
- Implementar verificación de ownership antes de permitir updates/deletes

**ASVS Reference:** V5.1.2, V5.2.1

---

### 🟡 MEDIA: Falta de Rate Limiting en Cliente (V5.3.1)

**Ubicación:** `app/reservas/page.tsx:188-250`

**Problema:**
No hay protección contra envío masivo de reservas (spam/DoS).

**Recomendación:**
```typescript
// ✅ Rate limiting básico en cliente
const RESERVATION_COOLDOWN = 60 * 1000; // 1 minuto

function checkReservationCooldown(): boolean {
  const lastReservation = parseInt(localStorage.getItem('last_reservation') || '0');
  return Date.now() - lastReservation > RESERVATION_COOLDOWN;
}

const handleSubmitReservation = async (e: React.FormEvent) => {
  if (!checkReservationCooldown()) {
    setSubmitError('Por favor, espera un momento antes de crear otra reserva');
    return;
  }
  // ... resto del código
  localStorage.setItem('last_reservation', String(Date.now()));
};
```

**Nota:** El rate limiting real debe estar en el backend.

**ASVS Reference:** V5.3.1

---

## 7. Datos Sensibles (ASVS 3.0) - V3: Input Validation

### 🟡 MEDIA: Datos Personales sin Encriptación en Tránsito (V3.1.4)

**Ubicación:** `app/reservas/page.tsx:217-229`

**Problema:**
Datos personales (nombre, email, teléfono) se envían sin verificación explícita de HTTPS.

**Recomendación:**
- Asegurar que todas las comunicaciones usen HTTPS
- Validar que `STRAPI_URL` use HTTPS en producción
- Considerar encriptación adicional para datos muy sensibles

**ASVS Reference:** V3.1.4, V7.1.1

---

## Checklist de Corrección Priorizada

### Prioridad 1 - Crítico (Corregir inmediatamente)
- [ ] ✅ Reemplazar `localStorage` por `httpOnly` cookies o `sessionStorage` para JWT
- [ ] ✅ Sanitizar HTML con DOMPurify antes de usar `dangerouslySetInnerHTML`
- [ ] ✅ Implementar Security Headers (CSP, X-Frame-Options, HSTS, etc.)

### Prioridad 2 - Alto (Corregir en 1-2 semanas)
- [ ] ✅ Agregar validación de contraseñas
- [ ] ✅ Implementar rate limiting (backend y frontend)
- [ ] ✅ Validar todos los inputs de formularios
- [ ] ✅ Sanitizar mensajes de error en producción
- [ ] ✅ Validar endpoints para prevenir SSRF
- [ ] ✅ Verificar autorización en operaciones CRUD

### Prioridad 3 - Medio (Planificar corrección)
- [ ] ✅ Validar emails robustamente
- [ ] ✅ Remover debug logging en producción
- [ ] ✅ Validar certificados SSL/TLS
- [ ] ✅ Revisar exposición de tokens en client-side
- [ ] ✅ Habilitar validaciones de build (ESLint/TypeScript)
- [ ] ✅ Implementar rate limiting para reservas

### Prioridad 4 - Bajo (Mejoras)
- [ ] ✅ Encriptación adicional de datos sensibles
- [ ] ✅ Implementar logging estructurado
- [ ] ✅ Auditoría de seguridad regular

---

## Recomendaciones Adicionales

### 1. Implementar Content Security Policy (CSP) Estricta
```typescript
// CSP más estricta (requiere ajustes según dependencias)
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'", // Reducir si es posible
  "img-src 'self' data: https:",
  "connect-src 'self' " + process.env.NEXT_PUBLIC_STRAPI_URL,
].join('; ');
```

### 2. Implementar Subresource Integrity (SRI)
Para scripts externos (si los hay), usar SRI para prevenir tampering.

### 3. Implementar CORS Correctamente en Strapi
Asegurar que Strapi tenga CORS configurado correctamente para solo permitir el dominio del frontend.

### 4. Auditoría de Dependencias
```bash
npm audit
npm audit fix
```

### 5. Implementar Honeypots en Formularios
Agregar campos ocultos para detectar bots.

### 6. Implementar CSRF Protection
Aunque Next.js tiene protección CSRF por defecto, verificar que funcione correctamente.

---

## Recursos

- [OWASP ASVS v4.0](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)

---

## Notas Finales

Este análisis se basa en el código disponible. Se recomienda:
1. Realizar pruebas de penetración profesionales
2. Implementar un programa de bug bounty
3. Revisar regularmente las dependencias
4. Mantener el código actualizado
5. Realizar auditorías de seguridad periódicas

**Última actualización:** 2024
