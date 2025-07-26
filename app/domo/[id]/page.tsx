"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
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
} from "lucide-react"

const domosData = {
  "1": {
    id: 1,
    name: "Domo Estrella",
    capacity: "2-3 personas",
    price: 120,
    rating: 4.9,
    reviews: 47,
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "El Domo Estrella ofrece una experiencia única con vistas panorámicas espectaculares. Perfecto para parejas que buscan una escapada romántica en la naturaleza.",
    features: ["Vista panorámica", "Terraza privada", "Baño completo", "Cama king size", "Calefacción", "Minibar"],
    amenities: [
      { icon: Wifi, name: "WiFi gratuito" },
      { icon: Car, name: "Parking privado" },
      { icon: Coffee, name: "Desayuno incluido" },
      { icon: Utensils, name: "Cocina equipada" },
      { icon: Bath, name: "Baño privado" },
      { icon: Bed, name: "Cama king size" },
      { icon: Thermometer, name: "Calefacción/AC" },
    ],
  },
  "2": {
    id: 2,
    name: "Domo Luna",
    capacity: "2-4 personas",
    price: 140,
    rating: 4.8,
    reviews: 52,
    images: [
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "El Domo Luna cuenta con jacuzzi privado y chimenea, ideal para una experiencia de lujo total. Perfecto para celebraciones especiales.",
    features: ["Jacuzzi privado", "Chimenea", "Cocina equipada", "Terraza amplia", "Vista al bosque", "Zona de estar"],
    amenities: [
      { icon: Wifi, name: "WiFi gratuito" },
      { icon: Car, name: "Parking privado" },
      { icon: Coffee, name: "Desayuno incluido" },
      { icon: Utensils, name: "Cocina completa" },
      { icon: Bath, name: "Jacuzzi privado" },
      { icon: Bed, name: "Cama queen size" },
      { icon: Thermometer, name: "Chimenea" },
    ],
  },
  "3": {
    id: 3,
    name: "Domo Sol",
    capacity: "4-6 personas",
    price: 180,
    rating: 4.9,
    reviews: 38,
    images: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "El Domo Sol es perfecto para familias o grupos de amigos. Con dos habitaciones separadas y una amplia sala de estar.",
    features: [
      "Espacio familiar",
      "Dos habitaciones",
      "Sala de estar",
      "Cocina completa",
      "Dos baños",
      "Terraza grande",
    ],
    amenities: [
      { icon: Wifi, name: "WiFi gratuito" },
      { icon: Car, name: "Parking para 2 autos" },
      { icon: Coffee, name: "Desayuno incluido" },
      { icon: Utensils, name: "Cocina completa" },
      { icon: Bath, name: "Dos baños" },
      { icon: Bed, name: "Dos habitaciones" },
      { icon: Thermometer, name: "Calefacción/AC" },
    ],
  },
  "4": {
    id: 4,
    name: "Domo Bosque",
    capacity: "2-3 personas",
    price: 130,
    rating: 5.0,
    reviews: 29,
    images: [
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
    ],
    description:
      "El Domo Bosque ofrece máxima privacidad rodeado de árboles centenarios. Ideal para observación de aves y conexión total con la naturaleza.",
    features: [
      "Rodeado de árboles",
      "Máxima privacidad",
      "Observación de aves",
      "Terraza en el bosque",
      "Senderos privados",
      "Zona de meditación",
    ],
    amenities: [
      { icon: Wifi, name: "WiFi gratuito" },
      { icon: Car, name: "Parking privado" },
      { icon: Coffee, name: "Desayuno incluido" },
      { icon: Utensils, name: "Cocina equipada" },
      { icon: Bath, name: "Baño ecológico" },
      { icon: Bed, name: "Cama queen size" },
      { icon: Thermometer, name: "Calefacción natural" },
    ],
  },
}

export default function DomoPage() {
  const params = useParams()
  const domoId = params.id as string
  const domo = domosData[domoId as keyof typeof domosData]

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [guests, setGuests] = useState(2)

  if (!domo) {
    return <div>Domo no encontrado</div>
  }

  const totalPrice = selectedDates.length > 1 ? domo.price * (selectedDates.length - 1) : domo.price

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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{domo.name}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                  <span className="font-semibold">{domo.rating}</span>
                  <span className="text-gray-600 ml-1">({domo.reviews} reseñas)</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-1" />
                  <span>{domo.capacity}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-1" />
                  <span>La Viella, Naturaleza</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-700">${domo.price}</div>
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
                  src={domo.images[selectedImage] || "/placeholder.svg"}
                  alt={`${domo.name} - Imagen ${selectedImage + 1}`}
                  width={800}
                  height={500}
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {domo.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative rounded-lg overflow-hidden ${
                      selectedImage === index ? "ring-2 ring-emerald-500" : ""
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${domo.name} - Miniatura ${index + 1}`}
                      width={200}
                      height={150}
                      className="w-full h-24 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{domo.description}</p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Características Destacadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {domo.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-emerald-600 mr-3" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Comodidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {domo.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                        <amenity.icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <span>{amenity.name}</span>
                    </div>
                  ))}
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
                  <p className="text-gray-600">Check-in: 15:00 hrs | Check-out: 11:00 hrs</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cancelación</h4>
                  <p className="text-gray-600">Cancelación gratuita hasta 48 horas antes de la llegada</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Mascotas</h4>
                  <p className="text-gray-600">Mascotas bienvenidas (consultar condiciones)</p>
                </div>
              </CardContent>
            </Card>
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
                  />
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de huéspedes</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value={1}>1 huésped</option>
                    <option value={2}>2 huéspedes</option>
                    <option value={3}>3 huéspedes</option>
                    <option value={4}>4 huéspedes</option>
                    <option value={5}>5 huéspedes</option>
                    <option value={6}>6 huéspedes</option>
                  </select>
                </div>

                {/* Price Summary */}
                {selectedDates.length > 1 && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between">
                      <span>
                        ${domo.price} x {selectedDates.length - 1} noches
                      </span>
                      <span>${totalPrice}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-emerald-700">${totalPrice}</span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  size="lg"
                  disabled={selectedDates.length < 2}
                >
                  {selectedDates.length < 2 ? "Selecciona fechas" : "Reservar Ahora"}
                </Button>

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
