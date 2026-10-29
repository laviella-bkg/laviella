import type { GlobalConfig } from 'payload'

import { anyone, isAdmin } from '../access'
import { revalidateHooks } from '../hooks/revalidate'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Página de inicio',
  hooks: { afterChange: revalidateHooks.afterChange },
  access: {
    read: anyone,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            { name: 'heroTitle', label: 'Título', type: 'text' },
            { name: 'heroSubtitle', label: 'Subtítulo', type: 'text' },
            { name: 'heroCtaLabel', label: 'Texto del botón', type: 'text' },
            { name: 'heroImage', label: 'Imagen', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Nosotros',
          fields: [
            { name: 'aboutTitle', label: 'Título', type: 'text' },
            { name: 'aboutDescription', label: 'Descripción', type: 'textarea' },
            { name: 'aboutLocationTitle', label: 'Ubicación: título', type: 'text' },
            { name: 'aboutLocationSubtitle', label: 'Ubicación: subtítulo', type: 'text' },
            { name: 'aboutClimaTitle', label: 'Clima: título', type: 'text' },
            { name: 'aboutClimaSubtitle', label: 'Clima: subtítulo', type: 'text' },
            { name: 'aboutImage', label: 'Imagen', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Servicios',
          fields: [
            { name: 'serviciosTitle', label: 'Título', type: 'text' },
            { name: 'serviciosSubtitle', label: 'Subtítulo', type: 'text' },
            {
              name: 'servicios',
              label: 'Servicios',
              type: 'array',
              fields: [
                { name: 'title', label: 'Título', type: 'text', required: true },
                { name: 'description', label: 'Descripción', type: 'textarea' },
                { name: 'image', label: 'Imagen', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
        {
          label: 'Contacto',
          fields: [
            { name: 'ctaTitle', label: 'Título', type: 'text' },
            { name: 'ctaDescription', label: 'Descripción', type: 'textarea' },
            { name: 'ctaHoursWeekdaysLabel', label: 'Horario semana: etiqueta', type: 'text' },
            { name: 'ctaHoursWeekdays', label: 'Horario semana', type: 'text' },
            { name: 'ctaHoursWeekendLabel', label: 'Horario fin de semana: etiqueta', type: 'text' },
            { name: 'ctaHoursWeekend', label: 'Horario fin de semana', type: 'text' },
            { name: 'ctaAddress', label: 'Dirección', type: 'textarea' },
            { name: 'ctaPhone', label: 'Teléfono', type: 'text', admin: { description: 'También se usa en el footer y en el WhatsApp de "¿Necesitas ayuda?" en Reservas.' } },
            { name: 'ctaEmail', label: 'Email', type: 'email', admin: { description: 'También se usa en el footer y en "¿Necesitas ayuda?" en Reservas.' } },
            { name: 'ctaImage', label: 'Imagen', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
