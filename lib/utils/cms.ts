// Utilidades puras, usables en cliente y servidor
import type { Domo, Media, PriceCalculation, Season } from '../types/cms';

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

/** El precio por noche incluye 2 personas */
export const BASE_GUESTS = 2;

export function formatUSD(amount: number): string {
  return `U$S ${amount.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * Precio total noche por noche: tarifa de semana o de fin de semana (viernes y sábado),
 * más personas adicionales, por el multiplicador de temporada.
 * Se usa igual en el cliente (para mostrar) y en el servidor (para guardar la reserva).
 */
export function calculatePrice(
  domo: Pick<Domo, 'basePrice' | 'weekendPrice' | 'extraGuestPrice'>,
  guests: number,
  seasons: Pick<Season, 'startDate' | 'endDate' | 'priceMultiplier'>[],
  checkIn: string,
  checkOut: string,
): PriceCalculation {
  const nights = calculateNights(checkIn, checkOut);
  const extraGuests = Math.max(0, guests - BASE_GUESTS);
  const extraPerNight = extraGuests * (domo.extraGuestPrice || 0);
  let weekdayNights = 0;
  let weekendNights = 0;
  let total = 0;

  for (let i = 0; i < nights; i++) {
    const date = new Date(Date.parse(`${checkIn}T12:00:00Z`) + i * 86400000);
    const night = date.toISOString().slice(0, 10);
    const isWeekend = !!domo.weekendPrice && (date.getUTCDay() === 5 || date.getUTCDay() === 6);
    const season = seasons.find((s) => s.startDate.slice(0, 10) <= night && night <= s.endDate.slice(0, 10));
    if (isWeekend) weekendNights++;
    else weekdayNights++;
    total += ((isWeekend ? domo.weekendPrice! : domo.basePrice) + extraPerNight) * (season?.priceMultiplier || 1);
  }

  const lines: PriceCalculation['lines'] = [];
  if (weekdayNights) {
    lines.push({ label: `${formatUSD(domo.basePrice)} x ${plural(weekdayNights, 'noche')}`, amount: domo.basePrice * weekdayNights });
  }
  if (weekendNights) {
    lines.push({
      label: `${formatUSD(domo.weekendPrice!)} x ${plural(weekendNights, 'noche')} de fin de semana (con late check-out)`,
      amount: domo.weekendPrice! * weekendNights,
    });
  }
  if (extraPerNight) {
    lines.push({
      label: `${plural(extraGuests, 'persona')} adicional${extraGuests === 1 ? '' : 'es'} x ${plural(nights, 'noche')}`,
      amount: extraPerNight * nights,
    });
  }
  const seasonAdjustment = total - lines.reduce((sum, l) => sum + l.amount, 0);
  if (Math.abs(seasonAdjustment) >= 0.01) lines.push({ label: 'Ajuste de temporada', amount: seasonAdjustment });

  return { nights, lines, total: Math.round(total * 100) / 100 };
}
