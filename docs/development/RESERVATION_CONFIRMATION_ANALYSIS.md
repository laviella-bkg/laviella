# Análisis Detallado: Flujo de Confirmación de Reservas

Análisis técnico profundo del flujo actual de confirmación de reservas, con código específico y propuestas de mejora implementables.

---

## 🔍 Flujo Actual - Análisis Paso a Paso

### Paso 1: Selección de Fechas y Domo

**Ubicación:** `app/reservas/page.tsx:39-116`

El usuario selecciona fechas en el calendario y un domo de la lista. Esto dispara un `useEffect` que verifica disponibilidad automáticamente.

```typescript
// useEffect que se ejecuta cuando cambian las fechas o el domo seleccionado
useEffect(() => {
  const verifyAvailability = async () => {
    if (!selectedDomo || !selectedDates || !selectedDates.from || !selectedDates.to) {
      return;
    }
    
    const checkIn = selectedDates.from.toISOString().split('T')[0];
    const checkOut = selectedDates.to.toISOString().split('T')[0];
    
    const available = await checkAvailability(selectedDomo.id, checkIn, checkOut);
    setIsAvailable(available);
    setAvailabilityChecked(true);
  };
  
  verifyAvailability();
}, [selectedDates, selectedDomo]);
```

**Observaciones:**
- ✅ La verificación es automática y reactiva
- ⚠️ No hay cache o debounce (se ejecuta en cada cambio)
- ⚠️ El resultado puede cambiar entre la verificación y el envío del formulario

---

### Paso 2: Verificación de Disponibilidad

**Ubicación:** `lib/strapi.ts:357-377`

```typescript
export async function checkAvailability(
  domoId: number,
  checkIn: string,
  checkOut: string
): Promise<boolean> {
  const startDate = new Date(checkIn).toISOString().split('T')[0];
  const endDate = new Date(checkOut).toISOString().split('T')[0];
  
  try {
    const data = await fetchAPI<StrapiData<Reservation>[]>(
      `/reservations?filters[domo][id][$eq]=${domoId}
      &filters[checkIn][$lte]=${endDate}
      &filters[checkOut][$gte]=${startDate}
      &filters[reservationStatus][$in][0]=confirmed
      &filters[reservationStatus][$in][1]=draft`
    );
    
    return data.data.length === 0;
  } catch (error) {
    console.error('Error checking availability:', error);
    return false; // On error, assume unavailable for safety
  }
}
```

**Análisis de la Query:**
- Busca reservas que se **solapen** con el rango solicitado
- Considera tanto reservas `confirmed` como `draft`
- La lógica de solapamiento es correcta:
  - `checkIn <= endDate`: La reserva existente empieza antes o cuando termina la nueva
  - `checkOut >= startDate`: La reserva existente termina después o cuando empieza la nueva

**Problemas Identificados:**

1. **Race Condition Crítica:**
   ```
   Tiempo: 0ms  - Usuario A: checkAvailability() → disponible
   Tiempo: 50ms - Usuario B: checkAvailability() → disponible (mismo resultado)
   Tiempo: 100ms - Usuario A: createReservation() → éxito
   Tiempo: 150ms - Usuario B: createReservation() → éxito (¡CONFLICTO!)
   ```

2. **No hay verificación de reservas expiradas:**
   - Las reservas `draft` antiguas (ej: creadas hace semanas) siguen bloqueando disponibilidad
   - No hay expiración automática

3. **No hay timestamp en la verificación:**
   - No se puede determinar cuándo fue la última verificación
   - No hay forma de invalidar resultados cacheados

---

### Paso 3: Completar Formulario

**Ubicación:** `app/reservas/page.tsx:63-68, 252-257`

```typescript
const [formData, setFormData] = useState({
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  specialRequests: "",
});

const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
};
```

**Validaciones Actuales (en el submit):**
- ✅ Fechas seleccionadas
- ✅ Disponibilidad verificada
- ✅ Capacidad de huéspedes

