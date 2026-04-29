import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefrontData } from "@/lib/api"
import StoreHeader from "@/components/store/StoreHeader"
import StoreFooter from "@/components/store/StoreFooter"
import ProductGrid from "@/components/store/ProductGrid"

interface Props { params: { handle: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getStorefrontData(params.handle)
  if (!data) return { title: "Products" }
  return { title: `All Products — ${data.vendor.name}` }
}

export default async function AllProductsPage({ params }: Props) {
  const data = await getStorefrontData(params.handle)
  if (!data) notFound()

  const { vendor, store, products, categories, collections } = data
  const brandPrimary = store?.primary_color ?? "#e65100"
  const isDark = store?.template === "bold"
  const brandStyles = { "--brand-primary": brandPrimary, "--brand-secondary": store?.secondary_color ?? "#000" } as React.CSSProperties

  return (
    <div style={brandStyles} className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-gray-50"}`}>
      <StoreHeader vendor={vendor} store={store} categories={categories} collections={collections} products={products} />

      <div className="px-4 py-10 mx-auto max-w-7xl sm:px-6">
        <div className="mb-8">
          <p className="mb-1 text-xs font-semibold tracking-widest uppercase" style={{ color: brandPrimary }}>{vendor.name}</p>
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>All Products</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>{products.length} product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <ProductGrid products={products} categories={categories} collections={collections} handle={params.handle} brandPrimary={brandPrimary} isDark={isDark} />
      </div>

      <StoreFooter vendor={vendor} store={store} categories={categories} collections={collections} />
    </div>
  )
}
