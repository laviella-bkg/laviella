"use client"

import { useState, useEffect } from "react"
import type { PriceCalculation } from "@/lib/strapi"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { 
  getDomo, 
  getStrapiMediaUrl, 
  normalizeStrapiData, 
  getTestimonialsByDomo, 
  getBookedDates, 
  calculatePriceWithSeasons
} from "@/lib/strapi"
import type { Domo, PriceCalculation } from "@/lib/strapi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Star,
  Users,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Bath,
  Bed,
  Thermometer,
  MapPin,
  CalendarIcon,
  Check,
  Loader2,
} from "lucide-react"

export default function DomoPage() {
  const params = useParams()
  const slug = params.slug as string
  const [domo, setDomo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
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
      if (selectedDates.length > 1 && domo) {
        setLoadingPrice(true)
        try {
          const normalizedDomo = normalizeStrapiData<Domo>(domo)
          const calc = await calculatePriceWithSeasons(
            normalizedDomo,
            selectedDates[0],
            selectedDates[selectedDates.length - 1]
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
  }, [selectedDates, domo])

  // Early returns DESPUÉS de todos los hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando domo...</p>
        </div>
      </div>
    )
  }

  if (error || !domo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error || "Domo no encontrado"}</p>
          <Link href="/">
            <Button variant="outline">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Normalize domo data after checking it exists
  const normalizedDomo = normalizeStrapiData<Domo>(domo)
  const mainImage = getStrapiMediaUrl(normalizedDomo.mainImage)
  const gallery = Array.isArray(normalizedDomo.gallery) ? normalizedDomo.gallery : []
  const images = [
    mainImage,
    ...gallery.map((img: any) => getStrapiMediaUrl(img))
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center text-emerald-800 hover:text-emerald-900">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-xl font-bold">La Viella Glamping</span>
          </Link>
          <Link href="/reservas">
            <Button className="bg-emerald-600 hover:bg-emerald-700">Reservar Ahora</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{normalizedDomo.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                  <span className="font-semibold">4.9</span>
                  <span className="text-gray-600 ml-1">(Reviews)</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-1" />
                  <span>Capacidad: {normalizedDomo.capacity} personas</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-1" />
                  <span>{normalizedDomo.location || "La Viella, Naturaleza"}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-700">${normalizedDomo.basePrice}</div>
              <div className="text-gray-600">por noche</div>
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
                        selectedImage === index ? "ring-2 ring-emerald-500" : ""
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
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-gray-600 leading-relaxed prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: normalizedDomo.description || "Descripción del domo..." }}
                />
              </CardContent>
            </Card>

            {/* Features */}
            {normalizedDomo.features && (
              <Card>
                <CardHeader>
                  <CardTitle>Características Destacadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {(Array.isArray(normalizedDomo.features) 
                      ? normalizedDomo.features 
                      : Object.values(normalizedDomo.features || {})).map((feature: any, index: number) => (
                      <div key={index} className="flex items-center">
                        <Check className="h-5 w-5 text-emerald-600 mr-3" />
                        <span>{typeof feature === 'string' ? feature : feature.name || feature.label || String(feature)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Comodidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                      <Wifi className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span>WiFi gratuito</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                      <Car className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span>Parking privado</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                      <Coffee className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span>Desayuno incluido</span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                      <Bath className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span>Baño privado</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Políticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Check-in / Check-out</h4>
                  <p className="text-gray-600">
                    Check-in: {normalizedDomo.checkInTime || "15:00"} hrs | Check-out: {normalizedDomo.checkOutTime || "11:00"} hrs
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cancelación</h4>
                  <p className="text-gray-600">Cancelación gratuita hasta 48 horas antes de la llegada</p>
                </div>
              </CardContent>
            </Card>

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Testimonios de Huéspedes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {testimonials.slice(0, 3).map((testimonial: any, index: number) => (
                      <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400">
                            {[...Array(testimonial.rating || 5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                          <span className="ml-2 font-semibold text-gray-900">
                            {testimonial.guestName}
                          </span>
                        </div>
                        <p className="text-gray-600 italic">"{testimonial.comment}"</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Reservar
                </CardTitle>
                <CardDescription>Selecciona las fechas para tu estadía</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Calendar */}
                <div>
                  <Calendar
                    mode="range"
                    selected={selectedDates}
                    onSelect={(dates) => setSelectedDates(dates || [])}
                    className="rounded-md border"
                    disabled={(date) => {
                      // Disable past dates
                      if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
                        return true
                      }
                      // Disable booked dates
                      const dateStr = date.toISOString().split('T')[0]
                      return bookedDates.includes(dateStr)
                    }}
                  />
                  {bookedDates.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Las fechas marcadas no están disponibles
                    </p>
                  )}
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de huéspedes</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {Array.from({ length: normalizedDomo.capacity || 6 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "huésped" : "huéspedes"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Summary */}
                {selectedDates.length > 1 && (
                  <div className="space-y-2 pt-4 border-t">
                    {loadingPrice ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                        <span className="ml-2 text-sm text-gray-600">Calculando precio...</span>
                      </div>
                    ) : priceCalculation ? (
                      <>
                        {priceCalculation.seasons.length > 0 && (
                          <div className="space-y-1 mb-2">
                            {priceCalculation.seasons.map((season: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  Temporada ({season.nights} noche{season.nights !== 1 ? 's' : ''})
                                </span>
                                <span>${season.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>
                            ${priceCalculation.basePrice} x {priceCalculation.nights} noche{priceCalculation.nights !== 1 ? 's' : ''}
                          </span>
                          <span>${priceCalculation.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Limpieza</span>
                          <span>${priceCalculation.fees.cleaning.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Tasas</span>
                          <span>${priceCalculation.fees.taxes.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span className="text-emerald-700">${priceCalculation.total.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span>
                          ${normalizedDomo.basePrice} x {selectedDates.length - 1} noche{(selectedDates.length - 1) !== 1 ? 's' : ''}
                        </span>
                        <span>${(normalizedDomo.basePrice * (selectedDates.length - 1)).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Book Button */}
                <Link href={`/reservas?domo=${normalizedDomo.slug}${selectedDates.length >= 2 ? `&checkIn=${selectedDates[0].toISOString().split('T')[0]}&checkOut=${selectedDates[selectedDates.length - 1].toISOString().split('T')[0]}` : ''}`}>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    size="lg"
                    disabled={selectedDates.length < 2}
                  >
                    {selectedDates.length < 2 ? "Selecciona fechas" : "Reservar Ahora"}
                  </Button>
                </Link>

                <p className="text-sm text-gray-600 text-center">
                  No se realizará ningún cargo hasta confirmar la reserva
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
