import { getDomos, getStrapiMediaUrl } from '@/lib/strapi'
import { NavBar } from '@/components/sections/nav-bar'
import { HeroSection } from '@/components/sections/hero-section'
import { IntroSection } from '@/components/sections/intro-section'
import { SectionHeader } from '@/components/sections/section-header'
import { DomoCard } from '@/components/sections/domo-card'
import { ServiciosSection } from '@/components/sections/servicios-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { CTASection } from '@/components/sections/cta-section'
import { Footer } from '@/components/sections/footer'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'

async function DomosSection() {
  let domos: any[] = []
  try {
    domos = await getDomos()
  } catch {
    return null
  }

  return (
    <section id="domos" className="bg-viella-sand py-20">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader scriptText="nuestros domos" title="Elegí tu refugio" />
        {domos.length === 0 ? (
          <p className="text-center font-dm-sans text-viella-brown font-light">
            Próximamente nuevos domos disponibles.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domos.map((domo) => (
              <DomoCard key={domo.id ?? domo.slug} domo={domo} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function DomosSkeleton() {
  return (
    <section className="bg-viella-sand py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <Skeleton className="h-5 w-32 mx-auto mb-2 bg-viella-beige" />
          <Skeleton className="h-10 w-64 mx-auto bg-viella-beige" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[360px] rounded-lg bg-viella-beige" />
          ))}
        </div>
      </div>
    </section>
  )
}

export default async function HomePage() {
  // Obtener imagen hero del primer domo
  let heroImageUrl: string | null = null
  try {
    const domos = await getDomos()
    if (domos.length > 0) {
      heroImageUrl = getStrapiMediaUrl(domos[0].mainImage)
    }
  } catch {
    // fallback a fondo sólido
  }

  return (
    <>
      <NavBar />
      <HeroSection
        imageUrl={heroImageUrl}
        scriptText="glamping & domos"
        title="La Viella"
        subtitle="Sierras de Córdoba · Argentina"
        ctaLabel="Reservar ahora"
        ctaHref="/reservas"
      />
      <IntroSection />
      <Suspense fallback={<DomosSkeleton />}>
        <DomosSection />
      </Suspense>
      <ServiciosSection />
      <Suspense fallback={null}>
        <TestimonialsSection />
      </Suspense>
      <CTASection />
      <Footer />
    </>
  )
}
