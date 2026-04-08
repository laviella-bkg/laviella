"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, Clock, DollarSign, AlertCircle } from "lucide-react"
import { getAdminDashboardMetrics, type AdminMetrics } from "@/lib/strapi"
import type { Reservation } from "@/lib/types/strapi"

function formatDate(d: string) {
  if (!d) return "—"
  const [y, m, day] = d.split("-")
  return `${day}/${m}/${y}`
}

function formatCurrency(n: number) {
  return `$${n.toLocaleString("es-AR")}`
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
}

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-gray-100 text-gray-600",
}

function KpiCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  sub?: string
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-viella-beige">
      <div className="flex items-center justify-between mb-4">
        <p className="font-dm-sans text-viella-brown text-sm">{label}</p>
        <div className="w-9 h-9 rounded-xl bg-viella-sand flex items-center justify-center">
          <Icon size={16} className="text-viella-accent" />
        </div>
      </div>
      <p className="font-cormorant text-4xl font-semibold text-viella-deep">{value}</p>
      {sub && <p className="font-dm-sans text-viella-brown/60 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function ReservationRow({ r }: { r: Reservation }) {
  const status = r.reservationStatus || "draft"
  const domoName = (r.domo as any)?.name || "Domo"
  return (
    <tr className="border-t border-viella-beige/50 hover:bg-viella-sand/40 transition-colors">
      <td className="py-3 px-4 font-dm-sans text-sm text-viella-deep">{r.guestName}</td>
      <td className="py-3 px-4 font-dm-sans text-sm text-viella-brown">{domoName}</td>
      <td className="py-3 px-4 font-dm-sans text-sm text-viella-brown">{formatDate(r.checkIn as string)}</td>
      <td className="py-3 px-4">
        <span className={`font-dm-sans text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </td>
    </tr>
  )
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getAdminDashboardMetrics()
      .then(setMetrics)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="flex items-center gap-3 text-red-600 font-dm-sans text-sm bg-red-50 border border-red-200 rounded-xl p-4">
        <AlertCircle size={16} />
        No se pudieron cargar las métricas. Verificá los permisos del rol admin en Strapi.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-cormorant text-3xl font-semibold text-viella-deep">Dashboard</h1>
        <p className="font-dm-sans text-viella-brown text-sm mt-1">Resumen operativo de La Viella</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Pendientes de confirmación"
          value={metrics.pending}
          icon={AlertCircle}
          sub="reservas en estado draft"
        />
        <KpiCard
          label="Check-ins hoy"
          value={metrics.checkInsToday}
          icon={Calendar}
          sub="llegadas confirmadas"
        />
        <KpiCard
          label="Ingresos del mes"
          value={formatCurrency(metrics.revenueThisMonth)}
          icon={DollarSign}
          sub="reservas confirmadas"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas llegadas */}
        <div className="bg-white rounded-2xl border border-viella-beige shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-viella-beige/50">
            <h2 className="font-cormorant text-xl font-semibold text-viella-deep">Próximas llegadas</h2>
            <Link href="/admin/reservas" className="font-dm-sans text-viella-accent text-xs hover:underline">
              Ver todas
            </Link>
          </div>
          {metrics.upcomingArrivals.length === 0 ? (
            <p className="font-dm-sans text-viella-brown text-sm px-5 py-6">Sin llegadas próximas.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-viella-sand/50">
                  <th className="py-2 px-4 text-left font-dm-sans text-xs text-viella-brown uppercase tracking-wider">Huésped</th>
                  <th className="py-2 px-4 text-left font-dm-sans text-xs text-viella-brown uppercase tracking-wider">Domo</th>
                  <th className="py-2 px-4 text-left font-dm-sans text-xs text-viella-brown uppercase tracking-wider">Check-in</th>
                  <th className="py-2 px-4 text-left font-dm-sans text-xs text-viella-brown uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody>
                {metrics.upcomingArrivals.map((r) => <ReservationRow key={r.id} r={r} />)}
              </tbody>
            </table>
          )}
        </div>

        {/* Últimas reservas */}
        <div className="bg-white rounded-2xl border border-viella-beige shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-viella-beige/50">
            <h2 className="font-cormorant text-xl font-semibold text-viella-deep">Últimas reservas</h2>
            <Link href="/admin/reservas" className="font-dm-sans text-viella-accent text-xs hover:underline">
              Ver todas
            </Link>
          </div>
          {metrics.recentReservations.length === 0 ? (
            <p className="font-dm-sans text-viella-brown text-sm px-5 py-6">Sin reservas recientes.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-viella-sand/50">
                  <th className="py-2 px-4 text-left font-dm-sans text-xs text-viella-brown uppercase tracking-wider">Huésped</th>
                  <th className="py-2 px-4 text-left font-dm-sans text-xs text-viella-brown uppercase tracking-wider">Domo</th>
                  <th className="py-2 px-4 text-left font-dm-sans text-xs text-viella-brown uppercase tracking-wider">Check-in</th>
                  <th className="py-2 px-4 text-left font-dm-sans text-xs text-viella-brown uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentReservations.map((r) => <ReservationRow key={r.id} r={r} />)}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
