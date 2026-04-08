import Image from 'next/image'

interface IntroSectionProps {
  imageUrl?: string | null
  title?: string
  description?: string
  locationTitle?: string
  locationSubtitle?: string
  climaTitle?: string
  climaSubtitle?: string
}

export function IntroSection({
  imageUrl,
  title = 'Desconecta del ruido. Conecta con lo esencial.',
  description = 'Un refugio íntimo donde la aventura y la comodidad se encuentran para crear una forma distinta de descansar. En nuestros domos vivís la experiencia del glamping, pero con el confort y el cuidado de un espacio pensado para que solo te ocupes de disfrutar.',
  locationTitle = 'Sierra de los Padres',
  locationSubtitle = 'Mar del Plata, Argentina',
  climaTitle = 'Naturaleza, calma y calidez',
  climaSubtitle = 'Un refugio boutique con domos y espacios compartidos al aire libre',
}: IntroSectionProps) {
  return (
    <section id="about" className="bg-viella-cream py-24 md:py-32">
      <div className="viella-shell grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="relative overflow-hidden rounded-[2rem] bg-viella-sand shadow-[0_30px_80px_rgba(60,53,48,0.12)]">
          <div className="absolute right-5 top-5 z-10 rounded-full bg-[rgba(255,255,255,0.82)] px-4 py-2 font-dm-sans text-[0.62rem] uppercase tracking-[0.28em] text-viella-deep">
            Sobre el refugio
          </div>
          <div className="relative aspect-[5/4]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Vista del glamping"
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#d9d1c6,#bcb1a1)]" />
            )}
          </div>
        </div>

        <div className="max-w-xl">
          <p className="viella-kicker mb-4">La Viella Glamp</p>
          <h2 className="font-cormorant text-4xl font-semibold leading-[0.95] text-viella-olive md:text-5xl lg:text-6xl">
            {title}
          </h2>
          <p className="mt-8 font-dm-sans text-base font-light leading-8 text-viella-brown md:text-[1.05rem]">
            {description}
          </p>
          <div className="mt-8 grid gap-5 border-t border-viella-brown/15 pt-8 sm:grid-cols-2">
            <div>
              <p className="viella-kicker mb-2">Ubicación</p>
              <p className="font-cormorant text-2xl text-viella-deep">{locationTitle}</p>
              <p className="mt-1 font-dm-sans text-sm font-light text-viella-brown">
                {locationSubtitle}
              </p>
            </div>
            <div>
              <p className="viella-kicker mb-2">Clima</p>
              <p className="font-cormorant text-2xl text-viella-deep">{climaTitle}</p>
              <p className="mt-1 font-dm-sans text-sm font-light text-viella-brown">
                {climaSubtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
