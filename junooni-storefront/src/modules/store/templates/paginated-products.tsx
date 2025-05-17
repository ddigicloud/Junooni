// import { listProductsWithSort } from "@lib/data/products"
// import { getRegion } from "@lib/data/regions"
// import ProductPreview from "@modules/products/components/product-preview"
// import { Pagination } from "@modules/store/components/pagination"
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

// const PRODUCT_LIMIT = 12

// type PaginatedProductsParams = {
//   limit: number
//   collection_id?: string[]
//   category_id?: string[]
//   id?: string[]
//   order?: string
//   tags?: string[]
//   price_min?: number
//   price_max?: number
// }

// export default async function PaginatedProducts({
//   sortBy,
//   page,
//   collectionId,
//   categoryHandle,
//   productsIds,
//   countryCode,
//   vendors,
//   colors,
//   minPrice,
//   maxPrice,
// }: {
//   sortBy?: SortOptions
//   page: number
//   collectionId?: string
//   categoryHandle?: string
//   productsIds?: string[]
//   countryCode: string
//   vendors?: string[]
//   colors?: string[]
//   minPrice?: number
//   maxPrice?: number
// }) {
//   const region = await getRegion(countryCode)

//   if (!region) {
//     return null
//   }

//   let products = []
//   let count = 0

//   // Step 1: Get products for the collection
//   const queryParams: PaginatedProductsParams = {
//     limit: PRODUCT_LIMIT,
//   }

//   if (collectionId) {
//     queryParams["collection_id"] = [collectionId]
//   }

//   if (productsIds) {
//     queryParams["id"] = productsIds
//   }

//   if (minPrice !== undefined) {
//     queryParams["price_min"] = minPrice
//   }

//   if (maxPrice !== undefined) {
//     queryParams["price_max"] = maxPrice
//   }

//   if (sortBy === "created_at") {
//     queryParams["order"] = "created_at"
//   }

//   let {
//     response: { products: fetchedProducts, count: fetchedCount },
//   } = await listProductsWithSort({
//     page,
//     queryParams,
//     sortBy,
//     countryCode,
//   })

//   products = fetchedProducts
//   count = fetchedCount

//   // Step 2: Apply vendor filter if specified
//   if (vendors && vendors.length > 0 && products.length > 0) {
//     products = products.filter(product => {
//       // Check if product has vendor
//       if (!product.vendor) {
//         return false
//       }
      
//       // Check if the vendor's handle matches any of the selected vendor handles
//       return vendors.includes(product.vendor.handle)
//     })
    
//     count = products.length
//   }

//   // Step 3: Apply category filter if specified
//   if (categoryHandle && products.length > 0) {
//     products = products.filter(product => {
//       if (!product.categories || product.categories.length === 0) {
//         return false
//       }

//       const hasMatchingCategory = product.categories.some(cat => {
//         if (cat.handle === categoryHandle) {
//           return true
//         }
        
//         if (cat.mpath && cat.mpath.includes(categoryHandle)) {
//           return true
//         }
        
//         return false
//       })

//       return hasMatchingCategory
//     })
    
//     count = products.length
//   }

//   // Step 4: Apply color filter if specified
//   if (colors && colors.length > 0 && products.length > 0) {
//     products = products.filter(product => {
//       const productColors = new Set<string>()
      
//       if (product.metadata) {
//         if (product.metadata.color_hex_values) {
//           try {
//             const parsedColors = JSON.parse(product.metadata.color_hex_values)
//             if (Array.isArray(parsedColors)) {
//               parsedColors.forEach(color => {
//                 if (color.name) {
//                   productColors.add(color.name.toLowerCase())
//                 }
//               })
//             }
//           } catch (e) {
//             console.error('Failed to parse color_hex_values:', e)
//           }
//         }
//       }
      
//       return colors.some(selectedColor => 
//         productColors.has(selectedColor.toLowerCase())
//       )
//     })
    
//     count = products.length
//   }

//   // If there are no products after filtering, return a message
//   if (products.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center w-full py-12">
//         <h2 className="text-2xl font-medium text-gray-900">No products found</h2>
//         <p className="mt-2 text-base text-gray-500">
//           Try adjusting your filters to find what you're looking for.
//         </p>
//       </div>
//     )
//   }

