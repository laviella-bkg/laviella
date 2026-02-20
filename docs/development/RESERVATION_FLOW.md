# Flujo de Confirmación de Reservas

Análisis del flujo actual de creación y confirmación de reservas en el sistema.

---

## 📊 Diagrama del Flujo Actual

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO ACTUAL DE RESERVA                      │
└─────────────────────────────────────────────────────────────────┘

Usuario selecciona fechas y domo
         │
         ▼
┌────────────────────────┐
│ checkAvailability()    │  ¿Disponible?
│ (lib/strapi.ts:357)    │
└────────────────────────┘
         │
    ┌────┴────┐
    │  NO     │     ──→  Mostrar "No disponible"
    │  SÍ      │
    └────┬────┘
         │
         ▼
┌────────────────────────┐
│ Usuario completa       │
│ formulario             │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Validaciones básicas:  │
│ - Fechas               │
│ - Capacidad            │
│ - Datos requeridos     │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ createReservation()    │
│ reservationStatus:     │
│   "draft"              │
│ paymentStatus:         │
│   "pending"            │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ ⚠️ RESERVA CREADA       │
│ Status: draft          │
│ Payment: pending       │
│                        │
│ ❌ NO HAY CONFIRMACIÓN  │
│ ❌ NO HAY PAGO          │
│ ❌ NO HAY EMAIL         │
└────────────────────────┘
         │
         ▼
┌────────────────────────┐
│ Mostrar mensaje de     │
│ éxito genérico         │
└────────────────────────┘
         │
         ▼
   ⚠️ REQUIERE ACCIÓN
   MANUAL EN STRAPI
```

---

## 📊 Estado Actual del Flujo

### 1. Creación de Reserva (Frontend)

**Ubicación:** `app/reservas/page.tsx:188-250`

#### Proceso Actual:

```typescript
// Paso 1: Usuario completa formulario
handleSubmitReservation()
  ↓
// Paso 2: Validaciones básicas
- Validar fechas seleccionadas
- Validar disponibilidad
- Validar capacidad de huéspedes
  ↓
// Paso 3: Crear reserva con estado inicial
const reservationData = {
  reservationStatus: "draft",    // ⚠️ Siempre se crea como draft
  paymentStatus: "pending",       // ⚠️ Siempre se crea como pending
  // ... otros datos
}
  ↓
// Paso 4: Enviar a Strapi
await createReservation(reservationData)
  ↓
// Paso 5: Mostrar mensaje de éxito
setSubmitSuccess(true)
```

#### Problemas Identificados:

1. ❌ **No hay confirmación automática**: Las reservas siempre se crean como `draft`
2. ❌ **No hay integración de pago**: El status de pago nunca cambia automáticamente
3. ❌ **No hay notificación al usuario**: Solo se muestra un mensaje genérico
4. ❌ **No hay verificación de disponibilidad final**: Se verifica antes, pero puede cambiar entre la verificación y la creación
5. ❌ **No hay gestión de conflictos**: Si dos usuarios reservan simultáneamente, pueden crear conflictos

---

### 2. Estados de Reserva

**Ubicación:** `lib/types/strapi.ts:101-102`

```typescript
type ReservationStatus = "draft" | "confirmed" | "cancelled" | "completed";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
```

#### Estados Posibles:

| ReservationStatus | PaymentStatus | Descripción | Quién lo establece |
|-------------------|---------------|-------------|-------------------|
| `draft` | `pending` | Reserva creada, pendiente de confirmación | Frontend (al crear) |
| `draft` | `paid` | Pago realizado pero reserva no confirmada | ❌ No existe en el flujo actual |
| `confirmed` | `pending` | Reserva confirmada sin pago | ❌ No existe (inconsistente) |
| `confirmed` | `paid` | Reserva confirmada y pagada | ❌ Requiere acción manual en Strapi |
| `cancelled` | `pending/paid/refunded` | Reserva cancelada | ❌ No implementado |
| `completed` | `paid` | Estadía completada | ❌ No implementado |

---

### 3. Verificación de Disponibilidad

**Ubicación:** `lib/strapi.ts:357-377`

```typescript
export async function checkAvailability(
  domoId: number,
  checkIn: string,
  checkOut: string
): Promise<boolean> {
  // Busca reservas con status "confirmed" O "draft" que se solapen
  const data = await fetchAPI(
    `/reservations?filters[domo][id][$eq]=${domoId}
     &filters[checkIn][$lte]=${endDate}
     &filters[checkOut][$gte]=${startDate}
     &filters[reservationStatus][$in][0]=confirmed
     &filters[reservationStatus][$in][1]=draft`
  );
  
  return data.data.length === 0; // Disponible si no hay solapamientos
}
```

#### Observaciones:

- ✅ Considera reservas `draft` como ocupadas (correcto)
- ✅ Considera reservas `confirmed` como ocupadas (correcto)
- ⚠️ **Race Condition**: Entre `checkAvailability()` y `createReservation()` pueden crearse conflictos
- ⚠️ No hay bloqueo temporal de disponibilidad durante el proceso de reserva

---

### 4. Actualización de Reservas

**Ubicación:** `lib/strapi.ts:328-337`

```typescript
export async function updateReservation(
  id: number,
  updateData: Partial<Reservation>
): Promise<Reservation> {
  // Permite actualizar cualquier campo
  // ⚠️ No hay validaciones de transición de estados
  // ⚠️ No hay verificación de permisos
}
```

#### Problemas:

- ❌ No hay validación de transiciones de estado válidas
- ❌ No hay verificación de que el usuario pueda modificar la reserva
- ❌ No hay lógica de negocio (ej: cancelar → refund automático)

---

## 🔄 Flujo Ideal vs. Flujo Actual

### Flujo Ideal (Recomendado)

```
1. Usuario selecciona fechas y domo
   ↓
