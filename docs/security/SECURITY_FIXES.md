# Guía de Corrección de Vulnerabilidades de Seguridad

Este documento contiene código listo para implementar que corrige las vulnerabilidades críticas identificadas en el análisis OWASP ASVS.

---

## 1. Sanitización de HTML (CRÍTICO)

### Instalación
```bash
npm install dompurify
npm install @types/dompurify --save-dev
```

### Crear utilidad de sanitización
```typescript
// lib/utils/sanitize.ts
import DOMPurify from 'dompurify';

/**
 * Sanitiza contenido HTML para prevenir XSS
 */
export function sanitizeHtml(html: string, options?: {
  allowedTags?: string[];
  allowedAttributes?: { [key: string]: string[] };
}): string {
  if (typeof window === 'undefined') {
    // Server-side: usar una alternativa o simplemente retornar texto plano
    return html.replace(/<[^>]*>/g, '');
  }

  const defaultOptions = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'b', 'i',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'blockquote', 'code', 'pre', 'hr'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  };

  const config = {
    ...defaultOptions,
    ...(options?.allowedTags && { ALLOWED_TAGS: options.allowedTags }),
    ...(options?.allowedAttributes && { 
      ALLOWED_ATTR: Object.keys(options.allowedAttributes).flatMap(
        tag => options.allowedAttributes![tag].map(attr => `${tag}:${attr}`)
      )
    }),
  };

  return DOMPurify.sanitize(html, config);
}
```

### Usar en componentes
```typescript
// app/[slug]/page.tsx
import { sanitizeHtml } from '@/lib/utils/sanitize';

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);
  
  if (!page) {
    notFound();
  }

  const sanitizedContent = sanitizeHtml(page.content);

  return (
    <div className="prose prose-lg max-w-none">
      <div
        className="text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </div>
  );
}
```

```typescript
// app/domo/[slug]/page.tsx
import { sanitizeHtml } from '@/lib/utils/sanitize';

// En el componente
const sanitizedDescription = sanitizeHtml(normalizedDomo.description || "");
<div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
```

---

## 2. Security Headers (CRÍTICO)

### Crear middleware
```typescript
// middleware.ts (en la raíz del proyecto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Obtener Strapi URL de manera segura
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || '';

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Reducir si es posible
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${strapiUrl}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  response.headers.set('Content-Security-Policy', csp);
  
  // HSTS (solo en HTTPS)
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 3. Validación de Entrada Robusta

### Crear utilidades de validación
```typescript
// lib/utils/validation.ts

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Valida un email
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'El email es requerido' };
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'El formato del email no es válido' };
  }
  
  if (email.length > 254) {
    return { valid: false, error: 'El email es demasiado largo' };
  }
  
  return { valid: true };
}

/**
 * Valida un nombre
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'El nombre es requerido' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }
  
  if (name.length > 50) {
    return { valid: false, error: 'El nombre no puede exceder 50 caracteres' };
  }
  
  // Solo letras, espacios, guiones, apóstrofes y caracteres acentuados
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(name)) {
    return { valid: false, error: 'El nombre contiene caracteres inválidos' };
  }
  
  return { valid: true };
}

/**
 * Valida un teléfono
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, error: 'El teléfono es requerido' };
  }
  
  // Remover espacios, guiones, paréntesis
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Formato: opcional +, seguido de 7-15 dígitos
  if (!/^\+?[1-9]\d{6,14}$/.test(cleaned)) {
    return { valid: false, error: 'El formato del teléfono no es válido (ej: +34123456789)' };
  }
  
  return { valid: true };
}

/**
 * Valida texto libre (descripciones, solicitudes especiales)
 */
export function validateFreeText(text: string, maxLength: number = 1000): { valid: boolean; error?: string } {
  if (text.length > maxLength) {
    return { valid: false, error: `El texto no puede exceder ${maxLength} caracteres` };
  }
  
  // Prevenir caracteres de control (excepto tab, newline, carriage return)
  if (/[\x00-\x08\x0B-\x0C\x0E-\x1F]/.test(text)) {
    return { valid: false, error: 'El texto contiene caracteres inválidos' };
  }
  
  return { valid: true };
}

/**
 * Valida datos de reserva
 */
