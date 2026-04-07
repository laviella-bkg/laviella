"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { NavBar } from "@/components/sections/nav-bar"
import { Footer } from "@/components/sections/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { loginUser, registerUser, isAuthenticated } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [loginError, setLoginError] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [loadingRegister, setLoadingRegister] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) router.replace("/mis-reservas")
  }, [router])

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoginError("")
    setLoadingLogin(true)
    const form = e.currentTarget
    const identifier = (form.elements.namedItem("identifier") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    try {
      await loginUser({ identifier, password })
      router.push("/mis-reservas")
    } catch (err: any) {
      setLoginError(err.message || "Email o contraseña incorrectos")
    } finally {
      setLoadingLogin(false)
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setRegisterError("")
    setLoadingRegister(true)
    const form = e.currentTarget
    const username = (form.elements.namedItem("username") as HTMLInputElement).value
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value
    if (password !== confirm) {
      setRegisterError("Las contraseñas no coinciden")
      setLoadingRegister(false)
      return
    }
    try {
      await registerUser({ username, email, password })
      router.push("/mis-reservas")
    } catch (err: any) {
      setRegisterError(err.message || "No se pudo crear la cuenta")
    } finally {
      setLoadingRegister(false)
    }
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-viella-sand flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-cormorant text-4xl font-semibold text-viella-deep mb-2">
              Mi cuenta
            </h1>
            <p className="font-dm-sans text-viella-brown text-sm">
              Ingresá para ver tus reservas en La Viella
            </p>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="w-full mb-6 bg-viella-beige">
              <TabsTrigger value="login" className="flex-1 font-dm-sans">Ingresar</TabsTrigger>
              <TabsTrigger value="register" className="flex-1 font-dm-sans">Crear cuenta</TabsTrigger>
            </TabsList>

            {/* Login */}
            <TabsContent value="login">
              <Card className="border-viella-beige shadow-lg">
                <CardHeader>
                  <CardTitle className="font-cormorant text-viella-deep text-2xl">Bienvenido</CardTitle>
                  <CardDescription className="font-dm-sans text-viella-brown">
                    Usá el email con el que hiciste tu reserva
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="identifier" className="font-dm-sans text-viella-deep">Email</Label>
                      <Input
                        id="identifier"
                        name="identifier"
                        type="email"
                        required
                        placeholder="tu@email.com"
                        className="border-viella-beige focus:border-viella-accent font-dm-sans"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="font-dm-sans text-viella-deep">Contraseña</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        placeholder="••••••••"
                        className="border-viella-beige focus:border-viella-accent font-dm-sans"
                      />
                    </div>
                    {loginError && (
                      <p className="text-sm text-red-600 font-dm-sans">{loginError}</p>
                    )}
                    <Button
                      type="submit"
                      disabled={loadingLogin}
                      className="w-full bg-viella-accent hover:bg-viella-deep text-white font-dm-sans"
                    >
                      {loadingLogin ? "Ingresando..." : "Ingresar"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Register */}
            <TabsContent value="register">
              <Card className="border-viella-beige shadow-lg">
                <CardHeader>
                  <CardTitle className="font-cormorant text-viella-deep text-2xl">Nueva cuenta</CardTitle>
                  <CardDescription className="font-dm-sans text-viella-brown">
                    Usá el mismo email con el que reservaste para ver tus reservas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="username" className="font-dm-sans text-viella-deep">Nombre</Label>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        required
                        placeholder="Tu nombre"
                        className="border-viella-beige focus:border-viella-accent font-dm-sans"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="font-dm-sans text-viella-deep">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="tu@email.com"
                        className="border-viella-beige focus:border-viella-accent font-dm-sans"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="font-dm-sans text-viella-deep">Contraseña</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        className="border-viella-beige focus:border-viella-accent font-dm-sans"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirm" className="font-dm-sans text-viella-deep">Repetir contraseña</Label>
                      <Input
                        id="confirm"
                        name="confirm"
                        type="password"
                        required
                        placeholder="••••••••"
                        className="border-viella-beige focus:border-viella-accent font-dm-sans"
                      />
                    </div>
                    {registerError && (
                      <p className="text-sm text-red-600 font-dm-sans">{registerError}</p>
                    )}
                    <Button
                      type="submit"
                      disabled={loadingRegister}
                      className="w-full bg-viella-accent hover:bg-viella-deep text-white font-dm-sans"
                    >
                      {loadingRegister ? "Creando cuenta..." : "Crear cuenta"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <p className="text-center mt-6 font-dm-sans text-viella-brown text-sm">
            ¿Querés hacer una reserva?{" "}
            <Link href="/reservas" className="text-viella-accent hover:underline">
              Ver disponibilidad
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}
