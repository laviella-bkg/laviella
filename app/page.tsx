import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Calendar,
  Users,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Star,
  Leaf,
  Mountain,
  TreePine,
  Bird,
} from "lucide-react"

const domos = [
  {
    id: 1,
    name: "Domo Estrella",
    capacity: "2-3 personas",
    price: 120,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    features: ["Vista panorámica", "Terraza privada", "Baño completo"],
    rating: 4.9,
  },
  {
    id: 2,
    name: "Domo Luna",
    capacity: "2-4 personas",
    price: 140,
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
    features: ["Jacuzzi privado", "Chimenea", "Cocina equipada"],
    rating: 4.8,
  },
  {
    id: 3,
    name: "Domo Sol",
    capacity: "4-6 personas",
    price: 180,
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80",
    features: ["Espacio familiar", "Dos habitaciones", "Sala de estar"],
    rating: 4.9,
  },
  {
    id: 4,
    name: "Domo Bosque",
    capacity: "2-3 personas",
    price: 130,
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    features: ["Rodeado de árboles", "Máxima privacidad", "Observación de aves"],
    rating: 5.0,
  },
]

const testimonials = [
  {
    name: "María González",
    location: "Madrid",
    rating: 5,
    comment: "Una experiencia increíble. Despertar rodeado de naturaleza en un domo tan cómodo fue mágico.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Carlos Ruiz",
    location: "Barcelona",
    rating: 5,
    comment: "Perfecto para desconectar. El domo tenía todas las comodidades y la vista era espectacular.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  },
  {
    name: "Ana Martín",
    location: "Valencia",
    rating: 5,
    comment: "Ideal para una escapada romántica. El jacuzzi bajo las estrellas fue inolvidable.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
  },
]

const activities = [
  {
    icon: TreePine,
    title: "Senderismo",
    description: "Rutas guiadas por senderos naturales con vistas panorámicas",
  },
  {
    icon: Bird,
    title: "Observación de Aves",
    description: "Descubre la rica fauna local en su hábitat natural",
  },
  {
    icon: Mountain,
    title: "Escalada",
    description: "Paredes de roca natural para todos los niveles",
  },
  {
    icon: Star,
    title: "Astronomía",
    description: "Noches estrelladas perfectas para observar el cosmos",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-emerald-600" />
            <div className="text-2xl font-bold text-emerald-800">La Viella Glamping</div>
          </div>
          <div className="hidden md:flex space-x-6">
            <Link href="#inicio" className="text-gray-700 hover:text-emerald-700 transition-colors">
              Inicio
            </Link>
            <Link href="#domos" className="text-gray-700 hover:text-emerald-700 transition-colors">
              Domos
            </Link>
            <Link href="#experiencias" className="text-gray-700 hover:text-emerald-700 transition-colors">
              Experiencias
            </Link>
            <Link href="/contacto" className="text-gray-700 hover:text-emerald-700 transition-colors">
              Contacto
            </Link>
          </div>
          <Link href="/reservas">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Reservar Ahora</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="pt-20 pb-16 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  <Leaf className="h-4 w-4 mr-2" />
                  Experiencia Única en la Naturaleza
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Glamping de Lujo en
                  <span className="text-emerald-700 block">La Viella</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Desconecta del mundo y reconecta contigo mismo en nuestros domos de lujo. Una experiencia única donde
                  el confort moderno se encuentra con la naturaleza salvaje.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/reservas">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                    <Calendar className="mr-2 h-5 w-5" />
                    Reservar Ahora
                  </Button>
                </Link>
                <Link href="#domos">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-8 bg-transparent"
                  >
                    <Mountain className="mr-2 h-5 w-5" />
                    Ver Domos
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700">4.9</div>
                  <div className="text-sm text-gray-600">Rating</div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700">100+</div>
                  <div className="text-sm text-gray-600">Huéspedes Felices</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700">4</div>
                  <div className="text-sm text-gray-600">Domos Únicos</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80"
                  alt="Domo de glamping en La Viella rodeado de naturaleza"
                  width={700}
                  height={600}
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Wifi className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">WiFi Gratis</div>
                    <div className="text-sm text-gray-600">Alta velocidad</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <TreePine className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">100% Natural</div>
                    <div className="text-sm text-gray-600">Entorno virgen</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Por qué elegir La Viella?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ofrecemos una experiencia de glamping única que combina lujo, naturaleza y sostenibilidad
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-800">Sostenible</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Construidos con materiales ecológicos y energía renovable. Cuidamos el medio ambiente.
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-800">Lujo Natural</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Todas las comodidades modernas en un entorno natural único. Confort sin compromisos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mountain className="h-8 w-8 text-emerald-600" />
                </div>
                <CardTitle className="text-emerald-800">Ubicación Única</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Rodeado de montañas y bosques vírgenes. El lugar perfecto para desconectar.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Domos Section */}
      <section id="domos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Domos</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cada domo está diseñado para ofrecer una experiencia única, con vistas espectaculares y todas las
              comodidades
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {domos.map((domo) => (
              <Card key={domo.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative">
                  <Image
                    src={domo.image || "/placeholder.svg"}
                    alt={domo.name}
                    width={600}
                    height={400}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-emerald-600 text-white">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {domo.rating}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white text-emerald-800 font-semibold">${domo.price}/noche</Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl text-gray-900">{domo.name}</CardTitle>
                      <CardDescription className="flex items-center mt-2 text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {domo.capacity}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
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
                      <Link href={`/domo/${domo.id}`} className="flex-1">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Ver Detalles</Button>
                      </Link>
                      <Link href="/reservas">
                        <Button
                          variant="outline"
                          className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                        >
                          Reservar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section id="experiencias" className="py-20 bg-emerald-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Experiencias en la Naturaleza</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre actividades únicas que te conectarán con la naturaleza y crearán recuerdos inolvidables
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {activities.map((activity, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-emerald-200">
                <CardHeader>
                  <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <activity.icon className="h-8 w-8 text-emerald-600" />
                  </div>
                  <CardTitle className="text-emerald-800">{activity.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{activity.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Lo que dicen nuestros huéspedes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experiencias reales de personas que han vivido la magia de La Viella
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.location}</CardDescription>
                    </div>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">"{testimonial.comment}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold">¿Listo para tu aventura?</h2>
            <p className="text-xl text-emerald-100">
              Reserva ahora y vive una experiencia única en contacto con la naturaleza. Desconecta del estrés y
              reconecta contigo mismo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/reservas">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8">
                  <Calendar className="mr-2 h-5 w-5" />
                  Reservar Ahora
                </Button>
              </Link>
              <Link href="/contacto">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-emerald-600 px-8 bg-transparent"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Más Información
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Leaf className="h-6 w-6 text-emerald-400" />
                <h3 className="text-xl font-bold">La Viella Glamping</h3>
              </div>
              <p className="text-gray-400">
                Experiencias únicas de glamping en contacto con la naturaleza. Lujo sostenible en un entorno natural
                incomparable.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-emerald-400">Enlaces</h4>
              <div className="space-y-2">
                <Link href="#domos" className="block text-gray-400 hover:text-white transition-colors">
                  Nuestros Domos
                </Link>
                <Link href="#experiencias" className="block text-gray-400 hover:text-white transition-colors">
                  Experiencias
                </Link>
                <Link href="/reservas" className="block text-gray-400 hover:text-white transition-colors">
                  Reservas
                </Link>
                <Link href="/contacto" className="block text-gray-400 hover:text-white transition-colors">
                  Contacto
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-emerald-400">Contacto</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Entorno Natural Privilegiado</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Abierto todo el año</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-emerald-400">Síguenos</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Instagram
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Facebook
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  YouTube
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 La Viella Glamping. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
