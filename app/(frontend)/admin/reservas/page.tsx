"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, CheckCircle, XCircle, AlertCircle, Filter } from "lucide-react"
import { getReservationsForAdmin, updateReservationStatus, getDomos } from "@/lib/strapi"
import type { Reservation, Domo } from "@/lib/types/strapi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const STATUS_LABEL: Record<string, string> = {
  draft: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
  blocked: "Bloqueada",
}

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
  blocked: "bg-blue-100 text-blue-700 border-blue-200",
}

function formatDate(d: string) {
  if (!d) return "—"
  const [y, m, day] = d.split("-")
  return `${day}/${m}/${y}`
}

const STATUS_FILTERS = [
  { value: "", label: "Todos" },
  { value: "draft", label: "Pendientes" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "cancelled", label: "Canceladas" },
  { value: "completed", label: "Completadas" },
]

export default function AdminReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [domos, setDomos] = useState<Domo[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | string | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [domoFilter, setDomoFilter] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const filters: any = {}
      if (statusFilter) filters.status = [statusFilter]
      if (domoFilter) filters.domoId = Number(domoFilter)
      if (search) filters.search = search
      const data = await getReservationsForAdmin(filters)
      setReservations(data)
    } catch {
      showToast("Error cargando reservas", false)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, domoFilter])

  useEffect(() => {
    getDomos().then(setDomos).catch(() => {})
  }, [])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleStatusChange(documentId: string | undefined, numericId: number | undefined, status: string) {
    if (!documentId) return
    setUpdatingId(numericId ?? null)
    try {
      const updated = await updateReservationStatus(documentId, status)
      setReservations((prev) =>
        prev.map((r) => (r.documentId === documentId ? { ...r, reservationStatus: updated.reservationStatus } : r))
      )
      showToast(`Reserva ${STATUS_LABEL[status].toLowerCase()}`, true)
    } catch {
      showToast("No se pudo actualizar la reserva", false)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-cormorant text-3xl font-semibold text-viella-deep">Reservas</h1>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-viella-beige p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-viella-brown/50" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 border-viella-beige font-dm-sans text-sm h-9"
          />
        </div>

        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`font-dm-sans text-xs px-3 py-1.5 rounded-lg border transition-colors
                ${statusFilter === f.value
                  ? "bg-viella-accent text-white border-viella-accent"
                  : "text-viella-brown border-viella-beige hover:border-viella-accent"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {domos.length > 0 && (
          <select
            value={domoFilter}
            onChange={(e) => setDomoFilter(e.target.value)}
            className="font-dm-sans text-sm border border-viella-beige rounded-lg px-3 py-1.5 text-viella-brown h-9 bg-white"
          >
            <option value="">Todos los domos</option>
            {domos.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-viella-beige shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-viella-sand/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <p className="font-dm-sans text-viella-brown text-sm px-6 py-10 text-center">
            No hay reservas que coincidan con los filtros.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-viella-sand/50 border-b border-viella-beige/50">
                  {["Huésped", "Domo", "Check-in", "Check-out", "Huéspedes", "Total", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left font-dm-sans text-xs text-viella-brown uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => {
                  const status = r.reservationStatus || "draft"
                  const domoName = (r.domo as any)?.name || "—"
                  const isUpdating = updatingId === r.id

                  return (
                    <tr key={r.id} className="border-t border-viella-beige/40 hover:bg-viella-sand/30 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-dm-sans text-sm text-viella-deep font-medium">{r.guestName}</p>
                        <p className="font-dm-sans text-xs text-viella-brown/60">{r.guestEmail}</p>
                      </td>
                      <td className="py-3 px-4 font-dm-sans text-sm text-viella-brown whitespace-nowrap">{domoName}</td>
                      <td className="py-3 px-4 font-dm-sans text-sm text-viella-brown whitespace-nowrap">{formatDate(r.checkIn as string)}</td>
                      <td className="py-3 px-4 font-dm-sans text-sm text-viella-brown whitespace-nowrap">{formatDate(r.checkOut as string)}</td>
                      <td className="py-3 px-4 font-dm-sans text-sm text-viella-brown text-center">{r.numberOfGuests}</td>
                      <td className="py-3 px-4 font-cormorant text-lg text-viella-accent whitespace-nowrap">
                        ${r.totalPrice?.toLocaleString("es-AR")}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`font-dm-sans text-xs border ${STATUS_COLOR[status]}`}>
                          {STATUS_LABEL[status]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {status === "draft" && (
                          <div className="flex gap-2">
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(r.documentId, r.id, "confirmed")}
                              className="flex items-center gap-1 font-dm-sans text-xs text-green-700 hover:text-green-900 disabled:opacity-50 transition-colors"
                            >
                              <CheckCircle size={13} />
                              Confirmar
                            </button>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(r.documentId, r.id, "cancelled")}
                              className="flex items-center gap-1 font-dm-sans text-xs text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                            >
                              <XCircle size={13} />
                              Cancelar
                            </button>
                          </div>
                        )}
                        {status === "confirmed" && (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(r.documentId, r.id, "cancelled")}
                            className="flex items-center gap-1 font-dm-sans text-xs text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                          >
                            <XCircle size={13} />
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg font-dm-sans text-sm text-white z-50
          ${toast.ok ? "bg-green-600" : "bg-red-600"}`}>
          {toast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}
