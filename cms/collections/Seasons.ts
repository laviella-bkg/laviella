import type { CollectionConfig } from 'payload'

import { anyone, dayOnly, isAdmin } from '../access'

export const Seasons: CollectionConfig = {
  slug: 'seasons',
  labels: { singular: 'Temporada', plural: 'Temporadas' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'startDate', 'endDate', 'priceMultiplier', 'isActive'],
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'isActive', label: 'Activa', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          label: 'Desde',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly' } },
          hooks: { beforeChange: [dayOnly] },
        },
        {
          name: 'endDate',
          label: 'Hasta',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly' } },
          hooks: { beforeChange: [dayOnly] },
        },
      ],
    },
    {
      name: 'priceMultiplier',
      label: 'Multiplicador de precio',
      type: 'number',
      required: true,
      min: 0,
      admin: { step: 0.1, description: 'Ej: 1.5 = 50% más caro que el precio base' },
    },
    { name: 'description', label: 'Descripción', type: 'textarea' },
  ],
}
