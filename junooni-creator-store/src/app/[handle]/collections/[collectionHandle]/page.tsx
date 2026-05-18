// import { notFound } from "next/navigation"
// import type { Metadata } from "next"
// import { getStorefrontData } from "@/lib/api"
// import CollectionDetailPageClient from "./CollectionDetailPageClient"

// interface Props { params: { handle: string; collectionHandle: string } }

// export const dynamic = "force-dynamic"
// export const revalidate = 0

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const data = await getStorefrontData(params.handle, { noCache: true })
//   if (!data) return { title: "Collection" }
//   const col = (data.collections ?? []).find((c: any) => c.handle === params.collectionHandle)
//   return { title: `${col?.title ?? "Collection"} — ${data.vendor.name}` }
// }

// export default async function CollectionPage({ params }: Props) {
//   const data = await getStorefrontData(params.handle, { noCache: true })
//   if (!data) notFound()

//   const { vendor, store, products, categories, collections } = data

//   const col = (collections ?? []).find((c: any) => c.handle === params.collectionHandle)
//   if (!col) notFound()

//   const productIds: string[] = (col as any).product_ids ?? []
//   const collectionProducts = productIds.length > 0
//     ? products.filter(p => productIds.includes(p.id))
//     : products

//   return (
//     <CollectionDetailPageClient
//       vendor={vendor}
//       initialStore={store}
//       products={products ?? []}
//       collectionProducts={collectionProducts}
//       categories={categories ?? []}
//       collections={collections ?? []}
//       col={col}
//       handle={params.handle}
//       collectionHandle={params.collectionHandle}
//     />
//   )
// }

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefrontData, getStoreCollectionDetail } from "@/lib/api"
import CollectionDetailPageClient from "./CollectionDetailPageClient"

interface Props { params: { handle: string; collectionHandle: string } }

export const revalidate = 30

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [storeData, colData] = await Promise.all([
    getStorefrontData(params.handle),
    getStoreCollectionDetail(params.handle, params.collectionHandle),
  ])
  if (!storeData) return { title: "Collection" }
  return {
    title: `${colData?.collection?.title ?? "Collection"} — ${storeData.vendor.name}`,
    description: `Shop the ${colData?.collection?.title ?? "collection"} from ${storeData.vendor.name} on JUNOONI.`,
  }
}

export default async function CollectionPage({ params }: Props) {
  const [storeData, colData] = await Promise.all([
    getStorefrontData(params.handle),
    getStoreCollectionDetail(params.handle, params.collectionHandle),
  ])

  if (!storeData) notFound()
  if (!colData?.collection) notFound()

  const { vendor, store, categories } = storeData

  return (
    <CollectionDetailPageClient
      vendor={vendor}
      initialStore={store}
      products={colData.products ?? []}
      collectionProducts={colData.products ?? []}
      categories={colData.categories ?? categories ?? []}
      collections={colData.collections ?? []}
      col={colData.collection}
      handle={params.handle}
      collectionHandle={params.collectionHandle}
    />
  )
}