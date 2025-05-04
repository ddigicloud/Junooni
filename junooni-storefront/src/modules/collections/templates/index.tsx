import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import { listCategories } from "@lib/data/categories"
import { retriveVendors } from "@lib/data/vendors"

type CollectionTemplateProps = {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  categoryHandle?: string
  creators?: string
  colors?: string
  price?: string
}

export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  categoryHandle,
  creators,
  colors,
  price,
}: CollectionTemplateProps) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  
  // Fetch categories and vendors
  const categories = await listCategories()
  const vendors = await retriveVendors() || []
  
  console.log("Loaded categories:", categories.length)
  console.log("Loaded vendors:", vendors.length)
  console.log("loaded products:", collection)
  
  // Map vendors to creator format
  const creatorData = vendors.map(vendor => ({
    id: vendor.id,
    name: vendor.name,
    handle: vendor.handle
  }))
  
  // Parse filter parameters
  const creatorArray = creators ? creators.split(",") : []
  const colorArray = colors ? colors.split(",") : []
  
  let minPrice, maxPrice
  if (price) {
    const [min, max] = price.split("-").map(p => parseInt(p, 10))
    minPrice = min
    maxPrice = max
  }
  
  console.log("Filter parameters:", {
    categoryHandle,
    creators: creatorArray,
    colors: colorArray,
    price
  })

  return (
    <div className="flex mt-16 gap-8 flex-col py-6 small:flex-row small:items-start content-container">
      <RefinementList
        sortBy={sort}
        categories={categories}
        creators={creatorData}
        products={collection.products}
      />
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1>{collection.title}</h1>
        </div>
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={collection.products?.length || 12}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
            categoryHandle={categoryHandle}
            creators={creatorArray.length > 0 ? creatorArray : undefined}
            colors={colorArray.length > 0 ? colorArray : undefined}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </Suspense>
      </div>
    </div>
  )
}