//   // Step 5: Implement pagination on the filtered results
//   const totalPages = Math.ceil(count / PRODUCT_LIMIT)

//   return (
//     <>
//       <ul
//         className="grid w-full grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
//         data-testid="products-list"
//       >
//         {products.map((p) => {
//           return (
//             <li key={p.id}>
//               <ProductPreview product={p} region={region} />
//             </li>
//           )
//         })}
//       </ul>
//       {totalPages > 1 && (
//         <Pagination
//           data-testid="product-pagination"
//           page={page}
//           totalPages={totalPages}
//         />
//       )}
//     </>
//   )
// }

// import { listProductsWithSort } from "@lib/data/products"
// import { getRegion } from "@lib/data/regions"
// import ProductPreview from "@modules/products/components/product-preview"
// import { Pagination } from "@modules/store/components/pagination"
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

// const PRODUCT_LIMIT = 12

// type PaginatedProductsParams = {
//   limit: number
//   collection_id?: string[]
//   category_id?: string[]
//   id?: string[]
//   order?: string
//   tags?: string[]
//   price_min?: number
//   price_max?: number
// }

// export default async function PaginatedProducts({
//   sortBy,
//   page,
//   collectionId,
//   categoryId,
//   categoryHandle,
//   productsIds,
//   countryCode,
//   vendors,
//   colors,
//   minPrice,
//   maxPrice,
//   categoryProducts = []
// }: {
//   sortBy?: SortOptions
//   page: number
//   collectionId?: string
//   categoryId?: string
//   categoryHandle?: string
//   productsIds?: string[]
//   countryCode: string
//   vendors?: string[]
//   colors?: string[]
//   minPrice?: number
//   maxPrice?: number
//   categoryProducts?: any[]
// }) {
//   const region = await getRegion(countryCode)

//   if (!region) {
//     return null
//   }

//   let products = []
//   let count = 0

//   // Step 1: Get products through API or use provided products
//   const queryParams: PaginatedProductsParams = {
//     limit: PRODUCT_LIMIT,
//   }

//   if (collectionId) {
//     queryParams["collection_id"] = [collectionId]
//   }

//   if (categoryId) {
//     queryParams["category_id"] = [categoryId]
//   }

//   if (productsIds) {
//     queryParams["id"] = productsIds
//   }

//   if (minPrice !== undefined) {
//     queryParams["price_min"] = minPrice
//   }

//   if (maxPrice !== undefined) {
//     queryParams["price_max"] = maxPrice
//   }

//   if (sortBy === "created_at") {
//     queryParams["order"] = "created_at"
//   }

//   // If we have category products already, use those; otherwise fetch
//   if (categoryProducts && categoryProducts.length > 0) {
//     products = [...categoryProducts]
//     count = categoryProducts.length
//   } else {
//     let {
//       response: { products: fetchedProducts, count: fetchedCount },
//     } = await listProductsWithSort({
//       page,
//       queryParams,
//       sortBy,
//       countryCode,
//     })

//     products = fetchedProducts
//     count = fetchedCount
//   }

//   // Step 2: Apply vendor filter if specified
//   if (vendors && vendors.length > 0 && products.length > 0) {
//     products = products.filter(product => {
//       // Check if product has vendor
//       if (!product.vendor) {
//         return false
//       }
      
//       // Check if the vendor's handle matches any of the selected vendor handles
//       return vendors.includes(product.vendor.handle)
//     })
    
//     count = products.length
//   }

//   // Step 3: Apply category filter if specified
//   if (categoryHandle && products.length > 0) {
//     products = products.filter(product => {
//       if (!product.categories || product.categories.length === 0) {
//         return false
//       }

//       const hasMatchingCategory = product.categories.some(cat => {
//         if (cat.handle === categoryHandle) {
//           return true
//         }
        
//         if (cat.mpath && cat.mpath.includes(categoryHandle)) {
//           return true
//         }
        
//         return false
//       })

//       return hasMatchingCategory
//     })
    
//     count = products.length
//   }

