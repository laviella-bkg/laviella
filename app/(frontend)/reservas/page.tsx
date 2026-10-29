import { Suspense } from "react"
import { getDomos, getSeasons, getHomePage } from "@/lib/cms"
import { ReservasContent } from "./reservas-client"

// Estática; Payload la invalida al editar contenido. Revalida cada hora como respaldo.
export const revalidate = 3600

export default async function ReservasPage() {
  const [domos, seasons, home] = await Promise.all([getDomos(), getSeasons(), getHomePage()])
  return (
    <Suspense>
      <ReservasContent initialDomos={domos} seasons={seasons} phone={home?.ctaPhone} email={home?.ctaEmail} />
    </Suspense>
  )
}
