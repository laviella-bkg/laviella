import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Testimonio', plural: 'Testimonios' },
  admin: {
    useAsTitle: 'guestName',
    defaultColumns: ['guestName', 'rating', 'domo', 'isApproved'],
  },
  access: {
    // El público solo ve los aprobados
    read: ({ req }) => req.user?.collection === 'users' || { isApproved: { equals: true } },
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'guestName', label: 'Nombre', type: 'text', required: true },
    { name: 'isApproved', label: 'Aprobado', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'rating', label: 'Puntaje', type: 'number', min: 1, max: 5 },
    { name: 'comment', label: 'Comentario', type: 'textarea', required: true },
    { name: 'guestImage', label: 'Foto', type: 'upload', relationTo: 'media' },
    { name: 'domo', label: 'Domo', type: 'relationship', relationTo: 'domos' },
  ],
}
