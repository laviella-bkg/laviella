import { Suspense } from "react"
import { getDomos, getSeasons } from "@/lib/cms"
import { ReservasContent } from "./reservas-client"

// Estática; Payload la invalida al editar domos o temporadas. Revalida cada hora como respaldo.
export const revalidate = 3600

export default async function ReservasPage() {
  const [domos, seasons] = await Promise.all([getDomos(), getSeasons()])
  return (
    <Suspense>
      <ReservasContent initialDomos={domos} seasons={seasons} />
    </Suspense>
  )
}
