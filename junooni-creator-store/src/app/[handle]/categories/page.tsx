// import { notFound } from "next/navigation"
// import Image from "next/image"
// import Link from "next/link"
// import type { Metadata } from "next"
// import { getStorefrontData } from "@/lib/api"
// import StoreHeader from "@/components/store/StoreHeader"
// import StoreFooter from "@/components/store/StoreFooter"

// interface Props { params: { handle: string } }

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const data = await getStorefrontData(params.handle)
//   if (!data) return { title: "Categories" }
//   return { title: `Categories — ${data.vendor.name}` }
// }

// export default async function CategoriesIndexPage({ params }: Props) {
//   const data = await getStorefrontData(params.handle)
//   if (!data) notFound()

//   const { vendor, store, products, categories, collections } = data
//   const brandPrimary = store?.primary_color ?? "#e65100"
//   const isDark = store?.template === "bold"
//   const brandStyles = { "--brand-primary": brandPrimary, "--brand-secondary": store?.secondary_color ?? "#000" } as React.CSSProperties

//   return (
//     <div style={brandStyles} className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-gray-50"}`}>
//       <StoreHeader vendor={vendor} store={store} categories={categories} collections={collections} products={products} />

//       <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
//         <div className="mb-8">
//           <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: brandPrimary }}>{vendor.name}</p>
//           <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Categories</h1>
//         </div>

//         {categories.length === 0 ? (
//           <div className="py-20 text-center">
//             <p className={`text-lg ${isDark ? "text-white/50" : "text-gray-500"}`}>No categories yet</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//             {categories.map(cat => {
//               const thumb = products.find(p => p.categories?.some(c => c.handle === cat.handle))?.thumbnail
//               return (
//                 <Link key={cat.id} href={`/${params.handle}/categories/${cat.handle}`}
//                   className={`group rounded-2xl overflow-hidden border ${isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-white"} shadow-sm hover:shadow-md transition-all`}>
//                   <div className="aspect-square relative bg-gray-100 overflow-hidden">
//                     {thumb
//                       ? <Image src={thumb} alt={cat.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
//                       : <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-gray-100"}`}><span className="text-4xl opacity-20">🏷</span></div>
//                     }
//                     <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
//                   </div>
//                   <div className="p-4">
//                     <h2 className={`font-semibold text-sm mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>{cat.name}</h2>
//                     <p className="text-xs" style={{ color: brandPrimary }}>{cat.product_count} item{cat.product_count !== 1 ? "s" : ""}</p>
//                   </div>
//                 </Link>
//               )
//             })}
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
import CategoriesPageClient from "./CategoriesPageClient"

interface Props { params: { handle: string } }

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getStorefrontData(params.handle, { noCache: true })
  if (!data) return { title: "Categories" }
  return { title: `Categories — ${data.vendor.name}` }
}

export default async function CategoriesIndexPage({ params }: Props) {
  const data = await getStorefrontData(params.handle, { noCache: true })
  if (!data) notFound()

  const { vendor, store, products, categories, collections } = data

  return (
    <CategoriesPageClient
      vendor={vendor}
      initialStore={store}
      products={products ?? []}
      categories={categories ?? []}
      collections={collections ?? []}
      handle={params.handle}
    />
  )
}