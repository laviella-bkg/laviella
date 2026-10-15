import { APIError, type CollectionAfterChangeHook, type CollectionBeforeChangeHook } from 'payload'

import type { Reservation } from '../payload-types'
import { toNoonUTC } from '../access'
import { createCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from '../services/google-calendar'
import { adminEmail, guestEmail } from '../services/reservation-emails'

const relId = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number))

// Rechaza reservas que se solapan con otra no cancelada del mismo domo
export const checkOverlap: CollectionBeforeChangeHook<Reservation> = async ({
  data,
  originalDoc,
  operation,
  req,
  context,
}) => {
  if (context.skipOverlapCheck || context.internal) return data

  const status = data.reservationStatus ?? originalDoc?.reservationStatus
  if (status === 'cancelled') return data

  const domo = relId(data.domo ?? originalDoc?.domo)
  const checkIn = toNoonUTC(data.checkIn ?? originalDoc?.checkIn)
  const checkOut = toNoonUTC(data.checkOut ?? originalDoc?.checkOut)
  if (!domo || !checkIn || !checkOut) return data

  if (checkIn >= checkOut) {
    throw new APIError('La fecha de check-out debe ser posterior al check-in.', 400, undefined, true)
  }

  const conflicts = await req.payload.count({
    collection: 'reservations',
    req,
    where: {
      domo: { equals: domo },
      reservationStatus: { not_equals: 'cancelled' },
      checkIn: { less_than: checkOut },
      checkOut: { greater_than: checkIn },
      ...(operation === 'update' && originalDoc ? { id: { not_equals: originalDoc.id } } : {}),
    },
  })

  if (conflicts.totalDocs > 0) {
    throw new APIError('Las fechas seleccionadas no están disponibles para este domo.', 409, undefined, true)
  }
  return data
}

// Emails de nueva reserva y sincronización con Google Calendar
export const notifyAndSyncCalendar: CollectionAfterChangeHook<Reservation> = async ({
  doc,
  operation,
  req,
  context,
}) => {
  if (context.internal) return doc
  const { payload } = req
  const status = doc.reservationStatus
  if (status === 'blocked') return doc

  let domoName = 'Domo seleccionado'
  try {
    const domo = await payload.findByID({ collection: 'domos', id: relId(doc.domo), depth: 0, req })
    domoName = domo.name
  } catch {
    // usamos el fallback
  }
  const r = { ...doc, domoName }

  if (operation === 'create') {
    try {
      await payload.sendEmail(guestEmail(r))
      await payload.sendEmail(
        adminEmail(r, process.env.ADMIN_NOTIFICATION_EMAIL || process.env.GMAIL_USER || 'laviella.glamp@gmail.com'),
      )
    } catch (err) {
      payload.logger.error(`[email] Error enviando emails de reserva ${doc.id}: ${err}`)
    }
  }

  const setEventId = (calendarEventId: string | null) =>
    payload.update({
      collection: 'reservations',
      id: doc.id,
      data: { calendarEventId },
      context: { internal: true },
      req,
    })

  try {
    if (status === 'confirmed') {
      if (doc.calendarEventId) {
        await updateCalendarEvent(doc.calendarEventId, r)
      } else {
        const eventId = await createCalendarEvent(r)
        if (eventId) await setEventId(eventId)
      }
    } else if ((status === 'cancelled' || status === 'completed') && doc.calendarEventId) {
      await deleteCalendarEvent(doc.calendarEventId)
      await setEventId(null)
    }
  } catch (err) {
    payload.logger.error(`[calendar] Error sincronizando reserva ${doc.id}: ${err}`)
  }
  return doc
}
