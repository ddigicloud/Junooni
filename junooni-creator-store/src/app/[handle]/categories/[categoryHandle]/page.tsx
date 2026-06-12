// import { notFound } from "next/navigation"
// import type { Metadata } from "next"
// import { getStorefrontData } from "@/lib/api"
// import CategoryDetailPageClient from "./CategoryDetailPageClient"

// interface Props { params: { handle: string; categoryHandle: string } }

// export const dynamic = "force-dynamic"
// export const revalidate = 0

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const data = await getStorefrontData(params.handle, { noCache: true })
//   if (!data) return { title: "Category" }
//   const cat = data.categories.find((c: any) => c.handle === params.categoryHandle)
//   return { title: `${cat?.name ?? "Category"} — ${data.vendor.name}` }
// }

// export default async function CategoryDetailPage({ params }: Props) {
//   const data = await getStorefrontData(params.handle, { noCache: true })
//   if (!data) notFound()

//   const { vendor, store, products, categories, collections } = data
//   const category = categories.find((c: any) => c.handle === params.categoryHandle)
//   if (!category) notFound()

//   const catProducts = products.filter((p: any) =>
//     p.categories?.some((c: any) => c.handle === params.categoryHandle)
//   )

//   return (
//     <CategoryDetailPageClient
//       vendor={vendor}
//       initialStore={store}
//       products={products ?? []}
//       catProducts={catProducts}
//       categories={categories ?? []}
//       collections={collections ?? []}
//       category={category}
//       handle={params.handle}
//       categoryHandle={params.categoryHandle}
//     />
//   )
// }

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getStorefrontData, getStoreCategoryDetail } from "@/lib/api"
import CategoryDetailPageClient from "./CategoryDetailPageClient"

interface Props { params: { handle: string; categoryHandle: string } }

export const revalidate = 30

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [storeData, catData] = await Promise.all([
    getStorefrontData(params.handle),
    getStoreCategoryDetail(params.handle, params.categoryHandle),
  ])
  if (!storeData) return { title: "Category" }
  return {
    title: `${catData?.category?.name ?? "Category"} — ${storeData.vendor.name}`,
    description: `Shop ${catData?.category?.name ?? "products"} from ${storeData.vendor.name} on JUNOONI.`,
  }
}

export default async function CategoryDetailPage({ params }: Props) {
  const [storeData, catData] = await Promise.all([
    getStorefrontData(params.handle),
    getStoreCategoryDetail(params.handle, params.categoryHandle),
  ])

  if (!storeData) notFound()
  if (!catData?.category) notFound()

  const { vendor, store, collections } = storeData

  return (
    <CategoryDetailPageClient
      vendor={vendor}
      initialStore={store}
      products={storeData.products ?? []}
      catProducts={catData.products ?? []}
      categories={catData.categories ?? []}
      collections={catData.collections ?? collections ?? []}
      category={catData.category}
      handle={params.handle}
      categoryHandle={params.categoryHandle}
    />
  )
}