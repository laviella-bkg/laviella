import Image from 'next/image'
import Link from 'next/link'

interface HeroSectionProps {
  imageUrl?: string | null
  scriptText: string
  title: string
  subtitle?: string
  ctaLabel: string
  ctaHref: string
  height?: '100vh' | '60vh'
}

export function HeroSection({
  imageUrl,
  scriptText,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  height = '100vh',
}: HeroSectionProps) {
  const heightClass =
    height === '100vh' ? 'h-screen min-h-[600px]' : 'h-[60vh] min-h-[400px]'
  const titleSize =
    height === '100vh'
      ? 'text-[3rem] md:text-[5rem]'
      : 'text-[2.5rem] md:text-[3.5rem]'

  return (
    <section className={`relative flex items-center justify-center ${heightClass}`}>
      {/* Imagen de fondo */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover z-0"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-viella-deep z-0" />
      )}

      {/* Overlay gradiente */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[rgba(60,53,48,0.35)] to-[rgba(60,53,48,0.65)]" />

      {/* Contenido */}
      <div className="relative z-20 text-center px-6 max-w-2xl mx-auto">
        <p className="font-dancing text-viella-beige text-lg mb-2">{scriptText}</p>
        <h1
          className={`font-cormorant font-semibold text-viella-cream leading-none ${titleSize}`}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="font-dm-sans text-viella-beige text-xs uppercase tracking-[0.2em] mt-4">
            {subtitle}
          </p>
        )}
        <Link
          href={ctaHref}
          className="inline-block mt-8 px-8 py-3 border border-viella-cream text-viella-cream font-dm-sans text-xs uppercase tracking-widest hover:bg-viella-cream hover:text-viella-deep transition-colors duration-200"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  )
}
