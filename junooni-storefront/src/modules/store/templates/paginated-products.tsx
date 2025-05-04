import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { fetchVendorProductsPaginated } from "@lib/data/vendors"
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
  creators,
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
  creators?: string[]
  colors?: string[]
  minPrice?: number
  maxPrice?: number
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // Initialize products and count
  let products = []
  let count = 0
  
  console.log("Filter params:", {
    categoryHandle,
    creators,
    colors,
    minPrice,
    maxPrice
  })


  console.log(creators)
  // If creators are selected, fetch products from each creator
  if (creators && creators.length > 0) {
    try {
      console.log("Fetching products for creators:", creators)
      // Fetch products for each selected creator (vendor)
      const vendorProductPromises = creators.map(creatorId => 
        console.log(creatorId),
        fetchVendorProductsPaginated(creatorId, page, PRODUCT_LIMIT, sortBy)
      )
      
      const vendorProductsResults = await Promise.all(vendorProductPromises)
      
      // Combine products from all creators
      products = vendorProductsResults.flatMap(result => result.products || [])
      count = vendorProductsResults.reduce((total, result) => total + (result.count || 0), 0)
      
      console.log(`Fetched ${products.length} products from ${creators.length} creators`)
    } catch (error) {
      console.error("Error fetching creator products:", error)
      // Fall back to standard product fetching
      products = []
      count = 0
    }
  } 
  
  // If no creators selected or if creator fetching failed, use standard product fetch
  if (products.length === 0) {
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
  }

  // Apply category and color filtering
  if (categoryHandle || (colors && colors.length > 0)) {
    console.log("Applying client-side filtering")
    console.log("Category filter:", categoryHandle)
    console.log("Color filters:", colors)
    
    const originalCount = count
    
    products = products.filter(product => {
      let matchesCategory = true
      let matchesColor = true

      // Category filtering
      if (categoryHandle && typeof categoryHandle === 'string' && categoryHandle !== '') {
        matchesCategory = false
        
        // Check if product has categories
        if (product.categories && product.categories.length > 0) {
          // Direct category match
          const directMatch = product.categories.some(cat => 
            cat.handle === categoryHandle
          )
          
          // Parent category match
          const parentMatch = product.categories.some(cat => {
            if (cat.parent_category && cat.parent_category.handle === categoryHandle) {
              return true
            }
            
            if (cat.mpath) {
              // Check if the category hierarchy includes our target
              return cat.mpath.includes(categoryHandle)
            }
            
            return false
          })
          
          matchesCategory = directMatch || parentMatch
        }
      }

      // Color filtering
      if (colors && colors.length > 0) {
        matchesColor = false
        const productColors = new Set<string>()
        
        // Extract colors from product metadata
        if (product.metadata) {
          // Try parsing color_hex_values first
          if (product.metadata.color_hex_values) {
            try {
              const parsedColors = JSON.parse(product.metadata.color_hex_values)
              if (Array.isArray(parsedColors)) {
                parsedColors.forEach(color => {
                  if (color && color.name) {
                    productColors.add(color.name.toLowerCase())
                  }
                })
              }
            } catch (e) {
              console.error('Failed to parse color_hex_values:', e)
            }
          }
          
          // Also check Color_ prefixed keys
          Object.keys(product.metadata).forEach(key => {
            if (key.startsWith("Color_")) {
              const colorName = key.replace("Color_", "").toLowerCase()
              productColors.add(colorName)
            }
          })
        }
        
        // Check if any selected color matches product colors
        matchesColor = colors.some(selectedColor => 
          productColors.has(selectedColor.toLowerCase())
        )
      }

      // Product must match all applied filters
      return matchesCategory && matchesColor
    })
    
    // Update count after filtering
    count = products.length
    console.log(`Filtered products: ${originalCount} → ${count}`)
  }

  // Handle pagination
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
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map((p) => (
            <li key={p.id}>
              <ProductPreview product={p} region={region} />
            </li>
          ))
        ) : (
          <div className="col-span-full py-8 text-center">
            <p className="text-gray-500">No products found matching your criteria</p>
          </div>
        )}
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