"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import DOMPurify from "isomorphic-dompurify"
import Link from "next/link"
import Image from "next/image"
import type { DateRange } from "react-day-picker"
import {
  getDomo,
  getStrapiMediaUrl,
  getTestimonialsByDomo,
  getBookedDates,
  calculatePriceWithSeasons
} from "@/lib/strapi"
import type { Domo, PriceCalculation } from "@/lib/strapi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import {
  Star,
  Users,
  MapPin,
  CalendarIcon,
  Check,
  Loader2,
} from "lucide-react"
import { NavBar } from "@/components/sections/nav-bar"
import { HeroSection } from "@/components/sections/hero-section"
import { Footer } from "@/components/sections/footer"

export default function DomoPage() {
  const params = useParams()
  const slug = params.slug as string
  const [domo, setDomo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedImage, setSelectedImage] = useState(0)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [guests, setGuests] = useState(2)
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null)
  const [loadingPrice, setLoadingPrice] = useState(false)
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [bookedDates, setBookedDates] = useState<string[]>([])

  // Fetch domo data
  useEffect(() => {
    const fetchDomo = async () => {
      try {
        setLoading(true)
        setError(null)
        const domoData = await getDomo(slug)
        if (domoData) {
          setDomo(domoData)

          // Load testimonials for this domo
          if (domoData.id) {
            const domoTestimonials = await getTestimonialsByDomo(domoData.id)
            setTestimonials(domoTestimonials)

            // Load booked dates for calendar
            const booked = await getBookedDates(domoData.id)
            setBookedDates(booked)
          }
        } else {
          setError("Domo no encontrado")
        }
      } catch (err) {
        console.error("Error fetching domo:", err)
        setError(err instanceof Error ? err.message : "Error loading domo")
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchDomo()
    } else {
      setError("Slug no proporcionado")
      setLoading(false)
    }
  }, [slug])

  // Calculate price with seasons when dates are selected
  // IMPORTANTE: Este hook debe estar ANTES de los returns tempranos
  useEffect(() => {
    const calculatePrice = async () => {
      if (dateRange?.from && dateRange?.to && domo) {
        setLoadingPrice(true)
        try {
          const calc = await calculatePriceWithSeasons(
            domo,
            dateRange.from,
            dateRange.to
          )
          setPriceCalculation(calc)
        } catch (error) {
          console.error('Error calculating price:', error)
          setPriceCalculation(null)
        } finally {
          setLoadingPrice(false)
        }
      } else {
        setPriceCalculation(null)
      }
    }
    calculatePrice()
  }, [dateRange, domo])

  // Early returns DESPUÉS de todos los hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-viella-sand flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-viella-accent mx-auto mb-4" />
          <p className="font-dm-sans text-viella-brown">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error || !domo) {
    return (
      <div className="min-h-screen bg-viella-sand flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4 font-dm-sans">Error: {error || "Domo no encontrado"}</p>
          <Link href="/">
            <Button variant="outline" className="font-dm-sans border-viella-beige text-viella-brown hover:bg-viella-cream">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  // domo ya viene normalizado de getDomo()
  const normalizedDomo = domo as Domo
  const mainImage = getStrapiMediaUrl(normalizedDomo.mainImage)
  const gallery = Array.isArray(normalizedDomo.gallery) ? normalizedDomo.gallery : []
  const images = [
    mainImage,
    ...gallery.map((img: any) => getStrapiMediaUrl(img))
  ].filter(Boolean)

  return (
    <>
      <NavBar />
      <HeroSection
        imageUrl={getStrapiMediaUrl(normalizedDomo.mainImage)}
        scriptText="glamping & domos"
        title={normalizedDomo.name}
        subtitle={`${normalizedDomo.capacity} huéspedes · desde $${normalizedDomo.basePrice}/noche`}
        ctaLabel="Reservar este domo"
        ctaHref={`/reservas?domo=${normalizedDomo.slug}`}
        height="60vh"
      />
      <div className="bg-viella-sand min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-cormorant text-4xl font-bold text-viella-deep mb-2">{normalizedDomo.name}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                    {testimonials.length > 0 ? (
                      <>
                        <span className="font-dm-sans font-semibold text-viella-deep">
                          {(testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.length).toFixed(1)}
                        </span>
                        <span className="font-dm-sans text-viella-brown ml-1">({testimonials.length} {testimonials.length === 1 ? 'reseña' : 'reseñas'})</span>
                      </>
                    ) : (
                      <span className="font-dm-sans text-viella-brown ml-1">Sin reseñas aún</span>
                    )}
                  </div>
                  <div className="flex items-center text-viella-brown font-dm-sans">
                    <Users className="h-5 w-5 mr-1" />
                    <span>Capacidad: {normalizedDomo.capacity} personas</span>
                  </div>
                  <div className="flex items-center text-viella-brown font-dm-sans">
                    <MapPin className="h-5 w-5 mr-1" />
                    <span>{normalizedDomo.location || "La Viella, Naturaleza"}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-cormorant text-3xl font-bold text-viella-accent">${normalizedDomo.basePrice}</div>
                <div className="font-dm-sans text-viella-brown">por noche</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden">
                    <Image
                      src={images[selectedImage] || "/placeholder.svg"}
                      alt={`${normalizedDomo.name} - Imagen ${selectedImage + 1}`}
                    width={800}
                    height={500}
                    className="w-full h-[500px] object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative rounded-lg overflow-hidden ${
                          selectedImage === index ? "ring-2 ring-viella-accent" : ""
                        }`}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${normalizedDomo.name} - Miniatura ${index + 1}`}
                          width={200}
                          height={150}
                          className="w-full h-24 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <Card className="bg-viella-cream border-viella-beige">
                <CardHeader>
                  <CardTitle className="font-cormorant text-viella-deep">Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="font-dm-sans text-viella-brown leading-relaxed prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(normalizedDomo.description || "Descripción del domo...") }}
                  />
                </CardContent>
              </Card>

              {/* Features */}
              {normalizedDomo.features && (
                <Card className="bg-viella-cream border-viella-beige">
                  <CardHeader>
                    <CardTitle className="font-cormorant text-viella-deep">Características Destacadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(Array.isArray(normalizedDomo.features)
                        ? normalizedDomo.features
                        : Object.values(normalizedDomo.features || {})).map((feature: any, index: number) => (
                        <div key={index} className="flex items-center font-dm-sans text-viella-deep">
                          <Check className="h-5 w-5 text-viella-accent mr-3" />
                          <span>{typeof feature === 'string' ? feature : feature.name || feature.label || String(feature)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Amenities */}
              {Array.isArray(normalizedDomo.amenities) && normalizedDomo.amenities.length > 0 && (
                <Card className="bg-viella-cream border-viella-beige">
                  <CardHeader>
                    <CardTitle className="font-cormorant text-viella-deep">Comodidades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {normalizedDomo.amenities.map((amenity: string, index: number) => (
                        <div key={index} className="flex items-center font-dm-sans text-viella-deep">
                          <Check className="h-5 w-5 text-viella-accent mr-3 shrink-0" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Policies */}
              <Card className="bg-viella-cream border-viella-beige">
                <CardHeader>
                  <CardTitle className="font-cormorant text-viella-deep">Políticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-cormorant font-semibold text-viella-deep mb-2">Check-in / Check-out</h4>
                    <p className="font-dm-sans text-viella-brown">
                      Check-in: {normalizedDomo.checkInTime || "15:00"} hrs | Check-out: {normalizedDomo.checkOutTime || "11:00"} hrs
                    </p>
                  </div>
                  <Separator className="bg-viella-beige" />
                  <div>
                    <h4 className="font-cormorant font-semibold text-viella-deep mb-2">Cancelación</h4>
                    <p className="font-dm-sans text-viella-brown">Cancelación gratuita hasta 48 horas antes de la llegada</p>
                  </div>
                </CardContent>
              </Card>

              {/* Testimonials */}
              {testimonials.length > 0 && (
                <Card className="bg-viella-cream border-viella-beige">
                  <CardHeader>
                    <CardTitle className="font-cormorant text-viella-deep">Testimonios de Huéspedes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {testimonials.slice(0, 3).map((testimonial: any, index: number) => (
                        <div key={index} className="border-b border-viella-beige last:border-0 pb-4 last:pb-0">
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400">
                              {[...Array(testimonial.rating || 5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-current" />
                              ))}
                            </div>
                            <span className="ml-2 font-dm-sans font-semibold text-viella-deep">
                              {testimonial.guestName}
                            </span>
                          </div>
                          <p className="font-dm-sans text-viella-brown italic">"{testimonial.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Booking */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 bg-viella-cream border border-viella-beige">
                <CardHeader>
                  <CardTitle className="font-cormorant text-viella-deep flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Reservar
                  </CardTitle>
                  <CardDescription className="font-dm-sans text-viella-brown">Selecciona las fechas para tu estadía</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Calendar */}
                  <div>
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      className="rounded-md border border-viella-beige"
                      disabled={(date) => {
                        if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true
                        const dateStr = date.toISOString().split('T')[0]
                        return bookedDates.includes(dateStr)
                      }}
                    />
                    {bookedDates.length > 0 && (
                      <p className="font-dm-sans text-xs text-viella-brown mt-2">
                        Las fechas marcadas no están disponibles
                      </p>
                    )}
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="font-dm-sans block text-sm font-medium text-viella-deep mb-2">Número de huéspedes</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="font-dm-sans w-full px-3 py-2 border border-viella-beige rounded-lg bg-viella-cream text-viella-deep focus:ring-2 focus:ring-viella-accent focus:border-transparent"
                    >
                      {Array.from({ length: normalizedDomo.capacity || 6 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "huésped" : "huéspedes"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Summary */}
                  {dateRange?.from && dateRange?.to && (
                    <div className="space-y-2 pt-4 border-t border-viella-beige">
                      {loadingPrice ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin text-viella-accent" />
                          <span className="font-dm-sans ml-2 text-sm text-viella-brown">Calculando precio...</span>
                        </div>
                      ) : priceCalculation ? (
                        <>
                          {priceCalculation.seasons.length > 0 && (
                            <div className="space-y-1 mb-2">
                              {priceCalculation.seasons.map((season: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm font-dm-sans">
                                  <span className="text-viella-brown">
                                    Temporada ({season.nights} noche{season.nights !== 1 ? 's' : ''})
                                  </span>
                                  <span className="text-viella-deep">${season.price.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between font-dm-sans text-viella-deep">
                            <span>
                              ${priceCalculation.basePrice} x {priceCalculation.nights} noche{priceCalculation.nights !== 1 ? 's' : ''}
                            </span>
                            <span>${priceCalculation.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-dm-sans text-viella-brown">
                            <span>Limpieza</span>
                            <span>${priceCalculation.fees?.cleaning?.toFixed(2) ?? '0.00'}</span>
                          </div>
                          <div className="flex justify-between text-sm font-dm-sans text-viella-brown">
                            <span>Tasas</span>
                            <span>${priceCalculation.fees?.taxes?.toFixed(2) ?? '0.00'}</span>
                          </div>
                          <Separator className="bg-viella-beige" />
                          <div className="flex justify-between font-dm-sans font-semibold text-lg">
                            <span className="text-viella-deep">Total</span>
                            <span className="text-viella-accent">${priceCalculation.total.toFixed(2)}</span>
                          </div>
                        </>
                      ) : null}
                    </div>
                  )}

                  {/* Book Button */}
                  <Link href={`/reservas?domo=${normalizedDomo.slug}${dateRange?.from && dateRange?.to ? `&checkIn=${dateRange.from.toISOString().split('T')[0]}&checkOut=${dateRange.to.toISOString().split('T')[0]}` : ''}`}>
                    <Button
                      className="w-full bg-viella-accent text-viella-cream hover:bg-viella-deep font-dm-sans"
                      size="lg"
                      disabled={!dateRange?.from || !dateRange?.to}
                    >
                      {!dateRange?.from || !dateRange?.to ? "Selecciona fechas" : "Reservar Ahora"}
                    </Button>
                  </Link>

                  <p className="font-dm-sans text-sm text-viella-brown text-center">
                    No se realizará ningún cargo hasta confirmar la reserva
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