2. Verificar disponibilidad en tiempo real
   ↓
3. Bloquear disponibilidad temporalmente (15 min)
   ↓
4. Usuario completa formulario
   ↓
5. Validar datos del formulario
   ↓
6. Procesar pago (si es requerido)
   ↓
7. Crear reserva con status "confirmed" (si pago exitoso)
   o Crear reserva con status "draft" (si pago pendiente)
   ↓
8. Enviar email de confirmación
   ↓
9. Mostrar confirmación al usuario
```

### Flujo Actual

```
1. Usuario selecciona fechas y domo
   ↓
2. Verificar disponibilidad
   ↓
3. Usuario completa formulario
   ↓
4. Validar datos básicos
   ↓
5. Crear reserva con status "draft" y payment "pending"
   ↓
6. Mostrar mensaje de éxito genérico
   ↓
7. ❌ NO HAY PASOS ADICIONALES
```

---

## 🚨 Problemas Críticos Identificados

### 1. **Race Condition en Disponibilidad**

**Problema:**
Dos usuarios pueden reservar el mismo domo en las mismas fechas simultáneamente.

**Escenario:**
```
Usuario A: checkAvailability() → disponible → createReservation()
Usuario B: checkAvailability() → disponible → createReservation() (¡mismo tiempo!)
Resultado: Dos reservas "draft" para las mismas fechas
```

**Solución:**
- Implementar bloqueo optimista en Strapi
- Verificar disponibilidad nuevamente antes de crear
- Usar transacciones de base de datos

---

### 2. **Falta de Integración de Pago**

**Problema:**
No hay procesamiento de pago, las reservas quedan en "draft" indefinidamente.

**Impacto:**
- No hay garantía de que se pague
- No hay confirmación real de reserva
- Requiere gestión manual en Strapi

**Solución:**
- Integrar pasarela de pago (Stripe, PayPal, etc.)
- Actualizar status después de pago exitoso
- Implementar webhooks para confirmación asíncrona

---

### 3. **No hay Confirmación Automática**

**Problema:**
Todas las reservas quedan como "draft" y requieren confirmación manual.

**Solución:**
- Confirmar automáticamente si el pago es exitoso
- O implementar flujo de aprobación manual con notificaciones

---

### 4. **Falta de Notificaciones**

**Problema:**
El usuario no recibe confirmación por email ni el admin es notificado.

**Solución:**
- Enviar email al usuario con detalles de reserva
- Enviar notificación al admin en Strapi
- Implementar SMS opcional

---

### 5. **Gestión de Reservas Draft**

**Problema:**
Las reservas "draft" bloquean disponibilidad indefinidamente.

**Solución:**
- Implementar expiración automática de reservas "draft" (ej: 15 minutos)
- Limpiar reservas "draft" antiguas
- No considerar "draft" antiguas en verificación de disponibilidad

---

## 📝 Flujo Mejorado Propuesto

### Opción A: Pago Inmediato (Stripe)

```
1. Usuario completa formulario
   ↓
