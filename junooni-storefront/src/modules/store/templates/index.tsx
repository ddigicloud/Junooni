import React, { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import FilterHandlersWrapper from "@modules/store/components/filter-handlers-wrapper"
import { listCategories } from "@lib/data/categories"
import { retriveVendors } from "@lib/data/vendors"
import { getRegion } from "@lib/data/regions"
import { redirect } from "next/navigation"
import SortWrapper from "@modules/store/components/refinement-list/sort-wrapper"

const PRODUCT_LIMIT = 12

// ✅ Helper function for building filter URLs
function buildFilterUrl(params: {
  page?: number
  vendors?: string[]
  colors?: string[]
  collections?: string[]
  categories?: string[]
  minPrice?: number
  maxPrice?: number
  sortBy?: string
}): string {
  const urlParams = new URLSearchParams()
  
  if (params.page) urlParams.set('page', params.page.toString())
  if (params.vendors?.length) urlParams.set('vendors', params.vendors.join(','))
  if (params.colors?.length) urlParams.set('colors', params.colors.join(','))
  if (params.collections?.length) urlParams.set('collections', params.collections.join(','))
  if (params.categories?.length) urlParams.set('categories', params.categories.join(','))
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    urlParams.set('price', `${params.minPrice || 0}-${params.maxPrice || 1000}`)
  }
  if (params.sortBy && params.sortBy !== 'created_at') urlParams.set('sortBy', params.sortBy)
  
  return `/store?${urlParams.toString()}`
}

