// PaginatedProducts.tsx - ORIGINAL ASYNC SERVER COMPONENT (for other pages)
import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 24

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
  categoryId,
  categoryHandle,
  categoryHandles,
  productsIds,
  countryCode,
  vendors,
  colors,
  collections,
  minPrice,
  maxPrice,
  categoryProducts = [],
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  categoryHandle?: string
  categoryHandles?: string[]
  productsIds?: string[]
  countryCode: string
  vendors?: string[]
  colors?: string[]
  collections?: string[]
  minPrice?: number
  maxPrice?: number
  categoryProducts?: any[]
}) {
  const region = await getRegion(countryCode)

  //console.log('📦 PaginatedProducts (Original) received:')
  //console.log('- collections prop:', collections)
  //console.log('- vendors prop:', vendors)
  //console.log('- colors prop:', colors)
  //console.log('- countryCode:', countryCode)

  if (!region) {
    return null
  }

  let products = []
  let count = 0

  // Step 1: Get products for the collection or category
  const queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
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

  // Step 2: Apply vendor filter if specified
  if (vendors && vendors.length > 0 && products.length > 0) {
    //console.log('🏪 Vendor Filter Debug:')
    //console.log('- Selected vendors:', vendors)
    //console.log('- Products before vendor filtering:', products.length)
    
    products = products.filter(product => {
      if (!product.vendor) {
        return false
      }
      
      const hasMatchingVendor = vendors.includes(product.vendor.handle)
      
      if (hasMatchingVendor) {
        //console.log(`✅ Product "${product.title}" matches vendor "${product.vendor.handle}"`)
      }
      
      return hasMatchingVendor
    })
    
    count = products.length
    //console.log('- Products after vendor filtering:', products.length)
  }

  // Step 3: Apply collection filter if specified
  if (collections && collections.length > 0 && products.length > 0) {
    //console.log('🏷️ Collection Filter Debug:')
    //console.log('- Selected collections:', collections)
    //console.log('- Products before filtering:', products.length)
    
    products = products.filter(product => {
      if (!product.collection) {
        //console.log(`❌ Product "${product.title}" has no collection`)
        return false
      }
      
      const hasMatchingCollection = collections.includes(product.collection.handle)
      
      if (hasMatchingCollection) {
        //console.log(`✅ Product "${product.title}" matches collection "${product.collection.handle}"`)
      } else {
        //console.log(`❌ Product "${product.title}" collection "${product.collection.handle}" not in selected collections`)
      }
      
      return hasMatchingCollection
    })
    
    count = products.length
    //console.log('- Products after collection filtering:', products.length)
  }

  // Step 4: Apply category filter with support for multiple categories
  const processedCategoryHandles = categoryHandles || (categoryHandle ? categoryHandle.split(',').map(c => c.trim()).filter(Boolean) : [])
  
  //console.log('🏷️ PaginatedProducts Debug:')
  //console.log('- categoryHandle (old):', categoryHandle)
  //console.log('- categoryHandles (new):', categoryHandles)
  //console.log('- processedCategoryHandles:', processedCategoryHandles)
  
  if (processedCategoryHandles.length > 0 && products.length > 0) {
    products = products.filter(product => {
      if (!product.categories || product.categories.length === 0) {
        return false
      }

      const hasMatchingCategory = product.categories.some(cat => {
        return processedCategoryHandles.some(selectedCategory => {
          if (cat.handle === selectedCategory) {
            return true
          }
          
          if (cat.mpath && cat.mpath.includes(selectedCategory)) {
            return true
          }
          
          if (cat.parent_category && cat.parent_category.handle === selectedCategory) {
            return true
          }
          
          return false
        })
      })

      return hasMatchingCategory
    })
    
    count = products.length
    
    //console.log('✅ After category filtering:')
    //console.log(`- Products found: ${products.length}`)
    // console.log(`- First few products:`, products.slice(0, 3).map(p => ({
    //   title: p.title,
    //   categories: p.categories?.map(c => c.handle)
    // })))
  }

  // Step 5: Apply color filter if specified
  if (colors && colors.length > 0 && products.length > 0) {
    products = products.filter(product => {
      const productColors = new Set<string>()
      
      if (product.metadata) {
        if (product.metadata.color_hex_values) {
          try {
            const parsedColors = JSON.parse(product.metadata.color_hex_values)
            if (Array.isArray(parsedColors)) {
              parsedColors.forEach(color => {
                if (color.name) {
                  productColors.add(color.name.toLowerCase())
                }
              })
            }
          } catch (e) {
            //console.error('Failed to parse color_hex_values:', e)
          }
        }
      }
      
      return colors.some(selectedColor => 
        productColors.has(selectedColor.toLowerCase())
      )
    })
    
    count = products.length
  }

  // If there are no products after filtering, return a message
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-12">
        <h2 className="text-2xl font-medium text-gray-900">No products found</h2>
        <p className="mt-2 text-base text-gray-500">
          Try adjusting your filters to find what you're looking for.
        </p>
      </div>
    )
  }

  // Step 6: Implement pagination on the filtered results
  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <div className="w-full">
      {/* Sort & View Options */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <p className="text-gray-600">
          Showing <span className="font-medium">{products.length}</span> of <span className="font-medium">{count}</span> products
        </p>
      </div>
      
      {/* Products Grid */}
      <ul
        className="grid grid-cols-2 gap-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id} className="overflow-hidden transition-shadow bg-white border border-gray-100 rounded-lg shadow-sm group hover:shadow-md">
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
    </div>
  )
}