import { Star } from 'lucide-react'
import { SectionHeader } from './section-header'
import type { Testimonial } from '@/lib/types/strapi'

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-[rgba(244,241,237,0.07)] rounded-lg p-6">
      <p className="font-cormorant text-viella-accent text-5xl leading-none mb-3">"</p>
      <p className="font-dm-sans text-viella-beige text-sm font-light leading-relaxed">
        {testimonial.comment}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="font-dm-sans text-viella-cream text-sm font-medium">
            {testimonial.guestName}
          </p>
          {testimonial.domo && (
            <p className="font-dm-sans text-viella-brown text-xs font-light mt-0.5">
              {(testimonial.domo as any)?.name ?? ''}
            </p>
          )}
        </div>
        {testimonial.rating && (
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < testimonial.rating! ? 'text-viella-accent fill-viella-accent' : 'text-viella-brown'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) return null

  return (
    <section className="bg-viella-deep py-20">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader
          scriptText="lo que dicen"
          title="Experiencias reales"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((t, i) => (
            <TestimonialCard key={(t as any).id ?? i} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