export function validateReservationForm(data: {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
}): ValidationResult {
  const errors: string[] = [];
  
  const nameValidation = validateName(data.guestName);
  if (!nameValidation.valid) {
    errors.push(nameValidation.error!);
  }
  
  const emailValidation = validateEmail(data.guestEmail);
  if (!emailValidation.valid) {
    errors.push(emailValidation.error!);
  }
  
  const phoneValidation = validatePhone(data.guestPhone);
  if (!phoneValidation.valid) {
    errors.push(phoneValidation.error!);
  }
  
  if (data.specialRequests) {
    const textValidation = validateFreeText(data.specialRequests, 1000);
    if (!textValidation.valid) {
      errors.push(textValidation.error!);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### Usar en formulario de reservas
```typescript
// app/reservas/page.tsx
import { validateReservationForm } from '@/lib/utils/validation';

const handleSubmitReservation = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ... validaciones existentes ...
  
  // Validar datos del formulario
  const validation = validateReservationForm({
    guestName: formData.guestName,
    guestEmail: formData.guestEmail,
    guestPhone: formData.guestPhone,
    specialRequests: formData.specialRequests,
  });
  
  if (!validation.valid) {
    setSubmitError(validation.errors.join('. '));
    return;
  }
  
  // ... resto del código ...
};
```

---

## 4. Validación de Contraseñas

```typescript
// lib/utils/password.ts

export interface PasswordValidation {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

/**
 * Valida fortaleza de contraseña
 */
export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (password.length < 12) {
    strength = 'weak';
  } else if (password.length < 16) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }
  
  // Mejorar fuerza si tiene múltiples tipos de caracteres
  const hasMultipleTypes = 
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[a-z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 1 : 0);
  
  if (hasMultipleTypes >= 3 && password.length >= 10) {
    if (strength === 'weak') strength = 'medium';
    if (password.length >= 14) strength = 'strong';
  }
  
  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
}
```

### Usar en registro
```typescript
// En componente de registro
import { validatePassword } from '@/lib/utils/password';

const handleRegister = async (formData: RegisterData) => {
  const passwordValidation = validatePassword(formData.password);
  
  if (!passwordValidation.valid) {
    setErrors(passwordValidation.errors);
    return;
  }
  
  // ... proceder con registro ...
};
```

---

## 5. Validación de Endpoints (Prevenir SSRF)

```typescript
// lib/utils/endpoint-validation.ts

/**
 * Valida que un endpoint sea seguro (previene SSRF)
 */
export function validateEndpoint(endpoint: string): { valid: boolean; error?: string } {
  // Debe empezar con /
  if (!endpoint.startsWith('/')) {
    return { valid: false, error: 'Endpoint must start with /' };
  }
  
  // No debe contener caracteres peligrosos
  if (/[<>"']/.test(endpoint)) {
    return { valid: false, error: 'Endpoint contains invalid characters' };
  }
  
  // No debe contener protocolos (prevenir SSRF)
  if (/^https?:\/\//i.test(endpoint)) {
    return { valid: false, error: 'Endpoint must be relative' };
  }
  
  // No debe contener caracteres de control
  if (/[\x00-\x1F]/.test(endpoint)) {
    return { valid: false, error: 'Endpoint contains control characters' };
  }
  
  // Limitar longitud
  if (endpoint.length > 2048) {
    return { valid: false, error: 'Endpoint is too long' };
  }
  
  return { valid: true };
}
```

### Usar en fetchAPI
```typescript
// lib/strapi.ts
import { validateEndpoint } from './utils/endpoint-validation';

export async function fetchAPI<T>(
  endpoint: string, 
  options: StrapiFetchOptions = {}
): Promise<StrapiResponse<T>> {
  // Validar endpoint
  const endpointValidation = validateEndpoint(endpoint);
  if (!endpointValidation.valid) {
    throw new Error(`Invalid endpoint: ${endpointValidation.error}`);
  }
  
  const url = `${STRAPI_URL}/api${endpoint}`;
  // ... resto del código ...
}
```

---

## 6. Manejo Seguro de Errores

```typescript
// lib/utils/error-handling.ts

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Genera mensajes de error seguros para producción
 */
export function getSafeErrorMessage(error: Error | unknown, context?: string): string {
  if (isProduction) {
    // En producción: mensajes genéricos
    if (error instanceof Error) {
      // Mapear tipos específicos de error
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        return 'No tienes permisos para realizar esta acción';
      }
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return 'No autenticado. Por favor, inicia sesión';
      }
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        return 'El recurso solicitado no fue encontrado';
      }
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        return 'Error de conexión. Por favor, verifica tu conexión a internet';
      }
    }
    
    // Mensaje genérico por defecto
    return context 
      ? `Error al ${context}. Por favor, intenta de nuevo más tarde.`
      : 'Ocurrió un error. Por favor, intenta de nuevo.';
  } else {
    // En desarrollo: información detallada
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
```

### Usar en fetchAPI
```typescript
// lib/strapi.ts
import { getSafeErrorMessage } from './utils/error-handling';

export async function fetchAPI<T>(
  endpoint: string, 
  options: StrapiFetchOptions = {}
): Promise<StrapiResponse<T>> {
  // ... código existente ...
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: headers as HeadersInit,
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      const error = new Error(`API Error (${response.status}): ${errorText}`);
      throw new Error(getSafeErrorMessage(error, 'procesar la solicitud'));
    }

    return response.json();
  } catch (error) {
    throw new Error(getSafeErrorMessage(error, 'realizar la solicitud'));
  }
}
```

---

## 7. Rate Limiting Básico en Cliente

```typescript
// lib/utils/rate-limit.ts

const RATE_LIMIT_KEY = 'api_rate_limit';
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 10;

interface RateLimitData {
  count: number;
  resetTime: number;
}

/**
 * Verifica si se puede hacer una request (rate limiting básico en cliente)
 */
export function checkRateLimit(): { allowed: boolean; retryAfter?: number } {
  if (typeof window === 'undefined') {
    return { allowed: true }; // Server-side: confiar en backend
  }
  
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();
    
    if (!stored) {
      // Primera request
      const data: RateLimitData = {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW,
      };
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
      return { allowed: true };
    }
    
    const data: RateLimitData = JSON.parse(stored);
    
    // Si pasó la ventana, resetear
    if (now > data.resetTime) {
      const newData: RateLimitData = {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW,
      };
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newData));
      return { allowed: true };
    }
    
    // Si excedió el límite
    if (data.count >= MAX_REQUESTS) {
      return {
        allowed: false,
        retryAfter: Math.ceil((data.resetTime - now) / 1000),
      };
    }
    
    // Incrementar contador
    data.count += 1;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    return { allowed: true };
  } catch {
    // Si hay error, permitir (mejor UX que bloquear)
    return { allowed: true };
  }
}
```

### Usar en fetchAPI
```typescript
// lib/strapi.ts
import { checkRateLimit } from './utils/rate-limit';

export async function fetchAPI<T>(
  endpoint: string, 
  options: StrapiFetchOptions = {}
): Promise<StrapiResponse<T>> {
  // Solo en cliente
  if (typeof window !== 'undefined') {
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      throw new Error(
        `Demasiadas solicitudes. Por favor, espera ${rateLimit.retryAfter} segundos.`
      );
    }
  }
  
  // ... resto del código ...
}
```

---

## 8. Almacenamiento Seguro de Tokens (Alternativa a localStorage)

```typescript
// lib/auth-secure.ts
// NOTA: La solución ideal es usar httpOnly cookies en el backend
// Esta es una alternativa mejor que localStorage si no puedes usar cookies

/**
 * Almacena JWT de forma más segura usando sessionStorage
 * (Mejor que localStorage pero no tan seguro como httpOnly cookies)
 */
export function storeTokenSecure(jwt: string, user: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Usar sessionStorage en lugar de localStorage
    // Se borra cuando se cierra la pestaña/navegador
    sessionStorage.setItem('jwt', jwt);
    sessionStorage.setItem('user', JSON.stringify(user));
    
    // Opcional: Agregar timestamp para expiración
    sessionStorage.setItem('token_expires', String(Date.now() + 24 * 60 * 60 * 1000));
  } catch (error) {
    console.error('Error storing token:', error);
  }
}

/**
 * Obtiene JWT de forma segura
 */
export function getTokenSecure(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Verificar expiración
    const expires = sessionStorage.getItem('token_expires');
    if (expires && Date.now() > parseInt(expires)) {
      clearTokenSecure();
      return null;
    }
    
    return sessionStorage.getItem('jwt');
  } catch {
    return null;
  }
}

/**
 * Limpia tokens
 */
export function clearTokenSecure(): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token_expires');
  } catch {
    // Ignorar errores
  }
}
```

---

## Checklist de Implementación

- [ ] Instalar DOMPurify y crear utilidad de sanitización
- [ ] Actualizar componentes que usan `dangerouslySetInnerHTML`
- [ ] Crear `middleware.ts` con security headers
- [ ] Crear utilidades de validación de entrada
- [ ] Actualizar formularios con validación
- [ ] Crear validación de contraseñas
- [ ] Crear validación de endpoints
- [ ] Actualizar manejo de errores
- [ ] Implementar rate limiting básico
- [ ] Considerar migrar de localStorage a sessionStorage o httpOnly cookies

---

## Notas Importantes

1. **Security Headers**: Ajusta CSP según las dependencias de tu proyecto. Puede que necesites permitir más dominios para scripts externos.

2. **Rate Limiting**: El rate limiting en el cliente es solo una mitigación. El rate limiting real debe estar en el backend (Strapi).

3. **Tokens**: La solución ideal para almacenar JWT es usar httpOnly cookies en el backend. Esto requiere cambios en el backend de Strapi.

4. **Testing**: Después de implementar estas correcciones, realiza pruebas exhaustivas para asegurar que todo funciona correctamente.

5. **Actualización Gradual**: Implementa las correcciones una por una y prueba cada una antes de continuar.
