'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navLinks = [
  { href: '/#domos', label: 'Domos' },
  { href: '/reservas', label: 'Reservar' },
  { href: '/contacto', label: 'Contacto' },
]

export function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navBg = scrolled || open ? 'bg-viella-deep' : 'bg-transparent'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${navBg}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-cormorant font-semibold text-viella-cream text-xl tracking-wide">
            La Viella
          </span>
          <span className="font-dancing text-viella-brown text-xs">glamping</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-dm-sans text-viella-cream text-xs uppercase tracking-widest hover:text-viella-beige transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button aria-label="Abrir menú" className="text-viella-cream">
                <Menu size={22} />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-viella-deep border-l border-viella-beige/20 w-64"
            >
              <div className="flex flex-col gap-6 pt-12">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="font-dm-sans text-viella-cream text-sm uppercase tracking-widest hover:text-viella-beige transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
