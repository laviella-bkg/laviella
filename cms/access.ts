import type { Access, FieldHook } from 'payload'

export const isAdmin: Access = ({ req }) => req.user?.collection === 'users'

export const anyone: Access = () => true

// Genera el slug desde otro campo si viene vacío
export const slugFrom =
  (field: string): FieldHook =>
  ({ value, data }) =>
    value ||
    String(data?.[field] ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

// Fechas de día completo se guardan a las 12:00 UTC para evitar corrimientos por zona horaria
export function toNoonUTC(value: string): string
export function toNoonUTC(value: unknown): string | undefined
export function toNoonUTC(value: unknown) {
  return value ? `${String(value).slice(0, 10)}T12:00:00.000Z` : undefined
}

export const dayOnly: FieldHook = ({ value }) => toNoonUTC(value)
