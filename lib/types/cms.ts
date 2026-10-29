// Tipos que consume el frontend (normalizados desde Payload en lib/cms.ts)

export interface Media {
  id?: number;
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
}

export interface Domo {
  id: number;
  name: string;
  slug: string;
  description: string; // HTML generado desde el editor
  capacity: number;
  basePrice: number;
  weekendPrice?: number;
  extraGuestPrice?: number;
  isActive: boolean;
  features: string[];
  amenities: string[];
  location?: string;
  checkInTime?: string; // "15:00"
  checkOutTime?: string; // "11:00"
  mainImage?: Media | null;
  gallery?: Media[];
}

export interface Season {
  id: number;
  name: string;
  startDate: string; // ISO
  endDate: string; // ISO
  priceMultiplier: number;
  isActive: boolean;
  description?: string;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string; // HTML generado desde el editor
  metaDescription?: string;
  isActive: boolean;
  seoTitle?: string;
  seoKeywords?: string;
}

export type ReservationStatus = "draft" | "confirmed" | "cancelled" | "completed" | "blocked";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Reservation {
  id: number;
  domo?: { id: number; name: string; slug: string } | null;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  totalPrice: number;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  numberOfGuests: number;
  specialRequests?: string;
}

export interface Testimonial {
  id: number;
  guestName: string;
  rating: number; // 1-5
  comment: string;
  isApproved: boolean;
  guestImage?: Media | null;
  domo?: { name: string } | null;
}

export interface HomePageServicio {
  id?: string | null;
  title: string;
  description?: string;
  image?: Media | null;
}

export interface HomePageContent {
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaLabel?: string;
  heroImage?: Media | null;
  aboutTitle?: string;
  aboutDescription?: string;
  aboutLocationTitle?: string;
  aboutLocationSubtitle?: string;
  aboutClimaTitle?: string;
  aboutClimaSubtitle?: string;
  aboutImage?: Media | null;
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
  ctaImage?: Media | null;
}

export interface PriceCalculation {
  nights: number;
  lines: Array<{ label: string; amount: number }>;
  total: number;
}
