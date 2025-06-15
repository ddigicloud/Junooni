// CollectionTemplate.jsx - WITH COLOR-BASED IMAGE SELECTION ADDED
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import SortWrapper from "@modules/store/components/refinement-list/sort-wrapper"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import FilterHandlersWrapper from "@modules/store/components/filter-handlers-wrapper"
import { HttpTypes } from "@medusajs/types"
import { listCategories } from "@lib/data/categories"
import { retriveVendors } from "@lib/data/vendors"
import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ShoppingBag } from "lucide-react"
import { notFound } from "next/navigation"

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

type CollectionTemplateProps = {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  categoryHandle?: string
  vendors?: string
  colors?: string
  price?: string
}

export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  categoryHandle,
  vendors,
  colors,
  price,
}: CollectionTemplateProps) {
  if (!collection || !countryCode) notFound()
  
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  // ✅ GET REGION FIRST
  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  // ✅ ENHANCED: Color name normalizer function (same as StoreTemplate, SearchResultsPage, and CategoryTemplate)
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

  // Fetch categories and vendors
  const categories = await listCategories()
  const vendorsData = await retriveVendors()
  
  // Extract unique vendors directly from collection products
  const uniqueVendors = new Map()
  if (collection.products && collection.products.length > 0) {
    collection.products.forEach(product => {
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
  
  // ✅ URL contains vendor handles (not names) - RefinementList uses handles as values
  let vendorHandles: string[] = []
  const vendorNamesFromURL: string[] = []
  if (vendors) {
    const vendorNames = vendors.split(",")  // URL contains vendor names like "Nike,Adidas"
    vendorNamesFromURL.push(...vendorNames)
    
    // Convert vendor names to handles for server-side filtering
    vendorHandles = formattedVendors
      .filter(vendor => vendorNames.includes(vendor.name))  // Match by name
      .map(vendor => vendor.handle)  // Convert to handles for filtering
    
    //console.log('🏪 Vendor names from URL:', vendorNames)
    //console.log('🏪 Converted to handles for filtering:', vendorHandles)
  }
  
  const colorArray = colors ? colors.split(",") : []
  
  // ✅ Parse comma-separated categories properly
  const parseCategoryHandles = (categoryParam?: string): string[] => {
    if (!categoryParam) return []
    return categoryParam.split(',').map(c => c.trim()).filter(Boolean)
  }
  
  const selectedCategoryHandles = parseCategoryHandles(categoryHandle)
  
  // ✅ PRICE PARSING (existing logic)
  let minPrice, maxPrice
  if (price) {
    const [min, max] = price.split("-").map(p => parseInt(p, 10))
    minPrice = min
    maxPrice = max
    //console.log('💰 Price filter range:', minPrice, '-', maxPrice)
  }

  // ✅ Check for filters (following StoreTemplate pattern)
  const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined
  const hasVendorFilter = vendorHandles.length > 0
  const hasColorFilter = colorArray.length > 0
  const hasCategoryFilter = selectedCategoryHandles.length > 0
  const hasAnyFilters = hasPriceFilter || hasVendorFilter || hasColorFilter || hasCategoryFilter

  //console.log('🎯 Filter analysis:')
  //console.log('- Has price filter:', hasPriceFilter)
  //console.log('- Has vendor filter:', hasVendorFilter)
  //console.log('- Has color filter:', hasColorFilter) 
  //console.log('- Has category filter:', hasCategoryFilter)
  //console.log('- Has ANY filters:', hasAnyFilters)
  //console.log('- Current page requested:', pageNumber)

  // ✅ DATA FETCHING LOGIC (Updated following StoreTemplate pattern)
  let products = []
  let count = 0

  // Step 1: Get products for the collection
  const queryParams: PaginatedProductsParams = {
    limit: hasAnyFilters ? 1000 : PRODUCT_LIMIT, // ✅ Fetch ALL products if filtering
  }

  if (collection.id) {
    queryParams["collection_id"] = [collection.id]
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
  
  // Step 2: Apply category filter if specified
  if (selectedCategoryHandles && selectedCategoryHandles.length > 0 && products.length > 0) {
    //console.log('🏷️ Applying category filter:', selectedCategoryHandles)
    
    products = products.filter(product => {
      if (!product.categories || product.categories.length === 0) {
        //console.log(`❌ Product "${product.title}" has no categories`)
        return false
      }
      
      const hasMatchingCategory = product.categories.some(category => 
        selectedCategoryHandles.includes(category.handle)
      )
      
      if (hasMatchingCategory) {
        //console.log(`✅ Product "${product.title}" matches category filter`)
      }
      
      return hasMatchingCategory
    })
    
    count = products.length
    //console.log('- Products after category filtering:', products.length)
  }

  // Step 3: Apply vendor filter if specified
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
    
    count = products.length
    //console.log('- Products after vendor filtering:', products.length)
  }

  // Step 4: Apply color filter if specified with improved normalization
  if (colorArray && colorArray.length > 0 && products.length > 0) {
    //console.log('🎨 [CollectionTemplate] Applying color filter:', colorArray)
    
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
        //console.log(`✅ [CollectionTemplate] Product "${product.title}" matches color filter`)
      }
      
      return hasMatchingColor
    })
    
    count = products.length
    //console.log('- Products after color filtering:', products.length)
  }

  // Step 5: Apply price filter if specified (CLIENT-SIDE FILTERING)
  if ((minPrice !== undefined || maxPrice !== undefined) && products.length > 0) {
    //console.log('💰 Applying client-side price filter:', { minPrice, maxPrice })
    
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
    
    count = products.length
    //console.log('- Products after client-side price filtering:', products.length)
  }

  // ✅ Professional behavior - show filtered results on current page
  if (hasAnyFilters && products.length > 0) {
    //console.log(`✅ PROFESSIONAL BEHAVIOR: Showing ${products.length} filtered products on page ${pageNumber}`)
    //console.log('✅ User sees results on their current page - no redirect')
  }

  // Calculate pagination (updated following StoreTemplate pattern)
  const totalPages = hasAnyFilters && products.length > 0 ? 1 : Math.ceil(count / PRODUCT_LIMIT)

  //console.log('📊 Final results:')
  //console.log('- Final products count:', products.length)
  //console.log('- Total count:', count)
  //console.log('- Total pages:', totalPages)

  // Extract collections from products (following CategoryTemplate pattern)
  const uniqueCollections = new Map()
  if (collection.products && collection.products.length > 0) {
    collection.products.forEach(product => {
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

  // ✅ Extract categories from products for proper mapping
  const uniqueCategories = new Map()
  if (collection.products && collection.products.length > 0) {
    collection.products.forEach(product => {
      if (product.categories && product.categories.length > 0) {
        product.categories.forEach(category => {
          uniqueCategories.set(category.id, {
            id: category.id,
            name: category.name,
            handle: category.handle
          })
        })
      }
    })
  }
  
  const categoriesFromProducts = Array.from(uniqueCategories.values())

  // ✅ ENHANCED: Prepare selectedColors for image selection (same logic as other templates)
  const selectedColorsForImageSelection = colorArray.map(color => normalizeColorName(color))
  
  // console.log('🎨 [CollectionTemplate] Color-based image selection setup:', {
  //   rawColorsFromURL: colorArray,
  //   normalizedSelectedColors: selectedColorsForImageSelection,
  //   hasColorFilter: hasColorFilter,
  //   productsWithColorData: products.filter(p => p.metadata?.color_hex_values).length
  // })

  // ✅ ENHANCED: Extract available colors from collection products for proper filter display
  const uniqueColors = new Map()
  if (collection.products && collection.products.length > 0) {
    collection.products.forEach(product => {
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

  //console.log('🔍 CollectionTemplate Debug:')
  //console.log('- categoryHandle prop:', categoryHandle)
  //console.log('- selectedCategoryHandles array:', selectedCategoryHandles)
  //console.log('- vendorHandles:', vendorHandles)
  //console.log('- colorArray:', colorArray)
  //console.log('- minPrice/maxPrice:', minPrice, maxPrice)
  //console.log('- products count:', products?.length || 0)
  //console.log('- totalCount:', count)
  //console.log('- totalPages:', totalPages)
  //console.log('- collection.products length:', collection.products?.length || 0)

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
          <span className="font-medium text-gray-900">{collection.title}</span>
        </div>
       
        {/* Collection Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{collection.title}</h1>
          {collection.description && (
            <p className="text-gray-600">{collection.description}</p>
          )}
          
          {/* ✅ ENHANCED: Professional messaging (following StoreTemplate pattern) */}
          {hasAnyFilters && (
            <div className="mt-2 text-sm text-gray-600">
              {count > 0 ? (
                <span>Found {count} product{count !== 1 ? 's' : ''}{products.length > 0 ? ` • Showing on page ${pageNumber}` : ''}</span>
              ) : (
                <span>No products match your filters • <a href={`/collections/${collection.handle}`} className="text-blue-600 underline">Clear filters</a></span>
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
                categories={categories}
                vendors={formattedVendors}
                products={collection.products}
                collections={collections}
                availableColors={availableColors} // ✅ ENHANCED: Pass extracted colors
                isCollectionPage={true}
              />
            </div>
          </aside>
          
          {/* Product Grid with Applied Filters */}
          <div className="flex-grow mt-4">
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
                categoryId={collection.id}
                countryCode={countryCode}
                vendors={vendorHandles} // ✅ Pass vendor handles (not display names)
                colors={colorArray}
                categories={selectedCategoryHandles}
                collections={[]} // Collections filtering not needed for collection pages
                minPrice={minPrice}
                maxPrice={maxPrice}
                products={products}
                totalCount={count}
                totalPages={totalPages}
                region={region}
                vendorsData={formattedVendors} // ✅ Pass vendors data for mapping
                categoriesData={categoriesFromProducts}
                collectionsData={collections}
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