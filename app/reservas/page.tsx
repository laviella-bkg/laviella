"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  CalendarIcon,
  Users,
  Wifi,
  Car,
  Coffee,
  Utensils,
  MessageCircle,
  Star,
  CreditCard,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import {
  getDomos,
  createReservation,
  checkAvailability,
  getStrapiMediaUrl,
  calculatePriceWithSeasons
} from "@/lib/strapi"
import type { Domo, PriceCalculation } from "@/lib/strapi"
import { NavBar } from "@/components/sections/nav-bar"
import { Footer } from "@/components/sections/footer"

function ReservasContent() {
  const searchParams = useSearchParams()

  // Data states
  const [domos, setDomos] = useState<any[]>([])
  const [rawDomos, setRawDomos] = useState<Domo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Selection states
  type DateRange = { from: Date; to: Date } | undefined
  const [selectedDates, setSelectedDates] = useState<DateRange>(undefined)
  const [selectedDomo, setSelectedDomo] = useState<any | null>(null)
  const [guests, setGuests] = useState(2)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [availabilityChecked, setAvailabilityChecked] = useState(false)
  const [isAvailable, setIsAvailable] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  // Form states
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Guest form data
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    specialRequests: "",
  })

  // Contact/WhatsApp form data
  const [contactForm, setContactForm] = useState({ nombre: '', consulta: '' })

  // Price calculation states
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null)
  const [loadingPrice, setLoadingPrice] = useState(false)

  // Load domos from Strapi
  useEffect(() => {
    const loadDomos = async () => {
      try {
        setLoading(true)
        const data = await getDomos()

        // Format domos data to match component expectations
        setRawDomos(data)

        const formattedDomos = data.map((domo: Domo) => {
          let features: any[] = []
          if (Array.isArray(domo.features)) {
            features = domo.features
          } else if (typeof domo.features === 'object' && domo.features !== null) {
            features = Object.values(domo.features).filter(Boolean)
          }

          return {
            id: domo.id,
            name: domo.name || "Sin nombre",
            slug: domo.slug || `domo-${domo.id}`,
            capacity: `${domo.capacity || 2} personas`,
            maxCapacity: domo.capacity || 2,
            price: domo.basePrice || 100,
            description: domo.description || "",
            features: features,
            image: domo.mainImage,
            rating: 4.9,
            available: domo.isActive !== false,
          }
        })

        setDomos(formattedDomos)
      } catch (err) {
        console.error("Error loading domos:", err)
        setError("Error al cargar los domos. Por favor, intenta de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    loadDomos()
  }, [])

  // Check availability when dates or domo changes
  useEffect(() => {
    const verifyAvailability = async () => {
      if (!selectedDomo || !selectedDates || !selectedDates.from || !selectedDates.to) {
        setAvailabilityChecked(false)
        setIsAvailable(false)
        setAvailabilityError(null)
        return
      }

      try {
        setIsCheckingAvailability(true)
        setAvailabilityError(null)

        const checkIn = selectedDates.from.toISOString().split('T')[0]
        const checkOut = selectedDates.to.toISOString().split('T')[0]

        const available = await checkAvailability(selectedDomo.id, checkIn, checkOut)

        setIsAvailable(available)
        setAvailabilityChecked(true)
      } catch (err) {
        console.error("Error checking availability:", err)
        setAvailabilityError("Error al verificar disponibilidad")
        setIsAvailable(false)
      } finally {
        setIsCheckingAvailability(false)
      }
    }

    verifyAvailability()
  }, [selectedDates, selectedDomo])

  // Pre-select domo and dates from URL query params
  useEffect(() => {
    const domoSlug = searchParams.get('domo')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')

    if (domoSlug && domos.length > 0) {
      const domo = domos.find(d => d.slug === domoSlug)
      if (domo) setSelectedDomo(domo)
    }

    if (checkIn && checkOut) {
      const from = new Date(checkIn + 'T12:00:00')
      const to = new Date(checkOut + 'T12:00:00')
      if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
        setSelectedDates({ from, to })
      }
    }
  }, [domos, searchParams])

  // Calculate price with seasons when dates and domo are selected
  useEffect(() => {
    const calculatePrice = async () => {
      if (selectedDomo && selectedDates?.from && selectedDates?.to) {
        setLoadingPrice(true)
        try {
          const fullDomo = rawDomos.find(d => d.id === selectedDomo.id)
          if (fullDomo) {
            const calc = await calculatePriceWithSeasons(fullDomo, selectedDates.from, selectedDates.to)
            setPriceCalculation(calc)
          }
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
  }, [selectedDates, selectedDomo, rawDomos])

  const selectedDomoData = selectedDomo
  const nights = selectedDates && selectedDates.from && selectedDates.to
    ? Math.ceil((selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const totalPrice = priceCalculation?.total || (selectedDomoData ? selectedDomoData.price * nights + 40 : 0)

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDomo || !selectedDates || !selectedDates.from || !selectedDates.to) {
      setSubmitError("Por favor, selecciona un domo y las fechas")
      return
    }

    if (!isAvailable && availabilityChecked) {
      setSubmitError("El domo no está disponible en las fechas seleccionadas")
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const checkIn = selectedDates.from.toISOString().split('T')[0]
      const checkOut = selectedDates.to.toISOString().split('T')[0]

      // Validate guest count doesn't exceed capacity
      if (guests > selectedDomo.maxCapacity) {
        setSubmitError(`El número de huéspedes no puede exceder la capacidad del domo (${selectedDomo.maxCapacity})`)
        return
      }

      // Use calculated price if available
      const finalPrice = priceCalculation?.total || totalPrice

      const reservationData = {
        domo: selectedDomo.id,
        guestName: formData.guestName.trim(),
        guestEmail: formData.guestEmail.trim().toLowerCase(),
        guestPhone: formData.guestPhone.trim(),
        checkIn,
        checkOut,
        numberOfGuests: guests,
        totalPrice: parseFloat(finalPrice.toFixed(2)),
        specialRequests: formData.specialRequests.trim() || undefined,
        reservationStatus: "draft" as const,
        paymentStatus: "pending" as const,
      }

      await createReservation(reservationData)

      setSubmitSuccess(true)
      setShowBookingForm(false)

      // Reset form
      setTimeout(() => {
        setSubmitSuccess(false)
        setFormData({ guestName: "", guestEmail: "", guestPhone: "", specialRequests: "" })
        setSelectedDates(undefined)
        setSelectedDomo(null)
      }, 3000)

    } catch (err) {
      console.error("Error creating reservation:", err)
      setSubmitError("Error al crear la reserva. Por favor, intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    if (!whatsappNumber) return

    const domo = selectedDomo?.name || 'un domo'
    const desde = selectedDates?.from ? format(selectedDates.from, 'dd/MM/yyyy') : ''
    const hasta = selectedDates?.to ? format(selectedDates.to, 'dd/MM/yyyy') : ''

    const mensaje = [
      `Hola! Soy ${contactForm.nombre}.`,
      desde && hasta ? `Me interesa reservar ${domo} del ${desde} al ${hasta}.` : `Me interesa reservar ${domo}.`,
      contactForm.consulta ? `Consulta: ${contactForm.consulta}` : '',
    ].filter(Boolean).join(' ')

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`, '_blank')
    setShowContactForm(false)
    setContactForm({ nombre: '', consulta: '' })
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-viella-sand pt-16">
        {/* Header de página */}
        <div className="bg-viella-deep py-16 text-center">
          <p className="font-dancing text-viella-brown text-lg mb-2">tu escapada</p>
          <h1 className="font-cormorant font-semibold text-viella-cream text-5xl">
            Reservar
          </h1>
        </div>

        {/* Contenido principal */}
        <main className="max-w-6xl mx-auto px-6 py-12">
          {/* Success Message */}
          {submitSuccess && (
            <div className="mb-6 bg-viella-accent/10 border border-viella-accent rounded-lg p-4 flex items-center gap-3">
              <Check className="h-5 w-5 text-viella-accent" />
              <p className="text-viella-accent font-dm-sans font-medium">¡Reserva creada exitosamente! Te contactaremos pronto.</p>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800 font-dm-sans font-medium">{submitError}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-viella-accent" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 font-dm-sans">{error}</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Date Selection and Domos */}
              <div className="lg:col-span-2 space-y-8">
                {/* Date Selection */}
                <Card className="shadow-lg border-viella-beige">
                  <CardHeader>
                    <CardTitle className="flex items-center text-viella-deep font-cormorant">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Selecciona tus fechas
                    </CardTitle>
                    <CardDescription className="font-dm-sans text-viella-brown">Elige las fechas de entrada y salida para tu estadía</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <Calendar
                        mode="range"
                        selected={selectedDates}
                        onSelect={(dates) => setSelectedDates(dates as any)}
                        className="rounded-md border border-viella-beige"
                        disabled={(date) => date < new Date()}
                      />
                    </div>
                    {selectedDates && selectedDates.from && selectedDates.to && (
                      <div className="mt-4 p-4 bg-viella-beige/30 rounded-lg">
                        <p className="text-viella-deep font-dm-sans font-semibold">
                          Fechas seleccionadas: {nights} noche{nights !== 1 ? "s" : ""}
                        </p>
                        <p className="text-viella-brown font-dm-sans">
                          Del {selectedDates.from.toLocaleDateString()} al{" "}
                          {selectedDates.to.toLocaleDateString()}
                        </p>
                        {isCheckingAvailability && (
                          <p className="text-sm text-viella-brown font-dm-sans mt-2 flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Verificando disponibilidad...
                          </p>
                        )}
                        {availabilityChecked && !isCheckingAvailability && (
                          <div className={`mt-2 p-2 rounded ${isAvailable ? 'bg-viella-accent/10' : 'bg-red-100'}`}>
                            <p className={`text-sm font-dm-sans font-medium ${isAvailable ? 'text-viella-accent' : 'text-red-800'}`}>
                              {isAvailable ? '✓ Disponible' : '✗ No disponible en estas fechas'}
                            </p>
                          </div>
                        )}
                        {availabilityError && (
                          <p className="text-sm text-red-600 font-dm-sans mt-2">{availabilityError}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Domos Grid */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-cormorant font-semibold text-viella-deep">Elige tu Domo</h2>
                  <div className="grid gap-6">
                    {domos.map((domo) => (
                      <Card
                        key={domo.id}
                        className={`overflow-hidden transition-all cursor-pointer hover:shadow-lg border-viella-beige ${
                          selectedDomo?.id === domo.id ? "ring-2 ring-viella-accent shadow-lg" : ""
                        } ${!domo.available ? "opacity-60" : ""}`}
                        onClick={() => domo.available && setSelectedDomo(domo)}
                      >
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="relative">
                            <Image
                              src={getStrapiMediaUrl(domo.image) || "/placeholder.jpg"}
                              alt={domo.name}
                              width={400}
                              height={300}
                              className="w-full h-64 md:h-full object-cover"
                            />
                            <div className="absolute top-4 left-4">
                              <Badge
                                variant={domo.available ? "default" : "destructive"}
                                className={domo.available ? "bg-viella-accent font-dm-sans" : "font-dm-sans"}
                              >
                                {domo.available ? "Disponible" : "Ocupado"}
                              </Badge>
                            </div>
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-viella-cream text-viella-deep font-dm-sans">
                                <Star className="h-3 w-3 mr-1 fill-current text-yellow-400" />
                                {domo.rating}
                              </Badge>
                            </div>
                          </div>

                          <div className="md:col-span-2 p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <CardTitle className="text-2xl font-cormorant text-viella-deep">{domo.name}</CardTitle>
                                <CardDescription className="flex items-center mt-2 font-dm-sans text-viella-brown">
                                  <Users className="h-4 w-4 mr-2" />
                                  {domo.capacity}
                                </CardDescription>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-cormorant font-semibold text-viella-accent">${domo.price}</div>
                                <div className="text-sm font-dm-sans text-viella-brown">por noche</div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {domo.features && domo.features.length > 0 && (
                                <div>
                                  <h4 className="font-dm-sans font-semibold text-viella-deep mb-2">Características:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {domo.features.map((feature: any, index: number) => (
                                      <Badge key={index} variant="outline" className="font-dm-sans text-viella-accent border-viella-accent">
                                        {typeof feature === 'string' ? feature : feature.label || feature.name}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs font-dm-sans border-viella-beige text-viella-brown">
                                  <Wifi className="h-3 w-3 mr-1" />
                                  WiFi
                                </Badge>
                                <Badge variant="outline" className="text-xs font-dm-sans border-viella-beige text-viella-brown">
                                  <Car className="h-3 w-3 mr-1" />
                                  Parking
                                </Badge>
                                <Badge variant="outline" className="text-xs font-dm-sans border-viella-beige text-viella-brown">
                                  <Coffee className="h-3 w-3 mr-1" />
                                  Desayuno
                                </Badge>
                                <Badge variant="outline" className="text-xs font-dm-sans border-viella-beige text-viella-brown">
                                  <Utensils className="h-3 w-3 mr-1" />
                                  Cocina
                                </Badge>
                              </div>

                              <div className="flex gap-3 pt-2">
                                <Link href={`/domo/${domo.slug}`}>
                                  <Button
                                    variant="outline"
                                    className="font-dm-sans border-viella-accent text-viella-accent hover:bg-viella-beige/30 bg-transparent"
                                  >
                                    Ver Detalles
                                  </Button>
                                </Link>
                                {selectedDomo?.id === domo.id && (
                                  <Badge className="bg-viella-accent/10 text-viella-accent font-dm-sans px-3 py-1">
                                    <Check className="h-4 w-4 mr-1" />
                                    Seleccionado
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 shadow-lg border-viella-beige">
                  <CardHeader>
                    <CardTitle className="font-cormorant text-viella-deep">Resumen de Reserva</CardTitle>
                    <CardDescription className="font-dm-sans text-viella-brown">Revisa los detalles antes de confirmar</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {selectedDomoData ? (
                      <>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-dm-sans font-semibold text-viella-deep">Domo seleccionado:</h4>
                            <p className="text-lg font-cormorant text-viella-accent">{selectedDomoData.name}</p>
                            <p className="font-dm-sans text-viella-brown">{selectedDomoData.capacity}</p>
                          </div>

                          {selectedDates && selectedDates.from && selectedDates.to && (
                            <div>
                              <h4 className="font-dm-sans font-semibold text-viella-deep">Fechas:</h4>
                              <p className="font-dm-sans text-viella-brown">
                                {selectedDates.from.toLocaleDateString()} -{" "}
                                {selectedDates.to.toLocaleDateString()}
                              </p>
                              <p className="font-dm-sans text-viella-brown">
                                {nights} noche{nights !== 1 ? "s" : ""}
                              </p>
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-dm-sans font-medium text-viella-deep mb-2">Número de huéspedes</label>
                            <select
                              value={guests}
                              onChange={(e) => setGuests(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-viella-beige rounded-lg focus:ring-2 focus:ring-viella-accent focus:border-viella-accent font-dm-sans text-viella-deep bg-viella-cream"
                            >
                              {Array.from({ length: selectedDomoData.maxCapacity || 6 }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num}>{num} {num === 1 ? 'huésped' : 'huéspedes'}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {nights > 0 && (
                          <>
                            <Separator className="bg-viella-beige" />
                            <div className="space-y-2">
                              {loadingPrice ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="h-4 w-4 animate-spin text-viella-accent" />
                                  <span className="ml-2 text-sm font-dm-sans text-viella-brown">Calculando precio...</span>
                                </div>
                              ) : priceCalculation ? (
                                <>
                                  {priceCalculation.seasons.length > 0 && (
                                    <div className="space-y-1 mb-2">
                                      {priceCalculation.seasons.map((season: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-sm font-dm-sans">
                                          <span className="text-viella-brown">
                                            Temporada ({season.nights} noche{season.nights !== 1 ? 's' : ''}) x{season.multiplier.toFixed(2)}
                                          </span>
                                          <span className="text-viella-deep">${season.price.toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="flex justify-between font-dm-sans text-viella-deep">
                                    <span>
                                      ${priceCalculation.basePrice} x {priceCalculation.nights} noche{priceCalculation.nights !== 1 ? "s" : ""}
                                    </span>
                                    <span>${priceCalculation.subtotal.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm font-dm-sans text-viella-brown">
                                    <span>Limpieza</span>
                                    <span>${priceCalculation.fees.cleaning.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm font-dm-sans text-viella-brown">
                                    <span>Tasas</span>
                                    <span>${priceCalculation.fees.taxes.toFixed(2)}</span>
                                  </div>
                                  <Separator className="bg-viella-beige" />
                                  <div className="flex justify-between font-dm-sans font-semibold text-lg">
                                    <span className="text-viella-deep">Total</span>
                                    <span className="text-viella-accent">${priceCalculation.total.toFixed(2)}</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex justify-between font-dm-sans text-viella-deep">
                                    <span>
                                      ${selectedDomoData.price} x {nights} noche{nights !== 1 ? "s" : ""}
                                    </span>
                                    <span>${(selectedDomoData.price * nights).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm font-dm-sans text-viella-brown">
                                    <span>Limpieza</span>
                                    <span>$25.00</span>
                                  </div>
                                  <div className="flex justify-between text-sm font-dm-sans text-viella-brown">
                                    <span>Tasas</span>
                                    <span>$15.00</span>
                                  </div>
                                  <Separator className="bg-viella-beige" />
                                  <div className="flex justify-between font-dm-sans font-semibold text-lg">
                                    <span className="text-viella-deep">Total</span>
                                    <span className="text-viella-accent">${totalPrice.toFixed(2)}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </>
                        )}

                        <div className="space-y-3">
                          <Button
                            className="w-full bg-viella-accent text-viella-cream hover:bg-viella-deep font-dm-sans"
                            size="lg"
                            disabled={!selectedDates || !selectedDates.from || !selectedDates.to || isCheckingAvailability || (!isAvailable && availabilityChecked)}
                            onClick={() => setShowBookingForm(true)}
                          >
                            {isCheckingAvailability ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Verificando...
                              </>
                            ) : !selectedDates || !selectedDates.from || !selectedDates.to ? (
                              "Selecciona fechas"
                            ) : !isAvailable && availabilityChecked ? (
                              "No disponible"
                            ) : (
                              <>
                                <CreditCard className="mr-2 h-5 w-5" />
                                Confirmar Reserva
                              </>
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full font-dm-sans border-viella-accent text-viella-accent hover:bg-viella-beige/30 bg-transparent"
                            onClick={() => setShowContactForm(true)}
                          >
                            <MessageCircle className="mr-2 h-5 w-5" />
                            Consultar por WhatsApp
                          </Button>
                        </div>

                        <p className="text-sm font-dm-sans text-viella-brown text-center">
                          No se realizará ningún cargo hasta confirmar la reserva
                        </p>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="h-12 w-12 text-viella-beige mx-auto mb-4" />
                        <p className="font-dm-sans text-viella-brown">Selecciona un domo y las fechas para ver el resumen de tu reserva</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Booking Form Modal */}
          {showBookingForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-viella-beige">
                <CardHeader>
                  <CardTitle className="font-cormorant text-viella-deep">Completar Reserva</CardTitle>
                  <CardDescription className="font-dm-sans text-viella-brown">Ingresa tus datos para confirmar la reserva</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitReservation} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-dm-sans font-medium text-viella-deep mb-2">Nombre *</label>
                        <Input
                          type="text"
                          name="guestName"
                          placeholder="Tu nombre"
                          value={formData.guestName}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-dm-sans font-medium text-viella-deep mb-2">Apellido</label>
                        <Input
                          type="text"
                          placeholder="Tu apellido"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-dm-sans font-medium text-viella-deep mb-2">Email *</label>
                      <Input
                        type="email"
                        name="guestEmail"
                        placeholder="tu@email.com"
                        value={formData.guestEmail}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-dm-sans font-medium text-viella-deep mb-2">Teléfono *</label>
                      <Input
                        type="tel"
                        name="guestPhone"
                        placeholder="+34 123 456 789"
                        value={formData.guestPhone}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-dm-sans font-medium text-viella-deep mb-2">Solicitudes especiales</label>
                      <Textarea
                        name="specialRequests"
                        rows={3}
                        placeholder="¿Hay algo especial que debamos saber? (celebración, alergias, etc.)"
                        value={formData.specialRequests}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="bg-viella-beige/30 p-4 rounded-lg">
                      <h4 className="font-cormorant font-semibold text-viella-deep mb-2">Resumen de la reserva:</h4>
                      <p className="font-dm-sans text-viella-deep">
                        <strong>Domo:</strong> {selectedDomoData?.name}
                      </p>
                      {selectedDates && selectedDates.from && selectedDates.to && (
                        <p className="font-dm-sans text-viella-deep">
                          <strong>Fechas:</strong> {selectedDates.from.toLocaleDateString()} -{" "}
                          {selectedDates.to.toLocaleDateString()}
                        </p>
                      )}
                      <p className="font-dm-sans text-viella-deep">
                        <strong>Huéspedes:</strong> {guests}
                      </p>
                      <p className="font-dm-sans text-viella-deep">
                        <strong>Total:</strong> ${totalPrice}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        className="flex-1 bg-viella-accent text-viella-cream hover:bg-viella-deep font-dm-sans"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Proceder al Pago
                          </>
                        )}
                      </Button>
                      <Button type="button" variant="outline" className="font-dm-sans border-viella-beige text-viella-brown hover:bg-viella-sand" onClick={() => setShowBookingForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Contact Form Modal */}
          {showContactForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md border-viella-beige">
                <CardHeader>
                  <CardTitle className="font-cormorant text-viella-deep">Consulta sobre Reservas</CardTitle>
                  <CardDescription className="font-dm-sans text-viella-brown">¿Tienes preguntas específicas? Contáctanos directamente</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-dm-sans font-medium text-viella-deep mb-2">Nombre</label>
                      <Input
                        type="text"
                        placeholder="Tu nombre"
                        value={contactForm.nombre}
                        onChange={e => setContactForm(p => ({ ...p, nombre: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-dm-sans font-medium text-viella-deep mb-2">WhatsApp / Teléfono</label>
                      <Input type="tel" placeholder="+34 123 456 789" />
                    </div>
                    <div>
                      <label className="block text-sm font-dm-sans font-medium text-viella-deep mb-2">Consulta</label>
                      <Textarea
                        rows={3}
                        placeholder="¿En qué podemos ayudarte?"
                        value={contactForm.consulta}
                        onChange={e => setContactForm(p => ({ ...p, consulta: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 bg-viella-accent text-viella-cream hover:bg-viella-deep font-dm-sans">
                        Enviar Consulta
                      </Button>
                      <Button type="button" variant="outline" className="font-dm-sans border-viella-beige text-viella-brown hover:bg-viella-sand" onClick={() => setShowContactForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Additional Info */}
          {!loading && (
            <div className="grid md:grid-cols-2 gap-8 mt-16">
              <Card className="shadow-lg border-viella-beige">
                <CardHeader>
                  <CardTitle className="font-cormorant text-viella-deep">Políticas de Reserva</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm font-dm-sans text-viella-brown">
                  <p>• Check-in: 15:00 hrs | Check-out: 11:00 hrs</p>
                  <p>• Cancelación gratuita hasta 48 hrs antes</p>
                  <p>• Se requiere depósito del 50% para confirmar</p>
                  <p>• Mascotas bienvenidas (consultar condiciones)</p>
                  <p>• Edad mínima: 18 años para reservar</p>
                  <p>• Capacidad máxima estrictamente respetada</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-viella-beige">
                <CardHeader>
                  <CardTitle className="font-cormorant text-viella-deep">¿Necesitas ayuda?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="font-dm-sans text-viella-brown">Nuestro equipo está disponible para ayudarte con tu reserva</p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start font-dm-sans bg-transparent border-viella-accent text-viella-accent hover:bg-viella-beige/30"
                      onClick={() => window.open("https://wa.me/34123456789", "_blank")}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp: +34 123 456 789
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start font-dm-sans bg-transparent border-viella-accent text-viella-accent hover:bg-viella-beige/30"
                      onClick={() => window.open("mailto:reservas@laviellaglamping.com")}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Email: reservas@laviellaglamping.com
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  )
}

export default function ReservasPage() {
  return (
    <Suspense>
      <ReservasContent />
    </Suspense>
  )
}
