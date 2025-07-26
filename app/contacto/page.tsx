"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MapPin, Phone, Mail, Clock, Leaf, MessageCircle, Calendar } from "lucide-react"

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center text-emerald-800 hover:text-emerald-900">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <div className="flex items-center space-x-2">
              <Leaf className="h-6 w-6 text-emerald-600" />
              <span className="text-xl font-bold">La Viella Glamping</span>
            </div>
          </Link>
          <Link href="/reservas">
            <Button className="bg-emerald-600 hover:bg-emerald-700">Reservar Ahora</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contáctanos</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            ¿Tienes preguntas sobre nuestros domos o quieres planificar tu escapada perfecta? Estamos aquí para ayudarte
            a crear una experiencia inolvidable.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-emerald-800">Envíanos un mensaje</CardTitle>
              <CardDescription>Completa el formulario y te responderemos lo antes posible</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                    <Input
                      type="text"
                      placeholder="Tu nombre"
                      className="focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido *</label>
                    <Input
                      type="text"
                      placeholder="Tu apellido"
                      className="focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    className="focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <Input
                    type="tel"
                    placeholder="+34 123 456 789"
                    className="focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de consulta</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="">Selecciona una opción</option>
                    <option value="reserva">Consulta sobre reservas</option>
                    <option value="domo">Información sobre domos</option>
                    <option value="actividades">Actividades y experiencias</option>
                    <option value="grupo">Reservas para grupos</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fechas de interés (opcional)</label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input type="date" className="focus:ring-emerald-500 focus:border-emerald-500" />
                    <Input type="date" className="focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje *</label>
                  <Textarea
                    rows={5}
                    placeholder="Cuéntanos más sobre tu consulta o lo que necesitas saber..."
                    className="focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Enviar Mensaje
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-emerald-800">Información de contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ubicación</h3>
                    <p className="text-gray-600">
                      Entorno Natural Privilegiado
                      <br />
                      Rodeado de montañas y bosques
                      <br />
                      Acceso por carretera asfaltada
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Teléfono</h3>
                    <p className="text-gray-600">+34 123 456 789</p>
                    <p className="text-sm text-gray-500">WhatsApp disponible</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">info@laviellaglamping.com</p>
                    <p className="text-gray-600">reservas@laviellaglamping.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Horarios de atención</h3>
                    <p className="text-gray-600">
                      Lunes a Viernes: 9:00 - 18:00
                      <br />
                      Sábados: 9:00 - 14:00
                      <br />
                      Domingos: Cerrado
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-emerald-800">Acciones rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/reservas">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 justify-start">
                    <Calendar className="mr-2 h-5 w-5" />
                    Ver disponibilidad y reservar
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50 justify-start bg-transparent"
                  onClick={() => window.open("https://wa.me/34123456789", "_blank")}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Chatear por WhatsApp
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50 justify-start bg-transparent"
                  onClick={() => window.open("tel:+34123456789")}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Llamar ahora
                </Button>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-emerald-800">Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative rounded-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80"
                    alt="Mapa de ubicación de La Viella Glamping"
                    width={600}
                    height={300}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-emerald-600/20 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-4 shadow-lg text-center">
                      <MapPin className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900">La Viella Glamping</p>
                      <p className="text-sm text-gray-600">Entorno Natural</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 border-emerald-600 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                  onClick={() => window.open("https://maps.google.com", "_blank")}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Ver en Google Maps
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Preguntas Frecuentes</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Cómo llego a La Viella?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Tenemos acceso por carretera asfaltada y parking privado. Te enviaremos las indicaciones detalladas
                  una vez confirmada tu reserva.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Qué incluye la estadía?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Todas las comodidades del domo, desayuno, WiFi, parking, acceso a senderos y actividades básicas.
                  Algunas experiencias premium tienen costo adicional.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Puedo traer mascotas?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sí, las mascotas son bienvenidas con previo aviso. Aplicamos una tarifa adicional de limpieza y
                  pedimos que respeten las normas del lugar.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Hay actividades para niños?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Tenemos senderos familiares, observación de fauna, y actividades educativas sobre la naturaleza. Es un
                  lugar perfecto para que los niños conecten con el entorno natural.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
