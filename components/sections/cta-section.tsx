import Link from 'next/link'
import Image from 'next/image'

interface CTASectionProps {
  imageUrl?: string | null
  title?: string
  description?: string
  hoursWeekdaysLabel?: string
  hoursWeekdays?: string
  hoursWeekendLabel?: string
  hoursWeekend?: string
  address?: string
  phone?: string
  email?: string
}

export function CTASection({
  imageUrl,
  title = 'Planificá tu estadía con calma.',
  description = 'Horarios de atención, contacto y ubicación para reservar tu próxima escapada entre domos, naturaleza y tiempo lento.',
  hoursWeekdaysLabel = 'Lunes a viernes',
  hoursWeekdays = '9:00 am - 9:00 pm',
  hoursWeekendLabel = 'Sábado y domingo',
  hoursWeekend = '10:00 am - 7:00 pm',
  address = 'Sierra de los Padres\nCiudad de Roma y Río Blanco',
  phone = '+54 223 423 5266',
  email = 'laviella.glamp@gmail.com',
}: CTASectionProps) {
  const addressLines = address.split('\n')

  return (
    <section id="reservas" className="relative overflow-hidden bg-viella-deep py-24 text-viella-cream md:py-32">
      <div className="absolute inset-0 opacity-30">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            aria-hidden
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#6e6258,#352f2b)]" />
        )}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,18,17,0.9),rgba(22,18,17,0.78))]" />
      <div className="viella-shell relative z-10 grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
        <div className="max-w-xl">
          <p className="viella-kicker mb-4 text-viella-beige/75">Reservas</p>
          <h2 className="font-cormorant text-5xl font-semibold leading-[0.92] text-viella-cream md:text-6xl">
            {title}
          </h2>
          <p className="mt-6 max-w-lg font-dm-sans text-base font-light leading-8 text-viella-beige/82">
            {description}
          </p>
          <Link
            href="/reservas"
            className="mt-10 inline-flex rounded-full bg-viella-cream px-8 py-3 font-dm-sans text-[0.72rem] uppercase tracking-[0.34em] text-viella-deep transition-colors hover:bg-white"
          >
            Reservar ahora
          </Link>
        </div>

        <div className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/6 p-7 backdrop-blur-sm md:grid-cols-2 md:p-9">
          <div>
            <p className="viella-kicker mb-3 text-viella-beige/75">Horarios de atención</p>
            <p className="font-cormorant text-2xl text-viella-cream">{hoursWeekdaysLabel}</p>
            <p className="mt-1 font-dm-sans text-sm font-light text-viella-beige/80">
              {hoursWeekdays}
            </p>
            <p className="mt-5 font-cormorant text-2xl text-viella-cream">{hoursWeekendLabel}</p>
            <p className="mt-1 font-dm-sans text-sm font-light text-viella-beige/80">
              {hoursWeekend}
            </p>
          </div>
          <div>
            <p className="viella-kicker mb-3 text-viella-beige/75">Información</p>
            <p className="font-dm-sans text-sm font-light leading-7 text-viella-beige/84">
              {addressLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < addressLines.length - 1 && <br />}
                </span>
              ))}
              <br />
              {phone}
              <br />
              {email}
            </p>
            <p className="mt-5 font-dm-sans text-sm uppercase tracking-[0.24em] text-viella-beige/72">
              ¡Etiquetanos!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
