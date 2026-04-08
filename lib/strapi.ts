// Export types for convenience
export type {
  Domo,
  Season,
  Page,
  Reservation,
  Testimonial,
  StrapiMedia,
  ReservationStatus,
  PaymentStatus,
  PriceCalculation,
  StrapiResponse,
  StrapiData,
  HomePageContent,
} from './types/strapi';

export {
  normalizeStrapiData,
  normalizeStrapiArray,
  getStrapiMediaUrl,
  buildStrapiQuery,
  calculateNights,
} from './utils/strapi';

import type {
  Domo,
  Season,
  Page,
  Reservation,
  Testimonial,
  StrapiResponse,
  StrapiData,
  PriceCalculation,
  HomePageContent,
} from './types/strapi';

import { normalizeStrapiData, normalizeStrapiArray, buildStrapiQuery, calculateNights } from './utils/strapi';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// API Token para lectura pública
// En Client Components, SOLO funciona NEXT_PUBLIC_STRAPI_API_TOKEN
// En Server Components, funciona tanto STRAPI_API_TOKEN como NEXT_PUBLIC_STRAPI_API_TOKEN
// Priorizamos NEXT_PUBLIC_ porque funciona en ambos contextos
const STRAPI_API_TOKEN = 
  (typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_STRAPI_API_TOKEN  // Client: solo NEXT_PUBLIC_ funciona
    : (process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN)); // Server: ambos funcionan

// Import JWT helper (reuse from auth module)
function getJWT(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('jwt');
  } catch {
    return null;
  }
}

// Interface para opciones de fetch con soporte de autenticación
interface StrapiFetchOptions extends RequestInit {
  useAuth?: boolean;  // Si es true, usa JWT en lugar de API Token
  noAuth?: boolean;   // Si es true, no envía ningún token (usa rol público)
}

/**
 * Helper function to make API calls to Strapi
 * Supports both API Tokens (for public read) and JWT Tokens (for authenticated operations)
 * 
 * @param endpoint - API endpoint (e.g., '/domos?populate=*')
 * @param options - Fetch options with optional useAuth flag
 * @returns Strapi API response
 * 
 * Usage:
 * - Public read (uses API Token): fetchAPI('/domos?populate=*')
 * - Authenticated write (uses JWT): fetchAPI('/reservations', { method: 'POST', useAuth: true, ... })
 */
