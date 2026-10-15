import ical from 'node-ical'
import type { Payload } from 'payload'

import { toNoonUTC } from './access'

// Cancela reservas `draft` más viejas que DRAFT_EXPIRY_HOURS (default 24)
export async function expireDraftReservations(payload: Payload) {
  const hours = parseInt(process.env.DRAFT_EXPIRY_HOURS || '24', 10)
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const { docs } = await payload.update({
    collection: 'reservations',
    where: { reservationStatus: { equals: 'draft' }, createdAt: { less_than: cutoff } },
    data: { reservationStatus: 'cancelled' },
  })
  return docs.length
}

// Marca como `completed` las reservas confirmadas cuyo checkout ya pasó
export async function completeFinishedReservations(payload: Payload) {
  if (process.env.AUTO_COMPLETE_RESERVATIONS === 'false') return 0
  const today = toNoonUTC(new Date().toISOString())

  const { docs } = await payload.update({
    collection: 'reservations',
    where: { reservationStatus: { equals: 'confirmed' }, checkOut: { less_than: today } },
    data: { reservationStatus: 'completed' },
  })
  return docs.length
}

// Fecha local YYYY-MM-DD (node-ical crea los eventos de día completo a medianoche local)
const localDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Bloquea en el sitio las fechas reservadas en Booking.com, leyendo el iCal de cada domo
export async function syncBookingIcal(payload: Payload) {
  const { docs: domos } = await payload.find({
    collection: 'domos',
    where: { bookingIcalUrl: { exists: true }, isActive: { equals: true } },
    pagination: false,
    depth: 0,
  })

  const summary: Record<string, string> = {}
  for (const domo of domos) {
    if (!domo.bookingIcalUrl) continue
    try {
      const res = await fetch(domo.bookingIcalUrl, { signal: AbortSignal.timeout(15_000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const events = ical.sync.parseICS(await res.text())

      // DTEND en iCal ya es el día de checkout (exclusivo), igual que nuestro checkOut
      const incoming = Object.values(events)
        .flatMap((e) =>
          e?.type === 'VEVENT' && e.start && e.end && e.uid
            ? [{ uid: String(e.uid), checkIn: toNoonUTC(localDate(e.start)), checkOut: toNoonUTC(localDate(e.end)) }]
            : [],
        )
        .filter((e) => e.checkIn < e.checkOut)

      const { docs: existing } = await payload.find({
        collection: 'reservations',
        where: { domo: { equals: domo.id }, reservationStatus: { equals: 'blocked' } },
        pagination: false,
        depth: 0,
      })
      const existingByUid = new Map(existing.map((r) => [r.externalId, r]))
      const incomingUids = new Set(incoming.map((e) => e.uid))

      const toDelete = existing.filter((r) => !r.externalId || !incomingUids.has(r.externalId))
      for (const r of toDelete) {
        await payload.delete({ collection: 'reservations', id: r.id })
      }

      let created = 0
      let updated = 0
      for (const e of incoming) {
        const current = existingByUid.get(e.uid)
        if (!current) {
          await payload.create({
            collection: 'reservations',
            context: { skipOverlapCheck: true },
            data: {
              domo: domo.id,
              checkIn: e.checkIn,
              checkOut: e.checkOut,
              reservationStatus: 'blocked',
              paymentStatus: 'pending',
              guestName: 'Booking.com',
              guestEmail: 'sync@booking.com',
              totalPrice: 0,
              numberOfGuests: 1,
              externalId: e.uid,
            },
          })
          created++
        } else if (current.checkIn !== e.checkIn || current.checkOut !== e.checkOut) {
          await payload.update({
            collection: 'reservations',
            id: current.id,
            context: { skipOverlapCheck: true },
            data: { checkIn: e.checkIn, checkOut: e.checkOut },
          })
          updated++
        }
      }

      summary[domo.name] = `creadas=${created} actualizadas=${updated} eliminadas=${toDelete.length}`
    } catch (err) {
      summary[domo.name] = `error: ${err}`
      payload.logger.error(`[booking-ical] Error sincronizando ${domo.name}: ${err}`)
    }
  }
  return summary
}
