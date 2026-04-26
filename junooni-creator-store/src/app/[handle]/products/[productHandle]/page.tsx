import { cache } from "react"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { getStorefrontData, formatPrice } from "@/lib/api"
import AddToCartButton from "@/components/cart/AddToCartButton"
import CartIconButton from "@/components/cart/CartIconButton"
import ProductGallery from "../ProductGallery"
import { GalleryProvider } from "../GalleryContext"

interface Props {
  params: { handle: string; productHandle: string }
}

const fetchStore = cache(async (handle: string, token?: string) => {
  return getStorefrontData(handle, {
    noCache: true,
    accessToken: token || undefined,
  })
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const token = cookies().get(`store_access_${params.handle}`)?.value
  const data = await fetchStore(params.handle, token)
  if (!data) return { title: "Product not found" }
  const product = data.products.find((p: any) => p.handle === params.productHandle)
  if (!product) return { title: "Product not found" }
  // DEBUG PRICE
  console.log("[ProductPage] variant[0] keys:", Object.keys(product.variants?.[0] ?? {}))
  console.log("[ProductPage] calculated_price:", product.variants?.[0]?.calculated_price)
  console.log("[ProductPage] prices:", product.variants?.[0]?.prices)
  console.log("[ProductPage] calculated_amount:", product.variants?.[0]?.calculated_price?.calculated_amount)
  console.log("[ProductPage] prices[0].amount:", product.variants?.[0]?.prices?.[0]?.amount)

  return {
    title: `${product.title} — ${data.vendor.name}`,
    description: product.description?.replace(/<[^>]*>/g, "") ?? undefined,
    openGraph: { images: product.thumbnail ? [{ url: product.thumbnail }] : [] },
  }
}

export default async function ProductPage({ params }: Props) {
  console.log("[ProductPage] params:", params)

  const token = cookies().get(`store_access_${params.handle}`)?.value
  const data = await fetchStore(params.handle, token)
  if (!data) notFound()

  const product = data.products.find((p: any) => p.handle === params.productHandle)
  if (!product) notFound()

  const { vendor, store } = data
  const brandStyles = {
    "--brand-primary":   store?.primary_color   ?? "#e65100",
    "--brand-secondary": store?.secondary_color ?? "#ac1900",
  } as React.CSSProperties

  const isDark = store?.template === "bold"
  const bgColor = isDark ? "bg-black text-white" : "bg-white text-gray-900"

  const firstVariant = product.variants?.[0]
  const initialImages: any[] =
    firstVariant?.images?.length > 0
      ? firstVariant.images
      : (product.images ?? []).slice(0, 4)

  return (
    <div style={brandStyles} className={`min-h-screen ${bgColor}`}>
      {/* Header */}
      <header
        className={`sticky top-0 z-50 ${
          isDark ? "bg-black/80 border-white/10" : "bg-white/90 border-gray-100"
        } backdrop-blur-md border-b`}
      >
        <div className="flex items-center justify-between h-16 px-6 mx-auto max-w-7xl">
          <Link
            href={`/${vendor.handle}`}
            className={`text-sm flex items-center gap-2 ${
              isDark ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-900"
            } transition-colors`}
          >
            ← Back to store
          </Link>
          <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
            {vendor.name}
          </span>
          <CartIconButton brandPrimary={store?.primary_color ?? "#e65100"} />
        </div>
      </header>

      {/* Product */}
      <div className="px-6 py-16 mx-auto max-w-7xl">
        <GalleryProvider initialImages={initialImages}>
          <div className="grid items-start gap-16 md:grid-cols-2">

            {/* Left: Gallery */}
            <ProductGallery
              initialImages={initialImages}
              fallbackThumbnail={product.thumbnail}
              productTitle={product.title}
              isDark={isDark}
            />

            {/* Right: Info + options */}
            <div className="sticky top-24">
              <p
                className="mb-3 text-xs font-medium tracking-widest uppercase"
                style={{ color: "var(--brand-primary)" }}
              >
                {vendor.name}
              </p>

              <h1
                className={`text-4xl font-bold mb-4 leading-tight ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {product.title}
              </h1>

              {product.variants?.[0]?.prices?.[0]?.amount !== undefined && (
                <p className="mb-8 text-3xl font-semibold" style={{ color: "var(--brand-primary)" }}>
                  {formatPrice(product.variants[0].prices[0].amount)}
                </p>
              )}

              <AddToCartButton
                product={product}
                brandPrimary={store?.primary_color ?? "#e65100"}
                isDark={isDark}
              />

              <p
                className={`text-xs text-center mt-4 ${
                  isDark ? "text-white/30" : "text-gray-400"
                }`}
              >
                Secure checkout via Junooni · Powered by Razorpay
              </p>

              {/* Description */}
              {product.description && (
                <div
                  className={`mt-10 pt-8 border-t ${
                    isDark ? "border-white/10" : "border-gray-100"
                  }`}
                >
                  <h3
                    className={`text-sm font-semibold uppercase tracking-widest mb-4 ${
                      isDark ? "text-white/60" : "text-gray-500"
                    }`}
                  >
                    Description
                  </h3>
                  <div
                    className={`prose prose-sm max-w-none leading-relaxed ${
                      isDark ? "text-white/70 prose-invert" : "text-gray-600"
                    }`}
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}
            </div>
          </div>
        </GalleryProvider>

        {/* Related products */}
        {data.products.length > 1 && (
          <div
            className={`mt-24 pt-12 border-t ${
              isDark ? "border-white/10" : "border-gray-100"
            }`}
          >
            <h2
              className={`text-sm uppercase tracking-widest font-semibold mb-8 ${
                isDark ? "text-white/60" : "text-gray-500"
              }`}
            >
              More from {vendor.name}
            </h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {data.products
                .filter((p: any) => p.handle !== params.productHandle)
                .slice(0, 4)
                .map((p: any) => (
                  <Link
                    key={p.id}
                    href={`/${vendor.handle}/products/${p.handle}`}
                    className="group"
                  >
                    <div
                      className={`aspect-square relative rounded-xl overflow-hidden mb-3 ${
                        isDark ? "bg-white/5" : "bg-gray-50"
                      }`}
                    >
                      {p.thumbnail && (
                        <Image
                          src={p.thumbnail}
                          alt={p.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <p
                      className={`text-sm font-medium truncate ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {p.title}
                    </p>
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