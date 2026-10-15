import type { CollectionConfig } from 'payload'

import { anyone, isAdmin, slugFrom } from '../access'

export const Domos: CollectionConfig = {
  slug: 'domos',
  labels: { singular: 'Domo', plural: 'Domos' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'capacity', 'basePrice', 'isActive'],
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true, unique: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Se genera desde el nombre si se deja vacío' },
      hooks: { beforeValidate: [slugFrom('name')] },
    },
    { name: 'isActive', label: 'Activo', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'description', label: 'Descripción', type: 'richText' },
    {
      type: 'row',
      fields: [
        { name: 'capacity', label: 'Capacidad', type: 'number', required: true, min: 1 },
        { name: 'basePrice', label: 'Precio base por noche', type: 'number', required: true, min: 0 },
      ],
    },
    { name: 'mainImage', label: 'Imagen principal', type: 'upload', relationTo: 'media' },
    { name: 'gallery', label: 'Galería', type: 'upload', relationTo: 'media', hasMany: true },
    {
      name: 'features',
      label: 'Características',
      type: 'array',
      fields: [{ name: 'text', label: 'Característica', type: 'text', required: true }],
    },
    {
      name: 'amenities',
      label: 'Amenities',
      type: 'array',
      fields: [{ name: 'text', label: 'Amenity', type: 'text', required: true }],
    },
    { name: 'location', label: 'Ubicación', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'checkInTime', label: 'Horario check-in', type: 'text', defaultValue: '15:00' },
        { name: 'checkOutTime', label: 'Horario check-out', type: 'text', defaultValue: '11:00' },
      ],
    },
    {
      name: 'bookingIcalUrl',
      label: 'URL iCal de Booking',
      type: 'text',
      admin: { description: 'Se sincroniza cada hora para bloquear fechas reservadas en Booking' },
    },
    { name: 'reservations', label: 'Reservas', type: 'join', collection: 'reservations', on: 'domo' },
    { name: 'testimonials', label: 'Testimonios', type: 'join', collection: 'testimonials', on: 'domo' },
  ],
}
