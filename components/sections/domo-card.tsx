import Image from 'next/image'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { getStrapiMediaUrl } from '@/lib/strapi'
import type { Domo } from '@/lib/types/strapi'

interface DomoCardProps {
  domo: Domo
}

export function DomoCard({ domo }: DomoCardProps) {
  const imageUrl = getStrapiMediaUrl(domo.mainImage)

  return (
    <Link href={`/domo/${domo.slug}`} className="block group">
      <div className="relative rounded-lg overflow-hidden h-[360px]">
        {/* Imagen de fondo z-0 */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={domo.name}
            fill
            className="object-cover z-0 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-viella-deep z-0" />
        )}

        {/* Overlay gradiente z-10 */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[rgba(60,53,48,0.85)] via-transparent to-transparent" />

        {/* Contenido z-20 */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
          <h3 className="font-cormorant font-semibold text-viella-cream text-2xl leading-tight">
            {domo.name}
          </h3>
          {domo.capacity && (
            <p className="font-dm-sans text-viella-beige text-xs mt-1 flex items-center gap-1 font-light">
              <Users size={12} />
              {domo.capacity} {domo.capacity === 1 ? 'huésped' : 'huéspedes'}
            </p>
          )}
          <div className="flex items-center justify-between mt-4">
            {domo.basePrice && (
              <p className="font-cormorant text-viella-beige text-lg">
                ${domo.basePrice}
                <span className="font-dm-sans text-xs font-light ml-1">/ noche</span>
              </p>
            )}
            <span className="font-dm-sans text-viella-cream text-xs uppercase tracking-wider border border-viella-cream/50 px-3 py-1 rounded-sm group-hover:bg-viella-cream group-hover:text-viella-deep transition-colors duration-200">
              Ver detalle
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
