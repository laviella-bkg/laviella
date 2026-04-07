import { Flame, Coffee, Waves, Star } from 'lucide-react'
import { SectionHeader } from './section-header'

const servicios = [
  {
    icon: Flame,
    title: 'Fogón',
    description: 'Noches alrededor del fuego bajo las estrellas',
  },
  {
    icon: Coffee,
    title: 'Matera',
    description: 'Despertate con vista y mate en mano',
  },
  {
    icon: Waves,
    title: 'Pileta',
    description: 'Refrescate en plena sierra',
  },
  {
    icon: Star,
    title: 'Cielo estrellado',
    description: 'Astronomía lejos de la ciudad',
  },
]

export function ServiciosSection() {
  return (
    <section className="bg-viella-cream py-20">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader scriptText="experiencias" title="Más que alojamiento" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {servicios.map((s) => (
            <div key={s.title} className="text-center">
              <div className="flex justify-center mb-4">
                <s.icon size={32} className="text-viella-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-cormorant font-semibold text-viella-deep text-xl mb-2">
                {s.title}
              </h3>
              <p className="font-dm-sans text-viella-brown text-sm font-light leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
