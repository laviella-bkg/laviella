import config from '@payload-config'
import { getPayload } from 'payload'

import { completeFinishedReservations, expireDraftReservations, syncBookingIcal } from '@/cms/tasks'

// Corre todas las tareas programadas. Lo invoca Vercel Cron (y/o un cron externo cada hora)
// con el header `Authorization: Bearer <CRON_SECRET>`.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const payload = await getPayload({ config })
  const run = async (name: string, task: () => Promise<unknown>) => {
    try {
      return await task()
    } catch (err) {
      payload.logger.error(`[cron] ${name} falló: ${err}`)
      return { error: String(err) }
    }
  }

  const result = {
    expiredDrafts: await run('expireDraftReservations', () => expireDraftReservations(payload)),
    completed: await run('completeFinishedReservations', () => completeFinishedReservations(payload)),
    bookingIcal: await run('syncBookingIcal', () => syncBookingIcal(payload)),
  }
  payload.logger.info(`[cron] ${JSON.stringify(result)}`)
  return Response.json(result)
}
