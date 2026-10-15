// Lectura de contenido desde Payload (Local API, solo servidor)
import config from '@payload-config'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import { getPayload } from 'payload'

import type {
  Domo as PayloadDomo,
  Media as PayloadMedia,
  Page as PayloadPage,
  Testimonial as PayloadTestimonial,
} from '@/cms/payload-types'
import type { Domo, HomePageContent, Media, Page, Season, Testimonial } from './types/cms'
import { toNoonUTC } from '@/cms/access'

export const cms = () => getPayload({ config })

const toHTML = (data: unknown) =>
  data ? convertLexicalToHTML({ data: data as Parameters<typeof convertLexicalToHTML>[0]['data'] }) : ''

function mapMedia(m: number | PayloadMedia | null | undefined): Media | null {
  if (!m || typeof m !== 'object' || !m.url) return null
  return { id: m.id, url: m.url, alternativeText: m.alt, width: m.width ?? undefined, height: m.height ?? undefined }
}

function mapDomo(d: PayloadDomo): Domo {
  return {
    id: d.id,
    name: d.name,
    slug: d.slug,
    description: toHTML(d.description),
    capacity: d.capacity,
    basePrice: d.basePrice,
    isActive: d.isActive ?? true,
    features: (d.features ?? []).map((f) => f.text),
    amenities: (d.amenities ?? []).map((a) => a.text),
    location: d.location ?? undefined,
    checkInTime: d.checkInTime ?? undefined,
    checkOutTime: d.checkOutTime ?? undefined,
    mainImage: mapMedia(d.mainImage),
    gallery: (d.gallery ?? []).map(mapMedia).filter((m): m is Media => !!m),
  }
}

function mapPage(p: PayloadPage): Page {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    content: toHTML(p.content),
    isActive: p.isActive ?? true,
    seoTitle: p.seoTitle ?? undefined,
    metaDescription: p.metaDescription ?? undefined,
    seoKeywords: p.seoKeywords ?? undefined,
  }
}

function mapTestimonial(t: PayloadTestimonial): Testimonial {
  return {
    id: t.id,
    guestName: t.guestName,
    rating: t.rating ?? 5,
    comment: t.comment,
    isApproved: t.isApproved ?? true,
    guestImage: mapMedia(t.guestImage),
    domo: t.domo && typeof t.domo === 'object' ? { name: t.domo.name } : null,
  }
}

// ── Domos ────────────────────────────────────────────────────────────

export async function getDomos(): Promise<Domo[]> {
  const { docs } = await (await cms()).find({
    collection: 'domos',
    where: { isActive: { equals: true } },
    sort: 'createdAt',
    depth: 1,
    pagination: false,
  })
  return docs.map(mapDomo)
}

export async function getDomoBySlug(slug: string): Promise<Domo | null> {
  const { docs } = await (await cms()).find({
    collection: 'domos',
    where: { slug: { equals: slug }, isActive: { equals: true } },
    depth: 1,
    limit: 1,
  })
  return docs[0] ? mapDomo(docs[0]) : null
}

/** Noches ocupadas (YYYY-MM-DD) de un domo, desde hoy en adelante */
export async function getBookedDates(domoId: number): Promise<string[]> {
  const { docs } = await (await cms()).find({
    collection: 'reservations',
    where: {
      domo: { equals: domoId },
      reservationStatus: { in: ['draft', 'confirmed', 'blocked'] },
      checkOut: { greater_than: toNoonUTC(new Date().toISOString()) },
    },
    select: { checkIn: true, checkOut: true },
    depth: 0,
    pagination: false,
  })

  const dates: string[] = []
  for (const r of docs) {
    for (let t = Date.parse(r.checkIn); t < Date.parse(r.checkOut); t += 86400000) {
      dates.push(new Date(t).toISOString().slice(0, 10))
    }
  }
  return dates
}

