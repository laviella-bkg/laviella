// Utilidades puras, usables en cliente y servidor
import type { Media, PriceCalculation, Season } from '../types/cms';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

export function getMediaUrl(media: Media | null | undefined, options?: { fallback?: string }): string {
  return media?.url || options?.fallback || FALLBACK_IMAGE;
}

/** Fecha local como YYYY-MM-DD (lo que el huésped ve en el calendario) */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Noches entre dos fechas YYYY-MM-DD */
export function calculateNights(checkIn: string, checkOut: string): number {
  const diff = Date.parse(`${checkOut}T12:00:00Z`) - Date.parse(`${checkIn}T12:00:00Z`);
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

export const CLEANING_FEE = 25;
export const TAXES_FEE = 15;

/**
 * Precio total aplicando el multiplicador de temporada noche por noche.
 * Se usa igual en el cliente (para mostrar) y en el servidor (para guardar la reserva).
 */
export function calculatePrice(
  basePrice: number,
  seasons: Pick<Season, 'startDate' | 'endDate' | 'priceMultiplier'>[],
  checkIn: string,
  checkOut: string,
): PriceCalculation {
  const nights = calculateNights(checkIn, checkOut);
  const pricePerNight: number[] = [];
  const seasonDetails: PriceCalculation['seasons'] = [];

  for (let i = 0; i < nights; i++) {
    const night = new Date(Date.parse(`${checkIn}T12:00:00Z`) + i * 86400000).toISOString().slice(0, 10);
    const season = seasons.find((s) => s.startDate.slice(0, 10) <= night && night <= s.endDate.slice(0, 10));
    const nightPrice = basePrice * (season?.priceMultiplier || 1);
    pricePerNight.push(nightPrice);

    if (season) {
      const existing = seasonDetails.find((s) => s.startDate === season.startDate);
      if (existing) {
        existing.nights += 1;
        existing.price += nightPrice;
      } else {
        seasonDetails.push({
          startDate: season.startDate,
          endDate: season.endDate,
          multiplier: season.priceMultiplier,
          nights: 1,
          price: nightPrice,
        });
      }
    }
  }

  const subtotal = pricePerNight.reduce((sum, p) => sum + p, 0);
  return {
    basePrice,
    nights,
    pricePerNight,
    seasons: seasonDetails,
    subtotal,
    fees: { cleaning: CLEANING_FEE, taxes: TAXES_FEE },
    total: subtotal + CLEANING_FEE + TAXES_FEE,
  };
}
