import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getPage, getPages } from "@/lib/strapi"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Leaf } from "lucide-react"

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
  params: { slug: string }
}): Promise<Metadata> {
  const page = await getPage(params.slug)

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

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug)

  if (!page) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center text-emerald-800 hover:text-emerald-900">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <div className="flex items-center space-x-2">
              <Leaf className="h-6 w-6 text-emerald-600" />
              <span className="text-xl font-bold">La Viella Glamping</span>
            </div>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.title}</h1>
        </div>

        {/* Page Content */}
        <div className="prose prose-lg max-w-none">
          <div
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>

        {/* Back Button */}
        <div className="mt-12">
          <Link href="/">
            <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
