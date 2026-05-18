// import { notFound } from "next/navigation"
// import type { Metadata } from "next"
// import { getStorefrontData } from "@/lib/api"
// import CollectionsPageClient from "./CollectionsPageClient"

// interface Props { params: { handle: string } }

// export const dynamic = "force-dynamic"
// export const revalidate = 0

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const data = await getStorefrontData(params.handle, { noCache: true })
//   if (!data) return { title: "Collections" }
//   return { title: `Collections — ${data.vendor.name}` }
// }

// export default async function CollectionsIndexPage({ params }: Props) {
//   const data = await getStorefrontData(params.handle, { noCache: true })
//   if (!data) notFound()

//   const { vendor, store, products, categories, collections } = data

//   return (
//     <CollectionsPageClient
//       vendor={vendor}
//       initialStore={store}
//       products={products ?? []}
//       categories={categories ?? []}
//       collections={collections ?? []}
//       handle={params.handle}
//     />
//   )
// }

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefrontData, getStoreCollections } from "@/lib/api"
import CollectionsPageClient from "./CollectionsPageClient"

interface Props { params: { handle: string } }

export const revalidate = 30

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getStorefrontData(params.handle)
  if (!data) return { title: "Collections" }
  return {
    title: `Collections — ${data.vendor.name}`,
    description: `Browse all collections from ${data.vendor.name} on JUNOONI.`,
  }
}

export default async function CollectionsIndexPage({ params }: Props) {
  const [storeData, collectionsData] = await Promise.all([
    getStorefrontData(params.handle),
    getStoreCollections(params.handle),
  ])

  if (!storeData) notFound()

  const { vendor, store, categories } = storeData

  return (
    <CollectionsPageClient
      vendor={vendor}
      initialStore={store}
      products={collectionsData?.products ?? []}
      categories={collectionsData?.categories ?? categories ?? []}
      collections={collectionsData?.collections ?? []}
      handle={params.handle}
    />
  )
}