"use client"

import { useState } from "react"
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
} from "lucide-react"

const domos = [
  {
    id: 1,
    name: "Domo Estrella",
    capacity: "2-3 personas",
    price: 120,
    available: true,
    features: ["Vista panorámica", "Terraza privada", "Baño completo"],
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    rating: 4.9,
  },
  {
    id: 2,
    name: "Domo Luna",
    capacity: "2-4 personas",
    price: 140,
    available: true,
    features: ["Jacuzzi privado", "Chimenea", "Cocina equipada"],
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    rating: 4.8,
  },
  {
    id: 3,
    name: "Domo Sol",
    capacity: "4-6 personas",
    price: 180,
    available: false,
    features: ["Espacio familiar", "Dos habitaciones", "Sala de estar"],
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
    rating: 4.9,
  },
  {
    id: 4,
    name: "Domo Bosque",
    capacity: "2-3 personas",
    price: 130,
    available: true,
    features: ["Rodeado de árboles", "Máxima privacidad", "Observación de aves"],
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    rating: 5.0,
  },
]

export default function ReservasPage() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [selectedDomo, setSelectedDomo] = useState<number | null>(null)
  const [guests, setGuests] = useState(2)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)

  const selectedDomoData = domos.find((d) => d.id === selectedDomo)
  const nights = selectedDates.length > 1 ? selectedDates.length - 1 : 0
  const totalPrice = selectedDomoData ? selectedDomoData.price * nights : 0

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
                    onSelect={(dates) => setSelectedDates(dates || [])}
                    className="rounded-md border"
                    disabled={(date) => date < new Date()}
                  />
                </div>
                {selectedDates.length > 1 && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                    <p className="text-emerald-800 font-semibold">
                      Fechas seleccionadas: {nights} noche{nights !== 1 ? "s" : ""}
                    </p>
                    <p className="text-emerald-700">
                      Del {selectedDates[0]?.toLocaleDateString()} al{" "}
                      {selectedDates[selectedDates.length - 1]?.toLocaleDateString()}
                    </p>
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
                      selectedDomo === domo.id ? "ring-2 ring-emerald-500 shadow-lg" : ""
                    } ${!domo.available ? "opacity-60" : ""}`}
                    onClick={() => domo.available && setSelectedDomo(domo.id)}
                  >
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="relative">
                        <Image
                          src={domo.image || "/placeholder.svg"}
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
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Características:</h4>
                            <div className="flex flex-wrap gap-2">
                              {domo.features.map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-emerald-700 border-emerald-200">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>

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
                            <Link href={`/domo/${domo.id}`}>
                              <Button
                                variant="outline"
                                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                              >
                                Ver Detalles
                              </Button>
                            </Link>
                            {selectedDomo === domo.id && (
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

                      {selectedDates.length > 1 && (
                        <div>
                          <h4 className="font-semibold text-gray-900">Fechas:</h4>
                          <p className="text-gray-600">
                            {selectedDates[0]?.toLocaleDateString()} -{" "}
                            {selectedDates[selectedDates.length - 1]?.toLocaleDateString()}
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
                          <option value={1}>1 huésped</option>
                          <option value={2}>2 huéspedes</option>
                          <option value={3}>3 huéspedes</option>
                          <option value={4}>4 huéspedes</option>
                          <option value={5}>5 huéspedes</option>
                          <option value={6}>6 huéspedes</option>
                        </select>
                      </div>
                    </div>

                    {nights > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>
                              ${selectedDomoData.price} x {nights} noche{nights !== 1 ? "s" : ""}
                            </span>
                            <span>${totalPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Limpieza</span>
                            <span>$25</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tasas</span>
                            <span>$15</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total</span>
                            <span className="text-emerald-700">${totalPrice + 40}</span>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-3">
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        size="lg"
                        disabled={selectedDates.length < 2}
                        onClick={() => setShowBookingForm(true)}
                      >
                        {selectedDates.length < 2 ? (
                          "Selecciona fechas"
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

        {/* Booking Form Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Completar Reserva</CardTitle>
                <CardDescription>Ingresa tus datos para confirmar la reserva</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                      <Input type="text" placeholder="Tu nombre" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apellido *</label>
                      <Input type="text" placeholder="Tu apellido" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <Input type="email" placeholder="tu@email.com" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                    <Input type="tel" placeholder="+34 123 456 789" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Solicitudes especiales</label>
                    <Textarea
                      rows={3}
                      placeholder="¿Hay algo especial que debamos saber? (celebración, alergias, etc.)"
                    />
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-emerald-800 mb-2">Resumen de la reserva:</h4>
                    <p>
                      <strong>Domo:</strong> {selectedDomoData?.name}
                    </p>
                    <p>
                      <strong>Fechas:</strong> {selectedDates[0]?.toLocaleDateString()} -{" "}
                      {selectedDates[selectedDates.length - 1]?.toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Huéspedes:</strong> {guests}
                    </p>
                    <p>
                      <strong>Total:</strong> ${totalPrice + 40}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceder al Pago
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
      </div>
    </div>
  )
}
