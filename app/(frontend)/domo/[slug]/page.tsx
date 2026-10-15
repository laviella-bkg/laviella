import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBookedDates, getDomoBySlug, getDomos, getSeasons, getTestimonials } from "@/lib/cms"
import { DomoDetail } from "./domo-detail"

// Estática; Payload la invalida al cambiar el domo o sus reservas. Revalida cada hora como respaldo.
export const revalidate = 3600

export async function generateStaticParams() {
  try {
    return (await getDomos()).map((domo) => ({ slug: domo.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const domo = await getDomoBySlug(slug)
  return { title: domo ? `${domo.name} | La Viella Glamping` : "Domo no encontrado" }
}

export default async function DomoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const domo = await getDomoBySlug(slug)
  if (!domo) notFound()

  const [testimonials, bookedDates, seasons] = await Promise.all([
    getTestimonials(domo.id),
    getBookedDates(domo.id),
    getSeasons(),
  ])

  return <DomoDetail domo={domo} testimonials={testimonials} bookedDates={bookedDates} seasons={seasons} />
}
