"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Wifi, Car, Coffee, Utensils, ArrowLeft, MessageCircle } from "lucide-react"

const domos = [
  {
    id: 1,
    name: "Domo Estrella",
    capacity: "2-3 personas",
    price: 120,
    available: true,
    features: ["Vista panorámica", "Terraza privada", "Baño completo"],
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 2,
    name: "Domo Luna",
    capacity: "2-4 personas",
    price: 140,
    available: true,
    features: ["Jacuzzi privado", "Chimenea", "Cocina equipada"],
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 3,
    name: "Domo Sol",
    capacity: "4-6 personas",
    price: 180,
    available: false,
    features: ["Espacio familiar", "Dos habitaciones", "Sala de estar"],
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 4,
    name: "Domo Bosque",
    capacity: "2-3 personas",
    price: 130,
    available: true,
    features: ["Rodeado de árboles", "Máxima privacidad", "Observación de aves"],
    image: "/placeholder.svg?height=300&width=400",
  },
]

export default function ReservasPage() {
  const [selectedDates, setSelectedDates] = useState({ checkin: "", checkout: "" })
  const [selectedDomo, setSelectedDomo] = useState<number | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center text-green-800 hover:text-green-900">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-2xl font-bold">La Viella</span>
          </Link>
          <div className="text-lg font-semibold text-gray-700">Sistema de Reservas</div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Reserva tu Domo</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecciona las fechas y el domo perfecto para tu experiencia de glamping en La Viella
          </p>
        </div>

        {/* Date Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Selecciona tus fechas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de entrada</label>
                <input
                  type="date"
                  value={selectedDates.checkin}
                  onChange={(e) => setSelectedDates({ ...selectedDates, checkin: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de salida</label>
                <input
                  type="date"
                  value={selectedDates.checkout}
                  onChange={(e) => setSelectedDates({ ...selectedDates, checkout: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Domos Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {domos.map((domo) => (
            <Card
              key={domo.id}
              className={`overflow-hidden transition-all ${selectedDomo === domo.id ? "ring-2 ring-green-500" : ""} ${!domo.available ? "opacity-60" : ""}`}
            >
              <div className="relative">
                <Image
                  src={domo.image || "/placeholder.svg"}
                  alt={domo.name}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge
                    variant={domo.available ? "default" : "destructive"}
                    className={domo.available ? "bg-green-600" : ""}
                  >
                    {domo.available ? "Disponible" : "Ocupado"}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{domo.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Users className="h-4 w-4 mr-1" />
                      {domo.capacity}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-800">${domo.price}</div>
                    <div className="text-sm text-gray-600">por noche</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Características destacadas:</h4>
                    <ul className="space-y-1">
                      {domo.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
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

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-800 hover:bg-green-900"
                      disabled={!domo.available}
                      onClick={() => setSelectedDomo(domo.id)}
                    >
                      {domo.available ? "Seleccionar" : "No disponible"}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowContactForm(true)}
                      className="border-green-800 text-green-800 hover:bg-green-50"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reservation Summary */}
        {selectedDomo && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Resumen de Reserva</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Domo seleccionado:</h4>
                  <p className="text-lg">{domos.find((d) => d.id === selectedDomo)?.name}</p>
                  <p className="text-gray-600">{domos.find((d) => d.id === selectedDomo)?.capacity}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Fechas:</h4>
                  <p>Entrada: {selectedDates.checkin || "Por seleccionar"}</p>
                  <p>Salida: {selectedDates.checkout || "Por seleccionar"}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-green-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total estimado:</span>
                  <span className="text-2xl font-bold text-green-800">
                    ${domos.find((d) => d.id === selectedDomo)?.price || 0} / noche
                  </span>
                </div>
                <Button className="w-full bg-green-800 hover:bg-green-900" size="lg">
                  Confirmar Reserva
                </Button>
              </div>
            </CardContent>
          </Card>
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
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp / Teléfono</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Consulta</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="¿En qué podemos ayudarte?"
                    ></textarea>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 bg-green-800 hover:bg-green-900">
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
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>• Check-in: 15:00 hrs | Check-out: 11:00 hrs</p>
              <p>• Cancelación gratuita hasta 48 hrs antes</p>
              <p>• Se requiere depósito del 50% para confirmar</p>
              <p>• Mascotas bienvenidas (consultar condiciones)</p>
              <p>• Edad mínima: 18 años para reservar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>¿Necesitas ayuda?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Nuestro equipo está disponible para ayudarte con tu reserva</p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp: +1 234 567 8900
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="h-4 w-4 mr-2" />
                  Email: reservas@laviella.com
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