**Faltantes:**
- ❌ Validación de email (solo `type="email"` en HTML)
- ❌ Validación de teléfono
- ❌ Sanitización de inputs
- ❌ Validación en tiempo real (solo al submit)

---

### Paso 4: Envío del Formulario

**Ubicación:** `app/reservas/page.tsx:188-250`

```typescript
const handleSubmitReservation = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validación 1: Fechas y domo seleccionados
  if (!selectedDomo || !selectedDates || !selectedDates.from || !selectedDates.to) {
    setSubmitError("Por favor, selecciona un domo y las fechas");
    return;
  }
  
  // Validación 2: Disponibilidad (usa resultado de useEffect anterior)
  if (!isAvailable && availabilityChecked) {
    setSubmitError("El domo no está disponible en las fechas seleccionadas");
    return;
  }
  
  // ⚠️ PROBLEMA: No verifica disponibilidad nuevamente aquí
  
  try {
    setIsSubmitting(true);
    
    const checkIn = selectedDates.from.toISOString().split('T')[0];
    const checkOut = selectedDates.to.toISOString().split('T')[0];
    
    // Validación 3: Capacidad
    if (guests > selectedDomo.maxCapacity) {
      setSubmitError(`El número de huéspedes no puede exceder la capacidad del domo`);
      return;
    }
    
    // Preparar datos
    const reservationData = {
      domo: selectedDomo.id,
      guestName: formData.guestName.trim(),
      guestEmail: formData.guestEmail.trim().toLowerCase(),
      guestPhone: formData.guestPhone.trim(),
      checkIn,
      checkOut,
      numberOfGuests: guests,
      totalPrice: parseFloat(finalPrice.toFixed(2)),
      specialRequests: formData.specialRequests.trim() || undefined,
      reservationStatus: "draft",      // ⚠️ Siempre draft
      paymentStatus: "pending",        // ⚠️ Siempre pending
    };
    
    // Crear reserva
    await createReservation(reservationData);
    
    // Mostrar éxito
    setSubmitSuccess(true);
    setShowBookingForm(false);
    
    // Reset después de 3 segundos
    setTimeout(() => {
      setSubmitSuccess(false);
      setFormData({ guestName: "", guestEmail: "", guestPhone: "", specialRequests: "" });
      setSelectedDates(undefined);
      setSelectedDomo(null);
    }, 3000);
    
  } catch (err) {
    console.error("Error creating reservation:", err);
    setSubmitError("Error al crear la reserva. Por favor, intenta de nuevo.");
  } finally {
    setIsSubmitting(false);
  }
};
```

**Problemas Críticos Identificados:**

1. **❌ No hay verificación final de disponibilidad:**
   - La disponibilidad se verificó en el `useEffect` (puede ser hace minutos)
   - No se vuelve a verificar justo antes de crear la reserva
   - **Riesgo de race condition alta**

2. **❌ Siempre crea como "draft":**
   - No hay lógica para crear como "confirmed"
   - Requiere intervención manual en Strapi

3. **❌ No hay manejo de errores específicos:**
   - Si Strapi rechaza por conflicto, solo muestra error genérico
   - No distingue entre error de red, conflicto, o validación

4. **❌ No hay retry logic:**
   - Si falla, el usuario debe rellenar todo de nuevo

---

### Paso 5: Creación en Backend

**Ubicación:** `lib/strapi.ts:253-262`

```typescript
export async function createReservation(
  reservationData: Partial<Reservation>
): Promise<Reservation> {
  const data = await fetchAPI<StrapiData<Reservation>>('/reservations', {
    method: 'POST',
    body: JSON.stringify({ data: reservationData }),
    useAuth: true, // Usa JWT si disponible, sino API Token
  });
  return normalizeStrapiData<Reservation>(data.data);
}
```

**Análisis:**
- ✅ Usa autenticación (JWT o API Token)
- ❌ No hay validación en el frontend antes de enviar
- ❌ No maneja errores específicos de Strapi (409 Conflict, 400 Validation, etc.)
- ❌ Strapi puede crear la reserva incluso si hay conflicto (depende de la configuración del backend)

