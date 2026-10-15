/**
 * Importa el contenido publicado del backup de Strapi (SQLite + uploads) a Payload.
 * Idempotente: actualiza por slug/nombre si el documento ya existe.
 * No importa reservas ni mensajes de contacto (eran datos de prueba).
 *
 * Uso: STRAPI_BACKUP_DIR=../_backup-strapi-2026-10-15 pnpm payload run scripts/import-strapi.ts
 * (el directorio debe tener data.db y uploads/ descomprimido)
 */
import config from '@payload-config'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import path from 'path'
import { DatabaseSync } from 'node:sqlite'
import { getPayload, type CollectionSlug } from 'payload'

const dir = process.env.STRAPI_BACKUP_DIR
if (!dir) throw new Error('Falta STRAPI_BACKUP_DIR')

const db = new DatabaseSync(path.join(dir, 'data.db'), { readOnly: true })
const rows = (sql: string) => db.prepare(sql).all() as Record<string, any>[]

const payload = await getPayload({ config })
const editorConfig = await editorConfigFactory.default({ config: payload.config })
const toLexical = (html: string | null) =>
  html ? convertHTMLToLexical({ editorConfig, html: html.trim(), JSDOM }) : null

async function upsert(collection: CollectionSlug, field: string, value: unknown, data: Record<string, any>) {
  const { docs } = await payload.find({ collection, where: { [field]: { equals: value } }, limit: 1, depth: 0 })
  if (docs[0]) return payload.update({ collection, id: docs[0].id, data })
  return payload.create({ collection, data } as any)
}

// --- Media ---
const mediaIdByFileId = new Map<number, number>()
for (const f of rows('select id, name, url, alternative_text from files')) {
  const filename = path.basename(f.url)
  const { docs } = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1 })
  const media =
    docs[0] ??
    (await payload.create({
      collection: 'media',
      data: { alt: f.alternative_text || path.parse(f.name).name.replace(/[-_]/g, ' ') },
      filePath: path.join(dir, 'uploads', filename),
    }))
  mediaIdByFileId.set(f.id, media.id)
}
console.log(`media: ${mediaIdByFileId.size}`)

const mediaFor = (relatedType: string, relatedId: number, field: string) => {
  const link = rows(
    `select file_id from files_related_mph where related_type = '${relatedType}' and related_id = ${relatedId} and field = '${field}' order by "order"`,
  )
  return link.map((l) => mediaIdByFileId.get(l.file_id)).filter(Boolean) as number[]
}

// features en Strapi era un objeto {clave: valor}; en Payload es una lista de textos
const toFeatureList = (json: string | null) => {
  if (!json) return []
  const value = JSON.parse(json)
  const items = Array.isArray(value)
    ? value
    : Object.entries(value).map(([k, v]) => (typeof v === 'number' ? `${v} ${k}` : v))
  return items.map((text) => ({ text: String(text) }))
}

// --- Domos ---
for (const d of rows('select * from domos where published_at is not null')) {
  await upsert('domos', 'slug', d.slug, {
    name: d.name,
    slug: d.slug,
    isActive: !!d.is_active,
    description: toLexical(d.description),
    capacity: d.capacity,
    basePrice: d.base_price,
    mainImage: mediaFor('api::domo.domo', d.id, 'mainImage')[0] ?? null,
    gallery: mediaFor('api::domo.domo', d.id, 'gallery'),
    features: toFeatureList(d.features),
    amenities: toFeatureList(d.amenities),
    location: d.location,
    checkInTime: d.check_in_time,
    checkOutTime: d.check_out_time,
  })
  console.log(`domo: ${d.name}`)
}

// --- Páginas ---
for (const p of rows('select * from pages where published_at is not null')) {
  await upsert('pages', 'slug', p.slug, {
    title: p.title,
    slug: p.slug,
    isActive: !!p.is_active,
    content: toLexical(p.content),
    seoTitle: p.seo_title,
    metaDescription: p.meta_description,
    seoKeywords: p.seo_keywords,
  })
  console.log(`página: ${p.title}`)
}

// --- Temporadas ---
for (const s of rows('select * from seasons where published_at is not null')) {
  await upsert('seasons', 'name', s.name, {
    name: s.name,
    isActive: !!s.is_active,
    startDate: s.start_date,
    endDate: s.end_date,
    priceMultiplier: s.price_multiplier,
    description: s.description,
  })
  console.log(`temporada: ${s.name}`)
}

// --- Testimonios ---
for (const t of rows('select * from testimonials where published_at is not null')) {
  await upsert('testimonials', 'guestName', t.guest_name, {
    guestName: t.guest_name,
    isApproved: !!t.is_approved,
    rating: t.rating,
    comment: t.comment,
    guestImage: mediaFor('api::testimonial.testimonial', t.id, 'guestImage')[0] ?? null,
  })
  console.log(`testimonio: ${t.guest_name}`)
}

process.exit(0)