//   // Step 4: Apply color filter if specified
//   if (colors && colors.length > 0 && products.length > 0) {
//     products = products.filter(product => {
//       const productColors = new Set<string>()
      
//       if (product.metadata) {
//         if (product.metadata.color_hex_values) {
//           try {
//             const parsedColors = JSON.parse(product.metadata.color_hex_values)
//             if (Array.isArray(parsedColors)) {
//               parsedColors.forEach(color => {
//                 if (color.name) {
//                   productColors.add(color.name.toLowerCase())
//                 }
//               })
//             }
//           } catch (e) {
//             console.error('Failed to parse color_hex_values:', e)
//           }
//         }
//       }
      
//       return colors.some(selectedColor => 
//         productColors.has(selectedColor.toLowerCase())
//       )
//     })
    
//     count = products.length
//   }

//   // If there are no products after filtering, return a message
//   if (products.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center w-full py-16">
//         <div className="mb-4">
//           <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-300">
//             <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 16M17 16H6M17 16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16C15 15.4477 15.4477 15 16 15C16.5523 15 17 15.4477 17 16ZM7 16C7 16.5523 6.55228 17 6 17C5.44772 17 5 16.5523 5 16C5 15.4477 5.44772 15 6 15C6.55228 15 7 15.4477 7 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//           </svg>
//         </div>
//         <h2 className="text-2xl font-medium text-gray-900 mb-2">No Products Found</h2>
//         <p className="text-gray-500 text-center max-w-md">
//           We couldn't find any products matching your selected filters. Try adjusting your filter criteria or browse our other collections.
//         </p>
//       </div>
//     )
//   }

//   // Step 5: Implement pagination on the filtered results
//   const totalPages = Math.ceil(count / PRODUCT_LIMIT)

//   return (
//     <>
//       {/* Product count and sort/filter info bar */}
//       <div className="flex flex-wrap justify-between items-center mb-6 pb-3 border-b border-gray-200">
//         <div className="text-gray-600 mb-4 md:mb-0">
//           <span className="font-medium">{count}</span> Products Found
//         </div>
        
//         {/* Filter Summary - showing applied filters */}
//         {(vendors?.length > 0 || colors?.length > 0 || minPrice || maxPrice !== PRICE_MAX) && (
//           <div className="text-sm text-gray-500">
//             Filters Applied: 
//             {vendors?.length > 0 && <span className="ml-1 text-gray-700">Brands ({vendors.length})</span>}
//             {colors?.length > 0 && <span className="ml-1 text-gray-700">• Colors ({colors.length})</span>}
//             {(minPrice > 0 || maxPrice < PRICE_MAX) && <span className="ml-1 text-gray-700">• Price</span>}
//           </div>
//         )}
//       </div>
      
//       {/* Product Grid - Myntra Style */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
//         data-testid="products-list">
//         {products.slice(0, PRODUCT_LIMIT).map((product) => (
//           <div key={product.id} className="transition duration-200">
//             <ProductPreview product={product} region={region} />
//           </div>
//         ))}
//       </div>
      
//       {/* Pagination */}
//       {totalPages > 1 && (
//         <Pagination
//           data-testid="product-pagination"
//           page={page}
//           totalPages={totalPages}
//         />
//       )}
//     </>
//   )
// }

// import { listProductsWithSort } from "@lib/data/products"
// import { getRegion } from "@lib/data/regions"
// import ProductPreview from "@modules/products/components/product-preview"
// import { Pagination } from "@modules/store/components/pagination"
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

// // Constants for price filtering
// const PRODUCT_LIMIT = 12
// const PRICE_MIN = 0
// const PRICE_MAX = 1000 // Define the constant here

// export default async function PaginatedProducts({
//   sortBy,
//   page,
//   collectionId,
//   categoryId,
//   categoryHandle,
//   productsIds,
//   countryCode,
//   vendors,
//   colors,
//   minPrice,
//   maxPrice,
//   categoryProducts = []
// }) {
//   const region = await getRegion(countryCode)

//   if (!region) {
//     return null
//   }

//   let products = []
//   let count = 0

//   // Step 1: Get products through API or use provided products
//   const queryParams = {
//     limit: PRODUCT_LIMIT,
//   }

