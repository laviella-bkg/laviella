'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, User, LogOut } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { isAuthenticated, getCurrentUser, logoutUser } from '@/lib/auth'

const navLinks = [
  { href: '/#domos', label: 'Domos' },
  { href: '/reservas', label: 'Reservar' },
  { href: '/contacto', label: 'Contacto' },
]

export function NavBar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ username: string; email: string } | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getCurrentUser() as any)
    }
  }, [])

  function handleLogout() {
    logoutUser()
    setUser(null)
    router.push('/')
  }

  const navBg = scrolled || open ? 'bg-viella-deep' : 'bg-transparent'
  const linkClass = 'font-dm-sans text-viella-cream text-xs uppercase tracking-widest hover:text-viella-beige transition-colors'

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
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-4 border-l border-viella-beige/30 pl-6 ml-2">
              <Link href="/mis-reservas" className={`${linkClass} flex items-center gap-1.5`}>
                <User size={13} />
                Mis reservas
              </Link>
              <button onClick={handleLogout} className={`${linkClass} flex items-center gap-1.5`}>
                <LogOut size={13} />
                Salir
              </button>
            </div>
          ) : (
            <Link href="/login" className={`${linkClass} border border-viella-beige/40 px-3 py-1 rounded`}>
              Ingresar
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button aria-label="Abrir menú" className="text-viella-cream">
                <Menu size={22} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-viella-deep border-l border-viella-beige/20 w-64">
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
                <div className="border-t border-viella-beige/20 pt-4">
                  {user ? (
                    <>
                      <Link
                        href="/mis-reservas"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 font-dm-sans text-viella-cream text-sm uppercase tracking-widest hover:text-viella-beige transition-colors mb-4"
                      >
                        <User size={14} />
                        Mis reservas
                      </Link>
                      <button
                        onClick={() => { handleLogout(); setOpen(false) }}
                        className="flex items-center gap-2 font-dm-sans text-viella-cream text-sm uppercase tracking-widest hover:text-viella-beige transition-colors"
                      >
                        <LogOut size={14} />
                        Salir
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="font-dm-sans text-viella-cream text-sm uppercase tracking-widest hover:text-viella-beige transition-colors"
                    >
                      Ingresar
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
