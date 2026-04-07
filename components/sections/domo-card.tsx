import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export interface ShowcaseDomo {
  name: string
  slug?: string
  capacityLabel?: string
  priceLabel?: string
  note?: string
  imageUrl?: string | null
}

interface DomoCardProps {
  domo: ShowcaseDomo
}

export function DomoCard({ domo }: DomoCardProps) {
  return (
    <Link href={domo.slug ? `/domo/${domo.slug}` : '/reservas'} className="group block">
      <article className="overflow-hidden rounded-[2rem] border border-viella-brown/10 bg-viella-cream shadow-[0_24px_70px_rgba(60,53,48,0.08)] transition-transform duration-500 group-hover:-translate-y-1">
        <div className="relative h-[360px] overflow-hidden">
        {domo.imageUrl ? (
          <Image
            src={domo.imageUrl}
            alt={domo.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-viella-deep" />
        )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,14,13,0.04),rgba(16,14,13,0.42))]" />
        </div>
        <div className="space-y-5 p-7 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="viella-kicker mb-3">Alojamiento</p>
              <h3 className="font-cormorant text-3xl font-semibold leading-none text-viella-deep">
                {domo.name}
              </h3>
            </div>
            <span className="mt-1 rounded-full border border-viella-brown/15 p-2 text-viella-accent transition-colors group-hover:bg-viella-accent group-hover:text-white">
              <ArrowUpRight size={16} />
            </span>
          </div>
          {domo.capacityLabel && (
            <p className="font-dm-sans text-sm uppercase tracking-[0.22em] text-viella-brown/80">
              {domo.capacityLabel}
            </p>
          )}
          {domo.priceLabel && (
            <p className="font-cormorant text-2xl text-viella-olive">{domo.priceLabel}</p>
          )}
          {domo.note && (
            <p className="font-dm-sans text-sm font-light leading-7 text-viella-brown">
              {domo.note}
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