//   if (collectionId) {
//     queryParams["collection_id"] = [collectionId]
//   }

//   if (categoryId) {
//     queryParams["category_id"] = [categoryId]
//   }

//   if (productsIds) {
//     queryParams["id"] = productsIds
//   }

//   if (minPrice !== undefined) {
//     queryParams["price_min"] = minPrice
//   }

//   if (maxPrice !== undefined) {
//     queryParams["price_max"] = maxPrice
//   }

//   if (sortBy === "created_at") {
//     queryParams["order"] = "created_at"
//   }

//   // If we have category products already, use those; otherwise fetch
//   if (categoryProducts && categoryProducts.length > 0) {
//     products = [...categoryProducts]
//     count = categoryProducts.length
//   } else {
//     let {
//       response: { products: fetchedProducts, count: fetchedCount },
//     } = await listProductsWithSort({
//       page,
//       queryParams,
//       sortBy,
//       countryCode,
//     })

//     products = fetchedProducts
//     count = fetchedCount
//   }

//   // Apply filters (vendor, category, color)
//   if (vendors && vendors.length > 0 && products.length > 0) {
//     products = products.filter(product => 
//       product.vendor && vendors.includes(product.vendor.handle)
//     )
//     count = products.length
//   }

//   if (categoryHandle && products.length > 0) {
//     products = products.filter(product => {
//       if (!product.categories || product.categories.length === 0) {
//         return false
//       }
//       return product.categories.some(cat => 
//         cat.handle === categoryHandle || (cat.mpath && cat.mpath.includes(categoryHandle))
//       )
//     })
//     count = products.length
//   }

//   if (colors && colors.length > 0 && products.length > 0) {
//     products = products.filter(product => {
//       const productColors = new Set()
      
//       if (product.metadata && product.metadata.color_hex_values) {
//         try {
//           const parsedColors = JSON.parse(product.metadata.color_hex_values)
//           if (Array.isArray(parsedColors)) {
//             parsedColors.forEach(color => {
//               if (color.name) {
//                 productColors.add(color.name.toLowerCase())
//               }
//             })
//           }
//         } catch (e) {
//           console.error('Failed to parse color_hex_values:', e)
//         }
//       }
      
//       return colors.some(selectedColor => 
//         productColors.has(selectedColor.toLowerCase())
//       )
//     })
//     count = products.length
//   }

//   // If there are no products after filtering, return a message
//   if (products.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center w-full py-16">
//         <div className="mb-4">
//           <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-300">
//             <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 16M17 16H6M17 16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16C15 15.4477 15.4477 15 16 15C16.5523 15 17 15.4477 17 16ZM7 16C7 16.5523 6.55228 17 6 17C5.44772 17 5 16.5523 5 16C5 15.4477 5.44772 15 6 15C6.55228 15 7 15.4477 7 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//           </svg>
//         </div>
//         <h2 className="text-2xl font-medium text-gray-900 mb-2">No Products Found</h2>
//         <p className="text-gray-500 text-center max-w-md">
//           We couldn't find any products matching your selected filters. Try adjusting your filter criteria or browse our other collections.
//         </p>
//       </div>
//     )
//   }

//   // Implement pagination on the filtered results
//   const totalPages = Math.ceil(count / PRODUCT_LIMIT)

//   return (
//     <>
//       {/* Product count and sort/filter info bar */}
//       <div className="flex flex-wrap justify-between items-center mb-6 pb-3 border-b border-gray-200">
//         <div className="text-gray-600 mb-4 md:mb-0">
//           <span className="font-medium">{count}</span> Products Found
//         </div>
        
//         {/* Filter Summary - showing applied filters */}
//         {(vendors?.length > 0 || colors?.length > 0 || minPrice > 0 || (maxPrice !== undefined && maxPrice < PRICE_MAX)) && (
//           <div className="text-sm text-gray-500">
//             Filters Applied: 
//             {vendors?.length > 0 && <span className="ml-1 text-gray-700">Brands ({vendors.length})</span>}
//             {colors?.length > 0 && <span className="ml-1 text-gray-700">• Colors ({colors.length})</span>}
//             {(minPrice > 0 || (maxPrice !== undefined && maxPrice < PRICE_MAX)) && <span className="ml-1 text-gray-700">• Price</span>}
//           </div>
//         )}
//       </div>
      
