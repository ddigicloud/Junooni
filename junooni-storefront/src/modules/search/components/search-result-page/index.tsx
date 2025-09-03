"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, Loader2 } from "lucide-react"
import RefinementList from "@modules/store/components/refinement-list"
import SortWrapper from "@modules/store/components/refinement-list/sort-wrapper"
import FilterHandlersWrapper from "@modules/store/components/filter-handlers-wrapper"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  countryCode: string
  region: any
}

export default function SearchResultsPage({ countryCode, region }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get search parameters
  const query = searchParams?.get('q') || ""
  const page = parseInt(searchParams?.get('page') || "1")
  const sortBy = (searchParams?.get('sortBy') as SortOptions) || "created_at"
  const vendors = searchParams?.get('vendors') || ""
  const colors = searchParams?.get('colors') || ""
  const collections = searchParams?.get('collections') || ""
  const categories = searchParams?.get('categories') || ""
  const priceRange = searchParams?.get('price') || ""
  
  // Component state
  const [allProducts, setAllProducts] = useState<any[]>([]) // Store all filtered products
  const [displayProducts, setDisplayProducts] = useState<any[]>([]) // Store paginated products for display
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter data
  const [categoriesData, setCategoriesData] = useState<any[]>([])
  const [vendorsData, setVendorsData] = useState<any[]>([])
  const [availableColors, setAvailableColors] = useState<any[]>([])
  const [availableCollections, setAvailableCollections] = useState<any[]>([])
  const [filtersLoading, setFiltersLoading] = useState(true)

  // ✅ Use proper limits
  const PRODUCT_LIMIT = 12 // For pagination display
  const SEARCH_LIMIT = 250 // For API requests (max Typesense limit)

  // ✅ Color name normalizer function (EXACTLY same as StoreTemplate)
  const normalizeColorName = (colorName: string): string => {
    return colorName
      .trim()
      // Add space before capital letters (camelCase to spaced)
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Handle common patterns
      .replace(/([a-z])(\d)/g, '$1 $2') // Add space before numbers
      .replace(/(\d)([a-z])/gi, '$1 $2') // Add space after numbers
      // Handle concatenated color words (SAME AS STORETEMPLATE)
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

  // 🔧 FIX: Product structure normalizer for search results
  const normalizeSearchProduct = (product: any) => {
    // Ensure consistent product structure for wishlist compatibility
    const normalizedProduct = {
      ...product,
      // Ensure variants array exists and has proper structure
      variants: product.variants?.map((variant: any) => ({
        ...variant,
        // Ensure variant has an ID (some search APIs might use different field names)
        id: variant.id || variant.variant_id || variant._id,
        // Ensure other required fields exist
        title: variant.title || '',
        sku: variant.sku || '',
        // Preserve all other variant data
      })) || [],
    }

    // Debug first few products in development
    if (process.env.NODE_ENV === 'development' && normalizedProduct.variants?.length > 0) {
      const firstVariant = normalizedProduct.variants[0]
      if (!firstVariant.id) {
        //console.warn(`⚠️ Product "${normalizedProduct.title}" has variant without ID:`, firstVariant)
      }
    }

    return normalizedProduct
  }
  

  // ✅ Add proper API headers helper
  const getApiHeaders = () => {
    const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_de22a6e19195388f210f847b142371b1bb3723cd97526e110fbe0bf5f44d9929"
    
    return {
      "Content-Type": "application/json",
      "x-publishable-api-key": apiKey,
    }
  }

  // ✅ Load filter data with proper headers
  useEffect(() => {
    const loadFilterData = async () => {
      setFiltersLoading(true)
      try {
        const backendUrl = process.env.MEDUSA_BACKEND_URL
        const headers = getApiHeaders()

        const [categoriesResponse, vendorsResponse] = await Promise.all([
          fetch(`${backendUrl}/store/categories`, { headers }),
          fetch(`${backendUrl}/store/vendors`, { headers }).catch(() => ({ json: () => ({ vendors: [] }) }))
        ])

        const categoriesResult = await categoriesResponse.json()
        let vendorsResult = { vendors: [] }
        
        try {
          vendorsResult = await vendorsResponse.json()
        } catch (e) {
          // //console.warn('Vendors endpoint not available, will extract from search results')
        }

        setCategoriesData(categoriesResult.categories || [])
        setVendorsData(vendorsResult.vendors || [])
        setAvailableColors([])
        
      } catch (error) {
        // //console.error('Error loading filter data:', error)
        setCategoriesData([])
        setVendorsData([])
        setAvailableColors([])
      } finally {
        setFiltersLoading(false)
      }
    }

    loadFilterData()
  }, [])

  // ✅ Apply filters CLIENT-SIDE - ENHANCED with StoreTemplate's EXACT color logic
  const applyFilters = (allProducts: any[]) => {
    let filteredProducts = [...allProducts]

    // Filter by vendors
    if (vendors) {
      const vendorList = vendors.split(',').map(v => v.trim().toLowerCase())
      filteredProducts = filteredProducts.filter(product => {
        const vendorName = product.vendor?.name?.toLowerCase() || ''
        const hasVendor = vendorList.some(vendor => vendorName.includes(vendor))
        return hasVendor
      })
    }

    // ✅ Filter by categories
    if (categories) {
      const categoryList = categories.split(',').map(c => c.trim().toLowerCase())
      filteredProducts = filteredProducts.filter(product => {
        let hasCategory = false
        
        if (product.categories && Array.isArray(product.categories)) {
          hasCategory = categoryList.some(category => 
            product.categories.some((cat: any) => 
              cat.name?.toLowerCase().includes(category) || 
              cat.handle?.toLowerCase().includes(category)
            )
          )
        }
        
        if (!hasCategory && product._raw_categories) {
          const rawCats = product._raw_categories.toLowerCase()
          hasCategory = categoryList.some(category => rawCats.includes(category))
        }
        
        return hasCategory
      })
    }

    // Filter by collections
    if (collections) {
      const collectionList = collections.split(',').map(c => c.trim().toLowerCase())
      filteredProducts = filteredProducts.filter(product => {
        const collectionHandle = product.collection?.handle?.toLowerCase() || ''
        const collectionTitle = product.collection?.title?.toLowerCase() || ''
        const hasCollection = collectionList.some(collection => 
          collectionHandle.includes(collection) || collectionTitle.includes(collection)
        )
        return hasCollection
      })
    }

    // ✅ CRITICAL FIX: Apply color filter using EXACT StoreTemplate logic with COMPLETE variant-specific image consideration
    if (colors) {
      const colorsArray = colors.split(',').map(c => c.trim()) // ✅ RAW colors, not normalized
      
      const beforeCount = filteredProducts.length
      const colorDebug = []
      
      // ✅ ENHANCED: More comprehensive color filtering (EXACT StoreTemplate logic + variant-specific images)
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
        const normalizedSelectedColors = colorsArray.map(c => 
          normalizeColorName(c).toLowerCase().trim()
        )
        
        const matches = normalizedSelectedColors.some(selectedColor => 
          productColors.has(selectedColor)
        )
        
        if (matches) {
          const matchedColors = normalizedSelectedColors.filter(selected => 
            productColors.has(selected)
          )
          colorDebug.push(`✅ ${product.title}: Matches [${matchedColors.join(', ')}] - Will show variant-specific image`)
        } else {
          colorDebug.push(`❌ ${product.title}: Has [${Array.from(productColors).join(', ')}] but need [${normalizedSelectedColors.join(', ')}]`)
        }
        
        return matches
      })
    }

    // 🔧 SIMPLIFIED PRICE FILTERING - Most common fix
  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split('-').map(p => parseFloat(p))
    
    filteredProducts = filteredProducts.filter(product => {
      let price = 0
      
      // Try multiple price sources with proper conversion
      if (product.variants?.[0]?.calculated_price?.calculated_amount) {
        price = product.variants[0].calculated_price.calculated_amount
        // Convert from cents to dollars if needed (most common case)
        if (price > 100) price = price
      } else if (product.calculated_price?.calculated_amount) {
        price = product.calculated_price.calculated_amount  
        if (price > 100) price = price
      } else if (product.price_info?.display_amount) {
        price = product.price_info.display_amount
      } else if (product.variants?.[0]?.prices?.[0]?.amount) {
        price = product.variants[0].prices[0].amount
        if (price > 100) price = price
      }
      
      // Skip products without valid prices
      if (price <= 0) return false
      
      const inRange = price >= minPrice && (maxPrice ? price <= maxPrice : true)
      
      // Debug first few products
      if (process.env.NODE_ENV === 'development' && filteredProducts.indexOf(product) < 3) {
        //console.log(`${inRange ? '✅' : '❌'} ${product.title}: ${price} (range: ${minPrice}-${maxPrice || '∞'})`)
      }
      
      return inRange
    })
  }

    return filteredProducts
  }

  // Sort products with improved price extraction
  const sortProducts = (products: any[], sortOption: SortOptions) => {
    const sorted = [...products]
    
    switch (sortOption) {
      case "price_asc":
        return sorted.sort((a, b) => {
          const priceA = a.price_info?.display_amount || a.calculated_price?.calculated_amount / 100 || a?.variants?.[0]?.calculated_price?.calculated_amount / 100 || 0
          const priceB = b.price_info?.display_amount || b.calculated_price?.calculated_amount / 100 || b?.variants?.[0]?.calculated_price?.calculated_amount / 100 || 0
          return priceA - priceB
        })
      case "price_desc":
        return sorted.sort((a, b) => {
          const priceA = a.price_info?.display_amount || a.calculated_price?.calculated_amount / 100 || a?.variants?.[0]?.calculated_price?.calculated_amount / 100 || 0
          const priceB = b.price_info?.display_amount || b.calculated_price?.calculated_amount / 100 || b?.variants?.[0]?.calculated_price?.calculated_amount / 100 || 0
          return priceB - priceA
        })
      case "title_asc":
        return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
      case "title_desc":
        return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''))
      case "created_at":
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  }

  // ✅ NEW: Paginate products for display
  const paginateProducts = (products: any[], currentPage: number, limit: number) => {
    const startIndex = (currentPage - 1) * limit
    const endIndex = startIndex + limit
    return products.slice(startIndex, endIndex)
  }

  // ✅ ENHANCED: Direct use of backend products (no transformation needed since backend now returns complete format)
  const performSearch = async (searchQuery: string) => {
    const backendUrl = process.env.MEDUSA_BACKEND_URL
    const searchUrl = `${backendUrl}/store/products/search`
    
    const requestBody = {
      query: searchQuery,
      limit: SEARCH_LIMIT,
      offset: 0,
      filter_by: "",
    }
    
    try {
      const response = await fetch(searchUrl, {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(requestBody),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`API Error: ${response.status} - ${errorData.message || 'Unknown error'}`)
      }

      const data = await response.json()
      
      // ✅ ENHANCED: Use complete products directly from backend (already transformed with complete variant-specific images)
      let searchProducts = []
      
      if (data.products && Array.isArray(data.products)) {
        // ✅ Backend now returns COMPLETE products with variant-specific images - use directly!
        searchProducts = data.products.map(normalizeSearchProduct)
      } else {
        searchProducts = []
      }
      
      // ✅ Extract available colors for filters (SAME AS STORETEMPLATE)
      const uniqueColors = new Map()
      const uniqueVendors = new Map()
      const uniqueCategories = new Map()
      const uniqueCollections = new Map()
      
      searchProducts.forEach((product) => {
        // Extract colors from product metadata
        if (product.metadata?.color_hex_values) {
          let colorsData = product.metadata.color_hex_values
          
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
                  // ✅ Normalize color name before storing (SAME AS STORETEMPLATE)
                  const normalizedName = normalizeColorName(color.name)
                  const colorKey = normalizedName.toLowerCase()
                  
                  uniqueColors.set(colorKey, {
                    name: normalizedName, // ✅ Store normalized name: "Light Pink"
                    hex: cleanHex
                  })
                }
              }
            })
          }
        }
        
        // ✅ ALSO extract colors from variant metadata (SAME AS STORETEMPLATE)
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
        
        // Extract other filter data
        if (product.vendor?.name) {
          uniqueVendors.set(product.vendor.name, product.vendor)
        }
        
        if (product.categories && Array.isArray(product.categories)) {
          product.categories.forEach(cat => {
            if (cat.name) {
              uniqueCategories.set(cat.name, cat)
            }
          })
        }
        
        if (product.collection?.title) {
          uniqueCollections.set(product.collection.title, product.collection)
        }
      })
      
      const availableColorsFromSearch = Array.from(uniqueColors.values())
      const availableVendorsFromSearch = Array.from(uniqueVendors.values())
      const availableCategoriesFromSearch = Array.from(uniqueCategories.values())
      const availableCollectionsFromSearch = Array.from(uniqueCollections.values())
      
      setAvailableColors(availableColorsFromSearch)
      setVendorsData(availableVendorsFromSearch)
      setCategoriesData(availableCategoriesFromSearch)
      setAvailableCollections(availableCollectionsFromSearch)
      
      return {
        products: searchProducts,
        count: searchProducts.length,
        total: data.total || searchProducts.length
      }
      
    } catch (error) {
      throw error
    }
  }

  // ✅ NEW: Separate effect to handle pagination when allProducts changes
  useEffect(() => {
    if (allProducts.length > 0) {
      // Calculate pagination
      const totalPagesCalculated = Math.ceil(allProducts.length / PRODUCT_LIMIT)
      setTotalPages(totalPagesCalculated)
      
      // Handle page overflow
      if (page > totalPagesCalculated && totalPagesCalculated > 0) {
        const params = new URLSearchParams(searchParams?.toString() || '')
        params.set('page', '1')
        router.push(`/${countryCode}/search?${params.toString()}`)
        return
      }
      
      // ✅ FIX: Paginate the products for display
      const paginatedProducts = paginateProducts(allProducts, page, PRODUCT_LIMIT)
      setDisplayProducts(paginatedProducts)
      
      // //console.log(`📄 [PAGINATION] Page ${page} of ${totalPagesCalculated}`)
      // //console.log(`📊 [PAGINATION] Showing ${paginatedProducts.length} of ${allProducts.length} total products`)
      // //console.log(`📍 [PAGINATION] Products ${((page - 1) * PRODUCT_LIMIT) + 1} - ${Math.min(page * PRODUCT_LIMIT, allProducts.length)}`)
      
    } else {
      setDisplayProducts([])
      setTotalPages(1)
    }
  }, [allProducts, page, router, countryCode, searchParams])

  // Effect to fetch products when query or filters change
  useEffect(() => {
    const fetchProducts = async () => {
      if (!query || !query.trim()) {
        setAllProducts([])
        setDisplayProducts([])
        setTotalCount(0)
        setTotalPages(1)
        setError(null)
        return
      }

      // //console.log('\n🚀 [FETCH] Starting product fetch process with pagination support')
      // //console.log('  Query:', query)
      // //console.log('  Current page:', page)
      // //console.log('  Filters:', { vendors, colors, collections, categories, priceRange })
      
      setLoading(true)
      setError(null)

      try {
        const searchResults = await performSearch(query.trim())
        let processedProducts = searchResults.products || []
        
        // //console.log('\n🔄 [PROCESSING] Post-search processing:')
        // //console.log('  Raw search results:', processedProducts.length)
        
        // Apply client-side filters
        processedProducts = applyFilters(processedProducts)
        ////console.log('  After filtering:', processedProducts.length)
        
        // Apply sorting
        processedProducts = sortProducts(processedProducts, sortBy)
        ////console.log('  After sorting:', processedProducts.length)
        
        // //console.log('\n✅ [FETCH SUCCESS] Search and processing complete:')
        // //console.log('  Final product count:', processedProducts.length)
        // //console.log('  Query:', query)
        // //console.log('  Active filters:', { vendors, colors, collections, categories, priceRange })

        // ✅ FIX: Store all products for pagination
        setAllProducts(processedProducts)
        setTotalCount(processedProducts.length)
        
      } catch (error) {
        ////console.error('❌ [FETCH ERROR] Search failed:', error)
        setError(`Failed to load search results: ${error.message}`)
        setAllProducts([])
        setDisplayProducts([])
        setTotalCount(0)
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [query, sortBy, vendors, colors, collections, categories, priceRange]) // ✅ Removed page from dependencies

  // Parse filter arrays for FilterHandlersWrapper
  const vendorsArray = vendors ? vendors.split(',') : []
  const colorsArray = colors ? colors.split(',') : [] // ✅ RAW colors from URL
  const collectionsArray = collections ? collections.split(',') : []
  const categoriesArray = categories ? categories.split(',') : []
  
  let minPrice, maxPrice
  if (priceRange) {
    const [min, max] = priceRange.split('-').map(p => parseFloat(p))
    minPrice = min
    maxPrice = max
  }

  return (
    <div className="py-6">
      <div className="flex flex-col small:flex-row small:items-start">
        {/* Sidebar with filters */}
        <div className={`w-full small:w-[300px] small:mr-6 ${showFilters ? 'block' : 'hidden small:block'}`}>
          {!filtersLoading && (
            <RefinementList
              sortBy={sortBy}
              search={true}
              vendors={vendorsData}
              categories={categoriesData} 
              products={allProducts} // ✅ Pass all products for filter counts
              availableColors={availableColors}
            />
          )}
          {filtersLoading && (
            <div className="p-4">
              <div className="space-y-4 animate-pulse">
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="w-full">
          {/* Mobile filter toggle */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg small:hidden"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Error State */}
          {error && !loading && (
            <div className="py-12 mb-6 text-center border border-red-200 rounded-lg bg-red-50">
              <div className="mb-4 text-red-600">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State for no query */}
          {!loading && !error && !query && (
            <div className="py-12 text-center bg-white rounded-lg shadow-sm">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Start your search</h3>
              <p className="text-gray-600">
                Enter a product name, brand, or category to find what you're looking for
              </p>
            </div>
          )}

          {/* Main title section */}
          <div className="mt-12 mb-8">
            <h1 className="mt-2 text-2xl-semi" data-testid="search-page-title">
              {query ? `Search results for "${query}"` : "Search"}
            </h1>
            <div className="mt-2 text-sm text-gray-600">
              {query ? (
                <span>
                  Found {totalCount} products matching "{query}"
                  {totalCount > 0 && (
                    <span className="ml-2">
                      (Showing {((page - 1) * PRODUCT_LIMIT) + 1} - {Math.min(page * PRODUCT_LIMIT, totalCount)})
                    </span>
                  )}
                </span>
              ) : (
                <span>Enter a search term to find products</span>
              )}
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <SortWrapper 
              sortBy={sortBy} 
              data-testid="sort-above-grid" 
            />
          </div>

          {/* No results state */}
          {query && !loading && !error && allProducts.length === 0 && (
            <div className="py-12 text-center rounded-lg bg-gray-50">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">No products found</h3>
              <p className="mb-4 text-gray-600">
                No products match "{query}"
                {(vendors || colors || collections || priceRange) && " with the selected filters"}
              </p>
              {(vendors || colors || collections || priceRange) && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams()
                    params.set('q', query)
                    router.push(`/${countryCode}/search?${params.toString()}`)
                  }}
                  className="px-4 py-2 bg-[#e65100] text-white rounded-lg hover:bg-[#e65100]-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* ✅ CRITICAL FIX: Pass paginated displayProducts to FilterHandlersWrapper */}
          {query && !error && displayProducts.length > 0 && (
            <FilterHandlersWrapper
              sortBy={sortBy}
              page={page}
              countryCode={countryCode}
              vendors={vendorsArray}
              colors={colorsArray} // ✅ Pass RAW colors for variant-specific image selection
              collections={collectionsArray}
              categories={categoriesArray}
              minPrice={minPrice}
              maxPrice={maxPrice}
              products={displayProducts} // ✅ FIX: Pass paginated products instead of all products
              totalCount={totalCount} // ✅ Total count of all filtered products
              totalPages={totalPages} // ✅ Total pages based on all filtered products
              region={region}
              vendorsData={vendorsData}
              collectionsData={availableCollections}
              categoriesData={categoriesData}
              availableColors={availableColors}
              selectedColors={colorsArray} // ✅ Pass RAW colors for variant-specific image switching
            />
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#e65100]-400 animate-spin" />
              <span className="ml-2 text-gray-600">Searching products...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}