// ✅ Color name normalizer function (consistent with ProductPreview)
const normalizeColorName = (colorName: string): string => {
  return colorName
    .trim()
    // Add space before capital letters (camelCase to spaced)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Handle common patterns
    .replace(/([a-z])(\d)/g, '$1 $2') // Add space before numbers
    .replace(/(\d)([a-z])/gi, '$1 $2') // Add space after numbers
    // Handle concatenated color words
    .replace(/([a-z])(pink|blue|red|green|yellow|purple|orange|black|white|gray|grey|brown)/gi, '$1 $2')
    .replace(/(light|dark|bright|deep|pale|neon|hot|cool|warm)([a-z])/gi, '$1 $2')
    // Normalize multiple spaces to single space
    .replace(/\s+/g, ' ')
    // Proper case each word
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function StoreTemplate({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  vendors,
  colors,
  collections,
  categories,
  minPrice,
  maxPrice,
}: {
  sortBy?: SortOptions
  page?: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  vendors?: string[]
  colors?: string[]
  collections?: string[]
  categories?: string[]
  minPrice?: number
  maxPrice?: number
}) {
  const pageNumber = page || 1
  const sort = sortBy || "created_at"

  //console.log('🏪 StoreTemplate - CLIENT-SIDE FILTERING WITH COLOR-BASED IMAGE SELECTION')
  //console.log('- Page:', pageNumber)
  //console.log('- Sort:', sort)
  //console.log('- Country:', countryCode)
  //console.log('- Selected colors for IMAGE SELECTION:', colors) // ✅ Emphasize image selection

  // ✅ Get region first
  const region = await getRegion(countryCode)
  if (!region) {
    return null
  }

  //console.log('- Region:', region.id, region.currency_code)

  // ✅ DETERMINE FILTER STATUS
  const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined
  const hasClientSideFilters = vendors?.length || colors?.length || collections?.length || categories?.length
  const hasAnyFilters = hasClientSideFilters || hasPriceFilter
  const hasColorFilter = colors?.length > 0

  //console.log('\n🎯 CLIENT-SIDE FILTER ANALYSIS:')
  //console.log('- Has price filter:', hasPriceFilter, hasPriceFilter ? `(${minPrice || 0}€ - ${maxPrice || '∞'}€)` : '')
  //console.log('- Has vendor filter:', vendors?.length ? vendors : 'none')
  //console.log('- Has category filter:', categories?.length ? categories : 'none')
  //console.log('- Has color filter:', colors?.length ? colors : 'none')
  //console.log('- Has collection filter:', collections?.length ? collections : 'none')
  //console.log('- Has ANY filters:', hasAnyFilters)
  //console.log('- COLOR-BASED IMAGE SELECTION:', hasColorFilter ? 'ENABLED' : 'DISABLED') // ✅ New log
  //console.log('- Current page requested:', pageNumber)

  // ✅ MINIMAL SERVER-SIDE QUERY (NO FILTERING - just fetch everything)
  const queryParams: any = {}

  // ✅ ONLY essential server-side filters that can't be done client-side
  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  // ✅ REMOVED: All client-side filterable params
  // NO server-side filtering for: colors, vendors, categories, collections
  // These will ALL be filtered CLIENT-SIDE ONLY

  let products = []
  let count = 0
  let totalPages = 1
  let allProducts = [] // ✅ Store all products for client-side filtering

  try {
    // Import the function here to avoid any expand issues
    const { listProductsWithSort } = await import("@lib/data/products")
    
    // ✅ FETCH ALL PRODUCTS (no server-side filtering)
    //console.log('🔄 Fetching ALL products (no server-side filtering)...')
    const allProductsQuery = { ...queryParams, limit: 1000 }
    
    const {
      response: { products: fetchedProducts },
    } = await listProductsWithSort({
      page: 1,
      queryParams: allProductsQuery,
      sortBy: sort,
      countryCode,
    })
    
    allProducts = fetchedProducts
    //console.log('📦 Fetched', allProducts.length, 'total products for CLIENT-SIDE filtering')
    
    // ✅ CLIENT-SIDE FILTERING (with special consideration for color-based image selection)
    if (hasAnyFilters) {
      //console.log('\n🔄 APPLYING CLIENT-SIDE FILTERS...')
      
      // Start with all products
      let filteredProducts = [...allProducts]

      // ✅ Apply collection filter (CLIENT-SIDE)
      if (collections?.length && filteredProducts.length > 0) {
        //console.log('📦 Applying CLIENT-SIDE collection filter:', collections)
        
        const beforeCount = filteredProducts.length
        filteredProducts = filteredProducts.filter(product => {
          if (!product.collection) {
            return false
          }
          
          const hasMatchingCollection = collections.includes(product.collection.handle)
          
          if (hasMatchingCollection) {
            //console.log(`✅ Product "${product.title}" matches collection "${product.collection.handle}"`)
          }
          
          return hasMatchingCollection
        })
        
        //console.log(`- Products after collection filtering: ${beforeCount} → ${filteredProducts.length}`)
      }

      // ✅ Apply category filter (CLIENT-SIDE)
      if (categories?.length && filteredProducts.length > 0) {
        //console.log('🏷️ Applying CLIENT-SIDE category filter:', categories)
        
        const beforeCount = filteredProducts.length
        filteredProducts = filteredProducts.filter(product => {
          if (!product.categories || product.categories.length === 0) {
            return false
          }
          
          const hasMatchingCategory = product.categories.some(category => 
            categories.includes(category.handle)
          )
          
          if (hasMatchingCategory) {
            //console.log(`✅ Product "${product.title}" matches category filter`)
          }
          
          return hasMatchingCategory
        })
        
        //console.log(`- Products after category filtering: ${beforeCount} → ${filteredProducts.length}`)
      }

      // ✅ Apply vendor filter (CLIENT-SIDE)
      if (vendors?.length && filteredProducts.length > 0) {
        //console.log('🏪 Applying CLIENT-SIDE vendor filter:', vendors)
        
        // Get vendor data for name-to-handle conversion
        const vendorsData = await retriveVendors()
        
        // Convert vendor names to handles
        const vendorHandles = vendorsData
          .filter(vendor => vendors.includes(vendor.name))
          .map(vendor => vendor.handle)
        
        // console.log('🏷️ Converted vendor names to handles:', {
        //   names: vendors,
        //   handles: vendorHandles
        // })
        
        // Filter products by vendor handle
        const beforeCount = filteredProducts.length
        filteredProducts = filteredProducts.filter(product => {
          if (!product.vendor) {
            return false
          }
          
          const hasMatchingVendor = vendorHandles.includes(product.vendor.handle)
          
          if (hasMatchingVendor) {
            //console.log(`✅ Product "${product.title}" matches vendor "${product.vendor.handle}"`)
          }
          
          return hasMatchingVendor
        })
        
        //console.log(`- Products after vendor filtering: ${beforeCount} → ${filteredProducts.length}`)
      }

      // ✅ Apply color filter (CLIENT-SIDE) - ENHANCED for image selection
      if (colors?.length && filteredProducts.length > 0) {
        //console.log('\n🎨 Applying CLIENT-SIDE color filter with IMAGE SELECTION consideration:', colors)
        //console.log('🖼️ NOTE: Products will show images in the selected color variants when available')
        
        const beforeCount = filteredProducts.length
        const colorDebug = []
        
        // ✅ ENHANCED: More comprehensive color filtering that considers both product and variant levels
        filteredProducts = filteredProducts.filter(product => {
          const productColors = new Set<string>()
          
          // ✅ Extract colors from product metadata
          if (product.metadata && product.metadata.color_hex_values) {
            let colorsData = product.metadata.color_hex_values
            
            // ✅ Handle both string and array formats
            if (typeof colorsData === 'string') {
              try {
                colorsData = JSON.parse(colorsData)
              } catch (e) {
                //console.error(`❌ JSON parse failed for "${product.title}":`, e.message)
                colorDebug.push(`❌ ${product.title}: Parse error`)
                return false
              }
            }
            
            if (Array.isArray(colorsData)) {
              colorsData.forEach(color => {
                if (color?.name) {
                  // ✅ Normalize product color names for comparison
                  const normalizedProductColor = normalizeColorName(color.name)
                  productColors.add(normalizedProductColor.toLowerCase().trim())
                }
              })
            }
          }
          
          // ✅ ALSO extract colors from variant metadata for comprehensive matching
          if (product.variants && product.variants.length > 0) {
            product.variants.forEach(variant => {
              if (variant.metadata) {
                // Check variant color metadata
                if (variant.metadata.color) {
                  const normalizedVariantColor = normalizeColorName(variant.metadata.color)
                  productColors.add(normalizedVariantColor.toLowerCase().trim())
                }
                
                if (variant.metadata.color_hex_values) {
                  let variantColorsData = variant.metadata.color_hex_values
                  if (typeof variantColorsData === 'string') {
                    try {
                      variantColorsData = JSON.parse(variantColorsData)
                    } catch (e) {
                      // Skip if can't parse
                    }
                  }
                  if (Array.isArray(variantColorsData)) {
                    variantColorsData.forEach(color => {
                      if (color?.name) {
                        const normalizedVariantColor = normalizeColorName(color.name)
                        productColors.add(normalizedVariantColor.toLowerCase().trim())
                      }
                    })
                  }
                }
              }
            })
          }
          
          if (productColors.size === 0) {
            colorDebug.push(`⚪ ${product.title}: No color data`)
            return false
          }
          
          // ✅ Normalize selected colors for comparison
          const normalizedSelectedColors = colors.map(c => 
            normalizeColorName(c).toLowerCase().trim()
          )
          
          const matches = normalizedSelectedColors.some(selectedColor => 
            productColors.has(selectedColor)
          )
          
          if (matches) {
            const matchedColors = normalizedSelectedColors.filter(selected => 
              productColors.has(selected)
            )
            colorDebug.push(`✅ ${product.title}: Matches [${matchedColors.join(', ')}] - Will show variant image`)
          } else {
            colorDebug.push(`❌ ${product.title}: Has [${Array.from(productColors).join(', ')}] but need [${normalizedSelectedColors.join(', ')}]`)
          }
          
          return matches
        })
        
        //console.log(`🎨 CLIENT-SIDE color filtering: ${beforeCount} → ${filteredProducts.length}`)
        //console.log(`🖼️ ${filteredProducts.length} products will display images in [${colors.join(', ')}] variants`)
        
        // Show detailed results for debugging
        // console.log('\n📋 COLOR FILTER + IMAGE SELECTION RESULTS:')
        // colorDebug.slice(0, 10).forEach(debug => console.log(`  ${debug}`))
        // if (colorDebug.length > 10) {
        //   console.log(`  ... and ${colorDebug.length - 10} more`)
        // }
      }
      
      // ✅ Apply price filter (CLIENT-SIDE)
      if (hasPriceFilter && filteredProducts.length > 0) {
        //console.log('💰 Applying CLIENT-SIDE price filter:', { minPrice, maxPrice })
        
        const beforeCount = filteredProducts.length
        filteredProducts = filteredProducts.filter(product => {
          const price = product.variants?.[0]?.calculated_price?.calculated_amount
          if (!price) return false
          
          const inRange = (minPrice === undefined || price >= minPrice) && 
                         (maxPrice === undefined || price <= maxPrice)
          
          return inRange
        })
        
        //console.log(`- Products after price filtering: ${beforeCount} → ${filteredProducts.length}`)
      }
      
      // ✅ CLIENT-SIDE PAGINATION
      if (filteredProducts.length > 0) {
        // Calculate total count and pages for filtered products
        count = filteredProducts.length
        totalPages = Math.ceil(count / PRODUCT_LIMIT)
        
        //console.log(`\n📊 CLIENT-SIDE PAGINATION:`)
        //console.log(`- Total filtered products: ${count}`)
        //console.log(`- Products per page: ${PRODUCT_LIMIT}`)
        //console.log(`- Total pages: ${totalPages}`)
        //console.log(`- Current page requested: ${pageNumber}`)
        
        // ✅ Handle page overflow with redirect
        if (pageNumber > totalPages && totalPages > 0) {
          //console.log(`🔄 Redirecting from page ${pageNumber} to page 1`)
          
          const redirectUrl = buildFilterUrl({
            page: 1,
            vendors,
            colors,
            collections,
            categories,
            minPrice,
            maxPrice,
            sortBy: sort
          })
          
          //console.log(`🔄 Redirecting to: ${redirectUrl}`)
          redirect(redirectUrl)
        }
        
        const effectivePageNumber = Math.min(pageNumber, totalPages)
        const startIndex = (effectivePageNumber - 1) * PRODUCT_LIMIT
        const endIndex = startIndex + PRODUCT_LIMIT
        
        // ✅ Get products for current page
        products = filteredProducts.slice(startIndex, endIndex)
        
        //console.log(`✅ CLIENT-SIDE PAGINATION: Showing products ${startIndex + 1}-${Math.min(endIndex, count)} of ${count}`)
        //console.log(`✅ Page ${effectivePageNumber} of ${totalPages} (${products.length} products on this page)`)
        
        // ✅ NEW: Log color-based image selection status
        if (hasColorFilter) {
          //console.log(`🖼️ COLOR-BASED IMAGE SELECTION: All ${products.length} products will attempt to show [${colors.join(', ')}] variant images`)
        }
        
      } else {
        products = []
        count = 0
        totalPages = 1
        //console.log('❌ No products match CLIENT-SIDE filters')
      }
      
    } else {
      // ✅ No filters: Use server-side pagination on all products
      //console.log('✅ NO FILTERS - Using server-side pagination on all products')
      
      const paginatedQuery = { ...queryParams, limit: PRODUCT_LIMIT }
      
      const {
        response: { products: paginatedProducts, count: totalCount },
      } = await listProductsWithSort({
        page: pageNumber,
        queryParams: paginatedQuery,
        sortBy: sort,
        countryCode,
      })
      
      products = paginatedProducts
      count = totalCount
      totalPages = Math.ceil(count / PRODUCT_LIMIT)
      
      //console.log('✅ Server-side pagination results:')
      //console.log('- Products fetched:', products.length)
      //console.log('- Total count:', count)
      //console.log('- Total pages:', totalPages)
    }
    
    //console.log('\n🔍 FINAL CLIENT-SIDE RESULTS:')
    //console.log('- Products displayed on current page:', products.length)
    //console.log('- Total count (after CLIENT-SIDE filtering):', count)
    //console.log('- Total pages:', totalPages)
    //console.log('- Current page:', pageNumber)
    //console.log('- Color-based image selection:', hasColorFilter ? `ACTIVE for [${colors.join(', ')}]` : 'INACTIVE')
    
  } catch (error) {
    //console.error('❌ Error fetching products:', error.message)
    products = []
    allProducts = []
    count = 0
    totalPages = 1
  }

  // ✅ Extract unique colors from ALL products (for filter options) - ENHANCED with variant colors
  //console.log('\n🎨 Extracting available colors from ALL products (including variants)...')
  const uniqueColors = new Map()
  
  if (allProducts && allProducts.length > 0) {
    allProducts.forEach((product, index) => {
      // Extract colors from product metadata
      if (product.metadata && product.metadata.color_hex_values) {
        let colorsData = product.metadata.color_hex_values
        
        // ✅ Handle both string and array formats
        if (typeof colorsData === 'string') {
          try {
            colorsData = JSON.parse(colorsData)
          } catch (e) {
            //console.error(`Color parse error for "${product.title}":`, e.message)
            return
          }
        }
        
        if (Array.isArray(colorsData)) {
          colorsData.forEach((color) => {
            if (color.name && color.hex) {
              let cleanHex = color.hex.trim()
              if (!cleanHex.startsWith('#')) {
                cleanHex = '#' + cleanHex
              }
              
              if (/^#[0-9A-F]{6}$/i.test(cleanHex)) {
                // ✅ Normalize color name before storing
                const normalizedName = normalizeColorName(color.name)
                const colorKey = normalizedName.toLowerCase()
                
                uniqueColors.set(colorKey, {
                  name: normalizedName, // ✅ Store normalized name: "Light Pink"
                  hex: cleanHex
                })
                
                // Debug first few colors
                if (index < 5) {
                  //console.log(`🎨 Color extracted: "${color.name}" → "${normalizedName}"`)
                }
              }
            }
          })
        }
      }
      
      // ✅ ALSO extract colors from variant metadata
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach(variant => {
          if (variant.metadata) {
            if (variant.metadata.color && variant.metadata.color_hex) {
              let cleanHex = variant.metadata.color_hex.trim()
              if (!cleanHex.startsWith('#')) {
                cleanHex = '#' + cleanHex
              }
              
              if (/^#[0-9A-F]{6}$/i.test(cleanHex)) {
                const normalizedName = normalizeColorName(variant.metadata.color)
                const colorKey = normalizedName.toLowerCase()
                
                uniqueColors.set(colorKey, {
                  name: normalizedName,
                  hex: cleanHex
                })
              }
            }
          }
        })
      }
    })
  }
  
  const availableColors = Array.from(uniqueColors.values())
  //console.log('🎨 Extracted', availableColors.length, 'unique colors for filter options')

  // ✅ DEBUG: Show first few normalized colors
  //console.log('🎨 Sample normalized colors available for image selection:')
  availableColors.slice(0, 5).forEach(color => {
    //console.log(`  - "${color.name}" (${color.hex})`)
  })

  // ✅ Get sidebar data for filters
  const [categoriesData, vendorsData] = await Promise.all([
    listCategories(),
    retriveVendors()
  ])

  //console.log('\n📊 Filter data loaded:')
  //console.log('- Categories:', categoriesData.length)
  //console.log('- Vendors:', vendorsData.length)
  //console.log('- Colors:', availableColors.length)

  return (
    <div className="flex flex-col py-6 small:flex-row small:items-start content-container">
      <RefinementList 
        sortBy={sort}
        search={true}
        vendors={vendorsData}
        categories={categoriesData}
        products={allProducts} // ✅ Pass ALL products for any other data extraction
        availableColors={availableColors} // ✅ Pass extracted colors
      />
      <div className="w-full ml-0 md:ml-4">
        <div className="mt-12 mb-0 text-2xl-semi">
          <h1 data-testid="store-page-title mt-8">
            All products
          </h1>
          {/* ✅ ENHANCED: Professional messaging with color-based image selection info */}
          {hasAnyFilters && (
            <div className="mt-2 text-sm text-gray-600">
              {count > 0 ? (   
                <div className="flex flex-col gap-1">
                  <span>Found {count} product{count !== 1 ? 's' : ''}</span>
                  {/* ✅ NEW: Color-based image selection indicator */}
                  {/* {hasColorFilter && (
                    <span className="text-[#e65100] font-medium">
                      🎨 Images showing {colors.join(', ')} variant{colors.length > 1 ? 's' : ''} when available
                    </span>
                  )} */}
                  {totalPages > 1 && (
                    <span>Showing page {Math.min(pageNumber, totalPages)} of {totalPages} • {products.length} products on this page</span>
                  )}
                </div>  
              ) : (
                <div className="flex flex-col gap-1">
                  <span>No products match your filters • <a href="/store" className="text-[#e65100] underline">Clear filters</a></span>
                  {hasColorFilter && (
                    <span className="text-xs text-orange-600">
                      Try selecting different colors or clearing the color filter
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-start mt-4 mb-6 md:justify-end">
          <SortWrapper 
            sortBy={sort} 
            data-testid="sort-above-grid" 
          />
        </div>
        
        <Suspense fallback={<SkeletonProductGrid />}>
          <FilterHandlersWrapper
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            vendors={vendors || []}
            colors={colors || []} // ✅ Pass colors for filtering
            collections={collections || []}
            categories={categories || []}
            minPrice={minPrice}
            maxPrice={maxPrice}
            products={products}
            totalCount={count}
            totalPages={totalPages}
            region={region}
            vendorsData={vendorsData}
            collectionsData={[]}
            categoriesData={categoriesData}
            availableColors={availableColors}
            selectedColors={colors || []} // ✅ CRITICAL: Pass selected colors for ProductPreview image selection
          />
        </Suspense>
      </div>
    </div>
  )
}