// import React from 'react'

// const CreatorInstagram = ({vendorsList}) => {

// console.log(vendorsList)

  
  

//   return (
//     <section className="py-16 bg-orange-50">
//     <div className="container px-4 mx-auto">
//       <h2 className="mb-10 text-3xl font-bold text-center">Creator Spotlight</h2>
      
//       <div className="flex flex-col items-center overflow-hidden bg-white shadow-lg md:flex-row rounded-xl">
//         <div className="md:w-2/5">
//           <div className="bg-gray-200 aspect-square">
//             <img 
//               src="/api/placeholder/600/600" 
//               alt="Creator spotlight" 
//               className="object-cover w-full h-full"
//             />
//           </div>
//         </div>
//         <div className="p-6 md:w-3/5 md:p-10">
//           <div className="mb-6">
//             <span className="inline-block px-3 py-1 text-xs font-semibold bg-orange-100 rounded-full text-orange-primary">
//               FEATURED CREATOR
//             </span>
//           </div>
//           <h3 className="mb-4 text-2xl font-bold md:text-3xl">Creator Name</h3>
//           <p className="mb-6 text-lg text-gray-600">
//             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus.
//           </p>
//           <div className="flex flex-wrap gap-4 mb-6">
//             <div className="flex items-center">
//               <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
//               </svg>
//               <span className="text-gray-600">1.2M followers</span>
//             </div>
//             <div className="flex items-center">
//               <svg className="w-5 h-5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
//               </svg>
//               <span className="text-gray-600">950K followers</span>
//             </div>
//           </div>
//           <div className="grid grid-cols-3 gap-4 mb-6">
//             {[1, 2, 3].map((item) => (
//               <div key={item} className="p-3 text-center bg-gray-100 rounded-lg">
//                 <img src={`/api/placeholder/${150}/${150}`} alt={`Item ${item}`} className="object-cover w-full mb-2 rounded aspect-square" />
//                 <p className="text-sm font-medium">Item {item}</p>
//                 <p className="text-xs text-gray-500">$49.00</p>
//               </div>
//             ))}
//           </div>
//           <a 
//             href="#" 
//             className="inline-block bg-[#e65100] text-white px-8 py-3 font-medium rounded-md hover:bg-[#d84315] transition"
//           >
//             Shop Collection
//           </a>
//         </div>
//       </div>
//     </div>
//   </section>
  
//   )
// }

// export default CreatorInstagram

"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { retriveVendors } from '@lib/data/vendors'
import { listProducts } from '@lib/data/products'
import { listRegions } from '@lib/data/regions'

interface Vendor {
  id: string;
  name: string;
  logo: string;
  handle: string;
  creator_bio?: string;
  metadata?: {
    creator_spotlight?: boolean | string;
    display_name?: string;
    bio?: string;
    profile_image?: string;
    instagram_followers?: number;
    youtube_followers?: number;
    shop_url?: string;
    instagram_url?: string;
    youtube_url?: string;
    twitter_url?: string;
  };
  instagram?: string;
  youtube?: string;
  xtwitter?: string;
}

