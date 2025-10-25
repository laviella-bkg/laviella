"use client"

import { useEffect, useState } from "react"
import { getDomos, fetchAPI } from "@/lib/strapi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function TestStrapiPage() {
  const [domos, setDomos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "failed">("checking")
  const [apiUrl, setApiUrl] = useState<string>("")

  useEffect(() => {
    setApiUrl(process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337")

    // Test connection
    const testConnection = async () => {
      try {
        // Try to fetch from Strapi
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/domos`)
        
        if (response.ok) {
          setConnectionStatus("connected")
          // Fetch actual data
          const domosData = await getDomos()
          setDomos(domosData)
        } else {
          setConnectionStatus("failed")
          setError(`API responded with status: ${response.status}`)
        }
      } catch (err) {
        setConnectionStatus("failed")
        setError(err instanceof Error ? err.message : "Failed to connect to Strapi")
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  const testDirectFetch = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${apiUrl}/api/domos`)
      const data = await response.json()
      console.log("Raw API Response:", data)
      alert(`Success! Found ${data.data?.length || 0} domos`)
    } catch (err) {
      alert(`Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Strapi Connection Test</h1>
            <p className="text-gray-600">Verifica la conexión con Strapi Backend</p>
          </div>
          <Link href="/">
            <Button variant="outline">← Volver al Inicio</Button>
          </Link>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Estado de Conexión
              {connectionStatus === "checking" && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
              {connectionStatus === "connected" && <CheckCircle className="h-5 w-5 text-green-500" />}
              {connectionStatus === "failed" && <XCircle className="h-5 w-5 text-red-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Strapi URL:</p>
              <code className="bg-gray-100 px-3 py-2 rounded block">{apiUrl}</code>
            </div>

            {connectionStatus === "failed" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error de conexión:</strong> {error}
                  <div className="mt-4 space-y-2 text-sm">
                    <p><strong>Posibles causas:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>El servidor Strapi no está ejecutándose (verifica puerto 1337)</li>
                      <li>Los permisos de API no están configurados en Strapi</li>
                      <li>La URL de Strapi es incorrecta en .env.local</li>
                      <li>Hay problemas de CORS</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {connectionStatus === "connected" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Conexión exitosa!</strong> El frontend puede comunicarse con Strapi.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Domos Data */}
        <Card>
          <CardHeader>
            <CardTitle>Domos desde Strapi</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-3">Cargando datos...</span>
              </div>
            ) : domos.length > 0 ? (
              <div className="space-y-4">
                <Badge variant="outline" className="mb-4">
                  Total: {domos.length} domos encontrados
                </Badge>
                <div className="space-y-4">
                  {domos.map((domo: any, index: number) => (
                    <Card key={domo.id || index} className="border">
                      <CardHeader>
                        <CardTitle className="text-xl">{domo.attributes?.name || "Sin nombre"}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>ID:</strong> {domo.id}
                          </div>
                          <div>
                            <strong>Slug:</strong> {domo.attributes?.slug || "N/A"}
                          </div>
                          <div>
                            <strong>Capacidad:</strong> {domo.attributes?.capacity || "N/A"}
                          </div>
                          <div>
                            <strong>Precio:</strong> ${domo.attributes?.basePrice || "N/A"}
                          </div>
                          <div>
                            <strong>Activo:</strong> {domo.attributes?.isActive ? "Sí" : "No"}
                          </div>
                          {domo.attributes?.description && (
                            <div className="col-span-2">
                              <strong>Descripción:</strong>
                              <p className="text-gray-600 mt-1">{domo.attributes.description.substring(0, 200)}...</p>
                            </div>
                          )}
                        </div>
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-medium text-blue-600">
                            Ver datos JSON completos
                          </summary>
                          <pre className="mt-2 bg-gray-100 p-4 rounded overflow-auto text-xs">
                            {JSON.stringify(domo, null, 2)}
                          </pre>
                        </details>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No se encontraron domos en Strapi. Puede que:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>No hay domos creados en el admin panel de Strapi</li>
                    <li>Los domos no están marcados como "Publicado"</li>
                    <li>El filtro isActive está filtrando todos los registros</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Manual Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test Manual de API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Puedes probar hacer un fetch directo a la API de Strapi haciendo clic en el botón:
            </p>
            <Button onClick={testDirectFetch} disabled={loading}>
              {loading ? "Probando..." : "Test Fetch Directo"}
            </Button>
            <p className="text-xs text-gray-500">
              Abre la consola del navegador (F12) para ver la respuesta completa
            </p>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Pasos para verificar la conexión</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Verifica que Strapi esté corriendo en http://localhost:1337</li>
              <li>Abre http://localhost:1337/admin y crea algunos domos</li>
              <li>Asegúrate de hacer "Publish" en cada domo</li>
              <li>Ve a Settings → Users & Permissions → Roles → Public</li>
              <li>Habilita "find" y "findOne" para "Domo"</li>
              <li>Recarga esta página</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