export async function fetchAPI<T>(
  endpoint: string, 
  options: StrapiFetchOptions = {}
): Promise<StrapiResponse<T>> {
  const url = `${STRAPI_URL}/api${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  // Determine which token to use
  if (options.noAuth) {
    // Explicitly no token — use Strapi public role permissions
  } else if (options.useAuth) {
    // For authenticated operations, use JWT token
    const jwt = getJWT();
    if (jwt) {
      headers['Authorization'] = `Bearer ${jwt}`;
    } else if (STRAPI_API_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
    }
  } else {
    // For public read operations, use API Token
    if (STRAPI_API_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
    }
  }
  
  // For client-side requests, add cache control
  if (typeof window !== 'undefined') {
    headers['cache-control'] = 'no-cache';
  }
  
  // Debug logging (solo en desarrollo)
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    const jwt = getJWT();
    const tokenType = headers['Authorization'] 
      ? (jwt && headers['Authorization'].includes(jwt) ? 'JWT' : 'API Token')
      : 'none';
    
    console.log('[Strapi API Debug]', {
      url,
      hasToken: !!headers['Authorization'],
      tokenType,
      useAuth: options.useAuth,
      hasAPIToken: !!STRAPI_API_TOKEN,
      hasJWT: !!jwt,
      envVar: typeof window !== 'undefined' ? 'NEXT_PUBLIC_STRAPI_API_TOKEN' : 'STRAPI_API_TOKEN or NEXT_PUBLIC_STRAPI_API_TOKEN',
    });
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: headers as HeadersInit,
      // For server components
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      
      // Mejor mensaje de error para 403
      if (response.status === 403) {
        const hasToken = !!headers['Authorization'];
        throw new Error(
          `Strapi API Error (403 Forbidden): ${errorText || 'Access denied'}\n` +
          `Debug: ${hasToken ? 'Token was sent' : 'No token configured'}\n` +
          `Please check: 1) API Token in .env.local, 2) Permissions in Strapi Admin, 3) Records are published`
        );
      }
      
      throw new Error(
        `Strapi API Error (${response.status}): ${errorText || response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Network error: ${String(error)}`);
  }
}

// ============================================================================
// DOMOS
// ============================================================================

/**
 * Gets all active domos with full population
 */
export async function getDomos(): Promise<Domo[]> {
  const data = await fetchAPI<StrapiData<Domo>[]>(
    '/domos?populate=*&filters[isActive][$eq]=true&filters[publishedAt][$notNull]=true&sort=createdAt:asc'
  );
  return normalizeStrapiArray<Domo>(data.data);
}

/**
 * Gets a domo by slug with full population
 */
export async function getDomoBySlug(slug: string): Promise<Domo | null> {
  try {
    // Try direct query first (works in Strapi v5)
    const data = await fetchAPI<StrapiData<Domo>[]>(
      `/domos?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*&filters[isActive][$eq]=true`
    );
    
    if (data.data && data.data.length > 0) {
      return normalizeStrapiData<Domo>(data.data[0]);
    }
    
    // Fallback: fetch all and filter (for Strapi v4 compatibility)
    const allData = await fetchAPI<StrapiData<Domo>[]>('/domos?populate=*&filters[isActive][$eq]=true');
    const domo = allData.data.find((d: any) => {
      const normalized = normalizeStrapiData<Domo>(d);
      return normalized.slug === slug;
    });
    
    return domo ? normalizeStrapiData<Domo>(domo) : null;
  } catch (error) {
    console.error('Error fetching domo:', error);
    return null;
  }
}

/**
 * Legacy function name for backward compatibility
 */
export async function getDomo(slug: string): Promise<Domo | null> {
  return getDomoBySlug(slug);
}

/**
 * Gets domos filtered by availability for a date range
 */
export async function getDomosWithAvailability(
  checkIn?: string,
  checkOut?: string
): Promise<Domo[]> {
  const domos = await getDomos();
  
  if (!checkIn || !checkOut) {
    return domos;
  }
  
  // Filter domos that have availability for the given dates
  const availableDomos: Domo[] = [];
  
  for (const domo of domos) {
    if (domo.id) {
      const isAvailable = await checkAvailability(
        domo.id,
        checkIn,
        checkOut
      );
      if (isAvailable) {
        availableDomos.push(domo);
      }
    }
  }
  
  return availableDomos;
}

// ============================================================================
// RESERVATIONS
// ============================================================================

/**
 * Creates a new reservation
 * Uses authenticated request (JWT) if available, otherwise falls back to API Token
 */
export async function createReservation(
  reservationData: Partial<Reservation>
): Promise<Reservation> {
  const jwt = typeof window !== 'undefined' ? localStorage.getItem('strapi_jwt') : null;
  const data = await fetchAPI<StrapiData<Reservation>>('/reservations', {
    method: 'POST',
    body: JSON.stringify({ data: reservationData }),
    ...(jwt ? { useAuth: true } : { noAuth: true }),
  });
  return normalizeStrapiData<Reservation>(data.data);
}

/**
 * Gets reservations with optional filters
 */
export async function getReservations(filters?: {
  domoId?: number;
  guestEmail?: string;
  reservationStatus?: string[];
  checkIn?: string;
  checkOut?: string;
}): Promise<Reservation[]> {
  let query = '/reservations?populate=domo';
  
  if (filters) {
    const queryParams: string[] = [];
    
    if (filters.domoId) {
      queryParams.push(`filters[domo][id][$eq]=${filters.domoId}`);
    }
    
    if (filters.guestEmail) {
      queryParams.push(`filters[guestEmail][$eq]=${encodeURIComponent(filters.guestEmail)}`);
    }
    
    if (filters.reservationStatus && filters.reservationStatus.length > 0) {
      filters.reservationStatus.forEach((status, i) => {
        queryParams.push(`filters[reservationStatus][$in][${i}]=${status}`);
      });
    }
    
    if (filters.checkIn) {
      queryParams.push(`filters[checkIn][$gte]=${filters.checkIn}`);
    }
    
    if (filters.checkOut) {
      queryParams.push(`filters[checkOut][$lte]=${filters.checkOut}`);
    }
    
    if (queryParams.length > 0) {
      query += `&${queryParams.join('&')}`;
    }
  }
  
  const data = await fetchAPI<StrapiData<Reservation>[]>(query);
  return normalizeStrapiArray<Reservation>(data.data);
}

/**
 * Gets a single reservation by ID
 */
export async function getReservation(id: number): Promise<Reservation | null> {
  try {
    const data = await fetchAPI<StrapiData<Reservation>>(
      `/reservations/${id}?populate=domo`
    );
    return normalizeStrapiData<Reservation>(data.data);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return null;
  }
}

/**
 * Updates a reservation
 */
export async function updateReservation(
  id: number,
  updateData: Partial<Reservation>
): Promise<Reservation> {
  const data = await fetchAPI<StrapiData<Reservation>>(`/reservations/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ data: updateData }),
  });
  return normalizeStrapiData<Reservation>(data.data);
}

