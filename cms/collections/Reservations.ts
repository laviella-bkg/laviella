import type { Access, CollectionConfig } from 'payload'

import { dayOnly, isAdmin } from '../access'
import { checkOverlap, notifyAndSyncCalendar } from '../hooks/reservations'
import { revalidateHooks } from '../hooks/revalidate'

// Admin ve todo; un huésped solo sus propias reservas
const adminOrOwnGuest: Access = ({ req }) => {
  if (req.user?.collection === 'users') return true
  if (req.user?.collection === 'guests') return { guestEmail: { equals: req.user.email } }
  return false
}

export const Reservations: CollectionConfig = {
  slug: 'reservations',
  labels: { singular: 'Reserva', plural: 'Reservas' },
  admin: {
    useAsTitle: 'guestName',
    defaultColumns: ['guestName', 'domo', 'checkIn', 'checkOut', 'reservationStatus', 'paymentStatus'],
  },
  access: {
    read: adminOrOwnGuest,
    create: isAdmin,
    update: adminOrOwnGuest,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      // Un huésped solo puede cancelar su reserva, no modificar otros campos
      ({ data, originalDoc, req, operation, context }) => {
        if (operation === 'update' && req.user?.collection === 'guests' && !context.internal) {
          return { ...originalDoc, reservationStatus: 'cancelled' }
        }
        return data
      },
      checkOverlap,
    ],
    afterChange: [notifyAndSyncCalendar, ...revalidateHooks.afterChange],
    afterDelete: revalidateHooks.afterDelete,
  },
  fields: [
    { name: 'domo', label: 'Domo', type: 'relationship', relationTo: 'domos', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'checkIn',
          label: 'Check-in',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly' } },
          hooks: { beforeChange: [dayOnly] },
        },
        {
          name: 'checkOut',
          label: 'Check-out',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly' } },
          hooks: { beforeChange: [dayOnly] },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'guestName', label: 'Nombre del huésped', type: 'text', required: true },
        { name: 'guestEmail', label: 'Email', type: 'email', required: true, index: true },
        { name: 'guestPhone', label: 'Teléfono', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'numberOfGuests', label: 'Cantidad de huéspedes', type: 'number', required: true, min: 1 },
        { name: 'totalPrice', label: 'Precio total', type: 'number', required: true, min: 0 },
      ],
    },
    {
      name: 'reservationStatus',
      label: 'Estado',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Pendiente', value: 'draft' },
        { label: 'Confirmada', value: 'confirmed' },
        { label: 'Cancelada', value: 'cancelled' },
        { label: 'Completada', value: 'completed' },
        { label: 'Bloqueada (Booking)', value: 'blocked' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'paymentStatus',
      label: 'Pago',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pendiente', value: 'pending' },
        { label: 'Pagado', value: 'paid' },
        { label: 'Fallido', value: 'failed' },
        { label: 'Reintegrado', value: 'refunded' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'specialRequests', label: 'Pedidos especiales', type: 'textarea' },
    {
      name: 'externalId',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', readOnly: true, description: 'UID del evento de Booking (iCal)' },
    },
    {
      name: 'calendarEventId',
      type: 'text',
      admin: { position: 'sidebar', readOnly: true, description: 'ID del evento en Google Calendar' },
    },
  ],
}
