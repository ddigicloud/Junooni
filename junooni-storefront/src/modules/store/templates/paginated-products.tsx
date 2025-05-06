import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
  tags?: string[]
  price_min?: number
  price_max?: number
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryHandle,
  productsIds,
  countryCode,
  vendors,
  colors,
  minPrice,
  maxPrice,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryHandle?: string
  productsIds?: string[]
  countryCode: string
  vendors?: string[]
  colors?: string[]
  minPrice?: number
  maxPrice?: number
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let products = []
  let count = 0

  // Step 1: Get products for the collection
  const queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (minPrice !== undefined) {
    queryParams["price_min"] = minPrice
  }

  if (maxPrice !== undefined) {
    queryParams["price_max"] = maxPrice
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  let {
    response: { products: fetchedProducts, count: fetchedCount },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  products = fetchedProducts
  count = fetchedCount

 console.log("All products:", products)

  // Step 2: Apply vendor filter if specified
  if (vendors && vendors.length > 0 && products.length > 0) {
   
    products = products.filter(product => {
      // Check if product has vendor and if vendor handle matches any selected vendors
      if (!product.vendor) {
        return false
      }
      
      // Check if the vendor's handle matches any of the selected vendor handles
      const hasMatchingVendor = vendors.includes(product.vendor.handle)
       return hasMatchingVendor
    })
    
    count = products.length
 
  }

  // Step 3: Apply category filter if specified
  if (categoryHandle && products.length > 0) {
    products = products.filter(product => {
      if (!product.categories || product.categories.length === 0) {
        return false
      }

      const hasMatchingCategory = product.categories.some(cat => {
        if (cat.handle === categoryHandle) {
          return true
        }
        
        if (cat.mpath && cat.mpath.includes(categoryHandle)) {
          return true
        }
        
        return false
      })

      return hasMatchingCategory
    })
    
    count = products.length
  }

  // Step 4: Apply color filter if specified
  if (colors && colors.length > 0 && products.length > 0) {
    products = products.filter(product => {
      const productColors = new Set<string>()
      
      if (product.metadata) {
        if (product.metadata.color_hex_values) {
          try {
            const parsedColors = JSON.parse(product.metadata.color_hex_values)
            if (Array.isArray(parsedColors)) {
              parsedColors.forEach(color => {
                productColors.add(color.name.toLowerCase())
              })
            }
          } catch (e) {
            console.error('Failed to parse color_hex_values:', e)
          }
        }
        
        // Object.keys(product.metadata).forEach(key => {
        //   if (key.startsWith("Color_")) {
        //     const colorName = key.replace("Color_", "").toLowerCase()
        //     productColors.add(colorName)
        //   }
        // })
      }
      
      return colors.some(selectedColor => 
        productColors.has(selectedColor.toLowerCase())
      )
    })
    
    count = products.length
  }

  // Step 5: Implement pagination on the filtered results
  const start = (page - 1) * PRODUCT_LIMIT
  const end = start + PRODUCT_LIMIT
  const paginatedProducts = products.slice(start, end)
  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      <ul
        className="grid w-full grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {paginatedProducts.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview product={p} region={region} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}

