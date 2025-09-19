import React, { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import FilterHandlersWrapper from "@modules/store/components/filter-handlers-wrapper"
import { listCategories } from "@lib/data/categories"
import { retriveVendors } from "@lib/data/vendors"
import { getRegion } from "@lib/data/regions"
import { redirect } from "next/navigation"
import MobileStoreWrapper from "@modules/store/components/mobile-store-wrapper"
import SortWrapper from "@modules/store/components/refinement-list/sort-wrapper"

const PRODUCT_LIMIT = 12

// Helper function for building filter URLs
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

// Color name normalizer function (consistent with ProductPreview)
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

// Dynamic price range calculation function
const calculatePriceRange = (products: any[]): { minPrice: number, maxPrice: number } => {
  //console.log(`📊 Calculating price range from ${products.length} products...`)
  
  if (!products || products.length === 0) {
    //console.log('⚠️ No products provided, using default range')
    return { minPrice: 0, maxPrice: 1000 }
  }

  const prices: number[] = []
  
  products.forEach(product => {
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        // Try calculated_price first (includes discounts, taxes, etc.)
        let price = variant.calculated_price?.calculated_amount
        
        if (!price && variant.prices && variant.prices.length > 0) {
          // Fallback to raw price amount (convert from cents to currency units)
          price = parseFloat(variant.prices[0].amount || '0') / 100
        }
        
        if (price && typeof price === 'number' && price > 0) {
          prices.push(Math.round(price)) // Round to avoid decimal issues
        }
      })
    }
  })

  if (prices.length === 0) {
    //console.log('⚠️ No valid prices found, using default range')
    return { minPrice: 0, maxPrice: 1000 }
  }

  //console.log(`📊 All prices found: [${prices.slice(0, 5).join(', ')}${prices.length > 5 ? '...' : ''}]`)
  
  const minPrice = Math.floor(Math.min(...prices))
  const maxPrice = Math.ceil(Math.max(...prices))
  
  //console.log(`📊 Calculated price range: ₹${minPrice} - ₹${maxPrice}`)
  
  return { minPrice, maxPrice }
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

  // Get region first
  const region = await getRegion(countryCode)
  if (!region) {
    return null
  }

  // DETERMINE FILTER STATUS
  const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined
  const hasClientSideFilters = vendors?.length || colors?.length || collections?.length || categories?.length
  const hasAnyFilters = hasClientSideFilters || hasPriceFilter
  const hasColorFilter = colors?.length > 0

  // MINIMAL SERVER-SIDE QUERY (NO FILTERING - just fetch everything)
  const queryParams: any = {}

  // ONLY essential server-side filters that can't be done client-side
  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  let products = []
  let count = 0
  let totalPages = 1
  let allProducts = [] // Store all products for client-side filtering

  try {
    // Import the function here to avoid any expand issues
    const { listProductsWithSort } = await import("@lib/data/products")
    
    // FETCH ALL PRODUCTS (no server-side filtering)
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
    
    // CLIENT-SIDE FILTERING (with special consideration for color-based image selection)
    if (hasAnyFilters) {
      // Start with all products
      let filteredProducts = [...allProducts]

      // Apply collection filter (CLIENT-SIDE)
      if (collections?.length && filteredProducts.length > 0) {
        const beforeCount = filteredProducts.length
        filteredProducts = filteredProducts.filter(product => {
          if (!product.collection) {
            return false
          }
          return collections.includes(product.collection.handle)
        })
      }

      // Apply category filter (CLIENT-SIDE)
      if (categories?.length && filteredProducts.length > 0) {
        const beforeCount = filteredProducts.length
        filteredProducts = filteredProducts.filter(product => {
          if (!product.categories || product.categories.length === 0) {
            return false
          }
          
          const hasMatchingCategory = product.categories.some(category => 
            categories.includes(category.handle)
          )
          
          return hasMatchingCategory
        })
      }

      // Apply vendor filter (CLIENT-SIDE)
      if (vendors?.length && filteredProducts.length > 0) {
        // Get vendor data for name-to-handle conversion
        const vendorsData = await retriveVendors()
        
        // Convert vendor names to handles
        const vendorHandles = vendorsData
          .filter(vendor => vendors.includes(vendor.name))
          .map(vendor => vendor.handle)
        
        // Filter products by vendor handle
        const beforeCount = filteredProducts.length
        filteredProducts = filteredProducts.filter(product => {
          if (!product.vendor) {
            return false
          }
          
          return vendorHandles.includes(product.vendor.handle)
        })
      }

      // Apply color filter (CLIENT-SIDE) - ENHANCED for image selection
      if (colors?.length && filteredProducts.length > 0) {
        const beforeCount = filteredProducts.length
        
        // ENHANCED: More comprehensive color filtering that considers both product and variant levels
        filteredProducts = filteredProducts.filter(product => {
          const productColors = new Set<string>()
          
          // Extract colors from product metadata
          if (product.metadata && product.metadata.color_hex_values) {
            let colorsData = product.metadata.color_hex_values
            
            // Handle both string and array formats
            if (typeof colorsData === 'string') {
              try {
                colorsData = JSON.parse(colorsData)
              } catch (e) {
                return false
              }
            }
            
            if (Array.isArray(colorsData)) {
              colorsData.forEach(color => {
                if (color?.name) {
                  // Normalize product color names for comparison
                  const normalizedProductColor = normalizeColorName(color.name)
                  productColors.add(normalizedProductColor.toLowerCase().trim())
                }
              })
            }
          }
          
          // ALSO extract colors from variant metadata for comprehensive matching
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
            return false
          }
          
          // Normalize selected colors for comparison
          const normalizedSelectedColors = colors.map(c => 
            normalizeColorName(c).toLowerCase().trim()
          )
          
          const matches = normalizedSelectedColors.some(selectedColor => 
            productColors.has(selectedColor)
          )
          
          return matches
        })
      }
      
      // Apply price filter (CLIENT-SIDE)
      if (hasPriceFilter && filteredProducts.length > 0) {
        const beforeCount = filteredProducts.length
        filteredProducts = filteredProducts.filter(product => {
          const price = product.variants?.[0]?.calculated_price?.calculated_amount
          if (!price) return false
          
          const inRange = (minPrice === undefined || price >= minPrice) && 
                         (maxPrice === undefined || price <= maxPrice)
          
          return inRange
        })
      }
      
      // CLIENT-SIDE PAGINATION
      if (filteredProducts.length > 0) {
        // Calculate total count and pages for filtered products
        count = filteredProducts.length
        totalPages = Math.ceil(count / PRODUCT_LIMIT)
        
        // Handle page overflow with redirect
        if (pageNumber > totalPages && totalPages > 0) {
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
          
          redirect(redirectUrl)
        }
        
        const effectivePageNumber = Math.min(pageNumber, totalPages)
        const startIndex = (effectivePageNumber - 1) * PRODUCT_LIMIT
        const endIndex = startIndex + PRODUCT_LIMIT
        
        // Get products for current page
        products = filteredProducts.slice(startIndex, endIndex)
        
      } else {
        products = []
        count = 0
        totalPages = 1
      }
      
    } else {
      // No filters: Use server-side pagination on all products
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
    }
    
  } catch (error) {
    products = []
    allProducts = []
    count = 0
    totalPages = 1
  }

  // Calculate dynamic price range based on current context
  //console.log('\n📊 CALCULATING DYNAMIC PRICE RANGE...')
  
  let dynamicPriceRange = { minPrice: 0, maxPrice: 1000 }
  let productsForPriceCalculation = allProducts

  if (categories?.length) {
    // Calculate price range from category-filtered products
    //console.log(`🏷️ Calculating price range for categories: [${categories.join(', ')}]`)
    
    productsForPriceCalculation = allProducts.filter(product => {
      if (!product.categories || product.categories.length === 0) {
        return false
      }
      return product.categories.some(category => 
        categories.includes(category.handle)
      )
    })
    
    //console.log(`🏷️ Found ${productsForPriceCalculation.length} products in selected categories`)
    dynamicPriceRange = calculatePriceRange(productsForPriceCalculation)
  } else {
    // No category filter: use all products
    //console.log('📦 Calculating price range from all products')
    dynamicPriceRange = calculatePriceRange(allProducts)
  }

  //console.log('✅ Final dynamic price range:', dynamicPriceRange)

  // Extract unique colors from ALL products (for filter options) - ENHANCED with variant colors
  const uniqueColors = new Map()
  
  if (allProducts && allProducts.length > 0) {
    allProducts.forEach((product, index) => {
      // Extract colors from product metadata
      if (product.metadata && product.metadata.color_hex_values) {
        let colorsData = product.metadata.color_hex_values
        
        // Handle both string and array formats
        if (typeof colorsData === 'string') {
          try {
            colorsData = JSON.parse(colorsData)
          } catch (e) {
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
                // Normalize color name before storing
                const normalizedName = normalizeColorName(color.name)
                const colorKey = normalizedName.toLowerCase()
                
                uniqueColors.set(colorKey, {
                  name: normalizedName, // Store normalized name: "Light Pink"
                  hex: cleanHex
                })
              }
            }
          })
        }
      }
      
      // ALSO extract colors from variant metadata
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

  // Get sidebar data for filters
  const [categoriesData, vendorsData] = await Promise.all([
    listCategories(),
    retriveVendors()
  ])

  return (
    <MobileStoreWrapper
      sortBy={sort}
      hasActiveFilters={hasAnyFilters}
      count={count}
      filterContent={
        <RefinementList 
          sortBy={sort}
          search={true}
          vendors={vendorsData}
          categories={categoriesData}
          products={productsForPriceCalculation}
          availableColors={availableColors}
          dynamicPriceRange={dynamicPriceRange}
        />
      }
    >
      {/* Desktop Layout Only */}
      <div className="flex flex-col px-0 py-0 small:py-6 small:px-6 small:flex-row small:items-start content-container">
        <div className="hidden md:block">
          <RefinementList 
            sortBy={sort}
            search={true}
            vendors={vendorsData}
            categories={categoriesData}
            products={productsForPriceCalculation}
            availableColors={availableColors}
            dynamicPriceRange={dynamicPriceRange}
          />
        </div>
        <div className="w-full px-0 ml-0 md:ml-4 sm:px-0">
          <div className="px-2 mt-0 mb-0 small:mt-12 text-2xl-semi">
            <h1 data-testid="store-page-title mt-8">All products</h1>
            {hasAnyFilters && (
              <div className="mt-2 text-sm text-gray-600">
                {count > 0 ? (   
                  <div className="flex flex-col gap-1">
                    <span>Found {count} product{count !== 1 ? 's' : ''}</span>
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
          <div className="justify-start hidden mt-4 mb-6 md:flex md:justify-end">
            <SortWrapper sortBy={sort} data-testid="sort-above-grid" />
          </div>
          
          <Suspense fallback={<SkeletonProductGrid />}>
            <FilterHandlersWrapper
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
              vendors={vendors || []}
              colors={colors || []}
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
              selectedColors={colors || []}
              dynamicPriceRange={dynamicPriceRange}
            />
          </Suspense>
        </div>
      </div>
    </MobileStoreWrapper>
  )
}