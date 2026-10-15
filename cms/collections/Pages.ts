import type { CollectionConfig } from 'payload'

import { anyone, isAdmin, slugFrom } from '../access'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Página', plural: 'Páginas' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isActive'],
  },
  access: {
    read: anyone,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', label: 'Título', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Se genera desde el título si se deja vacío' },
      hooks: { beforeValidate: [slugFrom('title')] },
    },
    { name: 'isActive', label: 'Activa', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    { name: 'content', label: 'Contenido', type: 'richText' },
    {
      type: 'collapsible',
      label: 'SEO',
      fields: [
        { name: 'seoTitle', label: 'Título SEO', type: 'text' },
        { name: 'metaDescription', label: 'Meta descripción', type: 'textarea' },
        { name: 'seoKeywords', label: 'Palabras clave', type: 'textarea' },
      ],
    },
  ],
}
