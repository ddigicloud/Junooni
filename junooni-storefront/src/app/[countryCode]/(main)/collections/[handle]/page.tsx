// app/collections/[handle]/[countryCode]/page.tsx

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ handle: string; countryCode: string }> // Now a Promise!
  searchParams: Promise<{  // Also a Promise in Next.js 15+
    page?: string
    sortBy?: SortOptions
    category?: string
    vendors?: string
    colors?: string
    price?: string
  }>
}

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  try {
    const { collections } = await listCollections({
      fields: "*products",
    })
    if (!collections || collections.length === 0) {
      return []
    }
    const countryCodes = await listRegions().then(
      (regions: StoreRegion[]) =>
        regions
          ?.map((r) => r.countries?.map((c) => c.iso_2))
          .flat()
          .filter(Boolean) as string[]
    )
    const collectionHandles = collections.map(
      (collection: StoreCollection) => collection.handle
    )
    const staticParams = countryCodes
      ?.map((countryCode: string) =>
        collectionHandles.map((handle: string | undefined) => ({
          countryCode,
          handle,
        }))
      )
      .flat()
    return staticParams
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

// Fix: Await params before using
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Await params before accessing properties
    const resolvedParams = await params
    const collection = await getCollectionByHandle(resolvedParams.handle)
    
    if (!collection) {
      return {
        title: "Collection Not Found | Medusa Store",
        description: "The requested collection could not be found.",
      }
    }
    return {
      title: `${collection.title} | Medusa Store`,
      description: collection.description || `${collection.title} collection`,
    }
  } catch (error) {
    return {
      title: "Error | Medusa Store",
      description: "An error occurred while retrieving collection information.",
    }
  }
}

// Fix: Await both params and searchParams
export default async function CollectionPage({ searchParams, params }: Props) {
  // Await both params and searchParams
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  const {
    sortBy,
    page,
    category,
    vendors,
    colors,
    price
  } = resolvedSearchParams

  try {
    const collection = await getCollectionByHandle(resolvedParams.handle)
    if (!collection) {
      notFound()
    }

    return (
      <CollectionTemplate
        collection={collection}
        page={page}
        sortBy={sortBy}
        countryCode={resolvedParams.countryCode}
        categoryHandle={category}
        vendors={vendors}
        colors={colors}
        price={price}
      />
    )
  } catch (error) {
    console.error("Error loading collection page:", error)
    notFound()
  }
}