**Qué pasa en Strapi:**
- Strapi recibe el POST
- Crea el registro con los datos proporcionados
- **No valida automáticamente disponibilidad** (a menos que haya un lifecycle hook custom)
- Retorna la reserva creada

---

### Paso 6: Post-Creación

**Ubicación:** `app/reservas/page.tsx:233-242`

Después de crear la reserva exitosamente:

```typescript
setSubmitSuccess(true);
setShowBookingForm(false);

// Reset después de 3 segundos
setTimeout(() => {
  setSubmitSuccess(false);
  setFormData({ ... });
  setSelectedDates(undefined);
  setSelectedDomo(null);
}, 3000);
```

**Problemas:**
- ❌ No muestra detalles de la reserva creada
- ❌ No guarda el ID de la reserva para referencia futura
- ❌ No redirige a una página de confirmación
- ❌ No envía email de confirmación
- ❌ No muestra número de reserva al usuario

---

## 🚨 Problemas Críticos - Análisis Técnico

### 1. Race Condition (Crítica)

**Escenario Real:**

```
Usuario A (10:00:00.000) - Verifica disponibilidad → ✅ Disponible
Usuario B (10:00:00.050) - Verifica disponibilidad → ✅ Disponible (mismo resultado)
Usuario A (10:00:01.000) - Crea reserva → ✅ Éxito (draft)
Usuario B (10:00:01.100) - Crea reserva → ✅ Éxito (draft) ← CONFLICTO!
```

**Resultado:** Dos reservas `draft` para las mismas fechas bloquean el domo.

**Solución Técnica Propuesta:**

```typescript
// Opción 1: Verificación final antes de crear (mitigación parcial)
export async function createReservationWithAvailabilityCheck(
  reservationData: Partial<Reservation>
): Promise<Reservation> {
  // Verificar disponibilidad JUSTO antes de crear
  const isAvailable = await checkAvailability(
    reservationData.domo as number,
    reservationData.checkIn!,
    reservationData.checkOut!
  );
  
  if (!isAvailable) {
    throw new Error('El domo ya no está disponible en estas fechas. Por favor, selecciona otras fechas.');
  }
  
  // Crear reserva (pero aún puede haber race condition aquí)
  return createReservation(reservationData);
}
```

**Mejor solución (requiere backend):**
- Implementar validación en Strapi con transacciones de DB
- Usar bloqueo optimista o pesimista
- Implementar unique constraint en DB (domo + checkIn + checkOut + status)

---

### 2. Falta de Verificación Final

**Problema Actual:**
```typescript
// En handleSubmitReservation:
if (!isAvailable && availabilityChecked) {
  // Rechaza si NO está disponible
  // Pero ¿qué pasa si availabilityChecked es false?
  // ¿Qué pasa si isAvailable cambió desde la última verificación?
}
```

**Solución:**

```typescript
const handleSubmitReservation = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ... validaciones iniciales ...
  
  try {
    setIsSubmitting(true);
    
    // ✅ VERIFICACIÓN FINAL justo antes de crear
    const finalAvailabilityCheck = await checkAvailability(
      selectedDomo.id,
      selectedDates.from.toISOString().split('T')[0],
      selectedDates.to.toISOString().split('T')[0]
    );
    
    if (!finalAvailabilityCheck) {
      setSubmitError("El domo ya no está disponible. Por favor, selecciona otras fechas.");
      setIsAvailable(false);
      setAvailabilityChecked(true);
      return;
    }
    
    // Crear reserva...
  } catch (err) {
    // ...
  }
};
```

---

### 3. Gestión de Reservas Draft

**Problema:**
Las reservas `draft` bloquean disponibilidad indefinidamente si no se procesan.

**Solución Propuesta (Frontend + Backend):**

