import { Star } from 'lucide-react'
import { SectionHeader } from './section-header'
import type { Testimonial } from '@/lib/types/strapi'

type LandingTestimonial = Pick<Testimonial, 'guestName' | 'rating' | 'comment' | 'domo'> & {
  id?: number
}

function TestimonialCard({ testimonial }: { testimonial: LandingTestimonial }) {
  return (
    <div className="rounded-[1.75rem] border border-viella-brown/10 bg-white/60 p-7 shadow-[0_18px_48px_rgba(60,53,48,0.08)] backdrop-blur-sm">
      <p className="mb-3 font-cormorant text-5xl leading-none text-viella-accent">"</p>
      <p className="font-dm-sans text-sm font-light leading-7 text-viella-brown">
        {testimonial.comment}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="font-dm-sans text-sm font-medium text-viella-deep">
            {testimonial.guestName}
          </p>
          {testimonial.domo && (
            <p className="mt-0.5 font-dm-sans text-xs font-light text-viella-brown">
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
                className={
                  i < testimonial.rating!
                    ? 'fill-viella-accent text-viella-accent'
                    : 'text-viella-brown/30'
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const items: LandingTestimonial[] = testimonials.length
    ? testimonials.slice(0, 3)
    : [
        {
          guestName: 'Martina',
          rating: 5,
          comment:
            'Nos encantó la tranquilidad del lugar y la sensación de desconexión total. Todo invita a bajar el ritmo.',
        },
        {
          guestName: 'Milena',
          rating: 5,
          comment:
            'El espacio común, la matera y el domo se sienten cuidados con muchísimo detalle. Es cálido y muy sereno.',
        },
        {
          guestName: 'Peter',
          rating: 5,
          comment:
            'El glamping está muy bien organizado y Verónica fue súper amable. Todos los espacios comunes están muy cuidados y las camas son excelentes.',
        },
      ]

  return (
    <section className="bg-viella-cream py-24 md:py-32">
      <div className="viella-shell">
        <SectionHeader
          scriptText="Opiniones"
          title="Calma y confort que se recuerdan"
          subtitle="Tres voces para una misma sensación: descanso, paisaje y una hospitalidad que se nota en los detalles."
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((t, i) => (
            <TestimonialCard key={(t as any).id ?? i} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  )
}
