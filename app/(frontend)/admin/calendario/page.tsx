"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getReservationsForAdmin, getDomos } from "@/lib/strapi"
import type { Reservation, Domo } from "@/lib/types/strapi"

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-yellow-200 text-yellow-900",
  confirmed: "bg-green-200 text-green-900",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-gray-200 text-gray-600",
  blocked: "bg-blue-100 text-blue-700",
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
  blocked: "Bloqueada",
}

function formatDate(d: string) {
  if (!d) return "—"
  const [y, m, day] = d.split("-")
  return `${day}/${m}/${y}`
}

function isoDate(d: Date) {
  return d.toISOString().split("T")[0]
}

function datesInRange(checkIn: string, checkOut: string): string[] {
  const dates: string[] = []
  const cur = new Date(checkIn + "T00:00:00")
  const end = new Date(checkOut + "T00:00:00")
  while (cur <= end) {
    dates.push(isoDate(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const DAY_NAMES = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]

export default function AdminCalendario() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [domos, setDomos] = useState<Domo[]>([])
  const [domoFilter, setDomoFilter] = useState("")
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDomos().then(setDomos).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const firstDay = `${year}-${String(month + 1).padStart(2, "0")}-01`
    const lastDay = isoDate(new Date(year, month + 1, 0))
    getReservationsForAdmin({
      status: ["draft", "confirmed", "blocked"],
      checkInFrom: firstDay,
      checkInTo: lastDay,
      ...(domoFilter ? { domoId: Number(domoFilter) } : {}),
    })
      .then(setReservations)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [year, month, domoFilter])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  // Build day grid
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Map date → reservations that cover that day
  const dayMap: Record<string, Reservation[]> = {}
  reservations.forEach((r) => {
    const checkIn = r.checkIn as string
    const checkOut = r.checkOut as string
    if (!checkIn || !checkOut) return
    datesInRange(checkIn, checkOut).forEach((d) => {
      if (!dayMap[d]) dayMap[d] = []
      dayMap[d].push(r)
    })
  })

  const selectedReservations = selectedDay ? (dayMap[selectedDay] || []) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-cormorant text-3xl font-semibold text-viella-deep">Calendario</h1>
        {domos.length > 0 && (
          <select
            value={domoFilter}
            onChange={(e) => setDomoFilter(e.target.value)}
            className="font-dm-sans text-sm border border-viella-beige rounded-lg px-3 py-1.5 text-viella-brown bg-white"
          >
            <option value="">Todos los domos</option>
            {domos.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-viella-beige shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-viella-beige/50">
            <button onClick={prevMonth} className="p-1.5 hover:bg-viella-sand rounded-lg transition-colors">
              <ChevronLeft size={16} className="text-viella-brown" />
            </button>
            <h2 className="font-cormorant text-xl font-semibold text-viella-deep">
              {MONTH_NAMES[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-1.5 hover:bg-viella-sand rounded-lg transition-colors">
              <ChevronRight size={16} className="text-viella-brown" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 border-b border-viella-beige/50">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-2 text-center font-dm-sans text-xs text-viella-brown/60 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDow }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 border-r border-b border-viella-beige/30" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
              const dayReservations = dayMap[dateStr] || []
              const isToday = dateStr === isoDate(today)
              const isSelected = dateStr === selectedDay

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                  className={`h-20 border-r border-b border-viella-beige/30 p-1.5 text-left transition-colors relative
                    ${isSelected ? "bg-viella-accent/10" : "hover:bg-viella-sand/50"}`}
                >
                  <span className={`font-dm-sans text-xs font-medium inline-flex items-center justify-center w-5 h-5 rounded-full
                    ${isToday ? "bg-viella-accent text-white" : "text-viella-deep"}`}>
                    {dayNum}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayReservations.slice(0, 2).map((r) => (
                      <div
                        key={r.id}
                        className={`text-[10px] font-dm-sans px-1 rounded truncate ${STATUS_COLOR[r.reservationStatus || "draft"]}`}
                      >
                        {(r.domo as any)?.name || r.guestName}
                      </div>
                    ))}
                    {dayReservations.length > 2 && (
                      <div className="text-[10px] font-dm-sans text-viella-brown/60 px-1">
                        +{dayReservations.length - 2} más
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 px-5 py-3 border-t border-viella-beige/50">
            {[["draft", "Pendiente"], ["confirmed", "Confirmada"], ["blocked", "Bloqueada (Booking)"]].map(([s, l]) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${STATUS_COLOR[s]}`} />
                <span className="font-dm-sans text-xs text-viella-brown/60">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="bg-white rounded-2xl border border-viella-beige shadow-sm overflow-hidden">
          <div className="px-4 py-4 border-b border-viella-beige/50">
            <h3 className="font-cormorant text-lg font-semibold text-viella-deep">
              {selectedDay ? formatDate(selectedDay) : "Seleccioná un día"}
            </h3>
          </div>
          <div className="p-4">
            {!selectedDay ? (
              <p className="font-dm-sans text-sm text-viella-brown/60">
                Hacé click en un día para ver sus reservas.
              </p>
            ) : selectedReservations.length === 0 ? (
              <p className="font-dm-sans text-sm text-viella-brown/60">Sin reservas este día.</p>
            ) : (
              <div className="space-y-3">
                {selectedReservations.map((r) => {
                  const status = r.reservationStatus || "draft"
                  return (
                    <div key={r.id} className="border border-viella-beige rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-dm-sans text-sm font-medium text-viella-deep">{r.guestName}</p>
                        <span className={`font-dm-sans text-xs px-1.5 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[status]}`}>
                          {STATUS_LABEL[status]}
                        </span>
                      </div>
                      <p className="font-dm-sans text-xs text-viella-brown/70">{(r.domo as any)?.name || "—"}</p>
                      <p className="font-dm-sans text-xs text-viella-brown/60 mt-1">
                        {formatDate(r.checkIn as string)} → {formatDate(r.checkOut as string)}
                      </p>
                      <p className="font-dm-sans text-xs text-viella-brown/60">{r.numberOfGuests} huésped(es)</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
