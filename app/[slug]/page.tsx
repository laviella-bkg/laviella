import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPage, getPages } from "@/lib/strapi"
import { NavBar } from "@/components/sections/nav-bar"
import { Footer } from "@/components/sections/footer"

export const dynamicParams = true // Allow dynamic params to handle 404 gracefully

// Generate static params for all pages at build time (optional)
export async function generateStaticParams() {
  try {
    const pages = await getPages()
    return pages.map((page) => ({
      slug: page.slug,
    }))
  } catch (error) {
    // If Strapi is not available during build, return empty array
    // Pages will be generated on-demand
    console.warn("Could not generate static params for pages:", error)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)

  if (!page) {
    return {
      title: "Página no encontrada",
    }
  }

  return {
    title: page.seoTitle || page.title,
    description: page.metaDescription || page.title,
    keywords: page.seoKeywords?.split(",").map((k) => k.trim()),
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.metaDescription || page.title,
      type: "website",
    },
  }
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPage(slug)

  if (!page) {
    notFound()
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-viella-sand">
        {/* Header de página */}
        <div className="bg-viella-sand border-b border-viella-beige py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="font-cormorant font-semibold text-viella-deep text-5xl">
              {page.title}
            </h1>
            <div className="mt-4 h-px w-16 bg-viella-accent" />
          </div>
        </div>
        {/* Cuerpo del artículo */}
        <main className="max-w-[720px] mx-auto px-6 py-16">
          <div
            className="font-dm-sans text-viella-olive text-base font-light leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.content ?? '' }}
          />
        </main>
      </div>
      <Footer />
    </>
  )
}
