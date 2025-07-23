import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Calendar, Users, Music, Tent, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-green-800">La Viella</div>
          <div className="hidden md:flex space-x-6">
            <Link href="#inicio" className="text-gray-700 hover:text-green-800 transition-colors">
              Inicio
            </Link>
            <Link href="#domo-eventos" className="text-gray-700 hover:text-green-800 transition-colors">
              Eventos
            </Link>
            <Link href="#glamping" className="text-gray-700 hover:text-green-800 transition-colors">
              Glamping
            </Link>
            <Link href="/reservas" className="text-gray-700 hover:text-green-800 transition-colors">
              Reservas
            </Link>
            <Link href="#contacto" className="text-gray-700 hover:text-green-800 transition-colors">
              Contacto
            </Link>
          </div>
          <Link href="/reservas">
            <Button className="bg-green-800 hover:bg-green-900">Reservar Ahora</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="pt-20 pb-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Bienvenidos a <span className="text-green-800">La Viella</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Un espacio único donde la naturaleza se encuentra con la cultura y el descanso. Descubre nuestros domos
                para eventos culturales y nuestra experiencia de glamping en un entorno natural incomparable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#domo-eventos">
                  <Button size="lg" className="bg-green-800 hover:bg-green-900">
                    <Music className="mr-2 h-5 w-5" />
                    Eventos Culturales
                  </Button>
                </Link>
                <Link href="/reservas">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-green-800 text-green-800 hover:bg-green-50 bg-transparent"
                  >
                    <Tent className="mr-2 h-5 w-5" />
                    Reservar Glamping
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
                alt="La Viella - Vista general de los domos"
                width={600}
                height={500}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* La Viella Domo - Eventos */}
      <section id="domo-eventos" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">La Viella Domo</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un espacio arquitectónico único diseñado para eventos culturales, conciertos y experiencias artísticas
              inolvidables
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">Eventos Culturales & Conciertos</h3>
              <p className="text-gray-600 leading-relaxed">
                Nuestro domo principal es un espacio versátil con acústica excepcional, perfecto para:
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Music className="h-5 w-5 text-green-800 mr-3" />
                  <span>Conciertos íntimos y festivales de música</span>
                </li>
                <li className="flex items-center">
                  <Users className="h-5 w-5 text-green-800 mr-3" />
                  <span>Eventos corporativos y conferencias</span>
                </li>
                <li className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-800 mr-3" />
                  <span>Celebraciones privadas y bodas</span>
                </li>
                <li className="flex items-center">
                  <Star className="h-5 w-5 text-green-800 mr-3" />
                  <span>Experiencias artísticas y culturales</span>
                </li>
              </ul>
              <Button className="bg-green-800 hover:bg-green-900">Ver Próximos Eventos</Button>
            </div>
            <div className="space-y-6">
              <Image
                src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=500&q=80"
                alt="Interior del domo preparado para concierto"
                width={500}
                height={300}
                className="rounded-xl shadow-lg"
              />
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="La Viella Domo - Eventos"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Capacidad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900">150 personas</p>
                <p className="text-gray-600">Configuración flexible según el evento</p>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Equipamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Sistema de sonido profesional, iluminación LED, escenario modular</p>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Entorno natural privilegiado con vistas panorámicas</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* La Viella Glamping */}
      <section id="glamping" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">La Viella Glamping</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experimenta la naturaleza con comodidad en nuestros domos de alojamiento, diseñados para una estadía única
              e inolvidable
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="La Viella Glamping - Tour Virtual"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              <Image
                src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=500&q=80"
                alt="Interior de domo glamping"
                width={500}
                height={300}
                className="rounded-xl shadow-lg"
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">Alojamiento Premium en la Naturaleza</h3>
              <p className="text-gray-600 leading-relaxed">
                Nuestros domos de glamping combinan el lujo moderno con la experiencia auténtica de la naturaleza. Cada
                domo está completamente equipado para garantizar tu comodidad.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Comodidades</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Cama queen size</li>
                    <li>• Baño privado</li>
                    <li>• Calefacción/AC</li>
                    <li>• Terraza privada</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Servicios</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• WiFi gratuito</li>
                    <li>• Desayuno incluido</li>
                    <li>• Servicio de limpieza</li>
                    <li>• Actividades guiadas</li>
                  </ul>
                </div>
              </div>
              <Link href="/reservas">
                <Button size="lg" className="bg-green-800 hover:bg-green-900">
                  <Calendar className="mr-2 h-5 w-5" />
                  Ver Disponibilidad
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((domo) => (
              <Card key={domo} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Image
                  src={
                    domo === 1
                      ? "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=300&q=80"
                      : domo === 2
                      ? "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=300&q=80"
                      : domo === 3
                      ? "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=300&q=80"
                      : "https://images.unsplash.com/photo-1465101178521-c1a9136a3b41?auto=format&fit=crop&w=300&q=80"
                  }
                  alt={`Domo ${domo}`}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <CardHeader>
                  <CardTitle className="text-lg">Domo {domo}</CardTitle>
                  <CardDescription>Capacidad: 2-4 personas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-800">$120/noche</span>
                    <Link href="/reservas">
                      <Button size="sm" variant="outline">
                        Reservar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 bg-green-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Contáctanos</h2>
              <p className="text-green-100 text-lg">
                ¿Tienes preguntas sobre nuestros servicios? ¿Quieres organizar un evento especial? Estamos aquí para
                ayudarte a crear experiencias inolvidables.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>Ubicación privilegiada en entorno natural</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3" />
                  <span>Abierto todo el año</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de consulta</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option>Reserva de Glamping</option>
                    <option>Evento Cultural</option>
                    <option>Información General</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Cuéntanos más sobre tu consulta..."
                  ></textarea>
                </div>
                <Button type="submit" className="w-full bg-green-800 hover:bg-green-900">
                  Enviar Mensaje
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">La Viella</h3>
              <p className="text-gray-400">Donde la naturaleza se encuentra con la cultura y el descanso.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
              <div className="space-y-2">
                <Link href="#inicio" className="block text-gray-400 hover:text-white transition-colors">
                  Inicio
                </Link>
                <Link href="#domo-eventos" className="block text-gray-400 hover:text-white transition-colors">
                  Eventos
                </Link>
                <Link href="#glamping" className="block text-gray-400 hover:text-white transition-colors">
                  Glamping
                </Link>
                <Link href="/reservas" className="block text-gray-400 hover:text-white transition-colors">
                  Reservas
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Síguenos</h4>
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
            <p>&copy; 2024 La Viella. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
