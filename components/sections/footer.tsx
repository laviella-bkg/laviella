import Link from 'next/link'

const navLinks = [
  { href: '/#about', label: 'Nosotros' },
  { href: '/#domos', label: 'Domos' },
  { href: '/#experiencias', label: 'Experiencias' },
  { href: '/#reservas', label: 'Reservas' },
]

const contactInfo = {
  phone: '+54 223 423 5266',
  email: 'laviella.glamp@gmail.com',
  instagram: 'https://www.instagram.com/',
  whatsapp: 'https://wa.me/542234235266',
  tiktok: null as string | null,
}

export function Footer() {
  const hasContactInfo = Object.values(contactInfo).some(Boolean)

  return (
    <footer className="bg-viella-deep border-t border-viella-beige/20">
      <div className={`viella-shell grid gap-8 py-12 ${hasContactInfo ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        <div>
          <p className="font-cormorant text-2xl font-semibold text-viella-cream">La Viella</p>
          <p className="mt-1 font-dm-sans text-xs font-light uppercase tracking-[0.24em] text-viella-brown">
            Glamping & Domo · Sierra de los Padres
          </p>
        </div>

        <div>
          <p className="mb-4 font-dm-sans text-xs uppercase tracking-widest text-viella-beige">
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
