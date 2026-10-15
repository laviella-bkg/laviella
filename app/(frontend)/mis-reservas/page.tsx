"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, MapPin, Users, LogOut, XCircle, AlertCircle, CheckCircle } from "lucide-react"
import { NavBar } from "@/components/sections/nav-bar"
import { Footer } from "@/components/sections/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getReservations, updateReservationStatus } from "@/lib/strapi"
import { getCurrentUser, isAuthenticated, logoutUser } from "@/lib/auth"
import type { Reservation } from "@/lib/types/strapi"

const STATUS_LABEL: Record<string, string> = {
  draft: "Pendiente de confirmación",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
}

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—"
  const [y, m, d] = dateStr.split("-")
  return `${d}/${m}/${y}`
}

export default function MisReservasPage() {
  const router = useRouter()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ username: string; email: string } | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login")
      return
    }
    const currentUser = getCurrentUser()
    setUser(currentUser as any)

    getReservations({
      guestEmail: currentUser?.email,
      reservationStatus: ["draft", "confirmed", "completed", "cancelled"],
    })
      .then((data) => setReservations(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  function handleLogout() {
    logoutUser()
    router.push("/")
  }

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleCancel(documentId: string | undefined) {
    if (!documentId) return
    if (!confirm("¿Cancelar esta reserva? Esta acción no se puede deshacer.")) return
    setCancellingId(documentId)
    try {
      await updateReservationStatus(documentId, "cancelled")
      setReservations((prev) =>
        prev.map((r) => r.documentId === documentId ? { ...r, reservationStatus: "cancelled" } : r)
      )
      showToast("Reserva cancelada", true)
    } catch {
      showToast("No se pudo cancelar la reserva", false)
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-viella-sand pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">

          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <h1 className="font-cormorant text-4xl font-semibold text-viella-deep mb-1">
                Mis reservas
              </h1>
              {user && (
                <p className="font-dm-sans text-viella-brown text-sm">{user.email}</p>
              )}
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="font-dm-sans text-viella-brown hover:text-viella-deep text-sm gap-2"
            >
              <LogOut size={15} />
              Salir
            </Button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-36 bg-viella-beige/50 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && reservations.length === 0 && (
            <div className="text-center py-20">
              <p className="font-cormorant text-2xl text-viella-deep mb-2">
                No tenés reservas todavía
              </p>
              <p className="font-dm-sans text-viella-brown text-sm mb-6">
                Explorá nuestros domos y hacé tu primera reserva
              </p>
              <Button asChild className="bg-viella-accent hover:bg-viella-deep text-white font-dm-sans">
                <Link href="/reservas">Ver disponibilidad</Link>
              </Button>
            </div>
          )}

          {/* Reservations list */}
          {!loading && reservations.length > 0 && (
            <div className="space-y-4">
              {reservations.map((r) => {
                const status = r.reservationStatus || "draft"
                const domoName = (r.domo as any)?.name || "Domo"
                return (
                  <Card key={r.id} className="border-viella-beige shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="font-cormorant text-viella-deep text-xl">
                          {domoName}
                        </CardTitle>
                        <Badge className={`font-dm-sans text-xs border shrink-0 ${STATUS_COLOR[status] || STATUS_COLOR.draft}`}>
                          {STATUS_LABEL[status] || status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 text-sm font-dm-sans text-viella-brown mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-viella-accent shrink-0" />
                          <span>Check-in: <strong className="text-viella-deep">{formatDate(r.checkIn as string)}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-viella-accent shrink-0" />
                          <span>Check-out: <strong className="text-viella-deep">{formatDate(r.checkOut as string)}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-viella-accent shrink-0" />
                          <span>{r.numberOfGuests} {r.numberOfGuests === 1 ? "huésped" : "huéspedes"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-viella-accent shrink-0" />
                          <span>La Viella, Córdoba</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-viella-beige">
                        <span className="font-dm-sans text-viella-brown text-sm">Total</span>
                        <span className="font-cormorant text-xl font-semibold text-viella-accent">
                          ${r.totalPrice?.toLocaleString("es-AR")}
                        </span>
                      </div>
                      {status === "draft" && (
                        <div className="mt-3 flex items-start justify-between gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                          <p className="text-xs font-dm-sans text-viella-brown">
                            Tu reserva está pendiente de confirmación. Te contactaremos para coordinar el pago.
                          </p>
                          <button
                            onClick={() => handleCancel(r.documentId)}
                            disabled={cancellingId === r.documentId}
                            className="flex items-center gap-1 font-dm-sans text-xs text-red-600 hover:text-red-800 disabled:opacity-50 shrink-0 transition-colors"
                          >
                            <XCircle size={13} />
                            {cancellingId === r.documentId ? "Cancelando..." : "Cancelar"}
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

        </div>
      </div>
      <Footer />

      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg font-dm-sans text-sm text-white z-50
          ${toast.ok ? "bg-green-600" : "bg-red-600"}`}>
          {toast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}
    </>
  )
}
