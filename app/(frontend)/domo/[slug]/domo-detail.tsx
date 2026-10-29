"use client"

import { useMemo, useState } from "react"
import DOMPurify from "isomorphic-dompurify"
import Link from "next/link"
import Image from "next/image"
import type { DateRange } from "react-day-picker"
import { calculatePrice, getMediaUrl, toDateKey } from "@/lib/utils/cms"
import type { Domo, Season, Testimonial } from "@/lib/types/cms"
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
} from "lucide-react"
import { NavBar } from "@/components/sections/nav-bar"
import { HeroSection } from "@/components/sections/hero-section"

export function DomoDetail({
  domo,
  testimonials,
  bookedDates,
  seasons,
}: {
  domo: Domo
  testimonials: Testimonial[]
  bookedDates: string[]
  seasons: Season[]
}) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [guests, setGuests] = useState(2)

  const priceCalculation = useMemo(
    () =>
      dateRange?.from && dateRange?.to
        ? calculatePrice(domo.basePrice, seasons, toDateKey(dateRange.from), toDateKey(dateRange.to))
        : null,
    [dateRange, domo.basePrice, seasons]
  )

  const normalizedDomo = domo
  const mainImage = getMediaUrl(normalizedDomo.mainImage)
  const gallery = Array.isArray(normalizedDomo.gallery) ? normalizedDomo.gallery : []
  const images = [
    mainImage,
    ...gallery.map((img) => getMediaUrl(img))
  ].filter(Boolean)

  return (
    <>
      <NavBar />
      <HeroSection
        imageUrl={mainImage}
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
              {normalizedDomo.features.length > 0 && (
                <Card className="bg-viella-cream border-viella-beige">
                  <CardHeader>
                    <CardTitle className="font-cormorant text-viella-deep">Características Destacadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {normalizedDomo.features.map((feature, index) => (
                        <div key={index} className="flex items-center font-dm-sans text-viella-deep">
                          <Check className="h-5 w-5 text-viella-accent mr-3" />
                          <span>{feature}</span>
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
                      {testimonials.slice(0, 3).map((testimonial, index) => (
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
                        return bookedDates.includes(toDateKey(date))
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
                      {priceCalculation ? (
                        <>
                          {priceCalculation.seasons.length > 0 && (
                            <div className="space-y-1 mb-2">
                              {priceCalculation.seasons.map((season, idx) => (
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
                  <Link href={`/reservas?domo=${normalizedDomo.slug}${dateRange?.from && dateRange?.to ? `&checkIn=${toDateKey(dateRange.from)}&checkOut=${toDateKey(dateRange.to)}` : ''}`}>
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
    </>
  )
}
