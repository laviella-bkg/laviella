import Link from 'next/link'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/#domos', label: 'Domos' },
  { href: '/reservas', label: 'Reservar' },
  { href: '/contacto', label: 'Contacto' },
]

// TODO: Reemplazar con datos reales cuando el cliente los provea
const contactInfo = {
  phone: null as string | null,
  email: null as string | null,
  instagram: null as string | null,
  whatsapp: null as string | null,
  tiktok: null as string | null,
}

export function Footer() {
  const hasContactInfo = Object.values(contactInfo).some(Boolean)

  return (
    <footer className="bg-viella-deep border-t border-viella-beige/20">
      <div className={`max-w-5xl mx-auto px-6 py-12 grid gap-8 ${hasContactInfo ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {/* Col 1: Marca */}
        <div>
          <p className="font-cormorant font-semibold text-viella-cream text-2xl">
            La Viella
          </p>
          <p className="font-dm-sans text-viella-brown text-xs font-light mt-1">
            Glamping & Domos · Sierras de Córdoba
          </p>
        </div>

        {/* Col 2: Navegación */}
        <div>
          <p className="font-dm-sans text-viella-beige text-xs uppercase tracking-widest mb-4">
            Navegación
          </p>
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-dm-sans text-viella-brown text-sm font-light hover:text-viella-cream transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Col 3: Contacto (solo si hay datos) */}
        {hasContactInfo && (
          <div>
            <p className="font-dm-sans text-viella-beige text-xs uppercase tracking-widest mb-4">
              Contacto
            </p>
            <div className="flex flex-col gap-2">
              {contactInfo.phone && (
                <a href={`tel:${contactInfo.phone}`} className="font-dm-sans text-viella-brown text-sm font-light hover:text-viella-cream transition-colors">
                  {contactInfo.phone}
                </a>
              )}
              {contactInfo.email && (
                <a href={`mailto:${contactInfo.email}`} className="font-dm-sans text-viella-brown text-sm font-light hover:text-viella-cream transition-colors">
                  {contactInfo.email}
                </a>
              )}
              {contactInfo.instagram && (
                <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="font-dm-sans text-viella-brown text-sm font-light hover:text-viella-cream transition-colors">
                  Instagram
                </a>
              )}
              {contactInfo.whatsapp && (
                <a href={contactInfo.whatsapp} target="_blank" rel="noopener noreferrer" className="font-dm-sans text-viella-brown text-sm font-light hover:text-viella-cream transition-colors">
                  WhatsApp
                </a>
              )}
              {contactInfo.tiktok && (
                <a href={contactInfo.tiktok} target="_blank" rel="noopener noreferrer" className="font-dm-sans text-viella-brown text-sm font-light hover:text-viella-cream transition-colors">
                  TikTok
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-viella-beige/10 py-4 text-center">
        <p className="font-dm-sans text-viella-brown text-xs font-light">
          © {new Date().getFullYear()} La Viella Glamping
        </p>
      </div>
    </footer>
  )
}
