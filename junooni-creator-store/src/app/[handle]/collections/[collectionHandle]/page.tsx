// import { notFound } from "next/navigation"
// import type { Metadata } from "next"
// import { getStorefrontData, getStoreCollectionDetail } from "@/lib/api"
// import CollectionDetailPageClient from "./CollectionDetailPageClient"

// interface Props { params: { handle: string; collectionHandle: string } }

// export const revalidate = 30

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const [storeData, colData] = await Promise.all([
//     getStorefrontData(params.handle),
//     getStoreCollectionDetail(params.handle, params.collectionHandle),
//   ])
//   if (!storeData) return { title: "Collection" }
//   return {
//     title: `${colData?.collection?.title ?? "Collection"} — ${storeData.vendor.name}`,
//     description: `Shop the ${colData?.collection?.title ?? "collection"} from ${storeData.vendor.name} on JUNOONI.`,
//   }
// }

// export default async function CollectionPage({ params }: Props) {
//   const [storeData, colData] = await Promise.all([
//     getStorefrontData(params.handle),
//     getStoreCollectionDetail(params.handle, params.collectionHandle),
//   ])

//   if (!storeData) notFound()
//   if (!colData?.collection) notFound()

//   const { vendor, store, categories } = storeData

//   return (
//     <CollectionDetailPageClient
//       vendor={vendor}
//       initialStore={store}
//       //products={colData.products ?? []}
//       products={storeData.products ?? []}
//       collectionProducts={colData.products ?? []}
//       categories={colData.categories ?? categories ?? []}
//       collections={colData.collections ?? []}
//       col={colData.collection}
//       handle={params.handle}
//       collectionHandle={params.collectionHandle}
//     />
//   )
// }


import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefrontData, getStoreCollectionDetail } from "@/lib/api"
import CollectionDetailPageClient from "./CollectionDetailPageClient"
import StoreHeader from "@/components/store/StoreHeader"
import StoreFooter from "@/components/store/StoreFooter"

interface Props { params: { handle: string; collectionHandle: string } }

export const revalidate = 30

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [storeData, colData] = await Promise.all([
    getStorefrontData(params.handle),
    getStoreCollectionDetail(params.handle, params.collectionHandle),
  ])
  if (!storeData) return { title: "Collection" }
  if (!colData?.collection) return { title: `Collection not found — ${storeData.vendor.name}` }
  return {
    title: `${colData.collection.title} — ${storeData.vendor.name}`,
    description: `Shop the ${colData.collection.title} collection from ${storeData.vendor.name} on JUNOONI.`,
  }
}

export default async function CollectionPage({ params }: Props) {
  const [storeData, colData] = await Promise.all([
    getStorefrontData(params.handle),
    getStoreCollectionDetail(params.handle, params.collectionHandle),
  ])

  // Vendor/store itself doesn't exist — fall back to the global branded 404
  if (!storeData) notFound()

  const { vendor, store, categories } = storeData

  const brandPrimary   = store?.primary_color   ?? "#e65100"
  const brandSecondary = store?.secondary_color ?? "#000"
  const isDark         = store?.template === "bold"

  const fontClass =
    store?.font === "poppins"       ? "font-poppins" :
    store?.font === "playfair"      ? "font-playfair" :
    store?.font === "dm-sans"       ? "font-dm-sans" :
    store?.font === "space-grotesk" ? "font-space-grotesk" :
    store?.font === "nunito"        ? "font-nunito" :
    store?.font === "raleway"       ? "font-raleway" :
    store?.font === "montserrat"    ? "font-montserrat" :
    "font-inter"

  const brandStyles = {
    "--brand-primary":   brandPrimary,
    "--brand-secondary": brandSecondary,
  } as React.CSSProperties

  // ── Collection not found — show proper 404 with store header/footer ────
  if (!colData?.collection) {
    return (
      <div style={brandStyles} className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-white"} ${fontClass}`}>
        <StoreHeader
          vendor={vendor} store={store}
          categories={categories ?? []} collections={colData?.collections ?? []} products={storeData.products ?? []}
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full"
            style={{ background: `${brandPrimary}15` }}>
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
            Collection not found
          </h1>
          <p className={`text-base mb-8 max-w-md ${isDark ? "text-white/60" : "text-gray-500"}`}>
            This collection doesn't exist or may have been removed from this store.
          </p>
          <a href={`/${vendor.handle}/collections`}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-opacity rounded-full hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, ${brandSecondary} 100%)` }}>
            Browse all collections
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
        <StoreFooter
          vendor={vendor} store={store}
          categories={categories ?? []} collections={colData?.collections ?? []}
        />
      </div>
    )
  }

  return (
    <CollectionDetailPageClient
      vendor={vendor}
      initialStore={store}
      products={storeData.products ?? []}
      collectionProducts={colData.products ?? []}
      categories={colData.categories ?? categories ?? []}
      collections={colData.collections ?? []}
      col={colData.collection}
      handle={params.handle}
      collectionHandle={params.collectionHandle}
    />
  )
}