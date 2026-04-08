// TypeScript types for Strapi Content Types

// Media type for Strapi images
export interface StrapiMedia {
  id?: number;
  url?: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: {
      url: string;
      width: number;
      height: number;
    };
    small?: {
      url: string;
      width: number;
      height: number;
    };
    medium?: {
      url: string;
      width: number;
      height: number;
    };
    large?: {
      url: string;
      width: number;
      height: number;
    };
  };
  // Strapi v5 structure
  data?: {
    id?: number;
    attributes?: StrapiMedia;
    url?: string;
  };
  attributes?: StrapiMedia;
}

// Domo content type
export interface Domo {
  id?: number;
  name: string;
  slug: string;
  description: string; // Rich text
  capacity: number;
  basePrice: number;
  isActive: boolean;
  features?: any; // JSON object or array
  amenities?: string[]; // JSON array
  location?: string;
  checkInTime?: string; // "15:00"
  checkOutTime?: string; // "11:00"
  mainImage?: StrapiMedia | null;
  gallery?: StrapiMedia[];
  reservations?: Reservation[];
  testimonials?: Testimonial[];
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  // Strapi v4 structure
  attributes?: Domo;
}

// Season content type
export interface Season {
  id?: number;
  name: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  priceMultiplier: number; // decimal
  isActive: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  // Strapi v4 structure
  attributes?: Season;
}

// Page content type
export interface Page {
  id?: number;
  title: string;
  slug: string;
  content: string; // Rich text
  metaDescription?: string;
  isActive: boolean;
  seoTitle?: string;
  seoKeywords?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  // Strapi v4 structure
  attributes?: Page;
}

// Reservation content type
export type ReservationStatus = "draft" | "confirmed" | "cancelled" | "completed";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Reservation {
  id?: number;
  documentId?: string;
  domo?: Domo | number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  totalPrice: number;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  numberOfGuests: number;
  specialRequests?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  // Strapi v4 structure
  attributes?: Reservation;
}

// Testimonial content type
export interface Testimonial {
  id?: number;
  guestName: string;
  rating: number; // 1-5
  comment: string;
  isApproved: boolean;
  guestImage?: StrapiMedia | null;
  domo?: Domo | number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  // Strapi v4 structure
  attributes?: Testimonial;
}

// Strapi API Response structure
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

// Strapi data wrapper (for v4)
export interface StrapiData<T> {
  id: number;
  attributes?: T;
  [key: string]: any;
}

// Home Page Single Type
export interface HomePageServicio {
  id: number;
  title: string;
  description?: string;
  image?: StrapiMedia | null;
}

export interface HomePageContent {
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaLabel?: string;
  heroImage?: StrapiMedia | null;
  aboutTitle?: string;
  aboutDescription?: string;
  aboutLocationTitle?: string;
  aboutLocationSubtitle?: string;
  aboutClimaTitle?: string;
  aboutClimaSubtitle?: string;
  aboutImage?: StrapiMedia | null;
  serviciosTitle?: string;
  serviciosSubtitle?: string;
  servicios?: HomePageServicio[];
  ctaTitle?: string;
  ctaDescription?: string;
  ctaHoursWeekdaysLabel?: string;
  ctaHoursWeekdays?: string;
  ctaHoursWeekendLabel?: string;
  ctaHoursWeekend?: string;
  ctaAddress?: string;
  ctaPhone?: string;
  ctaEmail?: string;
  ctaImage?: StrapiMedia | null;
}

// Price calculation result
export interface PriceCalculation {
  basePrice: number;
  nights: number;
  pricePerNight: number[];
  seasons: Array<{
    startDate: string;
    endDate: string;
    multiplier: number;
    nights: number;
    price: number;
  }>;
  subtotal: number;
  fees: {
    cleaning?: number;
    taxes?: number;
  };
  total: number;
}
