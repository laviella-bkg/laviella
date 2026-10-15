type EmailReservation = {
  id: number | string
  domoName: string
  guestName: string
  guestEmail: string
  numberOfGuests: number
  totalPrice: number
  specialRequests?: string | null
  checkIn: string
  checkOut: string
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://laviella.vercel.app'

const escape = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

// 2026-12-10T12:00:00.000Z -> 10/12/2026
const formatDate = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/')

export function guestEmail(r: EmailReservation) {
  return {
    to: r.guestEmail,
    subject: `Tu solicitud de reserva en La Viella — ${r.domoName}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #3c3530;">
        <h1 style="font-size: 28px; font-weight: 600; margin-bottom: 4px;">La Viella Glamping</h1>
        <p style="color: #71665c; font-size: 14px; margin-top: 0;">Sierras de Córdoba · Argentina</p>
        <hr style="border: none; border-top: 1px solid #dbd5cc; margin: 24px 0;" />

        <p>Hola <strong>${escape(r.guestName)}</strong>,</p>
        <p>Recibimos tu solicitud de reserva. En breve nos ponemos en contacto para coordinar el pago y confirmarla.</p>

        <div style="background: #f4f1ed; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h2 style="font-size: 18px; margin: 0 0 16px;">Detalle de tu reserva</h2>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #71665c;">Domo</td><td style="text-align: right;"><strong>${escape(r.domoName)}</strong></td></tr>
            <tr><td style="padding: 6px 0; color: #71665c;">Check-in</td><td style="text-align: right;"><strong>${formatDate(r.checkIn)}</strong></td></tr>
            <tr><td style="padding: 6px 0; color: #71665c;">Check-out</td><td style="text-align: right;"><strong>${formatDate(r.checkOut)}</strong></td></tr>
            <tr><td style="padding: 6px 0; color: #71665c;">Huéspedes</td><td style="text-align: right;"><strong>${r.numberOfGuests}</strong></td></tr>
            <tr style="border-top: 1px solid #dbd5cc;"><td style="padding: 10px 0 0; font-weight: 600;">Total estimado</td><td style="text-align: right; font-weight: 600; padding-top: 10px;">$${r.totalPrice}</td></tr>
          </table>
          ${r.specialRequests ? `<p style="margin-top: 16px; font-size: 13px; color: #71665c;"><em>Pedidos especiales: ${escape(r.specialRequests)}</em></p>` : ''}
        </div>

        <p style="font-size: 14px; color: #71665c;">Check-in: 15:00 hs · Check-out: 11:00 hs</p>
        <hr style="border: none; border-top: 1px solid #dbd5cc; margin: 24px 0;" />
        <p style="font-size: 12px; color: #71665c;">La Viella Glamping · Sierras de Córdoba · <a href="${SITE_URL}" style="color: #623e2a;">${SITE_URL}</a></p>
      </div>
    `,
  }
}

export function adminEmail(r: EmailReservation, to: string) {
  return {
    to,
    replyTo: r.guestEmail,
    subject: `Nueva reserva — ${r.guestName} · ${r.domoName}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #3c3530;">
        <h2 style="font-size: 22px;">Nueva solicitud de reserva</h2>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 8px 0; color: #71665c; width: 140px;">Huésped</td><td><strong>${escape(r.guestName)}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #71665c;">Email</td><td><a href="mailto:${escape(r.guestEmail)}" style="color: #623e2a;">${escape(r.guestEmail)}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #71665c;">Domo</td><td><strong>${escape(r.domoName)}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #71665c;">Check-in</td><td><strong>${formatDate(r.checkIn)}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #71665c;">Check-out</td><td><strong>${formatDate(r.checkOut)}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #71665c;">Huéspedes</td><td><strong>${r.numberOfGuests}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #71665c;">Total</td><td><strong>$${r.totalPrice}</strong></td></tr>
          ${r.specialRequests ? `<tr><td style="padding: 8px 0; color: #71665c;">Pedidos especiales</td><td>${escape(r.specialRequests)}</td></tr>` : ''}
        </table>
        <p style="margin-top: 24px;">
          <a href="${SITE_URL}/cms/collections/reservations/${r.id}" style="background: #623e2a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 13px;">Ver reserva</a>
        </p>
      </div>
    `,
  }
}
