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
import type { Testimonial } from '@/lib/types/strapi'
import { getTestimonials } from '@/lib/strapi'

function DomosSection({ domos }: { domos: any[] }) {
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

export default async function HomePage() {
  let domos: any[] = []
  let testimonials: Testimonial[] = []
  let heroImageUrl: string | null = null

  try {
    ;[domos, testimonials] = await Promise.all([getDomos(), getTestimonials()])
    if (domos.length > 0) {
      heroImageUrl = getStrapiMediaUrl(domos[0].mainImage)
    }
  } catch {
    // fallbacks: fondo sólido y secciones dependientes de API vacías
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
      <DomosSection domos={domos} />
      <ServiciosSection />
      <TestimonialsSection testimonials={testimonials} />
      <CTASection />
      <Footer />
    </>
  )
}
