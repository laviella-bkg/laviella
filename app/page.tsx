import { getDomos, getStrapiMediaUrl, getTestimonials, getHomePage } from '@/lib/strapi'
import { NavBar } from '@/components/sections/nav-bar'
import { HeroSection } from '@/components/sections/hero-section'
import { IntroSection } from '@/components/sections/intro-section'
import { SectionHeader } from '@/components/sections/section-header'
import { DomoCard, type ShowcaseDomo } from '@/components/sections/domo-card'
import { ServiciosSection } from '@/components/sections/servicios-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { CTASection } from '@/components/sections/cta-section'
import { Footer } from '@/components/sections/footer'
import type { Testimonial, HomePageContent } from '@/lib/types/strapi'

function DomosSection({ domos }: { domos: ShowcaseDomo[] }) {
  return (
    <section id="domos" className="bg-viella-sand py-24 md:py-32">
      <div className="viella-shell">
        <SectionHeader
          scriptText="Nuestros domos"
          title="Un refugio para cada plan"
          subtitle="Tres maneras de vivir La Viella: retiro en pareja, escapada compartida o una celebración rodeada de paisaje."
        />
        {domos.length ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {domos.map((domo, index) => (
              <DomoCard key={domo.slug ?? `${domo.name}-${index}`} domo={domo} />
            ))}
          </div>
        ) : (
          <p className="text-center font-dm-sans text-sm font-light leading-7 text-viella-brown">
            Próximamente nuevos domos disponibles.
          </p>
        )}
      </div>
    </section>
  )
}

export default async function HomePage() {
  let domos: any[] = []
  let testimonials: Testimonial[] = []
  let homeContent: HomePageContent | null = null
  let heroImageUrl: string | null = null
  let aboutImageUrl: string | null = null
  let ctaImageUrl: string | null = null
  let experienceImages: Array<string | null> = []
  let showcaseDomos: ShowcaseDomo[] = []

  try {
    ;[domos, testimonials, homeContent] = await Promise.all([
      getDomos(),
      getTestimonials(),
      getHomePage(),
    ])

    if (domos.length) {
      const domoImages = domos
        .flatMap((domo) => [
          getStrapiMediaUrl(domo.mainImage),
          ...(Array.isArray(domo.gallery) ? domo.gallery.map((item: any) => getStrapiMediaUrl(item)) : []),
        ])
        .filter(Boolean)

      heroImageUrl = homeContent?.heroImage
        ? getStrapiMediaUrl(homeContent.heroImage)
        : (domoImages[0] ?? null)
      aboutImageUrl = homeContent?.aboutImage
        ? getStrapiMediaUrl(homeContent.aboutImage)
        : (domoImages[1] ?? domoImages[0] ?? null)
      ctaImageUrl = homeContent?.ctaImage
        ? getStrapiMediaUrl(homeContent.ctaImage)
        : (domoImages[5] ?? domoImages[0] ?? null)
      experienceImages = [domoImages[2] ?? domoImages[0] ?? null, domoImages[3] ?? domoImages[1] ?? null, domoImages[4] ?? domoImages[0] ?? null]

      showcaseDomos = domos.slice(0, 3).map((domo) => ({
        name: domo.name,
        slug: domo.slug,
        capacityLabel:
          domo.capacity != null
            ? `${domo.capacity} ${domo.capacity === 1 ? 'adulto' : 'adultos'}`
            : undefined,
        priceLabel:
          domo.basePrice != null ? `$${domo.basePrice} usd x noche` : undefined,
        note:
          domo.description?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140),
        imageUrl: getStrapiMediaUrl(domo.mainImage) || domoImages[0] || undefined,
      }))
    }
  } catch {
    // fall back to static testimonials
  }

  return (
    <>
      <NavBar />
      <HeroSection
        imageUrl={heroImageUrl}
        scriptText="Bienvenidos a"
        title={homeContent?.heroTitle ?? 'La Viella'}
        subtitle={homeContent?.heroSubtitle ?? 'Glamping & Domo · Sierra de los Padres · Mar del Plata'}
        ctaLabel={homeContent?.heroCtaLabel ?? 'Explorar experiencia'}
        ctaHref="/#about"
      />
      <IntroSection
        imageUrl={aboutImageUrl}
        title={homeContent?.aboutTitle}
        description={homeContent?.aboutDescription}
        locationTitle={homeContent?.aboutLocationTitle}
        locationSubtitle={homeContent?.aboutLocationSubtitle}
        climaTitle={homeContent?.aboutClimaTitle}
        climaSubtitle={homeContent?.aboutClimaSubtitle}
      />
      <DomosSection domos={showcaseDomos} />
      <ServiciosSection
        images={experienceImages}
        title={homeContent?.serviciosTitle}
        subtitle={homeContent?.serviciosSubtitle}
        items={homeContent?.servicios?.map((s) => ({
          title: s.title,
          description: s.description,
          imageUrl: s.image ? getStrapiMediaUrl(s.image) : null,
        }))}
      />
      <TestimonialsSection testimonials={testimonials} />
      <CTASection
        imageUrl={ctaImageUrl}
        title={homeContent?.ctaTitle}
        description={homeContent?.ctaDescription}
        hoursWeekdaysLabel={homeContent?.ctaHoursWeekdaysLabel}
        hoursWeekdays={homeContent?.ctaHoursWeekdays}
        hoursWeekendLabel={homeContent?.ctaHoursWeekendLabel}
        hoursWeekend={homeContent?.ctaHoursWeekend}
        address={homeContent?.ctaAddress}
        phone={homeContent?.ctaPhone}
        email={homeContent?.ctaEmail}
      />
      <Footer />
    </>
  )
}
