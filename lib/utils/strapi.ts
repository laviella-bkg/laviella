// Utility functions for Strapi integration
import type { StrapiMedia, Domo, Season, Page, Reservation, Testimonial, StrapiData } from '../types/strapi';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * Normalizes Strapi data structure to work with both v4 (nested) and v5 (flat)
 */
export function normalizeStrapiData<T>(data: any): T {
  if (!data) return data;
  
  // If it has attributes, it's Strapi v4 structure
  if (data.attributes) {
    return {
      id: data.id,
      ...data.attributes,
    } as T;
  }
  
  // Otherwise it's Strapi v5 flat structure
  return data as T;
}

/**
 * Normalizes an array of Strapi data
 */
export function normalizeStrapiArray<T>(data: any[]): T[] {
  if (!Array.isArray(data)) return [];
  return data.map(item => normalizeStrapiData<T>(item));
}

/**
 * Gets the full URL for a Strapi media/image
 */
export function getStrapiMediaUrl(
  media: StrapiMedia | null | undefined,
  options?: {
    format?: 'thumbnail' | 'small' | 'medium' | 'large';
    fallback?: string;
  }
): string {
  const fallback = options?.fallback || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
  
  if (!media) return fallback;

  // Normalize media structure
  let imageUrl: string | undefined;
  const format = options?.format;

  // Handle nested data structure (Strapi v4/v5)
  const mediaData = media.data || media;
  const mediaAttrs = mediaData?.attributes || mediaData || media;

  // Try to get format-specific URL first
  if (format && mediaAttrs?.formats?.[format]?.url) {
    imageUrl = mediaAttrs.formats[format].url;
  } else if (mediaAttrs?.url) {
    imageUrl = mediaAttrs.url;
  } else if (mediaData?.url) {
    imageUrl = mediaData.url;
  } else if (media.url) {
    imageUrl = media.url;
  }

  if (!imageUrl) return fallback;

  // If URL already includes protocol, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Otherwise prepend Strapi base URL
  return `${STRAPI_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

/**
 * Builds query string for Strapi filters
 */
export function buildStrapiQuery(filters: Record<string, any>): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v, i) => {
          params.append(`filters[${key}][$in][${i}]`, String(v));
        });
      } else if (typeof value === 'object') {
        Object.entries(value).forEach(([op, val]) => {
          params.append(`filters[${key}][${op}]`, String(val));
        });
      } else {
        params.append(`filters[${key}][$eq]`, String(value));
      }
    }
  });
  
  return params.toString();
}

/**
 * Calculates number of nights between two dates
 */
export function calculateNights(checkIn: string | Date, checkOut: string | Date): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
