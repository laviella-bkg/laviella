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
    <section className={`relative flex items-center justify-center overflow-hidden ${heightClass}`}>
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

      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(25,21,19,0.22)_0%,rgba(25,21,19,0.35)_35%,rgba(25,21,19,0.72)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 z-10 h-40 bg-[linear-gradient(180deg,transparent,rgba(239,235,229,0.96))]" />

      <div className="relative z-20 mx-auto flex w-full max-w-6xl items-end px-6 pb-24 pt-32 md:px-10">
        <div className="max-w-3xl">
        <p className="mb-5 font-dm-sans text-[0.72rem] uppercase tracking-[0.55em] text-white/82">
          {scriptText}
        </p>
        <h1
          className={`font-cormorant font-semibold leading-[0.9] text-viella-beige drop-shadow-[0_16px_40px_rgba(0,0,0,0.28)] ${titleSize}`}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 max-w-md font-dm-sans text-sm uppercase tracking-[0.32em] text-white/80 md:text-[0.82rem]">
            {subtitle}
          </p>
        )}
        <Link
          href={ctaHref}
          className="mt-10 inline-flex rounded-full border border-white/35 px-8 py-3 font-dm-sans text-[0.72rem] uppercase tracking-[0.34em] text-white transition-colors duration-200 hover:bg-white hover:text-viella-deep"
        >
          {ctaLabel}
        </Link>
        </div>
      </div>
    </section>
  )
}
