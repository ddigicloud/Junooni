// CollectionTemplate.jsx - WITH MOBILE VIEW USING MobileStoreWrapper
import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import SortWrapper from "@modules/store/components/refinement-list/sort-wrapper"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import FilterHandlersWrapper from "@modules/store/components/filter-handlers-wrapper"
import MobileStoreWrapper from "@modules/store/components/mobile-store-wrapper"
import { HttpTypes } from "@medusajs/types"
import { listCategories } from "@lib/data/categories"
import { retriveVendors } from "@lib/data/vendors"
import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
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

  // Get region first
  const region = await getRegion(countryCode)
  if (!region) {
    notFound()
  }

  // Color name normalizer function
  const normalizeColorName = (colorName: string): string => {
    return colorName
      .trim()
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([a-z])(\d)/g, '$1 $2')
      .replace(/(\d)([a-z])/gi, '$1 $2')
      .replace(/\s+/g, ' ')
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
  
  // URL contains vendor handles (not names)
  let vendorHandles: string[] = []
  const vendorNamesFromURL: string[] = []
  if (vendors) {
    const vendorNames = vendors.split(",")
    vendorNamesFromURL.push(...vendorNames)
    
    vendorHandles = formattedVendors
      .filter(vendor => vendorNames.includes(vendor.name))
      .map(vendor => vendor.handle)
  }
  
  const colorArray = colors ? colors.split(",") : []
  
  // Parse comma-separated categories properly
  const parseCategoryHandles = (categoryParam?: string): string[] => {
    if (!categoryParam) return []
    return categoryParam.split(',').map(c => c.trim()).filter(Boolean)
  }
  
  const selectedCategoryHandles = parseCategoryHandles(categoryHandle)
  
  // Price parsing
  let minPrice, maxPrice
  if (price) {
    const [min, max] = price.split("-").map(p => parseInt(p, 10))
    minPrice = min
    maxPrice = max
  }

  // Check for filters
  const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined
  const hasVendorFilter = vendorHandles.length > 0
  const hasColorFilter = colorArray.length > 0
  const hasCategoryFilter = selectedCategoryHandles.length > 0
  const hasAnyFilters = hasPriceFilter || hasVendorFilter || hasColorFilter || hasCategoryFilter

  // Data fetching logic
  let products = []
  let count = 0

  // Step 1: Get products for the collection
  const queryParams: PaginatedProductsParams = {
    limit: hasAnyFilters ? 1000 : PRODUCT_LIMIT,
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
    page: hasAnyFilters ? 1 : pageNumber,
    queryParams,
    sortBy: sort,
    countryCode,
  })

  products = fetchedProducts
  count = fetchedCount

  // Calculate dynamic price range from available products
  const calculatePriceRange = (productList: any[]) => {
    let prices: number[] = []
    
    productList.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach(variant => {
          let productPrice = null
          
          if (variant.calculated_price && variant.calculated_price.calculated_amount) {
            productPrice = variant.calculated_price.calculated_amount
          }
          else if (variant.prices && variant.prices.length > 0) {
            const priceInRegion = variant.prices.find(p => p.currency_code === region.currency_code)
            if (priceInRegion) {
              productPrice = priceInRegion.amount
            }
          }
          
          if (productPrice !== null && productPrice !== undefined && productPrice > 0) {
            prices.push(productPrice)
          }
        })
      }
    })
    
    if (prices.length === 0) {
      return { minPrice: 0, maxPrice: 0 }
    }
    
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices)
    }
  }

  // Calculate price range from all products in the collection (before applying filters)
  const priceRange = calculatePriceRange(products)

  // Apply all filters step by step
  
  // Apply category filter if specified
  if (selectedCategoryHandles && selectedCategoryHandles.length > 0 && products.length > 0) {
    products = products.filter(product => {
      if (!product.categories || product.categories.length === 0) {
        return false
      }
      
      const hasMatchingCategory = product.categories.some(category => 
        selectedCategoryHandles.includes(category.handle)
      )
      
      return hasMatchingCategory
    })
    
    count = products.length
  }

  // Apply vendor filter if specified
  if (vendorHandles && vendorHandles.length > 0 && products.length > 0) {
    products = products.filter(product => {
      if (!product.vendor) {
        return false
      }
      
      const hasMatchingVendor = vendorHandles.includes(product.vendor.handle)
      return hasMatchingVendor
    })
    
    count = products.length
  }

  // Apply color filter if specified
  if (colorArray && colorArray.length > 0 && products.length > 0) {
    products = products.filter(product => {
      const productColors = new Set<string>()
      
      if (product.metadata) {
        if (product.metadata.color_hex_values) {
          try {
            const parsedColors = JSON.parse(product.metadata.color_hex_values)
            if (Array.isArray(parsedColors)) {
              parsedColors.forEach(color => {
                if (color.name) {
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
      
      const normalizedFilterColors = colorArray.map(color => normalizeColorName(color).toLowerCase())
      
      const hasMatchingColor = normalizedFilterColors.some(filterColor => 
        productColors.has(filterColor)
      )
      
      return hasMatchingColor
    })
    
    count = products.length
  }

  // Apply price filter if specified
  if ((minPrice !== undefined || maxPrice !== undefined) && products.length > 0) {
    products = products.filter(product => {
      let productPrice = null
      
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants[0]
        
        if (variant.calculated_price && variant.calculated_price.calculated_amount) {
          productPrice = variant.calculated_price.calculated_amount
        }
        else if (variant.prices && variant.prices.length > 0) {
          const priceInRegion = variant.prices.find(p => p.currency_code === region.currency_code)
          if (priceInRegion) {
            productPrice = priceInRegion.amount
          }
        }
      }
      
      if (productPrice === null || productPrice === undefined) {
        return false
      }
      
      let matchesPrice = true
      
      if (minPrice !== undefined && productPrice < minPrice) {
        matchesPrice = false
      }
      
      if (maxPrice !== undefined && productPrice > maxPrice) {
        matchesPrice = false
      }
      
      return matchesPrice
    })
    
    count = products.length
  }

  // Professional pagination for filtered products
  if (hasAnyFilters) {
    if (products.length > 0) {
      count = products.length
      const totalPages = Math.ceil(count / PRODUCT_LIMIT)
      
      let effectivePageNumber = pageNumber
      
      if (pageNumber > totalPages) {
        effectivePageNumber = 1
      }
      
      const startIndex = (effectivePageNumber - 1) * PRODUCT_LIMIT
      const endIndex = startIndex + PRODUCT_LIMIT
      
      products = products.slice(startIndex, endIndex)
    } else {
      count = 0
    }
  }

  // Calculate pagination
  const totalPages = hasAnyFilters && products.length > 0 ? 1 : Math.ceil(count / PRODUCT_LIMIT)

  // Extract collections from products
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

  // Extract categories from products for proper mapping
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

  // Prepare selectedColors for image selection
  const selectedColorsForImageSelection = colorArray.map(color => normalizeColorName(color))

  // Extract available colors from collection products
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

  return (
    <MobileStoreWrapper
      sortBy={sort}
      hasActiveFilters={hasAnyFilters}
      count={count}
      filterContent={
        <RefinementList
          sortBy={sort}
          categories={categories}
          vendors={formattedVendors}
          products={collection.products}
          collections={collections}
          availableColors={availableColors}
          dynamicPriceRange={priceRange}
          isCollectionPage={true}
        />
      }
    >
      {/* Announcement Bar */}
      {/* <div className="px-4 py-2 text-sm font-medium text-center text-white bg-black">
        Free shipping on all orders over $100 • Shop now and save
      </div> */}
      
      {/* Desktop Layout Only */}
      <div className="flex flex-col px-0 py-0 small:py-6 small:px-6 small:flex-row small:items-start content-container">
        {/* Desktop Filters Sidebar */}
        <div className="hidden md:block">
          <RefinementList
            sortBy={sort}
            categories={categories}
            vendors={formattedVendors}
            products={collection.products}
            collections={collections}
            availableColors={availableColors}
            dynamicPriceRange={priceRange}
            isCollectionPage={true}
          />
        </div>
        
        {/* Main Content */}
        <div className="w-full px-0 ml-0 md:ml-4 sm:px-0">
          {/* Breadcrumb - Desktop Only */}
          <div className="hidden mt-16 mb-0 text-sm text-gray-600 md:block">
            <LocalizedClientLink href="/" className="hover:text-[#e65100]">
              Home
            </LocalizedClientLink>
            <span className="mx-1.5">/</span>
            <span className="font-medium text-gray-900">{collection.title}</span>
          </div>
         
          {/* Collection Header */}
          <div className="px-2 mt-2 mb-0 small:mt-8 text-2xl-semi sm:px-0 md:px-0">
            <h1 className="mb-2 text-2xl font-bold md:text-3xl">{collection.title}</h1>
            {collection.description && (
              <p className="text-gray-600">{collection.description}</p>
            )}
            
            {/* Professional messaging with pagination info */}
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
                        ⚠️ Page {pageNumber} not available. <a href={`/collections/${collection.handle}?page=1`} className="text-blue-600 underline">Go to page 1</a>
                      </div>
                    )}
                  </div>
                ) : (
                  <span>No products match your filters • <a href={`/collections/${collection.handle}`} className="text-blue-600 underline">Clear filters</a></span>
                )}
              </div>
            )}
          </div>
          
          {/* Desktop Sort */}
          <div className="justify-start hidden mt-4 mb-6 md:flex md:justify-end">
            <SortWrapper 
              sortBy={sort} 
              data-testid="sort-above-grid" 
            />
          </div>
          
          {/* Product Grid */}
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={12}
              />
            }
          >
            <FilterHandlersWrapper
              sortBy={sort}
              page={pageNumber}
              categoryId={collection.id}
              countryCode={countryCode}
              vendors={vendorHandles}
              colors={colorArray}
              categories={selectedCategoryHandles}
              collections={[]}
              minPrice={minPrice}
              maxPrice={maxPrice}
              products={products}
              totalCount={count}
              totalPages={totalPages}
              region={region}
              vendorsData={formattedVendors}
              categoriesData={categoriesFromProducts}
              collectionsData={collections}
              availableColors={availableColors}
              selectedColors={selectedColorsForImageSelection}
            />
          </Suspense>
        </div>
      </div>
      
      {/* Simplified Footer */}
      {/* <footer className="py-12 mt-16 bg-gray-100">
        <div className="container px-4 mx-auto text-sm text-center text-gray-500">
          © 2025 Medusa Store. All rights reserved.
        </div>
      </footer> */}
    </MobileStoreWrapper>
  )
}