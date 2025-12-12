"use client"

import { useState, useEffect } from "react"
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
  ArrowLeft,
  MessageCircle,
  Star,
  Leaf,
  CreditCard,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { 
  getDomos, 
  createReservation, 
  checkAvailability, 
  getStrapiMediaUrl, 
  normalizeStrapiData, 
  calculatePriceWithSeasons
} from "@/lib/strapi"
import type { Domo, PriceCalculation } from "@/lib/strapi"

export default function ReservasPage() {
  // Data states
  const [domos, setDomos] = useState<any[]>([])
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
        const formattedDomos = data.map((domo: any) => {
          const normalized = normalizeStrapiData<Domo>(domo)
          let features: any[] = []
          if (Array.isArray(normalized.features)) {
            features = normalized.features
          } else if (typeof normalized.features === 'object' && normalized.features !== null) {
            features = Object.values(normalized.features).filter(Boolean)
          }
          
          return {
            id: normalized.id,
            name: normalized.name || "Sin nombre",
            slug: normalized.slug || `domo-${normalized.id}`,
            capacity: `${normalized.capacity || 2} personas`,
            maxCapacity: normalized.capacity || 2,
            price: normalized.basePrice || 100,
            description: normalized.description || "",
            features: features,
            image: normalized.mainImage,
            rating: 4.9,
            available: normalized.isActive !== false,
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

  // Calculate price with seasons when dates and domo are selected
  useEffect(() => {
    const calculatePrice = async () => {
      if (selectedDomo && selectedDates?.from && selectedDates?.to && selectedDomo.id) {
        setLoadingPrice(true)
        try {
          // Get full domo data to calculate price properly
          const domos = await getDomos()
          const fullDomo = domos.find(d => d.id === selectedDomo.id)
          
          if (fullDomo) {
            const calc = await calculatePriceWithSeasons(
              fullDomo,
              selectedDates.from,
              selectedDates.to
            )
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
  }, [selectedDates, selectedDomo])

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center text-emerald-800 hover:text-emerald-900">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <div className="flex items-center space-x-2">
              <Leaf className="h-6 w-6 text-emerald-600" />
              <span className="text-xl font-bold">La Viella Glamping</span>
            </div>
          </Link>
          <div className="text-lg font-semibold text-gray-700">Sistema de Reservas</div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Reserva tu Experiencia</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecciona las fechas y el domo perfecto para tu escapada a la naturaleza en La Viella
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="h-5 w-5 text-emerald-600" />
            <p className="text-emerald-800 font-medium">¡Reserva creada exitosamente! Te contactaremos pronto.</p>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 font-medium">{submitError}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Date Selection and Domos */}
            <div className="lg:col-span-2 space-y-8">
              {/* Date Selection */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-emerald-800">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Selecciona tus fechas
                  </CardTitle>
                  <CardDescription>Elige las fechas de entrada y salida para tu estadía</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <Calendar
                      mode="range"
                      selected={selectedDates}
                      onSelect={(dates) => setSelectedDates(dates as any)}
                      className="rounded-md border"
                      disabled={(date) => date < new Date()}
                    />
                  </div>
                  {selectedDates && selectedDates.from && selectedDates.to && (
                    <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                      <p className="text-emerald-800 font-semibold">
                        Fechas seleccionadas: {nights} noche{nights !== 1 ? "s" : ""}
                      </p>
                      <p className="text-emerald-700">
                        Del {selectedDates.from.toLocaleDateString()} al{" "}
                        {selectedDates.to.toLocaleDateString()}
                      </p>
                      {isCheckingAvailability && (
                        <p className="text-sm text-emerald-600 mt-2 flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Verificando disponibilidad...
                        </p>
                      )}
                      {availabilityChecked && !isCheckingAvailability && (
                        <div className={`mt-2 p-2 rounded ${isAvailable ? 'bg-emerald-100' : 'bg-red-100'}`}>
                          <p className={`text-sm font-medium ${isAvailable ? 'text-emerald-800' : 'text-red-800'}`}>
                            {isAvailable ? '✓ Disponible' : '✗ No disponible en estas fechas'}
                          </p>
                        </div>
                      )}
                      {availabilityError && (
                        <p className="text-sm text-red-600 mt-2">{availabilityError}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Domos Grid */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Elige tu Domo</h2>
                <div className="grid gap-6">
                  {domos.map((domo) => (
                    <Card
                      key={domo.id}
                      className={`overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
                        selectedDomo?.id === domo.id ? "ring-2 ring-emerald-500 shadow-lg" : ""
                      } ${!domo.available ? "opacity-60" : ""}`}
                      onClick={() => domo.available && setSelectedDomo(domo)}
                    >
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="relative">
                          <Image
                            src={getStrapiMediaUrl(domo.image)}
                            alt={domo.name}
                            width={400}
                            height={300}
                            className="w-full h-64 md:h-full object-cover"
                          />
                          <div className="absolute top-4 left-4">
                            <Badge
                              variant={domo.available ? "default" : "destructive"}
                              className={domo.available ? "bg-emerald-600" : ""}
                            >
                              {domo.available ? "Disponible" : "Ocupado"}
                            </Badge>
                          </div>
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-white text-emerald-800">
                              <Star className="h-3 w-3 mr-1 fill-current text-yellow-400" />
                              {domo.rating}
                            </Badge>
                          </div>
                        </div>

                        <div className="md:col-span-2 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <CardTitle className="text-2xl text-gray-900">{domo.name}</CardTitle>
                              <CardDescription className="flex items-center mt-2">
                                <Users className="h-4 w-4 mr-2" />
                                {domo.capacity}
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-emerald-700">${domo.price}</div>
                              <div className="text-sm text-gray-600">por noche</div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {domo.features && domo.features.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Características:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {domo.features.map((feature: any, index: number) => (
                                    <Badge key={index} variant="outline" className="text-emerald-700 border-emerald-200">
                                      {typeof feature === 'string' ? feature : feature.label || feature.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                <Wifi className="h-3 w-3 mr-1" />
                                WiFi
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Car className="h-3 w-3 mr-1" />
                                Parking
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Coffee className="h-3 w-3 mr-1" />
                                Desayuno
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Utensils className="h-3 w-3 mr-1" />
                                Cocina
                              </Badge>
                            </div>

                            <div className="flex gap-3 pt-2">
                              <Link href={`/domo/${domo.slug}`}>
                                <Button
                                  variant="outline"
                                  className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                                >
                                  Ver Detalles
                                </Button>
                              </Link>
                              {selectedDomo?.id === domo.id && (
                                <Badge className="bg-emerald-100 text-emerald-800 px-3 py-1">
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
              <Card className="sticky top-24 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-emerald-800">Resumen de Reserva</CardTitle>
                  <CardDescription>Revisa los detalles antes de confirmar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedDomoData ? (
                    <>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">Domo seleccionado:</h4>
                          <p className="text-lg text-emerald-700">{selectedDomoData.name}</p>
                          <p className="text-gray-600">{selectedDomoData.capacity}</p>
                        </div>

                        {selectedDates && selectedDates.from && selectedDates.to && (
                          <div>
                            <h4 className="font-semibold text-gray-900">Fechas:</h4>
                            <p className="text-gray-600">
                              {selectedDates.from.toLocaleDateString()} -{" "}
                              {selectedDates.to.toLocaleDateString()}
                            </p>
                            <p className="text-gray-600">
                              {nights} noche{nights !== 1 ? "s" : ""}
                            </p>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Número de huéspedes</label>
                          <select
                            value={guests}
                            onChange={(e) => setGuests(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            {Array.from({ length: selectedDomoData.maxCapacity || 6 }, (_, i) => i + 1).map(num => (
                              <option key={num} value={num}>{num} {num === 1 ? 'huésped' : 'huéspedes'}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {nights > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-2">
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
                                          Temporada ({season.nights} noche{season.nights !== 1 ? 's' : ''}) x{season.multiplier.toFixed(2)}
                                        </span>
                                        <span>${season.price.toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span>
                                    ${priceCalculation.basePrice} x {priceCalculation.nights} noche{priceCalculation.nights !== 1 ? "s" : ""}
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
                              <>
                                <div className="flex justify-between">
                                  <span>
                                    ${selectedDomoData.price} x {nights} noche{nights !== 1 ? "s" : ""}
                                  </span>
                                  <span>${(selectedDomoData.price * nights).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>Limpieza</span>
                                  <span>$25.00</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>Tasas</span>
                                  <span>$15.00</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold text-lg">
                                  <span>Total</span>
                                  <span className="text-emerald-700">${totalPrice.toFixed(2)}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </>
                      )}

                      <div className="space-y-3">
                        <Button
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
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
                          className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                          onClick={() => setShowContactForm(true)}
                        >
                          <MessageCircle className="mr-2 h-5 w-5" />
                          Consultar por WhatsApp
                        </Button>
                      </div>

                      <p className="text-sm text-gray-600 text-center">
                        No se realizará ningún cargo hasta confirmar la reserva
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Selecciona un domo y las fechas para ver el resumen de tu reserva</p>
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
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Completar Reserva</CardTitle>
                <CardDescription>Ingresa tus datos para confirmar la reserva</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReservation} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                      <Input 
                        type="text" 
                        placeholder="Tu apellido"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Solicitudes especiales</label>
                    <Textarea
                      name="specialRequests"
                      rows={3}
                      placeholder="¿Hay algo especial que debamos saber? (celebración, alergias, etc.)"
                      value={formData.specialRequests}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-emerald-800 mb-2">Resumen de la reserva:</h4>
                    <p>
                      <strong>Domo:</strong> {selectedDomoData?.name}
                    </p>
                    {selectedDates && selectedDates.from && selectedDates.to && (
                      <p>
                        <strong>Fechas:</strong> {selectedDates.from.toLocaleDateString()} -{" "}
                        {selectedDates.to.toLocaleDateString()}
                      </p>
                    )}
                    <p>
                      <strong>Huéspedes:</strong> {guests}
                    </p>
                    <p>
                      <strong>Total:</strong> ${totalPrice}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
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
                    <Button type="button" variant="outline" onClick={() => setShowBookingForm(false)}>
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
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Consulta sobre Reservas</CardTitle>
                <CardDescription>¿Tienes preguntas específicas? Contáctanos directamente</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <Input type="text" placeholder="Tu nombre" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp / Teléfono</label>
                    <Input type="tel" placeholder="+34 123 456 789" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Consulta</label>
                    <Textarea rows={3} placeholder="¿En qué podemos ayudarte?" />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      Enviar Consulta
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowContactForm(false)}>
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
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-emerald-800">Políticas de Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>• Check-in: 15:00 hrs | Check-out: 11:00 hrs</p>
                <p>• Cancelación gratuita hasta 48 hrs antes</p>
                <p>• Se requiere depósito del 50% para confirmar</p>
                <p>• Mascotas bienvenidas (consultar condiciones)</p>
                <p>• Edad mínima: 18 años para reservar</p>
                <p>• Capacidad máxima estrictamente respetada</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-emerald-800">¿Necesitas ayuda?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">Nuestro equipo está disponible para ayudarte con tu reserva</p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => window.open("https://wa.me/34123456789", "_blank")}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp: +34 123 456 789
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent border-emerald-600 text-emerald-700 hover:bg-emerald-50"
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
      </div>
    </div>
  )
}
