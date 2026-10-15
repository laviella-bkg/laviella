import type { Access, CollectionConfig } from 'payload'

import { isAdmin } from '../access'

// Cada huésped solo puede ver y editar su propia cuenta
const adminOrSelf: Access = ({ req }) => {
  if (req.user?.collection === 'users') return true
  if (req.user?.collection === 'guests') return { id: { equals: req.user.id } }
  return false
}

export const Guests: CollectionConfig = {
  slug: 'guests',
  labels: { singular: 'Huésped', plural: 'Huéspedes' },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7, // 7 días, igual que el JWT de Strapi
  },
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: adminOrSelf,
    create: () => true, // registro público
    update: adminOrSelf,
    delete: isAdmin,
  },
  fields: [{ name: 'name', label: 'Nombre', type: 'text' }],
}
