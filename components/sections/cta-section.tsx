import Link from 'next/link'

// Cambiar a true cuando el cliente entregue public/cta-bg.jpg
const CTA_IMAGE_READY = false

export function CTASection() {
  const hasImage = CTA_IMAGE_READY

  return (
    <section className="relative py-32 flex items-center justify-center overflow-hidden">
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/cta-bg.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      ) : (
        <div className="absolute inset-0 bg-viella-deep z-0" />
      )}
      <div className="absolute inset-0 bg-[rgba(60,53,48,0.7)] z-10" />
      <div className="relative z-20 text-center px-6 max-w-xl mx-auto">
        <h2 className="font-cormorant font-semibold text-viella-cream text-5xl leading-tight">
          ¿Listo para desconectarte?
        </h2>
        <p className="font-dm-sans text-viella-beige text-sm font-light mt-4">
          Reservas disponibles todo el año
        </p>
        <Link
          href="/reservas"
          className="inline-block mt-8 px-10 py-3 bg-viella-accent text-viella-cream font-dm-sans text-xs uppercase tracking-widest hover:bg-viella-deep transition-colors duration-200"
        >
          Reservar ahora
        </Link>
      </div>
    </section>
  )
}
