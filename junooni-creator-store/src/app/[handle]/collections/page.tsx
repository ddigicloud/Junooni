// // src/app/[handle]/collections/page.tsx
// import { notFound } from "next/navigation"
// import Image from "next/image"
// import Link from "next/link"
// import type { Metadata } from "next"
// import { getStorefrontData } from "@/lib/api"
// import StoreHeader from "@/components/store/StoreHeader"
// import StoreFooter from "@/components/store/StoreFooter"
// import PageSections from "@/components/store/PageSections"

// interface Props { params: { handle: string } }

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const data = await getStorefrontData(params.handle)
//   if (!data) return { title: "Collections" }
//   return { title: `Collections — ${data.vendor.name}` }
// }

// export default async function CollectionsIndexPage({ params }: Props) {
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

//       {/* ── Sections ABOVE the collections grid ── */}
//       <PageSections
//         layoutKey="collections"
//         store={store}
//         vendor={vendor}
//         products={products}
//         categories={categories}
//         collections={collections}
//         brandPrimary={brandPrimary}
//         isDark={isDark}
//         position="top"
//       />

//       {/* ── Default collections grid (always shown) ── */}
//       <div className="max-w-6xl px-4 py-10 mx-auto sm:px-6">
//         <div className="mb-8">
//           <p className="mb-1 text-xs font-semibold tracking-widest uppercase" style={{ color: brandPrimary }}>
//             {vendor.name}
//           </p>
//           <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Collections</h1>
//         </div>

//         {collections.length === 0 ? (
//           <div className="py-20 text-center">
//             <p className={`text-lg ${isDark ? "text-white/50" : "text-gray-500"}`}>No collections yet</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//             {collections.map(col => {
//               const colProductIds: string[] = (col as any).product_ids ?? []
//               const productCount = colProductIds.length
//               const thumb =
//                 (col as any).thumbnail ??
//                 products.find(p => colProductIds.map(String).includes(String(p.id)))?.thumbnail

//               return (
//                 <Link key={col.id} href={`/${params.handle}/collections/${col.handle}`}
//                   className={`group rounded-2xl overflow-hidden border hover:shadow-md transition-all ${
//                     isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-white"
//                   }`}>
//                   <div className="aspect-[4/5] relative bg-gray-100 overflow-hidden">
//                     {thumb
//                       ? <Image src={thumb} alt={col.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
//                       : <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-gray-100"}`}>
//                           <span className="text-4xl opacity-20">🛍</span>
//                         </div>
//                     }
//                     <div className="absolute inset-0 transition-colors bg-black/10 group-hover:bg-black/0" />
//                   </div>
//                   <div className="p-5">
//                     <h2 className={`font-semibold text-base mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>{col.title}</h2>
//                     <p className="text-sm" style={{ color: brandPrimary }}>
//                       {productCount} product{productCount !== 1 ? "s" : ""}
//                     </p>
//                   </div>
//                 </Link>
//               )
//             })}
//           </div>
//         )}
//       </div>

//       {/* ── Sections BELOW the collections grid ── */}
//       <PageSections
//         layoutKey="collections"
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
import CollectionsPageClient from "./CollectionsPageClient"

interface Props { params: { handle: string } }

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getStorefrontData(params.handle, { noCache: true })
  if (!data) return { title: "Collections" }
  return { title: `Collections — ${data.vendor.name}` }
}

export default async function CollectionsIndexPage({ params }: Props) {
  const data = await getStorefrontData(params.handle, { noCache: true })
  if (!data) notFound()

  const { vendor, store, products, categories, collections } = data

  return (
    <CollectionsPageClient
      vendor={vendor}
      initialStore={store}
      products={products ?? []}
      categories={categories ?? []}
      collections={collections ?? []}
      handle={params.handle}
    />
  )
}