```typescript
// En checkAvailability, ignorar drafts antiguos
export async function checkAvailability(
  domoId: number,
  checkIn: string,
  checkOut: string
): Promise<boolean> {
  const DRAFT_EXPIRATION_MINUTES = 15;
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() - DRAFT_EXPIRATION_MINUTES);
  
  const data = await fetchAPI<StrapiData<Reservation>[]>(
    `/reservations?filters[domo][id][$eq]=${domoId}
    &filters[checkIn][$lte]=${endDate}
    &filters[checkOut][$gte]=${startDate}
    &filters[reservationStatus][$in][0]=confirmed
    &filters[reservationStatus][$in][1]=draft
    &filters[createdAt][$gte]=${expirationTime.toISOString()}` // Solo drafts recientes
  );
  
  // Filtrar drafts expirados manualmente (por si Strapi no soporta el filtro)
  const validReservations = data.data.filter(reservation => {
    const normalized = normalizeStrapiData<Reservation>(reservation);
    if (normalized.reservationStatus === 'draft') {
      const createdAt = new Date(normalized.createdAt || '');
      return createdAt >= expirationTime;
    }
    return true;
  });
  
  return validReservations.length === 0;
}
```

**Mejor solución (Backend):**
- Cron job en Strapi que cancela `draft` antiguas
- O actualizar `checkAvailability` para excluir drafts > 15 minutos

---

## ✅ Mejoras Propuestas - Implementación Inmediata

### Mejora 1: Verificación Final de Disponibilidad

```typescript
// app/reservas/page.tsx - handleSubmitReservation
const handleSubmitReservation = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ... validaciones existentes ...
  
  try {
    setIsSubmitting(true);
    setSubmitError(null);
    
    const checkIn = selectedDates.from.toISOString().split('T')[0];
    const checkOut = selectedDates.to.toISOString().split('T')[0];
    
    // ✅ NUEVO: Verificación final
    const finalCheck = await checkAvailability(selectedDomo.id, checkIn, checkOut);
    if (!finalCheck) {
      setSubmitError("El domo ya no está disponible en estas fechas. Por favor, selecciona otras fechas.");
      setIsAvailable(false);
      return;
    }
    
    // ... resto del código ...
  } catch (err) {
    // Manejo de errores mejorado
    if (err instanceof Error) {
      if (err.message.includes('disponible') || err.message.includes('available')) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Error al crear la reserva. Por favor, intenta de nuevo.");
      }
    }
  } finally {
    setIsSubmitting(false);
  }
};
```

---

### Mejora 2: Mostrar Detalles de Reserva Creada

```typescript
// Después de crear exitosamente
const reservation = await createReservation(reservationData);

// Guardar ID para referencia
setReservationId(reservation.id);

// Mostrar mensaje con detalles
setSubmitSuccess({
  message: `¡Reserva creada exitosamente!`,
  reservationId: reservation.id,
  guestEmail: formData.guestEmail,
});

// Redirigir a página de confirmación
router.push(`/reservas/confirmacion/${reservation.id}`);
```

---

### Mejora 3: Validación Mejorada de Inputs

```typescript
import { validateReservationForm } from '@/lib/utils/validation';

const handleSubmitReservation = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validación completa del formulario
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

## 📊 Diagrama de Flujo Mejorado Propuesto

```
┌─────────────────────────────────────────────────────────────┐
│              FLUJO MEJORADO DE RESERVA                      │
└─────────────────────────────────────────────────────────────┘

Usuario selecciona fechas y domo
         │
         ▼
┌────────────────────────┐
│ checkAvailability()    │  (con cache/debounce)
│ (automático)           │
└────────────────────────┘
         │
    ┌────┴────┐
    │  NO     │     ──→  Deshabilitar botón "Reservar"
    │  SÍ      │
    └────┬────┘
         │
         ▼
┌────────────────────────┐
│ Usuario completa       │
│ formulario             │
│ (validación en tiempo  │
│  real opcional)        │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Usuario hace clic en   │
│ "Confirmar Reserva"    │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ ✅ Validación completa │
│ - Datos del formulario │
│ - Capacidad            │
│ - Fechas               │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ ✅ VERIFICACIÓN FINAL  │  ⭐ NUEVO
│ checkAvailability()    │
│ (justo antes de crear) │
└────────────────────────┘
         │
    ┌────┴────┐
    │  NO     │     ──→  Error: "Ya no disponible"
    │  SÍ      │
    └────┬────┘
         │
         ▼
