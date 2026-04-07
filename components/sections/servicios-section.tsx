import Image from 'next/image'
import { SectionHeader } from './section-header'

interface OutdoorArea {
  title: string
  description: string
  imageUrl?: string | null
}

const serviciosBase = [
  {
    title: 'Fogón',
    description:
      'Fogón común ubicado entre el domo Sauco y el principal. Cuenta con leña para iniciar el fuego y un disco para cocinar.',
  },
  {
    title: 'Matera',
    description:
      'Al lado del fogón hay un sector con techo con heladera, bacha, pava, cocina, ollas, utensilios, mesa y sillas.',
  },
  {
    title: 'Pileta',
    description:
      'Alejado de los domos, el tanque australiano con deck de madera suma sombra, cortinas y una atmósfera serena para los días de sol.',
  },
]

export function ServiciosSection({ images = [] }: { images?: Array<string | null> }) {
  const servicios: OutdoorArea[] = serviciosBase.map((item, index) => ({
    ...item,
    imageUrl: images[index] ?? null,
  }))

  return (
    <section id="experiencias" className="bg-viella-sand py-24 md:py-32">
      <div className="viella-shell">
        <SectionHeader
          scriptText="Sectores exteriores"
          title="Rituales compartidos, tardes sin prisa"
          subtitle="La experiencia no termina en el domo: también se vive entre fuego, sombra, madera y paisaje."
        />
        <div className="space-y-14">
          {servicios.map((s, index) => (
            <article
              key={s.title}
              className={`grid gap-8 lg:grid-cols-2 lg:items-center ${index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-[0_24px_70px_rgba(60,53,48,0.1)]">
                {s.imageUrl ? (
                  <Image src={s.imageUrl} alt={s.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#d9d1c6,#b7ab9f)]" />
                )}
              </div>
              <div className="max-w-xl px-2">
                <p className="viella-kicker mb-3">Espacio exterior</p>
                <h3 className="font-cormorant text-4xl font-semibold text-viella-deep md:text-5xl">
                  {s.title}
                </h3>
                <p className="mt-5 font-dm-sans text-base font-light leading-8 text-viella-brown">
                  {s.description}
                </p>
                <div className="mt-6 h-px w-24 bg-viella-accent/30" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