/**
 * Deletes a reservation
 */
export async function deleteReservation(id: number): Promise<boolean> {
  try {
    await fetchAPI(`/reservations/${id}`, {
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return false;
  }
}

/**
 * Checks if a domo is available for the given date range
 */
export async function checkAvailability(
  domoId: number,
  checkIn: string,
  checkOut: string
): Promise<boolean> {
  const startDate = new Date(checkIn).toISOString().split('T')[0];
  const endDate = new Date(checkOut).toISOString().split('T')[0];
  
  try {
    const data = await fetchAPI<StrapiData<Reservation>[]>(
      `/reservations?filters[domo][id][$eq]=${domoId}&filters[checkIn][$lte]=${endDate}&filters[checkOut][$gte]=${startDate}&filters[reservationStatus][$in][0]=confirmed&filters[reservationStatus][$in][1]=draft`
    );
    
    // A domo is available if there are no overlapping reservations
    return data.data.length === 0;
  } catch (error) {
    console.error('Error checking availability:', error);
    // On error, assume unavailable for safety
    return false;
  }
}

/**
 * Gets all booked dates for a domo (for calendar display)
 */
export async function getBookedDates(domoId: number): Promise<string[]> {
  try {
    const reservations = await getReservations({
      domoId,
      reservationStatus: ['confirmed', 'draft'],
    });
    
    const bookedDates: string[] = [];
    
    reservations.forEach((reservation) => {
      const checkIn = new Date(reservation.checkIn);
      const checkOut = new Date(reservation.checkOut);
      
      const currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        bookedDates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return bookedDates;
  } catch (error) {
    console.error('Error getting booked dates:', error);
    return [];
  }
}

// ============================================================================
// PAGES
// ============================================================================

/**
 * Gets a page by slug
 */
export async function getPage(slug: string): Promise<Page | null> {
  try {
    const data = await fetchAPI<StrapiData<Page>[]>(
      `/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&filters[isActive][$eq]=true`
    );
    
    if (data.data && data.data.length > 0) {
      return normalizeStrapiData<Page>(data.data[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

/**
 * Gets all active pages
 */
export async function getPages(): Promise<Page[]> {
  try {
    const data = await fetchAPI<StrapiData<Page>[]>(
      '/pages?filters[isActive][$eq]=true&sort=createdAt:asc'
    );
    return normalizeStrapiArray<Page>(data.data);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
}

// ============================================================================
// TESTIMONIALS
// ============================================================================

/**
 * Gets all approved testimonials
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const data = await fetchAPI<StrapiData<Testimonial>[]>(
      '/testimonials?filters[isApproved][$eq]=true&populate=*&sort=createdAt:desc'
    );
    return normalizeStrapiArray<Testimonial>(data.data);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

/**
 * Gets testimonials for a specific domo
 */
export async function getTestimonialsByDomo(domoId: number): Promise<Testimonial[]> {
  try {
    const data = await fetchAPI<StrapiData<Testimonial>[]>(
      `/testimonials?filters[isApproved][$eq]=true&filters[domo][id][$eq]=${domoId}&populate=*&sort=createdAt:desc`
    );
    return normalizeStrapiArray<Testimonial>(data.data);
  } catch (error) {
    console.error('Error fetching testimonials by domo:', error);
    return [];
  }
}

// ============================================================================
// SEASONS
// ============================================================================

/**
 * Gets all active seasons
 */
export async function getSeasons(): Promise<Season[]> {
  try {
    const data = await fetchAPI<StrapiData<Season>[]>(
      '/seasons?filters[isActive][$eq]=true&sort=startDate:asc'
    );
    return normalizeStrapiArray<Season>(data.data);
  } catch (error) {
    console.error('Error fetching seasons:', error);
    return [];
  }
}

/**
 * Gets the active season for a specific date
 */
export async function getActiveSeasonForDate(date: string | Date): Promise<Season | null> {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  
  try {
    const seasons = await getSeasons();
    
    // Find season that contains this date
    const activeSeason = seasons.find((season) => {
      const startDate = new Date(season.startDate);
      const endDate = new Date(season.endDate);
      const checkDate = new Date(dateStr);
      
      return checkDate >= startDate && checkDate <= endDate;
    });
    
    return activeSeason || null;
  } catch (error) {
    console.error('Error getting active season:', error);
    return null;
  }
}

/**
 * Gets all active seasons that overlap with a date range
 */
export async function getActiveSeasonsForDateRange(
  checkIn: string | Date,
  checkOut: string | Date
): Promise<Season[]> {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  try {
    const seasons = await getSeasons();
    
    // Find seasons that overlap with the date range
    const activeSeasons = seasons.filter((season) => {
      const seasonStart = new Date(season.startDate);
      const seasonEnd = new Date(season.endDate);
      
      // Check if seasons overlap: season starts before checkOut and ends after checkIn
      return seasonStart <= checkOutDate && seasonEnd >= checkInDate;
    });
    
    return activeSeasons;
  } catch (error) {
    console.error('Error getting active seasons for date range:', error);
    return [];
  }
}

// ============================================================================
// PRICE CALCULATION
// ============================================================================

/**
 * Calculates the total price for a reservation including season multipliers
 */
export async function calculatePriceWithSeasons(
  domo: Domo,
  checkIn: string | Date,
  checkOut: string | Date,
  fees: { cleaning?: number; taxes?: number } = {}
): Promise<PriceCalculation> {
  const nights = calculateNights(checkIn, checkOut);
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const basePrice = domo.basePrice || 0;
  
  // Get active seasons for the date range
  const seasons = await getActiveSeasonsForDateRange(checkIn, checkOut);
  
  // Calculate price per night
  const pricePerNight: number[] = [];
  const seasonDetails: PriceCalculation['seasons'] = [];
  
  let currentDate = new Date(checkInDate);
  
  while (currentDate < checkOutDate) {
    // Find active season for this date
    const activeSeason = seasons.find((season) => {
      const seasonStart = new Date(season.startDate);
      const seasonEnd = new Date(season.endDate);
      return currentDate >= seasonStart && currentDate <= seasonEnd;
    });
    
    const multiplier = activeSeason?.priceMultiplier || 1;
    const nightPrice = basePrice * multiplier;
    pricePerNight.push(nightPrice);
    
    // Track season usage
    if (activeSeason) {
      const existingSeason = seasonDetails.find(
        (s) => s.startDate === activeSeason.startDate
      );
      
      if (existingSeason) {
        existingSeason.nights += 1;
        existingSeason.price += nightPrice;
      } else {
        seasonDetails.push({
          startDate: activeSeason.startDate,
          endDate: activeSeason.endDate,
          multiplier: activeSeason.priceMultiplier,
          nights: 1,
          price: nightPrice,
        });
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const subtotal = pricePerNight.reduce((sum, price) => sum + price, 0);
  const cleaningFee = fees.cleaning || 25;
  const taxesFee = fees.taxes || 15;
  const total = subtotal + cleaningFee + taxesFee;
  
  return {
    basePrice,
    nights,
    pricePerNight,
    seasons: seasonDetails,
    subtotal,
    fees: {
      cleaning: cleaningFee,
      taxes: taxesFee,
    },
    total,
  };
}

// ============================================================================
// HOME PAGE
// ============================================================================

/**
 * Gets the Home Page Single Type content from Strapi with full media population.
 * Returns null if the content type doesn't exist yet or on any error — the frontend
 * uses hardcoded fallbacks in that case.
 */
export async function getHomePage(): Promise<HomePageContent | null> {
  try {
    const res = await fetchAPI<any>(
      '/home-page?populate[heroImage]=true&populate[aboutImage]=true&populate[ctaImage]=true&populate[servicios][populate][image]=true'
    );
    if (!res?.data) return null;
    return normalizeStrapiData(res.data) as HomePageContent;
  } catch {
    return null;
  }
}

// ============================================================================
// CONTACT
// ============================================================================

export async function submitContactMessage(data: {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
}): Promise<void> {
  await fetchAPI('/contact-messages', {
    method: 'POST',
    body: JSON.stringify({ data }),
    noAuth: true,
  });
}
// ============================================================================
// ADMIN
// ============================================================================

export interface AdminReservationFilters {
  status?: string[]
  domoId?: number
  search?: string
  checkInFrom?: string
  checkInTo?: string
}

export interface AdminMetrics {
  pending: number
  checkInsToday: number
  revenueThisMonth: number
  upcomingArrivals: Reservation[]
  recentReservations: Reservation[]
}

export async function getReservationsForAdmin(
  filters?: AdminReservationFilters
): Promise<Reservation[]> {
  const params = new URLSearchParams()
  params.set('populate', 'domo')
  params.set('sort', 'createdAt:desc')
  params.set('pagination[pageSize]', '100')

  if (filters?.status?.length) {
    filters.status.forEach((s, i) =>
      params.set(`filters[reservationStatus][$in][${i}]`, s)
    )
  }
  if (filters?.domoId) {
    params.set('filters[domo][id][$eq]', String(filters.domoId))
  }
  if (filters?.search) {
    params.set('filters[$or][0][guestName][$containsi]', filters.search)
    params.set('filters[$or][1][guestEmail][$containsi]', filters.search)
  }
  if (filters?.checkInFrom) {
    params.set('filters[checkIn][$gte]', filters.checkInFrom)
  }
  if (filters?.checkInTo) {
    params.set('filters[checkIn][$lte]', filters.checkInTo)
  }

  const res = await fetchAPI<StrapiData<Reservation>[]>(
    `/reservations?${params.toString()}`,
    { useAuth: true }
  )
  return normalizeStrapiArray<Reservation>(res.data)
}

export async function updateReservationStatus(
  id: number,
  status: string
): Promise<Reservation> {
  const res = await fetchAPI<StrapiData<Reservation>>(`/reservations/${id}`, {
    method: 'PUT',
    useAuth: true,
    body: JSON.stringify({ data: { reservationStatus: status } }),
  })
  return normalizeStrapiData(res.data) as Reservation
}

export async function getAdminDashboardMetrics(): Promise<AdminMetrics> {
  const today = new Date().toISOString().split('T')[0]
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0]

  const [allActive, todayArrivals, monthConfirmed] = await Promise.all([
    getReservationsForAdmin({ status: ['draft', 'confirmed'] }),
    getReservationsForAdmin({ status: ['confirmed'], checkInFrom: today, checkInTo: today }),
    getReservationsForAdmin({ status: ['confirmed'], checkInFrom: firstOfMonth }),
  ])

  const pending = allActive.filter((r) => r.reservationStatus === 'draft').length
  const revenueThisMonth = monthConfirmed.reduce((sum, r) => sum + (r.totalPrice || 0), 0)

  const upcoming = allActive
    .filter((r) => r.reservationStatus === 'confirmed' && (r.checkIn as string) >= today)
    .sort((a, b) => ((a.checkIn as string) > (b.checkIn as string) ? 1 : -1))
    .slice(0, 5)

  const recent = [...allActive]
    .sort((a, b) => ((a.id ?? 0) > (b.id ?? 0) ? -1 : 1))
    .slice(0, 5)

  return {
    pending,
    checkInsToday: todayArrivals.length,
    revenueThisMonth,
    upcomingArrivals: upcoming,
    recentReservations: recent,
  }
}