//       {/* Product Grid - Myntra Style */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
//         data-testid="products-list">
//         {products.slice(0, PRODUCT_LIMIT).map((product) => (
//           <div key={product.id} className="transition duration-200">
//             <ProductPreview product={product} region={region} />
//           </div>
//         ))}
//       </div>
      
//       {/* Pagination */}
//       {totalPages > 1 && (
//         <Pagination
//           data-testid="product-pagination"
//           page={page}
//           totalPages={totalPages}
//         />
//       )}
//     </>
//   )
// }

import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12
const PRICE_MIN = 0
const PRICE_MAX = 1000

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  categoryHandle,
  productsIds,
  countryCode,
  vendors,
  colors,
  minPrice,
  maxPrice,
  categoryProducts = []
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let products = []
  let count = 0

  const queryParams = {
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

  if (categoryProducts && categoryProducts.length > 0) {
    products = [...categoryProducts]
    count = categoryProducts.length
  } else {
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

  if (vendors && vendors.length > 0 && products.length > 0) {
    products = products.filter(product => 
      product.vendor && vendors.includes(product.vendor.handle)
    )
    count = products.length
  }

  if (categoryHandle && products.length > 0) {
    products = products.filter(product => {
      if (!product.categories || product.categories.length === 0) {
        return false
      }
      return product.categories.some(cat => 
        cat.handle === categoryHandle || (cat.mpath && cat.mpath.includes(categoryHandle))
      )
    })
    count = products.length
  }

  if (colors && colors.length > 0 && products.length > 0) {
    products = products.filter(product => {
      const productColors = new Set()
      
      if (product.metadata && product.metadata.color_hex_values) {
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
          console.error('Failed to parse color_hex_values:', e)
        }
      }
      
      return colors.some(selectedColor => 
        productColors.has(selectedColor.toLowerCase())
      )
    })
    count = products.length
  }

  if (products.length === 0) {
    return (
      <div className="w-full">
        <div className="flex flex-wrap justify-between items-center mb-6 pb-3 border-b border-gray-200">
          <div className="text-gray-600 mb-4 md:mb-0">
            <span className="font-medium">0</span> Products Found
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center w-full py-16 px-4 bg-white rounded-md shadow-sm">
          <div className="mb-4 text-gray-300">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 16M17 16H6M17 16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16C15 15.4477 15.4477 15 16 15C16.5523 15 17 15.4477 17 16ZM7 16C7 16.5523 6.55228 17 6 17C5.44772 17 5 16.5523 5 16C5 15.4477 5.44772 15 6 15C6.55228 15 7 15.4477 7 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-medium text-gray-900 mb-2 text-center">No Products Found</h2>
          <p className="text-gray-500 text-center max-w-md">
            We couldn't find any products matching your selected filters. Try adjusting your filter criteria or browse our other collections.
          </p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-between items-center mb-6 pb-3 border-b border-gray-200">
        <div className="text-gray-600 mb-4 md:mb-0">
          <span className="font-medium">{count}</span> Products Found
        </div>
        
        {(vendors?.length > 0 || colors?.length > 0 || minPrice > 0 || (maxPrice !== undefined && maxPrice < PRICE_MAX)) && (
          <div className="text-sm text-gray-500">
            Filters Applied: 
            {vendors?.length > 0 && <span className="ml-1 text-gray-700">Brands ({vendors.length})</span>}
            {colors?.length > 0 && <span className="ml-1 text-gray-700">• Colors ({colors.length})</span>}
            {(minPrice > 0 || (maxPrice !== undefined && maxPrice < PRICE_MAX)) && <span className="ml-1 text-gray-700">• Price</span>}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        data-testid="products-list">
        {products.slice(0, PRODUCT_LIMIT).map((product) => (
          <div key={product.id} className="h-full">
            <ProductPreview product={product} region={region} />
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            data-testid="product-pagination"
            page={page}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  )
}