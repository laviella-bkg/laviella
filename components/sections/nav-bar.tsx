'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, User, LogOut } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { isAuthenticated, getCurrentUser, logoutUser } from '@/lib/auth'

const navLinks = [
  { href: '/#about', label: 'Nosotros' },
  { href: '/#domos', label: 'Domos' },
  { href: '/#experiencias', label: 'Experiencias' },
  { href: '/#reservas', label: 'Reservas' },
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

  const navBg =
    scrolled || open
      ? 'bg-[rgba(27,24,22,0.82)] backdrop-blur-md border-b border-white/10'
      : 'bg-transparent'
  const linkClass =
    'font-dm-sans text-[0.68rem] uppercase tracking-[0.32em] text-viella-cream hover:text-white transition-colors'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${navBg}`}>
      <div className="viella-shell flex h-20 items-center justify-between">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-cormorant text-2xl font-semibold tracking-[0.08em] text-viella-cream">
            La Viella
          </span>
          <span className="mt-1 font-dm-sans text-[0.6rem] uppercase tracking-[0.36em] text-viella-beige/75">
            refugio glamping
          </span>
        </Link>

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
            <Link
              href="/login"
              className="rounded-full border border-white/25 px-4 py-2 font-dm-sans text-[0.68rem] uppercase tracking-[0.32em] text-viella-cream transition-colors hover:bg-white hover:text-viella-deep"
            >
              Ingresar
            </Link>
          )}
        </div>

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
