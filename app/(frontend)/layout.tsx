import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans, Dancing_Script } from 'next/font/google'
import { getHomePage } from '@/lib/cms'
import { Footer } from '@/components/sections/footer'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-dancing',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'La Viella Glamping | Sierras de Córdoba',
  description: 'Domos glamping en las Sierras de Córdoba. Un refugio íntimo donde la aventura y la comodidad se encuentran en plena naturaleza.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const home = await getHomePage().catch(() => null)

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${cormorant.variable} ${dmSans.variable} ${dancingScript.variable}`}
    >
      <body>
        {children}
        <Footer phone={home?.ctaPhone} email={home?.ctaEmail} />
      </body>
    </html>
  )
}
