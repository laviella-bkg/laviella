'use server'

import { APIError } from 'payload'
import { headers } from 'next/headers'

import { cms, getSeasons, isDomoAvailable } from './cms'
import type { Reservation } from './types/cms'
import { calculatePrice } from './utils/cms'

type Result = { ok: true } | { ok: false; error: string }

const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v)
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export async function checkAvailability(domoId: number, checkIn: string, checkOut: string): Promise<boolean> {
  if (!isDate(checkIn) || !isDate(checkOut)) return false
  return isDomoAvailable(domoId, checkIn, checkOut)
}

export async function createReservation(input: {
  domoId: number
  guestName: string
  guestEmail: string
  guestPhone?: string
  checkIn: string
  checkOut: string
  numberOfGuests: number
  specialRequests?: string
}): Promise<Result> {
  const guestName = input.guestName?.trim()
  const guestEmail = input.guestEmail?.trim().toLowerCase()
  if (!guestName || !isEmail(guestEmail)) return { ok: false, error: 'Completá tu nombre y un email válido.' }
  if (!isDate(input.checkIn) || !isDate(input.checkOut) || input.checkIn >= input.checkOut) {
    return { ok: false, error: 'Las fechas seleccionadas no son válidas.' }
  }

  const payload = await cms()
  const domo = await payload.findByID({ collection: 'domos', id: input.domoId, depth: 0 }).catch(() => null)
  if (!domo || domo.isActive === false) return { ok: false, error: 'El domo seleccionado no está disponible.' }

  const numberOfGuests = Math.floor(Number(input.numberOfGuests))
  if (!(numberOfGuests >= 1 && numberOfGuests <= domo.capacity)) {
    return { ok: false, error: `El número de huéspedes no puede exceder la capacidad del domo (${domo.capacity}).` }
  }

  // El precio se calcula en el servidor, no se confía en el que muestra el navegador
  const { total } = calculatePrice(domo.basePrice, await getSeasons(), input.checkIn, input.checkOut)

  try {
    await payload.create({
      collection: 'reservations',
      data: {
        domo: domo.id,
        guestName,
        guestEmail,
        guestPhone: input.guestPhone?.trim() || undefined,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        numberOfGuests,
        totalPrice: Math.round(total * 100) / 100,
        specialRequests: input.specialRequests?.trim() || undefined,
        reservationStatus: 'draft',
        paymentStatus: 'pending',
      },
    })
    return { ok: true }
  } catch (err) {
    if (err instanceof APIError && err.status === 409) return { ok: false, error: err.message }
    console.error('Error creando reserva:', err)
    return { ok: false, error: 'Error al crear la reserva. Por favor, intentá de nuevo.' }
  }
}

export async function submitContactMessage(input: {
  nombre: string
  email: string
  telefono?: string
  mensaje: string
}): Promise<Result> {
  const nombre = input.nombre?.trim()
  const email = input.email?.trim()
  const mensaje = input.mensaje?.trim()
  if (!nombre || !isEmail(email) || !mensaje) return { ok: false, error: 'Completá nombre, email y mensaje.' }

  await (await cms()).create({
    collection: 'contact-messages',
    data: { nombre, email, telefono: input.telefono?.trim() || undefined, mensaje },
  })
  return { ok: true }
}

// ── Mis reservas (huésped autenticado por cookie de Payload) ─────────

async function currentGuest() {
  const payload = await cms()
  const { user } = await payload.auth({ headers: await headers() })
  return user?.collection === 'guests' ? { payload, user } : null
}

/** null si no hay huésped logueado */
export async function getMyReservations(): Promise<Reservation[] | null> {
  const session = await currentGuest()
  if (!session) return null

  const { docs } = await session.payload.find({
    collection: 'reservations',
    user: session.user,
    overrideAccess: false,
    where: { reservationStatus: { not_equals: 'blocked' } },
    sort: '-checkIn',
    depth: 1,
    pagination: false,
  })

  return docs.map((r) => ({
    id: r.id,
    domo: typeof r.domo === 'object' ? { id: r.domo.id, name: r.domo.name, slug: r.domo.slug } : null,
    guestName: r.guestName,
    guestEmail: r.guestEmail,
    guestPhone: r.guestPhone ?? undefined,
    checkIn: r.checkIn.slice(0, 10),
    checkOut: r.checkOut.slice(0, 10),
    totalPrice: r.totalPrice,
    reservationStatus: r.reservationStatus,
    paymentStatus: r.paymentStatus,
    numberOfGuests: r.numberOfGuests,
    specialRequests: r.specialRequests ?? undefined,
  }))
}

export async function cancelMyReservation(id: number): Promise<Result> {
  const session = await currentGuest()
  if (!session) return { ok: false, error: 'Tu sesión expiró. Volvé a iniciar sesión.' }
  try {
    // El acceso y el hook de la colección limitan al huésped a cancelar sus propias reservas
    await session.payload.update({
      collection: 'reservations',
      id,
      user: session.user,
      overrideAccess: false,
      data: { reservationStatus: 'cancelled' },
    })
    return { ok: true }
  } catch {
    return { ok: false, error: 'No se pudo cancelar la reserva.' }
  }
}
