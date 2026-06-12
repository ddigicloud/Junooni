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
      //products={colData.products ?? []}
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