2. Validar datos
   ↓
3. Mostrar resumen y botón "Pagar"
   ↓
4. Redirigir a Stripe Checkout o integrar Stripe Elements
   ↓
5. Usuario completa pago
   ↓
6. Webhook de Stripe → Strapi
   ↓
7. Crear reserva con status "confirmed" y payment "paid"
   ↓
8. Enviar email de confirmación
   ↓
9. Redirigir a página de confirmación
```

### Opción B: Reserva con Pago Pendiente

```
1. Usuario completa formulario
   ↓
2. Validar datos
   ↓
3. Crear reserva con status "confirmed" y payment "pending"
   ↓
4. Enviar email con link de pago
   ↓
5. Usuario paga (link expira en X días)
   ↓
6. Actualizar paymentStatus a "paid"
   ↓
7. Si no paga en X días, cancelar reserva
```

### Opción C: Confirmación Manual (Actual con mejoras)

```
1. Usuario completa formulario
   ↓
2. Crear reserva con status "draft"
   ↓
3. Enviar email al admin
   ↓
4. Admin revisa y confirma manualmente en Strapi
   ↓
5. Enviar email de confirmación al usuario
   ↓
6. Enviar link de pago
```

---

## 🛠️ Mejoras Recomendadas (Priorizadas)

### Prioridad 1 - Crítico

1. **Implementar verificación de disponibilidad final antes de crear**
   ```typescript
   // En createReservation, verificar nuevamente justo antes de crear
   const isAvailable = await checkAvailability(domoId, checkIn, checkOut);
   if (!isAvailable) {
     throw new Error('El domo ya no está disponible en estas fechas');
   }
   ```

2. **Agregar expiración de reservas "draft"**
   - Job en Strapi que cancela reservas "draft" después de 15-30 minutos
   - O verificar antigüedad al verificar disponibilidad

### Prioridad 2 - Alto

3. **Integrar sistema de pagos**
   - Stripe o PayPal
   - Actualizar status después de pago
   - Manejar webhooks

4. **Implementar notificaciones por email**
   - Email de confirmación al usuario
   - Email de notificación al admin
   - Usar Strapi Email plugin o servicio externo (SendGrid, etc.)

### Prioridad 3 - Medio

5. **Mejorar validación de transiciones de estado**
   ```typescript
   const validTransitions = {
     draft: ['confirmed', 'cancelled'],
     confirmed: ['cancelled', 'completed'],
     cancelled: [], // Terminal
     completed: [], // Terminal
   };
   ```

6. **Agregar página de confirmación de reserva**
   - Mostrar detalles de la reserva
   - Link de pago (si aplica)
   - Opción de cancelar

7. **Implementar gestión de reservas para usuarios**
   - Ver mis reservas
   - Cancelar reserva
   - Ver historial

---

## 📋 Checklist de Implementación

### Fase 1: Correcciones Críticas
- [ ] Verificar disponibilidad justo antes de crear reserva
- [ ] Implementar expiración de reservas "draft"
- [ ] Agregar manejo de errores mejorado para conflictos

### Fase 2: Integración de Pagos
- [ ] Seleccionar pasarela de pago (Stripe recomendado)
- [ ] Configurar cuenta y credenciales
- [ ] Integrar checkout en frontend
- [ ] Implementar webhooks en Strapi
- [ ] Actualizar status después de pago

### Fase 3: Notificaciones
- [ ] Configurar servicio de email (SendGrid, AWS SES, etc.)
- [ ] Crear templates de email
- [ ] Implementar envío al crear reserva
- [ ] Implementar envío al confirmar reserva
- [ ] Implementar envío de recordatorios

### Fase 4: Mejoras de UX
- [ ] Página de confirmación de reserva
- [ ] Página "Mis Reservas"
- [ ] Mejores mensajes de error
- [ ] Loading states mejorados
- [ ] Confirmación visual mejorada

---

## 🔗 Recursos

- [Stripe Integration Guide](https://stripe.com/docs/payments)
- [Strapi Email Plugin](https://docs.strapi.io/dev-docs/plugins/email)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) (para procesar pagos)

---

**Última actualización:** 2024
