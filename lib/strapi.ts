const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiData<T> {
  id: number;
  attributes?: T;
  // For Strapi v5 flat structure, data may be at root level
  [key: string]: any;
}

// Helper para hacer llamadas a la API de Strapi
export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<StrapiResponse<T>> {
  const url = `${STRAPI_URL}/api${endpoint}`;
  
  // Add cache control for client-side requests
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };
  
  // For client-side requests, add cache control
  if (typeof window !== 'undefined') {
    headers['cache-control'] = 'no-cache';
  }
  
  const response = await fetch(url, {
    headers,
    ...options,
    // For server components, we need to explicitly handle errors
    next: { revalidate: 0 }, // Always fetch fresh data
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText} (${response.status})`);
  }

  return response.json();
}

// Funciones específicas para domos
export async function getDomos() {
  const data = await fetchAPI<StrapiData<any>[]>('/domos?populate=*&filters[publishedAt][$notNull]=true&filters[isActive][$eq]=true');
  return data.data;
}

export async function getDomo(slug: string) {
  // Since Strapi v5 filter by slug doesn't work well, fetch all and filter client-side
  const data = await fetchAPI<StrapiData<any>[]>('/domos?populate=*');
  const domo = data.data.find((d: any) => {
    const domoSlug = d.attributes?.slug || d.slug;
    return domoSlug === slug;
  });
  return domo;
}

// Funciones para reservas
export async function createReservation(reservationData: any) {
  const data = await fetchAPI('/reservations', {
    method: 'POST',
    body: JSON.stringify({ data: reservationData }),
  });
  return data;
}

export async function checkAvailability(domoId: number, checkIn: string, checkOut: string) {
  const data = await fetchAPI(`/reservations?filters[domo][id][$eq]=${domoId}&filters[checkIn][$lte]=${checkOut}&filters[checkOut][$gte]=${checkIn}&filters[status][$in][0]=confirmed&filters[status][$in][1]=draft`);
  return data.data.length === 0; // true si está disponible
}

// Funciones para páginas
export async function getPage(slug: string) {
  const data = await fetchAPI<StrapiData<any>[]>(`/pages?filters[slug][$eq]=${slug}&filters[isActive][$eq]=true`);
  return data.data[0];
}

// Funciones para testimonios
export async function getTestimonials() {
  const data = await fetchAPI<StrapiData<any>[]>('/testimonials?filters[isApproved][$eq]=true&populate=*');
  return data.data;
}

// Funciones para temporadas
export async function getSeasons() {
  const data = await fetchAPI<StrapiData<any>[]>('/seasons?filters[isActive][$eq]=true');
  return data.data;
} 