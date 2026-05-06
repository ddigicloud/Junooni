// // src/app/[handle]/search/page.tsx
// import { notFound } from "next/navigation"
// import type { Metadata } from "next"
// import { getStorefrontData } from "@/lib/api"
// import StoreHeader from "@/components/store/StoreHeader"
// import StoreFooter from "@/components/store/StoreFooter"
// import PageSections from "@/components/store/PageSections"
// import SearchClient from "./SearchClient"

// interface Props { params: { handle: string }; searchParams: { q?: string } }

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const data = await getStorefrontData(params.handle)
//   if (!data) return { title: "Search" }
//   return { title: `Search — ${data.vendor.name}` }
// }

// export default async function SearchPage({ params, searchParams }: Props) {
//   const data = await getStorefrontData(params.handle)
//   if (!data) notFound()

//   const { vendor, store, products, categories, collections } = data
//   const brandPrimary = store?.primary_color ?? "#e65100"
//   const isDark = store?.template === "bold"
//   const brandStyles = {
//     "--brand-primary": brandPrimary,
//     "--brand-secondary": store?.secondary_color ?? "#000",
//   } as React.CSSProperties

//   return (
//     <div style={brandStyles} className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-gray-50"}`}>
//       <StoreHeader vendor={vendor} store={store} categories={categories} collections={collections} products={products} />

//       {/* ── Sections above search ── */}
//       <PageSections
//         layoutKey="search"
//         store={store}
//         vendor={vendor}
//         products={products}
//         categories={categories}
//         collections={collections}
//         brandPrimary={brandPrimary}
//         isDark={isDark}
//         position="top"
//       />

//       {/* ── Search UI (always shown) ── */}
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
//         <SearchClient
//           products={products}
//           handle={params.handle}
//           brandPrimary={brandPrimary}
//           isDark={isDark}
//           initialQuery={searchParams.q ?? ""}
//         />
//       </div>

//       {/* ── Sections below search ── */}
//       <PageSections
//         layoutKey="search"
//         store={store}
//         vendor={vendor}
//         products={products}
//         categories={categories}
//         collections={collections}
//         brandPrimary={brandPrimary}
//         isDark={isDark}
//         position="bottom"
//       />

//       <StoreFooter vendor={vendor} store={store} categories={categories} collections={collections} />
//     </div>
//   )
// }

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefrontData } from "@/lib/api"
import SearchPageClient from "./SearchPageClient"

interface Props { params: { handle: string }; searchParams: { q?: string } }

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getStorefrontData(params.handle, { noCache: true })
  if (!data) return { title: "Search" }
  return { title: `Search — ${data.vendor.name}` }
}

export default async function SearchPage({ params, searchParams }: Props) {
  const data = await getStorefrontData(params.handle, { noCache: true })
  if (!data) notFound()

  const { vendor, store, products, categories, collections } = data

  return (
    <SearchPageClient
      vendor={vendor}
      initialStore={store}
      products={products ?? []}
      categories={categories ?? []}
      collections={collections ?? []}
      handle={params.handle}
      initialQuery={searchParams.q ?? ""}
    />
  )
}