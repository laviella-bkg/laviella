'use client'

import { useState } from 'react'
import { NavBar } from '@/components/sections/nav-bar'
import { Footer } from '@/components/sections/footer'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'

export default function ContactoPage() {
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // TODO (backlog C-06): conectar a API real
    setSubmitted(true)
    toast({
      title: '¡Mensaje enviado!',
      description: 'Te contactaremos pronto.',
    })
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-viella-sand">
        {/* Header */}
        <div className="bg-viella-deep py-16 text-center">
          <p className="font-dancing text-viella-brown text-lg mb-2">escribinos</p>
          <h1 className="font-cormorant font-semibold text-viella-cream text-5xl">
            Contacto
          </h1>
        </div>

        <main className="max-w-2xl mx-auto px-6 py-16">
          <form
            onSubmit={handleSubmit}
            className="bg-viella-cream rounded-lg p-8 shadow-sm space-y-6"
          >
            <div>
              <label className="block font-dm-sans text-viella-deep text-xs uppercase tracking-widest mb-2">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                required
                disabled={submitted}
                className="w-full border border-viella-beige bg-transparent px-4 py-3 font-dm-sans text-viella-deep text-sm focus:outline-none focus:border-viella-accent transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block font-dm-sans text-viella-deep text-xs uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                disabled={submitted}
                className="w-full border border-viella-beige bg-transparent px-4 py-3 font-dm-sans text-viella-deep text-sm focus:outline-none focus:border-viella-accent transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block font-dm-sans text-viella-deep text-xs uppercase tracking-widest mb-2">
                Teléfono <span className="normal-case text-viella-brown">(opcional)</span>
              </label>
              <input
                type="tel"
                name="telefono"
                disabled={submitted}
                className="w-full border border-viella-beige bg-transparent px-4 py-3 font-dm-sans text-viella-deep text-sm focus:outline-none focus:border-viella-accent transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block font-dm-sans text-viella-deep text-xs uppercase tracking-widest mb-2">
                Mensaje
              </label>
              <textarea
                name="mensaje"
                required
                rows={5}
                disabled={submitted}
                className="w-full border border-viella-beige bg-transparent px-4 py-3 font-dm-sans text-viella-deep text-sm focus:outline-none focus:border-viella-accent transition-colors resize-none disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={submitted}
              className="w-full bg-viella-accent text-viella-cream font-dm-sans text-xs uppercase tracking-widest py-4 hover:bg-viella-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitted ? 'Enviado' : 'Enviar mensaje'}
            </button>
          </form>
        </main>
      </div>
      <Footer />
      <Toaster />
    </>
  )
}
