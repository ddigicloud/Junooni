// import { notFound } from "next/navigation"
// import type { Metadata } from "next"
// import { getStorefrontData } from "@/lib/api"
// import MinimalTemplate from "@/components/templates/minimal/MinimalTemplate"
// import StoreHeader from "@/components/store/StoreHeader"
// import StoreFooter from "@/components/store/StoreFooter"
// import ProductCard from "@/components/ui/ProductCard"
// import Link from "next/link"
// import { ArrowLeft } from "lucide-react"

// interface Props { params: { handle: string; collectionHandle: string } }

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const data = await getStorefrontData(params.handle)
//   if (!data) return { title: "Collection" }
//   const col = (data.collections ?? []).find((c: any) => c.handle === params.collectionHandle)
//   return { title: `${col?.title ?? "Collection"} — ${data.vendor.name}` }
// }

// export default async function CollectionPage({ params }: Props) {
//   const data = await getStorefrontData(params.handle)
//   if (!data) notFound()

//   const { vendor, store, products, categories, collections } = data

//   // Find this vendor collection
//   const col = (collections ?? []).find((c: any) => c.handle === params.collectionHandle)
//   if (!col) notFound()

//   // Filter products to only those in this collection's product_ids
//   const productIds: string[] = (col as any).product_ids ?? []
//   const collectionProducts = productIds.length > 0
//     ? products.filter(p => productIds.includes(p.id))
//     : products // fallback: show all if no ids set

//   const brandPrimary = store?.primary_color ?? "#e65100"
//   const isDark = store?.template === "bold"
//   const brandStyles = {
//     "--brand-primary": brandPrimary,
//     "--brand-secondary": store?.secondary_color ?? "#000",
//   } as React.CSSProperties

//   return (
//     <div style={brandStyles} className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white"}`}>
//       {/* Header */}
//       <div className={isDark ? "sticky top-0 z-40" : "sticky top-0 z-40"}>
//         <StoreHeader vendor={vendor} store={store} categories={categories}
//           collections={collections} products={products} />
//       </div>

//       {/* Collection hero */}
//       <div className={`border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
//         {(col as any).thumbnail && (
//           <div className="relative h-48 overflow-hidden md:h-64">
//             <img src={(col as any).thumbnail} alt={col.title}
//               className="object-cover w-full h-full opacity-60" />
//             <div className={`absolute inset-0 ${isDark ? "bg-black/60" : "bg-white/6"}`} />
//           </div>
//         )}
//         <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6">
//           <Link href={`/${vendor.handle}`}
//             className="flex items-center gap-1.5 text-sm mb-4 opacity-60 hover:opacity-100 transition-opacity"
//             style={{ color: brandPrimary }}>
//             <ArrowLeft className="w-3.5 h-3.5" />Back to store
//           </Link>
//           <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
//             {col.title}
//           </h1>
//           {(col as any).description && (
//             <p className={`text-base max-w-xl ${isDark ? "text-white/60" : "text-gray-500"}`}>
//               {(col as any).description}
//             </p>
//           )}
//           <p className="mt-2 text-sm" style={{ color: brandPrimary }}>
//             {collectionProducts.length} product{collectionProducts.length !== 1 ? "s" : ""}
//           </p>
//         </div>
//       </div>

//       {/* Products grid */}
//       <div className="max-w-6xl px-4 py-10 mx-auto sm:px-6">
//         {collectionProducts.length === 0 ? (
//           <div className="py-20 text-center">
//             <p className={`text-lg ${isDark ? "text-white/50" : "text-gray-400"}`}>
//               No products in this collection yet.
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
//             {collectionProducts.map(product => (
//               <ProductCard
//                 key={product.id}
//                 product={product}
//                 handle={vendor.handle}
//                 brandPrimary={brandPrimary}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       <StoreFooter vendor={vendor} store={store} categories={categories} collections={collections} />
//     </div>
//   )
// }

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefrontData } from "@/lib/api"
import CollectionDetailPageClient from "./CollectionDetailPageClient"

interface Props { params: { handle: string; collectionHandle: string } }

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getStorefrontData(params.handle, { noCache: true })
  if (!data) return { title: "Collection" }
  const col = (data.collections ?? []).find((c: any) => c.handle === params.collectionHandle)
  return { title: `${col?.title ?? "Collection"} — ${data.vendor.name}` }
}

export default async function CollectionPage({ params }: Props) {
  const data = await getStorefrontData(params.handle, { noCache: true })
  if (!data) notFound()

  const { vendor, store, products, categories, collections } = data

  const col = (collections ?? []).find((c: any) => c.handle === params.collectionHandle)
  if (!col) notFound()

  const productIds: string[] = (col as any).product_ids ?? []
  const collectionProducts = productIds.length > 0
    ? products.filter(p => productIds.includes(p.id))
    : products

  return (
    <CollectionDetailPageClient
      vendor={vendor}
      initialStore={store}
      products={products ?? []}
      collectionProducts={collectionProducts}
      categories={categories ?? []}
      collections={collections ?? []}
      col={col}
      handle={params.handle}
      collectionHandle={params.collectionHandle}
    />
  )
}