const CreatorInstagram = () => {
  const [spotlightVendor, setSpotlightVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vendorProducts, setVendorProducts] = useState<any[]>([])
  const [productLoading, setProductLoading] = useState(false)
  const [productError, setProductError] = useState<string | null>(null)
  const [currentRegion, setCurrentRegion] = useState<any>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasTriedAlternativeRegion, setHasTriedAlternativeRegion] = useState(false)
  
  const scrollContainerRef = useRef(null)
  const autoScrollIntervalRef = useRef(null)

  // Debug logging function
  const debugLog = (message: string, data?: any) => {
    console.log(`[CreatorInstagram Debug] ${message}`, data || '')
  }

  // Separate function to fetch products with better error handling
  const fetchVendorProducts = async (vendorId: string, vendorName: string, regionId: string, isRetry: boolean = false) => {
    try {
      setProductLoading(true)
      setProductError(null)
      debugLog('Fetching products for vendor:', { vendorId, vendorName, regionId, isRetry })

      const queryParams = {
        fields: "*vendor,*variants.calculated_price,*variants.prices,*variants,*calculated_price,*prices",
        limit: 100
        // Removed vendor_id as it's not supported by the API
      }
      
      debugLog('API Query Parameters:', queryParams)
      debugLog('API Region ID:', regionId)

      const productResponse = await listProducts({
        regionId,
        queryParams,
      })

      debugLog('Product API response:', productResponse)

      const allProducts = productResponse?.response?.products || productResponse?.products || []
      debugLog('All products received:', { count: allProducts.length, products: allProducts })

      // Debug first product structure in detail
      if (allProducts.length > 0) {
        debugLog('=== FIRST PRODUCT STRUCTURE DEBUG ===')
        debugLog('First product keys:', Object.keys(allProducts[0]))
        debugLog('First product full object:', allProducts[0])
        debugLog('First product pricing fields:', {
          calculated_price: allProducts[0].calculated_price,
          price: allProducts[0].price,
          prices: allProducts[0].prices,
          variants: allProducts[0].variants
        })
        if (allProducts[0].variants && allProducts[0].variants.length > 0) {
          debugLog('First product first variant:', allProducts[0].variants[0])
          debugLog('First product first variant pricing:', {
            calculated_price: allProducts[0].variants[0].calculated_price,
            price: allProducts[0].variants[0].price,
            prices: allProducts[0].variants[0].prices
          })
        }
        debugLog('=== END FIRST PRODUCT STRUCTURE DEBUG ===')
      }

      if (!allProducts.length) {
        debugLog('No products found in API response')
        setVendorProducts([])
        return []
      }

      // More flexible filtering logic
      const filteredProducts = allProducts.filter((product: any) => {
        // Try multiple ways to match the vendor
        const matchesVendorId = product.vendor_id === vendorId
        const matchesVendorObjectId = product.vendor?.id === vendorId
        const matchesVendorName = product.vendor?.name === vendorName
        const matchesVendorHandle = product.vendor?.handle === spotlightVendor?.handle
        
        // Special case for Junooni X
        const isJunooniProduct = vendorName === "Junooni X" && (
          product.vendor?.name === "Junooni X" ||
          product.title?.toLowerCase().includes("junooni") ||
          product.vendor?.handle?.toLowerCase().includes("junooni")
        )

        const isMatch = matchesVendorId || matchesVendorObjectId || matchesVendorName || matchesVendorHandle || isJunooniProduct
        
        if (isMatch) {
          debugLog('Product matched:', {
            productTitle: product.title,
            productVendorId: product.vendor_id,
            productVendorName: product.vendor?.name,
            productVendorHandle: product.vendor?.handle,
            matchType: {
              matchesVendorId,
              matchesVendorObjectId,
              matchesVendorName,
              matchesVendorHandle,
              isJunooniProduct
            }
          })
        }

        return isMatch
      })

      debugLog('Filtered products:', { count: filteredProducts.length, products: filteredProducts })

      // Transform products for display
      const transformedProducts = filteredProducts.slice(0, 8).map((product: any, index: number) => {
        // Better image URL handling
        let imageUrl = "/api/placeholder/150/150"
        if (product.thumbnail) {
          imageUrl = product.thumbnail
        } else if (product.images && product.images.length > 0) {
          imageUrl = product.images[0].url || product.images[0]
        } else if (product.image) {
          imageUrl = product.image
        }
        
        debugLog('Product image URL:', { title: product.title, imageUrl, thumbnail: product.thumbnail, images: product.images })
        
        // Enhanced pricing debugging
        debugLog('=== PRICING DEBUG START ===')
        debugLog('Product:', product.title)
        debugLog('Raw product pricing data:', {
          calculated_price: product.calculated_price,
          variants: product.variants,
          price: product.price,
          prices: product.prices
        })
        
        // Try multiple pricing sources
        let calculatedPrice = null
        
        // Method 1: Direct calculated_price
        if (product.calculated_price) {
          calculatedPrice = product.calculated_price
          debugLog('Found pricing method 1 (direct calculated_price):', calculatedPrice)
          debugLog('Currency code in method 1:', calculatedPrice.currency_code)
        }
        
        // Method 2: First variant's calculated_price
        else if (product.variants && product.variants.length > 0) {
          debugLog('Checking variants for pricing. Total variants:', product.variants.length)
          
          for (let i = 0; i < product.variants.length; i++) {
            const variant = product.variants[i]
            debugLog(`Variant ${i} pricing data:`, {
              calculated_price: variant.calculated_price,
              price: variant.price,
              prices: variant.prices
            })
            
            if (variant.calculated_price) {
              calculatedPrice = variant.calculated_price
              debugLog(`Found pricing method 2 (variant ${i} calculated_price):`, calculatedPrice)
              debugLog(`Currency code in variant ${i}:`, calculatedPrice.currency_code)
              break
            }
          }
        }
        
        // Method 3: Check if there's a price field
        else if (product.price) {
          calculatedPrice = product.price
          debugLog('Found pricing method 3 (direct price):', calculatedPrice)
          debugLog('Currency code in method 3:', calculatedPrice?.currency_code)
        }
        
        // Method 4: Check if there's a prices array
        else if (product.prices && product.prices.length > 0) {
          calculatedPrice = product.prices[0]
          debugLog('Found pricing method 4 (prices array):', calculatedPrice)
          debugLog('Currency code in method 4:', calculatedPrice?.currency_code)
        }
        
        debugLog('Final calculated price for', product.title, ':', calculatedPrice)
        debugLog('=== PRICING DEBUG END ===')
        
        const transformedProduct = {
          id: product.id || `product-${index}`,
          title: product.title || "Unnamed Product",
          thumbnail: imageUrl,
          calculated_price: calculatedPrice,
          vendor_id: product.vendor_id,
          vendor: product.vendor,
          handle: product.handle
        }
        
        // Debug the product URL that will be generated
        const productUrl = transformedProduct.handle 
          ? `/products/${transformedProduct.handle}` 
          : `/products/${transformedProduct.id}`
        debugLog('Product URL generated:', { title: transformedProduct.title, handle: transformedProduct.handle, id: transformedProduct.id, url: productUrl })
        
        return transformedProduct
      })

      debugLog('Transformed products:', transformedProducts)
      
      // Debug final pricing data for all products
      debugLog('=== FINAL PRICING SUMMARY ===')
      transformedProducts.forEach((product, index) => {
        debugLog(`Product ${index + 1}: ${product.title}`)
        debugLog(`- Has calculated_price:`, !!product.calculated_price)
        debugLog(`- calculated_price value:`, product.calculated_price)
        debugLog(`- Will display price:`, product.calculated_price ? 
          `${product.calculated_price.currency_code === 'INR' ? '₹' : '$'}${product.calculated_price.calculated_amount?.toFixed(2)}` :
          'Price unavailable'
        )
      })
      debugLog('=== END FINAL PRICING SUMMARY ===')
      
      setVendorProducts(transformedProducts)
      return transformedProducts

    } catch (err: any) {
      debugLog('Error fetching vendor products:', err)
      
      // Check if this is a region-related error and we haven't already tried an alternative
      if (!isRetry && err.message && err.message.includes('Region with id') && err.message.includes('not found')) {
        debugLog('Region not found error detected, attempting to find alternative region')
        setHasTriedAlternativeRegion(true)
        
        // Try to fetch regions again and use a different one
        try {
          const regionsData = await listRegions()
          const alternativeRegions = regionsData?.filter(r => r.id !== regionId && r.countries && r.countries.length > 0) || []
          
          if (alternativeRegions.length > 0) {
            const newRegion = alternativeRegions[0]
            debugLog('Trying alternative region:', newRegion)
            setCurrentRegion(newRegion)
            
            // Try with the new region (with isRetry=true to prevent infinite loops)
            return await fetchVendorProducts(vendorId, vendorName, newRegion.id, true)
          }
        } catch (regionErr) {
          debugLog('Failed to fetch alternative regions:', regionErr)
        }
        
        setProductError('Unable to load products: Region configuration issue. Please try refreshing the page.')
      } else {
        setProductError(`Failed to load products: ${err.message}`)
      }
      
      setVendorProducts([])
      return []
    } finally {
      setProductLoading(false)
    }
  }

  // Main data fetching effect
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        setError(null)
        setHasTriedAlternativeRegion(false) // Reset alternative region flag
        debugLog('Starting data fetch...')

        // Fetch regions and vendors in parallel
        const [regionsData, vendorsData] = await Promise.all([
          listRegions(),
          retriveVendors()
        ])

        debugLog('Regions data:', regionsData)
        debugLog('Vendors data:', vendorsData)

        // Handle region selection with better validation
        let selectedRegion = null
        if (regionsData?.length > 0) {
          // Try to find a region that's likely to work (e.g., has countries defined)
          selectedRegion = regionsData.find(region => 
            region.countries && region.countries.length > 0
          ) || regionsData[0]
          
          debugLog('Available regions:', regionsData.map(r => ({ id: r.id, name: r.name, countries: r.countries?.length || 0 })))
          setCurrentRegion(selectedRegion)
        }

        debugLog('Selected region:', selectedRegion)

        // Find spotlight vendor
        if (!vendorsData?.length) {
          throw new Error("No vendors found in API response")
        }

        const spotlightVendors = vendorsData.filter((vendor: Vendor) => {
          const spotlightValue = vendor.metadata?.creator_spotlight
          return spotlightValue === true || spotlightValue === 'true'
        })

        debugLog('Spotlight vendors found:', spotlightVendors)

        if (!spotlightVendors.length) {
          throw new Error("No creator spotlight vendors found")
        }

        const rawVendor = spotlightVendors[0]
        const transformedVendor: Vendor = {
          id: rawVendor.id,
          name: rawVendor.name,
          logo: rawVendor.logo,
          handle: rawVendor.handle,
          creator_bio: rawVendor.creator_bio,
          metadata: {
            creator_spotlight: true,
            display_name: rawVendor.metadata?.display_name || rawVendor.name,
            bio: rawVendor.metadata?.bio || rawVendor.creator_bio || 'Discover amazing products from this featured creator.',
            profile_image: rawVendor.metadata?.profile_image || rawVendor.logo,
            instagram_followers: rawVendor.metadata?.instagram_followers || 950000,
            youtube_followers: rawVendor.metadata?.youtube_followers || 1200000,
            shop_url: rawVendor.metadata?.shop_url || `/creator/${rawVendor.handle}`,
            instagram_url: rawVendor.metadata?.instagram_url || rawVendor.instagram,
            youtube_url: rawVendor.metadata?.youtube_url || rawVendor.youtube,
            twitter_url: rawVendor.metadata?.twitter_url || rawVendor.xtwitter
          }
        }

        debugLog('Transformed vendor:', transformedVendor)
        setSpotlightVendor(transformedVendor)

        // Fetch products after vendor is set
        if (selectedRegion?.id) {
          debugLog('Fetching products for vendor...')
          await fetchVendorProducts(transformedVendor.id, transformedVendor.name, selectedRegion.id)
        } else {
          debugLog('No region selected, skipping product fetch')
          setProductError('No region available for product pricing')
        }

      } catch (err: any) {
        debugLog('Error in fetchAllData:', err)
        setError(`Failed to load creator spotlight: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [])

  // Separate effect to fetch products when vendor or region changes
  useEffect(() => {
    if (spotlightVendor && currentRegion?.id && !loading) {
      debugLog('Vendor or region changed, refetching products...')
      fetchVendorProducts(spotlightVendor.id, spotlightVendor.name, currentRegion.id)
    }
  }, [spotlightVendor?.id, currentRegion?.id])

  // Reset scroll position when products change
  useEffect(() => {
    if (vendorProducts.length > 0) {
      setCurrentIndex(0)
      scrollToIndex(0)
    }
  }, [vendorProducts.length])

  // Auto-scroll effect with actual scrolling
  useEffect(() => {
    if (vendorProducts.length > 2) {
      autoScrollIntervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const newIndex = (prev + 1) % vendorProducts.length
          // Scroll to the new index
          scrollToIndex(newIndex)
          return newIndex
        })
      }, 4000)

      return () => {
        if (autoScrollIntervalRef.current) {
          clearInterval(autoScrollIntervalRef.current)
        }
      }
    }
  }, [vendorProducts.length])

  // Function to scroll to specific index
  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) {
      debugLog('Scroll container ref not available')
      return
    }
    
    const container = scrollContainerRef.current
    // Calculate card width based on screen size
    const isMobile = window.innerWidth < 768
    const cardWidth = isMobile ? 144 + 8 : 208 + 16 // w-36 (144px) + gap-2 (8px) mobile, w-52 (208px) + gap-4 (16px) desktop
    const scrollPosition = index * cardWidth
    
    debugLog('Scrolling to index:', { 
      index, 
      cardWidth, 
      scrollPosition, 
      isMobile, 
      containerWidth: container.clientWidth,
      scrollWidth: container.scrollWidth
    })
    
    try {
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
    } catch (error) {
      debugLog('Scroll error:', error)
      // Fallback scroll method
      container.scrollLeft = scrollPosition
    }
  }

  const handleManualScroll = (direction: 'left' | 'right') => {
    // Clear auto-scroll when user manually scrolls
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current)
    }
    
    const newIndex = direction === 'left' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(vendorProducts.length - 1, currentIndex + 1)
    
    debugLog('Manual scroll:', { direction, currentIndex, newIndex, vendorProductsLength: vendorProducts.length })
    
    setCurrentIndex(newIndex)
    
    // Use setTimeout to ensure state has updated
    setTimeout(() => {
      scrollToIndex(newIndex)
    }, 10)
  }

  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`
    return count?.toString() || '0'
  }

  // Retry function for products
  const retryFetchProducts = () => {
    if (spotlightVendor && currentRegion?.id) {
      setHasTriedAlternativeRegion(false) // Reset the flag for retry
      fetchVendorProducts(spotlightVendor.id, spotlightVendor.name, currentRegion.id)
    }
  }

  if (loading) {
    return (
      <section className="py-8 md:py-16 bg-orange-50">
        <div className="container px-1 mx-auto">
          <div className="flex items-center justify-center">
            <div className="text-base text-gray-600 md:text-lg">Loading creator spotlight...</div>
          </div>
        </div>
      </section>
    )
  }

  if (error || !spotlightVendor) {
    return (
      <section className="py-8 md:py-16 bg-orange-50">
        <div className="container px-1 mx-2 sm:mx-4 sm:px-4">
          <div className="text-center text-gray-600">
            <p className="text-sm md:text-base">{error || 'No creator spotlight available'}</p>
            {process.env.NODE_ENV === 'development' && (
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-xs text-blue-500 underline"
              >
                Retry (Dev Mode)
              </button>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 md:py-16 bg-white">
      <div className="container px-0 mx-auto sm:px-4">
        <h2 className="mb-4 text-2xl font-bold text-center md:mb-10 md:text-3xl">Creator Spotlight</h2>
        
        <div className="flex flex-col items-center overflow-hidden bg-white md:flex-row rounded-xl">
          {/* Image Section */}
          <div className="w-full md:w-2/5">
            <div className="bg-gray-200 aspect-square">
              <img 
                src={spotlightVendor.metadata?.profile_image || spotlightVendor.logo || "/api/placeholder/600/600"} 
                alt={`${spotlightVendor.name} spotlight`}
                className="object-cover w-full h-full"
                loading="lazy"
              />
            </div>
          </div>
          
          {/* Content Section */}
          <div className="w-full px-3 py-4 sm:p-4 md:p-6 lg:p-10 md:w-3/5">
            {/* Featured Creator Badge */}
            <div className="mb-4 md:mb-6">
              <span className="inline-block px-2 py-1 text-xs font-semibold bg-orange-100 rounded-full md:px-3 text-orange-primary">
                FEATURED CREATOR
              </span>
            </div>
            
            {/* Creator Name */}
            <h3 className="mb-3 text-xl font-bold md:mb-4 md:text-2xl lg:text-3xl">
              {spotlightVendor.metadata?.display_name || spotlightVendor.name}
            </h3>
            
            {/* Creator Bio */}
            <p className="mb-4 text-sm leading-relaxed text-gray-600 md:mb-6 md:text-base lg:text-lg">
              {spotlightVendor.metadata?.bio || spotlightVendor.creator_bio || 
               'Discover amazing products from this featured creator.'}
            </p>
            
            {/* Social Media Stats and Links */}
            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between md:gap-4 md:mb-6">
              {/* Follower Stats */}
              <div className="flex flex-wrap gap-3 md:gap-4">
                {spotlightVendor.metadata?.youtube_followers && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                    <span className="text-xs text-gray-600 md:text-sm">
                      {formatFollowerCount(spotlightVendor.metadata.youtube_followers)} followers
                    </span>
                  </div>
                )}
                
                {spotlightVendor.metadata?.instagram_followers && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/>
                    </svg>
                    <span className="text-xs text-gray-600 md:text-sm">
                      {formatFollowerCount(spotlightVendor.metadata.instagram_followers)} followers
                    </span>
                  </div>
                )}
              </div>
              
              {/* Social Media Links */}
              <div className="flex gap-3 md:gap-4">
                {spotlightVendor.metadata?.instagram_url && (
                  <a 
                    href={spotlightVendor.metadata.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 transition-colors rounded-full hover:text-pink-500 hover:bg-pink-50"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z"/>
                    </svg>
                  </a>
                )}
                
                {spotlightVendor.metadata?.youtube_url && (
                  <a 
                    href={spotlightVendor.metadata.youtube_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 transition-colors rounded-full hover:text-red-500 hover:bg-red-50"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Featured Products Section */}
            <div className="mb-4 md:mb-6">
              <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-center sm:justify-between md:mb-4">
                <h4 className="text-base font-semibold md:text-lg">Featured Products</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 md:text-sm">
                    {vendorProducts.length} product{vendorProducts.length !== 1 ? 's' : ''}
                  </span>
                  {productLoading && (
                    <div className="w-4 h-4 border-2 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
                  )}
                </div>
              </div>
              
              {/* Product Loading State */}
              {productLoading && (
                <div className="flex justify-center py-6 md:py-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full md:w-16 md:h-16 md:mb-4">
                      <div className="w-6 h-6 border-2 border-orange-500 rounded-full animate-spin border-t-transparent md:w-8 md:h-8"></div>
                    </div>
                    <p className="text-sm text-gray-600 md:text-base">Loading products...</p>
                  </div>
                </div>
              )}

              {/* Product Error State */}
              {productError && !productLoading && (
                <div className="flex justify-center py-6 md:py-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full md:w-16 md:h-16 md:mb-4">
                      <svg className="w-6 h-6 text-red-500 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="mb-2 text-sm text-red-600 md:text-base">{productError}</p>
                    <button 
                      onClick={retryFetchProducts}
                      className="text-xs text-blue-500 underline md:text-sm hover:text-blue-700"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}
              
              {/* Products Display */}
              {vendorProducts.length > 0 && !productLoading ? (
                <div className="relative">
                  {/* Navigation Buttons */}
                  {vendorProducts.length > 2 && (
                    <>
                      <button
                        onClick={() => handleManualScroll('left')}
                        disabled={currentIndex === 0}
                        className="absolute left-0 z-10 p-1.5 md:p-2 transition-all -translate-y-1/2 rounded-full shadow-lg top-1/2 bg-white/90 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4 text-gray-600 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleManualScroll('right')}
                        disabled={currentIndex === vendorProducts.length - 1}
                        className="absolute right-0 z-10 p-1.5 md:p-2 transition-all -translate-y-1/2 rounded-full shadow-lg top-1/2 bg-white/90 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4 text-gray-600 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Product Cards Container */}
                  <div 
                    ref={scrollContainerRef}
                    className="flex gap-2 px-2 pb-4 overflow-x-auto md:gap-4 md:px-4 scroll-smooth snap-x snap-mandatory"
                    style={{ 
                      scrollbarWidth: 'none', 
                      msOverflowStyle: 'none',
                      WebkitScrollSnapType: 'x mandatory'
                    }}
                  >
                    {vendorProducts.map((product, index) => {
                      // Construct product URL - using handle if available, otherwise fallback to id
                      const productUrl = product.handle 
                        ? `/products/${product.handle}` 
                        : `/products/${product.id}`
                      
                      return (
                        <Link 
                          key={product.id}
                          href={productUrl}
                          className={`flex-shrink-0 w-36 md:w-52 p-2 md:p-3 text-center transition-all duration-300 rounded-lg cursor-pointer snap-start hover:shadow-md ${
                            index === currentIndex 
                              ? 'bg-gray-100 hover:bg-gray-200 transform scale-102' 
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <div className="relative mb-2 md:mb-3 aspect-square">
                            <img 
                              src={product.thumbnail} 
                              alt={product.title}
                              className="object-cover w-full h-full transition-transform rounded hover:scale-105"
                              loading="lazy"
                              onError={(e) => {
                                debugLog('Image failed to load:', product.thumbnail)
                                // Set fallback image on error
                                const target = e.target as HTMLImageElement
                                target.src = "/api/placeholder/150/150"
                              }}
                            />
                            {/* Loading indicator for images */}
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded opacity-0">
                              <div className="w-6 h-6 border-2 border-gray-300 rounded-full animate-spin border-t-transparent"></div>
                            </div>
                          </div>
                          <p className="text-xs md:text-sm font-medium mb-1 md:mb-2 line-clamp-2 min-h-[2rem] md:min-h-[2.5rem] hover:text-orange-600 transition-colors">
                            {product.title}
                          </p>
                          <p className="text-xs font-medium text-gray-500">
                            {(() => {
                              const price = product.calculated_price
                              debugLog('=== CURRENCY DEBUG START ===')
                              debugLog('Rendering price for', product.title)
                              debugLog('Full price object:', price)
                              
                              if (price) {
                                // Enhanced currency detection
                                const detectCurrency = (currencyCode) => {
                                  debugLog('Raw currency_code:', currencyCode, typeof currencyCode)
                                  
                                  if (!currencyCode) {
                                    debugLog('No currency code found, defaulting to ₹')
                                    return '₹' // Default to INR if no currency code
                                  }
                                  
                                  const code = String(currencyCode).toUpperCase()
                                  debugLog('Normalized currency code:', code)
                                  
                                  // More robust currency detection
                                  if (code === 'INR' || code === 'RS' || code === 'RUPEES' || code === 'RUPEE') {
                                    debugLog('Detected Indian currency')
                                    return '₹'
                                  } else if (code === 'USD' || code === 'DOLLAR' || code === 'DOLLARS') {
                                    debugLog('Detected US currency')
                                    return '$'
                                  } else {
                                    debugLog('Unknown currency code, defaulting to ₹')
                                    return '₹' // Default to INR for unknown currencies
                                  }
                                }
                                
                                // Handle different price object structures
                                if (price.calculated_amount !== undefined) {
                                  const symbol = detectCurrency(price.currency_code)
                                  const amount = price.calculated_amount.toFixed(2)
                                  debugLog('Using calculated_amount:', amount, 'with symbol:', symbol)
                                  return `${symbol}${amount}`
                                } else if (price.amount !== undefined) {
                                  const symbol = detectCurrency(price.currency_code)
                                  const amount = price.amount.toFixed(2)
                                  debugLog('Using amount:', amount, 'with symbol:', symbol)
                                  return `${symbol}${amount}`
                                } else if (typeof price === 'number') {
                                  debugLog('Price is raw number:', price, 'defaulting to ₹')
                                  return `₹${price.toFixed(2)}` // Default to INR for raw numbers
                                } else if (price.original_amount) {
                                  const symbol = detectCurrency(price.currency_code)
                                  const amount = price.original_amount.toFixed(2)
                                  debugLog('Using original_amount:', amount, 'with symbol:', symbol)
                                  return `${symbol}${amount}`
                                } else {
                                  debugLog('Unknown price structure for', product.title, ':', price)
                                  return 'Price unavailable'
                                }
                              }
                              debugLog('=== CURRENCY DEBUG END ===')
                              return 'Price unavailable'
                            })()}
                          </p>
                        </Link>
                      )
                    })}
                    
                    {/* View All Card */}
                    <Link 
                      href={spotlightVendor.metadata?.shop_url || `/creator/${spotlightVendor.handle}` || "#"}
                      className="flex-shrink-0 p-2 text-center transition-colors border-2 border-orange-300 border-dashed rounded-lg cursor-pointer w-36 md:w-48 md:p-3 bg-gradient-to-br from-orange-100 to-orange-200 hover:border-orange-400 hover:shadow-md"
                    >
                      <div className="flex items-center justify-center w-full h-full">
                        <div>
                          <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-white rounded-full md:w-12 md:h-12 md:mb-3">
                            <svg className="w-4 h-4 text-orange-500 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <p className="mb-1 text-xs font-medium text-orange-700 md:text-sm">View All</p>
                          <p className="hidden text-xs text-orange-600 md:block">See complete collection</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              ) : (
                // No products found state (only show if not loading and no error)
                !productLoading && !productError && (
                  <div className="flex justify-center py-6 md:py-8">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-full md:w-16 md:h-16 md:mb-4">
                        <svg className="w-6 h-6 text-gray-400 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                        </svg>
                      </div>
                      <p className="mb-2 text-sm text-gray-500 md:text-base">No products available</p>
                      <p className="text-xs text-gray-400 md:text-sm">Check back soon for new arrivals!</p>
                      {process.env.NODE_ENV === 'development' && (
                        <button 
                          onClick={retryFetchProducts}
                          className="mt-2 text-xs text-blue-500 underline"
                        >
                          Retry Fetch (Dev Mode)
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Shop Collection Button */}
            <a 
              href={spotlightVendor.metadata?.shop_url || `/creator/${spotlightVendor.handle}` || "#"} 
              className="inline-block w-full md:w-auto text-center bg-[#e65100] text-white px-6 md:px-8 py-3 font-medium rounded-md hover:bg-[#d84315] transition"
            >
              Shop Collection
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CreatorInstagram