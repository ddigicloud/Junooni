import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "./paginated-products"
import { listCategories } from "@lib/data/categories"
import { retriveVendors } from "@lib/data/vendors"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  categoryHandle,
  vendors,
  colors,
  price,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  categoryHandle?: string
  vendors?: string
  colors?: string
  price?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const colorArray = colors ? colors.split(",") : []
  
  let minPrice, maxPrice
  if (price) {
    const [min, max] = price.split("-").map(p => parseInt(p, 10))
    minPrice = min
    maxPrice = max
  }

  // Fetch categories and vendors for the filters
  const categories = await listCategories()
  const vendorsData = await retriveVendors()
  
  // Map vendors to the format expected by the UI
  const formattedVendors = vendorsData.map(vendor => ({
    id: vendor.id,
    name: vendor.name,
    handle: vendor.handle,
    products:vendor.products
  }))
  
  
  console.log("formattedVendors", formattedVendors)
  // Convert vendor names from URL to handles for filtering
  let vendorHandles: string[] = []
  if (vendors) {
    const vendorNames = vendors.split(",")
    vendorHandles = vendorsData
      .filter(vendor => vendorNames.includes(vendor.name))
      .map(vendor => vendor.handle)
  }

  return (
    <div
      className="flex flex-col py-6 small:flex-row small:items-start content-container"
      data-testid="category-container"
    >
      <RefinementList 
        sortBy={sort} 
        categories={categories}
        vendors={formattedVendors}
      />
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1 data-testid="store-page-title">All products</h1>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            categoryHandle={categoryHandle}
            vendors={vendorHandles.length > 0 ? vendorHandles : undefined}
            colors={colorArray.length > 0 ? colorArray : undefined}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate

