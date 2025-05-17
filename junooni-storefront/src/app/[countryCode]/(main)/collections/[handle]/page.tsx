// import { Metadata } from "next"
// import { notFound } from "next/navigation"
// import { getCollectionByHandle, listCollections } from "@lib/data/collections"
// import { listRegions } from "@lib/data/regions"
// import { StoreCollection, StoreRegion } from "@medusajs/types"
// import CollectionTemplate from "@modules/collections/templates"
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

// type Props = {
//   params: { handle: string; countryCode: string }
//   searchParams: {
//     page?: string
//     sortBy?: SortOptions
//     category?: string
//     vendors?: string
//     colors?: string
//     price?: string
//   }
// }

// export const PRODUCT_LIMIT = 12

// export async function generateStaticParams() {
//   try {
//     const { collections } = await listCollections({
//       fields: "*products",
//     })
//     if (!collections || collections.length === 0) {
//       return []
//     }
//     const countryCodes = await listRegions().then(
//       (regions: StoreRegion[]) =>
//         regions
//           ?.map((r) => r.countries?.map((c) => c.iso_2))
//           .flat()
//           .filter(Boolean) as string[]
//     )
//     const collectionHandles = collections.map(
//       (collection: StoreCollection) => collection.handle
//     )
//     const staticParams = countryCodes
//       ?.map((countryCode: string) =>
//         collectionHandles.map((handle: string | undefined) => ({
//           countryCode,
//           handle,
//         }))
//       )
//       .flat()
//     return staticParams
//   } catch (error) {
//     console.error("Error generating static params:", error)
//     return []
//   }
// }

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   try {
//     const collection = await getCollectionByHandle(params.handle)
//     if (!collection) {
//       return {
//         title: "Collection Not Found | Medusa Store",
//         description: "The requested collection could not be found.",
//       }
//     }
//     return {
//       title: `${collection.title} | Medusa Store`,
//       description: `${collection.title} collection`,
//       openGraph: {
//         title: `${collection.title} | Medusa Store`,
//         description: `Explore our ${collection.title} collection`,
//         type: "website",
//       }
//     }
//   } catch (error) {
//     return {
//       title: "Error | Medusa Store",
//       description: "An error occurred while retrieving collection information.",
//     }
//   }
// }

// export default async function CollectionPage({ searchParams, params }: Props) {
//   const { 
//     sortBy, 
//     page,
//     category,
//     vendors,
//     colors,
//     price 
//   } = searchParams
  
//   try {
//     const collection = await getCollectionByHandle(params.handle)
//     if (!collection) {
//       notFound()
//     }
    
//     return (
//       <div className="bg-white min-h-screen">
//         <CollectionTemplate
//           collection={collection}
//           page={page}
//           sortBy={sortBy}
//           countryCode={params.countryCode}
//           categoryHandle={category}
//           vendors={vendors}
//           colors={colors}
//           price={price}
//         />
//       </div>
//     )
//   } catch (error) {
//     console.error("Error loading collection page:", error)
//     notFound()
//   }
// }

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import MobileFilters from "@modules/store/components/mobile-filters"
import { listCategories } from "@lib/data/categories"

type Props = {
  params: { handle: string; countryCode: string }
  searchParams: {
    page?: string
    sortBy?: SortOptions
    category?: string
    vendors?: string
    colors?: string
    price?: string
    showMobileFilters?: string
  }
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const collection = await getCollectionByHandle(params.handle)
    if (!collection) {
      return {
        title: "Collection Not Found | Medusa Store",
        description: "The requested collection could not be found.",
      }
    }
    return {
      title: `${collection.title} | Medusa Store`,
      description: `${collection.title} collection`,
      openGraph: {
        title: `${collection.title} | Medusa Store`,
        description: `Explore our ${collection.title} collection`,
        type: "website",
      }
    }
  } catch (error) {
    return {
      title: "Error | Medusa Store",
      description: "An error occurred while retrieving collection information.",
    }
  }
}

export default async function CollectionPage({ searchParams, params }: Props) {
  const { 
    sortBy, 
    page,
    category,
    vendors,
    colors,
    price,
    showMobileFilters 
  } = searchParams
  
  try {
    const collection = await getCollectionByHandle(params.handle)
    if (!collection) {
      notFound()
    }
    
    // If showing mobile filters, render the mobile filter component
    if (showMobileFilters === "true") {
      const categories = await listCategories()
      
      return (
        <MobileFilters
          sortBy={sortBy || "created_at"}
          categories={categories}
          vendors={[]} // These will be fetched inside the component
          products={collection.products}
          isCollectionPage={true}
        />
      )
    }
    
    return (
      <div className="bg-white min-h-screen">
        <CollectionTemplate
          collection={collection}
          page={page}
          sortBy={sortBy}
          countryCode={params.countryCode}
          categoryHandle={category}
          vendors={vendors}
          colors={colors}
          price={price}
        />
      </div>
    )
  } catch (error) {
    console.error("Error loading collection page:", error)
    notFound()
  }
}