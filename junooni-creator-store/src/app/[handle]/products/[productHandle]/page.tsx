import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { getStorefrontData, formatPrice } from "@/lib/api"
import AddToCartButton from "@/components/cart/AddToCartButton"
import CartIconButton from "@/components/cart/CartIconButton"

interface Props {
  params: { handle: string; productHandle: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getStorefrontData(params.handle)
  if (!data) return { title: "Product not found" }
  const product = data.products.find(p => p.handle === params.productHandle)
  if (!product) return { title: "Product not found" }
  return {
    title: `${product.title} — ${data.vendor.name}`,
    description: product.description?.replace(/<[^>]*>/g, "") ?? undefined,
    openGraph: { images: product.thumbnail ? [{ url: product.thumbnail }] : [] },
  }
}

export default async function ProductPage({ params }: Props) {
  const data = await getStorefrontData(params.handle)
  if (!data) notFound()

  const product = data.products.find(p => p.handle === params.productHandle)
  if (!product) notFound()

  const { vendor, store } = data
  const brandStyles = {
    "--brand-primary": store?.primary_color ?? "#000000",
    "--brand-secondary": store?.secondary_color ?? "#ffffff",
  } as React.CSSProperties

  const isDark = store?.template === "bold"
  const bgColor = isDark ? "bg-black text-white" : "bg-white text-gray-900"
  const price = product.variants?.[0]?.prices?.[0]?.amount

  return (
    <div style={brandStyles} className={`min-h-screen ${bgColor}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${isDark ? "bg-black/80 border-white/10" : "bg-white/90 border-gray-100"} backdrop-blur-md border-b`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href={`/${vendor.handle}`}
            className={`text-sm flex items-center gap-2 ${isDark ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-900"} transition-colors`}
          >
            ← Back to store
          </Link>
          <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{vendor.name}</span>
          {/* Cart icon */}
          <CartIconButton brandPrimary={store?.primary_color ?? "#e65100"} />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-100">
              {product.thumbnail ? (
                <Image src={product.thumbnail} alt={product.title} fill className="object-cover" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl opacity-20">🛍</span>
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((img: any) => (
                  <div key={img.id} className="aspect-square relative rounded-xl overflow-hidden bg-gray-100">
                    <Image src={img.url} alt={product.title} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="sticky top-24">
            <p className="text-xs uppercase tracking-widest mb-3 font-medium" style={{ color: "var(--brand-primary)" }}>
              {vendor.name}
            </p>
            <h1 className={`text-4xl font-bold mb-4 leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              {product.title}
            </h1>

            {price !== undefined && (
              <p className="text-3xl font-semibold mb-8" style={{ color: "var(--brand-primary)" }}>
                {formatPrice(price)}
              </p>
            )}

            {/* Add to cart with option selectors */}
            <AddToCartButton
              product={product}
              brandPrimary={store?.primary_color ?? "#e65100"}
              isDark={isDark}
            />

            <p className={`text-xs text-center mt-4 ${isDark ? "text-white/30" : "text-gray-400"}`}>
              Secure checkout · Powered by Razorpay
            </p>

            {/* Description — render HTML properly */}
            {product.description && (
              <div className={`mt-10 pt-8 border-t ${isDark ? "border-white/10" : "border-gray-100"}`}>
                <h3 className={`text-sm font-semibold uppercase tracking-widest mb-4 ${isDark ? "text-white/60" : "text-gray-500"}`}>
                  Description
                </h3>
                <div
                  className={`prose prose-sm max-w-none leading-relaxed ${isDark ? "text-white/70 prose-invert" : "text-gray-600"}`}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {data.products.length > 1 && (
          <div className={`mt-24 pt-12 border-t ${isDark ? "border-white/10" : "border-gray-100"}`}>
            <h2 className={`text-sm uppercase tracking-widest font-semibold mb-8 ${isDark ? "text-white/60" : "text-gray-500"}`}>
              More from {vendor.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {data.products
                .filter(p => p.handle !== params.productHandle)
                .slice(0, 4)
                .map(p => (
                  <Link key={p.id} href={`/${vendor.handle}/products/${p.handle}`} className="group">
                    <div className={`aspect-square relative rounded-xl overflow-hidden mb-3 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                      {p.thumbnail && (
                        <Image src={p.thumbnail} alt={p.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                    </div>
                    <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>{p.title}</p>
                    {p.variants?.[0]?.prices?.[0]?.amount && (
                      <p className="text-sm" style={{ color: "var(--brand-primary)" }}>
                        {formatPrice(p.variants[0].prices[0].amount)}
                      </p>
                    )}
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
