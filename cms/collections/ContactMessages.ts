import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access'

export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  labels: { singular: 'Mensaje de contacto', plural: 'Mensajes de contacto' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'email', 'createdAt'],
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'telefono', label: 'Teléfono', type: 'text' },
    { name: 'mensaje', label: 'Mensaje', type: 'textarea', required: true },
  ],
}