/** true si el domo no tiene reservas activas que se solapen con el rango */
export async function isDomoAvailable(domoId: number, checkIn: string, checkOut: string): Promise<boolean> {
  const { totalDocs } = await (await cms()).count({
    collection: 'reservations',
    where: {
      domo: { equals: domoId },
      reservationStatus: { not_equals: 'cancelled' },
      checkIn: { less_than: toNoonUTC(checkOut) },
      checkOut: { greater_than: toNoonUTC(checkIn) },
    },
  })
  return totalDocs === 0
}

// ── Páginas ──────────────────────────────────────────────────────────

export async function getPages(): Promise<Page[]> {
  const { docs } = await (await cms()).find({
    collection: 'pages',
    where: { isActive: { equals: true } },
    sort: 'createdAt',
    pagination: false,
  })
  return docs.map(mapPage)
}

export async function getPage(slug: string): Promise<Page | null> {
  const { docs } = await (await cms()).find({
    collection: 'pages',
    where: { slug: { equals: slug }, isActive: { equals: true } },
    limit: 1,
  })
  return docs[0] ? mapPage(docs[0]) : null
}

// ── Testimonios ──────────────────────────────────────────────────────

export async function getTestimonials(domoId?: number): Promise<Testimonial[]> {
  const { docs } = await (await cms()).find({
    collection: 'testimonials',
    where: {
      isApproved: { equals: true },
      ...(domoId ? { domo: { equals: domoId } } : {}),
    },
    sort: '-createdAt',
    depth: 1,
    pagination: false,
  })
  return docs.map(mapTestimonial)
}

// ── Temporadas ───────────────────────────────────────────────────────

export async function getSeasons(): Promise<Season[]> {
  const { docs } = await (await cms()).find({
    collection: 'seasons',
    where: { isActive: { equals: true } },
    sort: 'startDate',
    pagination: false,
  })
  return docs.map((s) => ({
    id: s.id,
    name: s.name,
    startDate: s.startDate,
    endDate: s.endDate,
    priceMultiplier: s.priceMultiplier,
    isActive: s.isActive ?? true,
    description: s.description ?? undefined,
  }))
}

// ── Home ─────────────────────────────────────────────────────────────

export async function getHomePage(): Promise<HomePageContent | null> {
  const h = await (await cms()).findGlobal({ slug: 'home-page', depth: 1 })
  if (!h) return null
  const text = (v: string | null | undefined) => v ?? undefined
  return {
    heroTitle: text(h.heroTitle),
    heroSubtitle: text(h.heroSubtitle),
    heroCtaLabel: text(h.heroCtaLabel),
    heroImage: mapMedia(h.heroImage),
    aboutTitle: text(h.aboutTitle),
    aboutDescription: text(h.aboutDescription),
    aboutLocationTitle: text(h.aboutLocationTitle),
    aboutLocationSubtitle: text(h.aboutLocationSubtitle),
    aboutClimaTitle: text(h.aboutClimaTitle),
    aboutClimaSubtitle: text(h.aboutClimaSubtitle),
    aboutImage: mapMedia(h.aboutImage),
    serviciosTitle: text(h.serviciosTitle),
    serviciosSubtitle: text(h.serviciosSubtitle),
    servicios: h.servicios?.length
      ? h.servicios.map((s) => ({ id: s.id, title: s.title, description: text(s.description), image: mapMedia(s.image) }))
      : undefined,
    ctaTitle: text(h.ctaTitle),
    ctaDescription: text(h.ctaDescription),
    ctaHoursWeekdaysLabel: text(h.ctaHoursWeekdaysLabel),
    ctaHoursWeekdays: text(h.ctaHoursWeekdays),
    ctaHoursWeekendLabel: text(h.ctaHoursWeekendLabel),
    ctaHoursWeekend: text(h.ctaHoursWeekend),
    ctaAddress: text(h.ctaAddress),
    ctaPhone: text(h.ctaPhone),
    ctaEmail: text(h.ctaEmail),
    ctaImage: mapMedia(h.ctaImage),
  }
}