┌────────────────────────┐
│ Procesar pago          │  ⭐ FUTURO
│ (si está implementado) │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ createReservation()    │
│ reservationStatus:     │
│   - "confirmed" (si pago OK)
│   - "draft" (si pago pendiente)
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ ✅ Guardar ID reserva  │  ⭐ NUEVO
│ ✅ Mostrar detalles    │  ⭐ NUEVO
│ ✅ Enviar email        │  ⭐ FUTURO
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Redirigir a página de  │  ⭐ NUEVO
│ confirmación con ID    │
└────────────────────────┘
```

---

## 🔧 Código de Implementación Completa

### Función Mejorada de Creación

```typescript
// lib/strapi.ts
export async function createReservationWithFinalCheck(
  reservationData: Partial<Reservation>
): Promise<Reservation> {
  // Verificación final de disponibilidad
  const domoId = typeof reservationData.domo === 'object' 
    ? reservationData.domo.id 
    : reservationData.domo;
  
  if (!domoId || !reservationData.checkIn || !reservationData.checkOut) {
    throw new Error('Datos incompletos para crear la reserva');
  }
  
  const isAvailable = await checkAvailability(
    domoId,
    reservationData.checkIn,
    reservationData.checkOut
  );
  
  if (!isAvailable) {
    throw new Error('El domo ya no está disponible en las fechas seleccionadas. Por favor, selecciona otras fechas.');
  }
  
  // Crear reserva
  return createReservation(reservationData);
}
```

### Uso en el Componente

```typescript
// app/reservas/page.tsx
import { createReservationWithFinalCheck } from '@/lib/strapi';

const handleSubmitReservation = async (e: React.FormEvent) => {
  // ... validaciones iniciales ...
  
  try {
    setIsSubmitting(true);
    
    const reservationData = {
      // ... datos ...
    };
    
    // ✅ Usar función mejorada
    const reservation = await createReservationWithFinalCheck(reservationData);
    
    // ✅ Guardar ID y redirigir
    router.push(`/reservas/confirmacion/${reservation.id}`);
    
  } catch (err) {
    // Manejo de errores mejorado
    if (err instanceof Error) {
      setSubmitError(err.message);
    } else {
      setSubmitError("Error al crear la reserva. Por favor, intenta de nuevo.");
    }
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 📋 Checklist de Implementación Priorizada

### Fase 1: Correcciones Críticas (Esta Semana)
- [ ] ✅ Agregar verificación final de disponibilidad antes de crear
- [ ] ✅ Mejorar manejo de errores con mensajes específicos
- [ ] ✅ Validar inputs del formulario completamente
- [ ] ✅ Mostrar detalles de reserva creada (al menos ID)

### Fase 2: Mejoras de UX (Próximas 2 Semanas)
- [ ] ✅ Crear página de confirmación de reserva
- [ ] ✅ Guardar ID de reserva en localStorage/sessionStorage
- [ ] ✅ Agregar debounce a verificación de disponibilidad
- [ ] ✅ Mejorar estados de carga y feedback visual

### Fase 3: Funcionalidad Avanzada (Próximo Mes)
- [ ] ⏳ Integrar sistema de pagos (Stripe/PayPal)
- [ ] ⏳ Implementar notificaciones por email
- [ ] ⏳ Agregar expiración de reservas draft (backend)
- [ ] ⏳ Implementar página "Mis Reservas"

---

## 🔗 Referencias

- [Documento de Flujo Actual](./RESERVATION_FLOW.md)
- [Análisis de Seguridad](../security/OWASP_SECURITY_ANALYSIS.md)
- [Código de Reservas](../../app/reservas/page.tsx)
- [API de Strapi](../../lib/strapi.ts)

---

**Última actualización:** 2024
