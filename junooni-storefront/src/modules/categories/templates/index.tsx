// CategoryTemplate.jsx - WITH COLOR-BASED IMAGE SELECTION ADDED
import { Suspense } from "react"
import { notFound } from "next/navigation"
import SortWrapper from "@modules/store/components/refinement-list/sort-wrapper"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import FilterHandlersWrapper from "@modules/store/components/filter-handlers-wrapper"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { ShoppingBag } from "lucide-react"
import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
  tags?: string[]
}

type CategoryTemplateProps = {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  vendors?: string
  colors?: string
  price?: string
  collections?: string
}

export default async function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  vendors,
  colors,
  price,
  collections: selectedCollections,
}: CategoryTemplateProps) {
  if (!category || !countryCode) notFound()
  
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  // ✅ GET REGION FIRST
  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  // ✅ ENHANCED: Color name normalizer function (same as StoreTemplate and SearchResultsPage)
  const normalizeColorName = (colorName: string): string => {
    return colorName
      .trim()
      // Add space before capital letters (camelCase to spaced)
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Handle common patterns
      .replace(/([a-z])(\d)/g, '$1 $2') // Add space before numbers
      .replace(/(\d)([a-z])/gi, '$1 $2') // Add space after numbers
      // Normalize multiple spaces to single space
      .replace(/\s+/g, ' ')
      // Proper case each word
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  //console.log('🔍 CategoryTemplate Debug:')
  //console.log('- category:', category?.name, category?.id)
  //console.log('- selectedCollections param:', selectedCollections)

  // Extract unique vendors directly from category products
  const uniqueVendors = new Map()
  if (category.products && category.products.length > 0) {
    category.products.forEach(product => {
      if (product.vendor) {
        uniqueVendors.set(product.vendor.id, {
          id: product.vendor.id,
          name: product.vendor.name,
          handle: product.vendor.handle
        })
      }
    })
  }
  
  const formattedVendors = Array.from(uniqueVendors.values())
  
  // Convert vendor names from URL to handles for filtering
  let vendorHandles: string[] = []
  if (vendors) {
    const vendorNames = vendors.split(",")  // ✅ URL now contains vendor names
    vendorHandles = formattedVendors
      .filter(vendor => vendorNames.includes(vendor.name))  // ✅ This now matches!
      .map(vendor => vendor.handle)  // ✅ Convert to handles for filtering
    
    //console.log('🏪 Vendor names from URL:', vendorNames)
    //console.log('🏪 Converted to handles for filtering:', vendorHandles)
  }

  // ✅ Keep original vendor names for display in Applied Filter pills
  const vendorNamesForDisplay = vendors ? vendors.split(",") : []
  
  const colorArray = colors ? colors.split(",") : []
  
  let collectionHandles: string[] = []
  if (selectedCollections) {
    collectionHandles = selectedCollections.split(",")
  }
  
  // ✅ PRICE PARSING (existing logic)
  let minPrice, maxPrice
  if (price) {
    const [min, max] = price.split("-").map(p => parseInt(p, 10))
    minPrice = min
    maxPrice = max
    //console.log('💰 Price filter range:', minPrice, '-', maxPrice)
  }

  // ✅ Check for filters
  const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined
  const hasVendorFilter = vendorHandles.length > 0
  const hasColorFilter = colorArray.length > 0
  const hasCollectionFilter = collectionHandles.length > 0
  const hasAnyFilters = hasPriceFilter || hasVendorFilter || hasColorFilter || hasCollectionFilter

  //console.log('🎯 Filter analysis:')
  //console.log('- Has price filter:', hasPriceFilter)
  //console.log('- Has vendor filter:', hasVendorFilter)
  //console.log('- Has color filter:', hasColorFilter)
  //console.log('- Has collection filter:', hasCollectionFilter)
  //console.log('- Has ANY filters:', hasAnyFilters)
  //console.log('- Current page requested:', pageNumber)

  // ✅ DATA FETCHING LOGIC
  let products = []
  let count = 0
  let totalPages = 1

  // Step 1: Get products for the category
  const queryParams: PaginatedProductsParams = {
    limit: hasAnyFilters ? 1000 : PRODUCT_LIMIT, // ✅ Fetch ALL products if filtering
  }

  if (category.id) {
    queryParams["category_id"] = [category.id]
  }

  if (sort === "created_at") {
    queryParams["order"] = "created_at"
  }

  let {
    response: { products: fetchedProducts, count: fetchedCount },
  } = await listProductsWithSort({
    page: hasAnyFilters ? 1 : pageNumber, // ✅ Always page 1 if filtering
    queryParams,
    sortBy: sort,
    countryCode,
  })

  products = fetchedProducts
  count = fetchedCount

  //console.log('📦 Initial products fetched:', products.length)

  // ✅ Apply all filters step by step (existing logic unchanged)

  // Step 2: Apply vendor filter if specified
  if (vendorHandles && vendorHandles.length > 0 && products.length > 0) {
    //console.log('🏪 Applying vendor filter:', vendorHandles)
    
    products = products.filter(product => {
      if (!product.vendor) {
        return false
      }
      
      const hasMatchingVendor = vendorHandles.includes(product.vendor.handle)
      
      if (hasMatchingVendor) {
        //console.log(`✅ Product "${product.title}" matches vendor "${product.vendor.handle}"`)
      }
      
      return hasMatchingVendor
    })
    
    //console.log('- Products after vendor filtering:', products.length)
  }

  // Step 3: Apply collection filter if specified
  if (collectionHandles && collectionHandles.length > 0 && products.length > 0) {
    //console.log('🏷️ Applying collection filter:', collectionHandles)
    
    products = products.filter(product => {
      if (!product.collection) {
        //console.log(`❌ Product "${product.title}" has no collection`)
        return false
      }
      
      const hasMatchingCollection = collectionHandles.includes(product.collection.handle)
      
      if (hasMatchingCollection) {
        //console.log(`✅ Product "${product.title}" matches collection "${product.collection.handle}"`)
      }
      
      return hasMatchingCollection
    })
    
    //console.log('- Products after collection filtering:', products.length)
  }

  // Step 4: Apply color filter if specified with improved normalization
  if (colorArray && colorArray.length > 0 && products.length > 0) {
    //console.log('🎨 [CategoryTemplate] Applying color filter:', colorArray)
    
    products = products.filter(product => {
      const productColors = new Set<string>()
      
      if (product.metadata) {
        if (product.metadata.color_hex_values) {
          try {
            const parsedColors = JSON.parse(product.metadata.color_hex_values)
            if (Array.isArray(parsedColors)) {
              parsedColors.forEach(color => {
                if (color.name) {
                  // ✅ ENHANCED: Normalize color names for consistent matching
                  const normalizedColorName = normalizeColorName(color.name)
                  productColors.add(normalizedColorName.toLowerCase())
                }
              })
            }
          } catch (e) {
            //console.error('Failed to parse color_hex_values:', e)
          }
        }
      }
      
      // ✅ ENHANCED: Also normalize filter colors for comparison
      const normalizedFilterColors = colorArray.map(color => normalizeColorName(color).toLowerCase())
      
      const hasMatchingColor = normalizedFilterColors.some(filterColor => 
        productColors.has(filterColor)
      )
      
      if (hasMatchingColor) {
        //console.log(`✅ [CategoryTemplate] Product "${product.title}" matches color filter`)
      }
      
      return hasMatchingColor
    })
    
    //console.log('- Products after color filtering:', products.length)
  }

  // Step 5: Apply price filter if specified
  if ((minPrice !== undefined || maxPrice !== undefined) && products.length > 0) {
    //console.log('💰 Applying price filter:', { minPrice, maxPrice })
    
    products = products.filter(product => {
      // Get product price using same logic as ProductPreview
      let productPrice = null
      
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants[0] // Use first variant
        
        // Try calculated_price first
        if (variant.calculated_price && variant.calculated_price.calculated_amount) {
          productPrice = variant.calculated_price.calculated_amount
        }
        // Fallback to prices array
        else if (variant.prices && variant.prices.length > 0) {
          const priceInRegion = variant.prices.find(p => p.currency_code === region.currency_code)
          if (priceInRegion) {
            productPrice = priceInRegion.amount
          }
        }
      }
      
      // Skip products without valid price
      if (productPrice === null || productPrice === undefined) {
        //console.log(`❌ Product "${product.title}" has no valid price`)
        return false
      }
      
      // Check price range
      let matchesPrice = true
      
      if (minPrice !== undefined && productPrice < minPrice) {
        matchesPrice = false
      }
      
      if (maxPrice !== undefined && productPrice > maxPrice) {
        matchesPrice = false
      }
      
      if (matchesPrice) {
        //console.log(`✅ Product "${product.title}" price ${productPrice} matches range [${minPrice}-${maxPrice}]`)
      } else {
        //console.log(`❌ Product "${product.title}" price ${productPrice} outside range [${minPrice}-${maxPrice}]`)
      }
      
      return matchesPrice
    })
    
    //console.log('- Products after price filtering:', products.length)
  }

  // ✅ PROFESSIONAL PAGINATION FOR FILTERED PRODUCTS
  if (hasAnyFilters) {
    if (products.length > 0) {
      // Calculate total count and pages for filtered products
      count = products.length
      totalPages = Math.ceil(count / PRODUCT_LIMIT)
      
      //console.log(`📊 FILTERED PAGINATION CALCULATION:`)
      //console.log(`- Total filtered products: ${count}`)
      //console.log(`- Products per page: ${PRODUCT_LIMIT}`)
      //console.log(`- Total pages needed: ${totalPages}`)
      //console.log(`- Current page requested: ${pageNumber}`)
      
      // ✅ PROFESSIONAL UX FIX: When filters are applied, handle page overflow gracefully
      let effectivePageNumber = pageNumber
      
      if (pageNumber > totalPages) {
        //console.log(`⚠️ UX FIX: Requested page ${pageNumber} exceeds total pages ${totalPages}, showing page 1`)
        effectivePageNumber = 1
      }
      
      const startIndex = (effectivePageNumber - 1) * PRODUCT_LIMIT
      const endIndex = startIndex + PRODUCT_LIMIT
      
      // ✅ Get products for current page only
      products = products.slice(startIndex, endIndex)
      
      //console.log(`✅ PROFESSIONAL PAGINATION: Showing products ${startIndex + 1}-${Math.min(endIndex, count)} of ${count}`)
      //console.log(`✅ Page ${effectivePageNumber} of ${totalPages} (${products.length} products on this page)`)
    } else {
      count = 0
      totalPages = 1
      //console.log('❌ No products match all applied filters')
    }
  } else {
    // No filters: use normal pagination calculation
    totalPages = Math.ceil(count / PRODUCT_LIMIT)
  }

  //console.log('📊 Final results:')
  //console.log('- Final products count on page:', products.length)
  //console.log('- Total count:', count)
  //console.log('- Total pages:', totalPages)

  // Get parent categories for breadcrumbs
  const parents = [] as HttpTypes.StoreProductCategory[]
  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }
  getParents(category)

  // Extract collections from products
  const uniqueCollections = new Map()
  if (category.products && category.products.length > 0) {
    category.products.forEach(product => {
      if (product.collection) {
        uniqueCollections.set(product.collection.id, {
          id: product.collection.id,
          title: product.collection.title,
          handle: product.collection.handle
        })
      }
    })
  }
  
  const collections = Array.from(uniqueCollections.values())

  // ✅ ENHANCED: Prepare selectedColors for image selection (same logic as StoreTemplate and SearchResultsPage)
  const selectedColorsForImageSelection = colorArray.map(color => normalizeColorName(color))
  
  // console.log('🎨 [CategoryTemplate] Color-based image selection setup:', {
  //   rawColorsFromURL: colorArray,
  //   normalizedSelectedColors: selectedColorsForImageSelection,
  //   hasColorFilter: hasColorFilter,
  //   productsWithColorData: products.filter(p => p.metadata?.color_hex_values).length
  // })

  // ✅ ENHANCED: Extract available colors from category products for proper filter display
  const uniqueColors = new Map()
  if (category.products && category.products.length > 0) {
    category.products.forEach(product => {
      if (product.metadata && product.metadata.color_hex_values) {
        try {
          let colorsData = product.metadata.color_hex_values
          if (typeof colorsData === 'string') {
            colorsData = JSON.parse(colorsData)
          }
          if (Array.isArray(colorsData)) {
            colorsData.forEach((color) => {
              if (color.name && color.hex) {
                let cleanHex = color.hex.trim()
                if (!cleanHex.startsWith('#')) {
                  cleanHex = '#' + cleanHex
                }
                if (/^#[0-9A-F]{6}$/i.test(cleanHex)) {
                  const normalizedName = normalizeColorName(color.name)
                  const colorKey = normalizedName.toLowerCase()
                  uniqueColors.set(colorKey, {
                    name: normalizedName,
                    hex: cleanHex
                  })
                }
              }
            })
          }
        } catch (e) {
          //console.error('Color parsing error:', e)
        }
      }
    })
  }
  
  const availableColors = Array.from(uniqueColors.values())

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Announcement Bar */}
      <div className="px-4 py-2 text-sm font-medium text-center text-white bg-black">
        Free shipping on all orders over $100 • Shop now and save
      </div>
      
      <main className="container flex-grow px-4 py-8 mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600">
          <LocalizedClientLink href="/" className="hover:text-[#e65100]">
            Home
          </LocalizedClientLink>
          <span className="mx-1.5">/</span>
          
          {parents.length > 0 && parents.slice().reverse().map((parent) => (
            <div key={parent.id} className="inline">
              <LocalizedClientLink
                className="hover:text-[#e65100]"
                href={`/categories/${parent.handle}`}
              >
                {parent.name}
              </LocalizedClientLink>
              <span className="mx-1.5">/</span>
            </div>
          ))}
          
          <span className="font-medium text-gray-900">{category.name}</span>
        </div>
       
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
          
          {/* ✅ ENHANCED Professional messaging with pagination info */}
          {hasAnyFilters && (
            <div className="mt-2 text-sm text-gray-600">
              {count > 0 ? (
                <div className="flex flex-col gap-1">
                  <span>Found {count} product{count !== 1 ? 's' : ''}</span>
                  {totalPages > 1 && (
                    <span>Showing page {Math.min(pageNumber, totalPages)} of {totalPages} • {products.length} products on this page</span>
                  )}
                  {pageNumber > totalPages && totalPages > 0 && (
                    <div className="mt-1 text-xs text-orange-600">
                      ⚠️ Page {pageNumber} not available. <a href={`/categories/${category.handle}?page=1`} className="text-blue-600 underline">Go to page 1</a>
                    </div>
                  )}
                </div>
              ) : (
                <span>No products match your filters • <a href={`/categories/${category.handle}`} className="text-blue-600 underline">Clear filters</a></span>
              )}
            </div>
          )}
        </div>
       
        {/* Mobile Filters Toggle */}
        {/* <div className="mb-4 lg:hidden">
          <button
            className="flex items-center justify-center w-full gap-2 px-6 py-3 font-medium text-white bg-black rounded-md"
            id="mobile-filters-toggle"
          >
            <ShoppingBag size={18} />
            Filters & Sort
          </button>
        </div> */}
       
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop Filters Sidebar */}
          <aside className="flex-shrink-0 w-full lg:w-64">
            <div className="sticky top-28">
              <RefinementList
                sortBy={sort}
                vendors={formattedVendors}
                products={category.products || []}
                currentCategory={category}
                collections={collections}
                selectedCollections={selectedCollections || ""}
                availableColors={availableColors} // ✅ ENHANCED: Pass extracted colors
                isCollectionPage={false}
              />
            </div>
          </aside>
          
          {/* Product Grid */}
          <div className="flex-grow">
            <div className="flex justify-start mb-6 md:justify-end">
              <SortWrapper 
                sortBy={sort} 
                data-testid="sort-above-grid" 
              />
            </div>
            
            <Suspense
              fallback={
                <SkeletonProductGrid
                  numberOfProducts={12}
                />
              }
            >
              {/* ✅ ENHANCED: Pass selectedColors for color-based image selection */}
              <FilterHandlersWrapper
                sortBy={sort}
                page={pageNumber}
                categoryId={category.id}
                countryCode={countryCode}
                vendors={vendorNamesForDisplay}
                colors={colorArray}
                collections={collectionHandles}
                minPrice={minPrice}
                maxPrice={maxPrice}
                products={products}
                totalCount={count}
                totalPages={totalPages}
                region={region}
                vendorsData={formattedVendors}
                collectionsData={collections}
                categoriesData={[]} // Not needed for category pages
                availableColors={availableColors} // ✅ ENHANCED: For color circle display
                selectedColors={selectedColorsForImageSelection} // ✅ CRITICAL: For ProductPreview image selection
              />
            </Suspense>
          </div>
        </div>
      </main>
      
      {/* Simplified Footer */}
      <footer className="py-12 mt-16 bg-gray-100">
        <div className="container px-4 mx-auto text-sm text-center text-gray-500">
          © 2025 Medusa Store. All rights reserved.
        </div>
      </footer>
    </div>
  )
}