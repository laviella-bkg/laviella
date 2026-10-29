import { auth, calendar } from '@googleapis/calendar'

const TIMEZONE = 'America/Argentina/Buenos_Aires'

type CalendarReservation = {
  id: number | string
  domoName: string
  guestName: string
  guestEmail: string
  guestPhone?: string | null
  numberOfGuests: number
  totalPrice: number
  specialRequests?: string | null
  checkIn: string
  checkOut: string
}

function isConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN &&
    process.env.GOOGLE_CALENDAR_ID
  )
}

function getClient() {
  const oauth2Client = new auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
  return calendar({ version: 'v3', auth: oauth2Client })
}

function buildEvent(r: CalendarReservation) {
  const lines = [
    `Reserva #${r.id}`,
    `Domo: ${r.domoName}`,
    `Huésped: ${r.guestName}`,
    `Email: ${r.guestEmail}`,
    r.guestPhone ? `Teléfono: ${r.guestPhone}` : null,
    `Huéspedes: ${r.numberOfGuests}`,
    `Total: U$S ${r.totalPrice?.toLocaleString('es-AR')}`,
    r.specialRequests ? `Solicitudes: ${r.specialRequests}` : null,
  ].filter(Boolean)

  return {
    summary: `${r.domoName} — ${r.guestName}`,
    description: lines.join('\n'),
    start: { date: r.checkIn.slice(0, 10), timeZone: TIMEZONE },
    end: { date: r.checkOut.slice(0, 10), timeZone: TIMEZONE },
    attendees: [{ email: r.guestEmail }],
    extendedProperties: {
      private: { reservationId: String(r.id) },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 60 },
      ],
    },
  }
}

export async function createCalendarEvent(r: CalendarReservation): Promise<string | null> {
  if (!isConfigured()) return null
  const res = await getClient().events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    requestBody: buildEvent(r),
  })
  return res.data.id ?? null
}

export async function updateCalendarEvent(eventId: string, r: CalendarReservation): Promise<void> {
  if (!isConfigured()) return
  await getClient().events.update({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    eventId,
    requestBody: buildEvent(r),
  })
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  if (!isConfigured()) return
  await getClient().events.delete({ calendarId: process.env.GOOGLE_CALENDAR_ID!, eventId })
}
