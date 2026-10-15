"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, CalendarDays, ListOrdered, LogOut, Menu, X } from "lucide-react"
import { isAuthenticated, isAdmin, logoutUser, getCurrentUser } from "@/lib/auth"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/reservas", label: "Reservas", icon: ListOrdered, exact: false },
  { href: "/admin/calendario", label: "Calendario", icon: CalendarDays, exact: false },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ username: string; email: string } | null>(null)

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      router.replace(isAuthenticated() ? "/" : "/login")
      return
    }
    setUser(getCurrentUser() as any)
    setReady(true)
  }, [router])

  function handleLogout() {
    logoutUser()
    router.push("/")
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-viella-sand flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-viella-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-viella-sand flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-56 bg-viella-deep flex flex-col transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-cormorant font-semibold text-viella-cream text-lg tracking-wide">
              La Viella
            </span>
            <span className="font-dancing text-viella-brown text-xs">admin</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href) && pathname !== "/admin"
              || (exact && pathname === href)
            const isActive = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-dm-sans text-sm transition-colors
                  ${isActive
                    ? "bg-viella-accent/20 text-viella-cream"
                    : "text-viella-beige/60 hover:text-viella-cream hover:bg-white/5"
                  }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4 border-t border-white/10">
          {user && (
            <p className="font-dm-sans text-viella-beige/50 text-xs truncate mb-3">
              {user.email}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 font-dm-sans text-viella-beige/60 hover:text-viella-cream text-sm transition-colors"
          >
            <LogOut size={14} />
            Salir
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar (mobile) */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-viella-deep border-b border-white/10">
          <button onClick={() => setSidebarOpen(true)} className="text-viella-cream">
            <Menu size={20} />
          </button>
          <span className="font-cormorant text-viella-cream font-semibold">La Viella Admin</span>
          <div className="w-5" />
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
