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

interface CreatorInstagramProps {
  region?: {
    id: string;
    currency_code: string;
  };
  countryCode?: string; // Add country code as an option
}

const CreatorInstagram = ({ region, countryCode = 'us' }: CreatorInstagramProps = {}) => {
  const [spotlightVendor, setSpotlightVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vendorProducts, setVendorProducts] = useState<any[]>([])
  const [currentRegion, setCurrentRegion] = useState<any>(region)
  
  // Auto-scroll states
  const scrollContainerRef = useRef(null)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const autoScrollIntervalRef = useRef(null)

  // Get region using the same approach as CollectionPage
  useEffect(() => {
    const getRegion = async () => {
      if (!currentRegion) {
        try {
          console.log("🌍 Getting regions using listRegions() - same as CollectionPage");
          const regions = await listRegions();
          console.log("✅ Available regions:", regions);
          
          if (regions && regions.length > 0) {
            // Find region by country code, or use first available region
            let selectedRegion = regions[0]; // Default to first region
            
            if (countryCode) {
              const regionByCountry = regions.find(region => 
                region.countries?.some(country => country.iso_2 === countryCode)
              );
              if (regionByCountry) {
                selectedRegion = regionByCountry;
                console.log(`🎯 Found region for country ${countryCode}:`, selectedRegion.id);
              } else {
                console.log(`⚠️ No region found for country ${countryCode}, using default:`, selectedRegion.id);
              }
            }
            
            setCurrentRegion(selectedRegion);
          } else {
            console.error("❌ No regions available");
            setError("No regions available");
          }
        } catch (regionError) {
          console.error("❌ Error fetching regions:", regionError);
          setError("Failed to fetch regions");
        }
      }
    };

    getRegion();
  }, [currentRegion, countryCode]);

  useEffect(() => {
    if (currentRegion) {
      fetchSpotlightVendor();
    }
  }, [currentRegion])

  const fetchSpotlightVendor = async () => {
    console.log("🚀 Starting fetchSpotlightVendor function...")
    try {
      setLoading(true)
      setError(null)
      
      console.log("🔍 Calling retriveVendors() - same as VendorList...")
      const vendorData = await retriveVendors()
      
      console.log("✅ Retrieved vendor data:", vendorData)
      
      if (!vendorData || vendorData.length === 0) {
        setError("No vendors found")
        setLoading(false)
        return
      }
      
      const spotlightVendors = vendorData.filter((vendor: Vendor) => {
        const spotlightValue = vendor.metadata?.creator_spotlight
        return spotlightValue === true || spotlightValue === 'true'
      })

      console.log("Final spotlight vendors:", spotlightVendors)

      if (spotlightVendors.length > 0) {
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
          },
          instagram: rawVendor.instagram,
          youtube: rawVendor.youtube,
          xtwitter: rawVendor.xtwitter
        }
        
        console.log("Transformed vendor:", transformedVendor)
        setSpotlightVendor(transformedVendor)
      } else {
        console.log("No spotlight vendors found")
        setError("No creator spotlight available - Please check if there are vendors with creator_spotlight set to true in the database.")
      }
      
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching spotlight vendor:', err)
      setError(`Failed to load creator spotlight: ${err.message}`)
      setLoading(false)
    }
  }

  const getVendorProducts = async (vendorId: string, vendorName: string) => {
    try {
      console.log("🛍️ Getting products using listProducts() for vendor:", vendorName)
      console.log("🔍 Vendor ID:", vendorId)
      console.log("🌍 Using region:", currentRegion?.id)
      
      if (!currentRegion?.id) {
        console.error("❌ No region ID available");
        return [];
      }
      
      // Use the same pattern as ProductRail component
      const {
        response: { products: allProducts },
      } = await listProducts({
        regionId: currentRegion.id,
        queryParams: {
          fields: "*vendor,*tags,*metadata,*variants.calculated_price",
          limit: 100,
        },
      })
      
      console.log("✅ Successfully fetched products!")
      console.log("📦 Total products fetched:", allProducts?.length)
      
      if (!allProducts || allProducts.length === 0) {
        console.log("❌ No products found from listProducts()")
        return []
      }

      // Filter products for the specific vendor
      const filteredProducts = allProducts.filter((product: any) => {
        const matchesVendorId = product.vendor_id === vendorId
        const matchesVendorName = product.vendor?.name === vendorName || product.vendor_name === vendorName
        const matchesVendor = product.vendor?.id === vendorId
        const matchesMetadata = product.metadata?.vendor_id === vendorId
        const matchesJunoniX = vendorName === "Junooni X" && (
          product.vendor?.name === "Junooni X" ||
          product.vendor_name === "Junooni X" ||
          product.title?.toLowerCase().includes("junooni") ||
          product.description?.toLowerCase().includes("junooni")
        )
        
        const isMatch = matchesVendorId || matchesVendorName || matchesVendor || matchesMetadata || matchesJunoniX
        
        if (isMatch) {
          console.log("✅ Found matching product:", product.title, "for vendor:", vendorName)
          console.log("   - Product vendor info:", {
            vendor_id: product.vendor_id,
            vendor_name: product.vendor_name,
            vendor: product.vendor
          })
        }
        
        return isMatch
      })

      console.log("📋 Products after filtering for", vendorName + ":", filteredProducts.length)
      
      if (filteredProducts.length === 0) {
        console.log("⚠️ No products found for vendor:", vendorName)
        console.log("🔍 Sample product structure for debugging:")
        if (allProducts.length > 0) {
          console.log("First product:", allProducts[0])
          console.log("First product vendor info:", {
            vendor_id: allProducts[0].vendor_id,
            vendor_name: allProducts[0].vendor_name,
            vendor: allProducts[0].vendor
          })
        }
      }

      // Transform products to match expected structure
      const transformedProducts = filteredProducts.map((product: any, index: number) => {
        return {
          id: product.id || `product-${index}`,
          title: product.title || product.name || "Unnamed Product",
          thumbnail: product.thumbnail || product.image_url || product.images?.[0]?.url,
          images: product.images || [],
          variants: product.variants || [],
          calculated_price: product.calculated_price || product.variants?.[0]?.calculated_price,
          price: product.price,
          price_range: product.price_range,
          vendor_id: product.vendor_id,
          vendor: product.vendor
        }
      })
      
      console.log("🎯 Final vendor products count:", transformedProducts.length)
      return transformedProducts
      
    } catch (err) {
      console.error('❌ Error fetching vendor products:', err)
      return []
    }
  }

  useEffect(() => {
    if (spotlightVendor && currentRegion) {
      getVendorProducts(spotlightVendor.id, spotlightVendor.name).then(setVendorProducts)
    }
  }, [spotlightVendor, currentRegion])

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoScrolling && vendorProducts.length > 0) {
      autoScrollIntervalRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % vendorProducts.length
          scrollToIndex(nextIndex)
          return nextIndex
        })
      }, 3000)
    }

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
      }
    }
  }, [isAutoScrolling, vendorProducts.length])

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = window.innerWidth < 768 ? 160 : 200 // Responsive card width
      const scrollPosition = index * cardWidth
      ;(scrollContainerRef.current as HTMLElement).scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
    }
  }

  const handleManualScroll = (direction: 'left' | 'right') => {
    setIsAutoScrolling(false)
    const newIndex = direction === 'left' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(vendorProducts.length - 1, currentIndex + 1)
    
    setCurrentIndex(newIndex)
    scrollToIndex(newIndex)
    
    setTimeout(() => setIsAutoScrolling(true), 5000)
  }

  const toggleAutoScroll = () => {
    setIsAutoScrolling(!isAutoScrolling)
  }

  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`
    }
    return count?.toString() || '0'
  }

  if (loading || !currentRegion) {
    return (
      <section className="py-8 md:py-16 bg-orange-50">
        <div className="container px-4 mx-auto">
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
        <div className="container px-4 mx-auto">
          <div className="text-center text-gray-600">
            <p className="mb-2 text-sm md:text-base">{error || 'No creator spotlight available'}</p>
            <p className="mb-4 text-xs text-gray-500 md:text-sm">
              Please check if there are vendors with creator_spotlight set to true in the database.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 md:py-16 bg-orange-50">
      <style dangerouslySetInnerHTML={{
        __html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
          .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          @media (max-width: 768px) {
            .mobile-card-width { width: 140px; }
          }
        `
      }} />
      <div className="container px-4 mx-auto">
        <h2 className="mb-6 text-2xl font-bold text-center md:mb-10 md:text-3xl">Creator Spotlight</h2>
        
        <div className="flex flex-col items-center overflow-hidden bg-white shadow-lg md:flex-row rounded-xl">
          {/* Image Section */}
          <div className="w-full md:w-2/5">
            <div className="bg-gray-200 aspect-square md:aspect-square">
              <img 
                src={spotlightVendor.metadata?.profile_image || spotlightVendor.logo || "/api/placeholder/600/600"} 
                alt={`${spotlightVendor.name} spotlight`}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          
          {/* Content Section */}
          <div className="w-full p-4 md:p-6 lg:p-10 md:w-3/5">
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
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
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
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
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
                <span className="text-xs text-gray-500 md:text-sm">
                  {vendorProducts.length} product{vendorProducts.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {vendorProducts.length > 0 ? (
                <div className="relative">
                  {/* Navigation Buttons - Hidden on mobile if only 1-2 products */}
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
                    className="flex gap-2 px-2 pb-4 overflow-x-auto md:gap-4 md:px-4 scroll-smooth hide-scrollbar"
                    onMouseEnter={() => setIsAutoScrolling(false)}
                    onMouseLeave={() => setIsAutoScrolling(true)}
                  >
                    {vendorProducts.map((product, index) => (
                      <div 
                        key={product.id} 
                        className={`flex-shrink-0 mobile-card-width md:w-52 p-2 md:p-3 text-center transition-all duration-300 rounded-lg cursor-pointer ${
                          index === currentIndex 
                            ? 'bg-gray-100 hover:bg-gray-200 transform scale-102' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <img 
                          src={product.thumbnail || product.images?.[0]?.url || `/api/placeholder/150/150`} 
                          alt={product.title}
                          className="object-cover w-full mb-2 transition-transform rounded md:mb-3 aspect-square hover:scale-105" 
                        />
                        <p className="text-xs md:text-sm font-medium mb-1 md:mb-2 line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]">
                          {product.title}
                        </p>
                        <p className="text-xs font-medium text-gray-500">
                          {(() => {
                            if (product.calculated_price) {
                              const price = product.calculated_price.calculated_amount
                              const currencyCode = product.calculated_price.currency_code || 'INR'
                              return `${currencyCode === 'INR' ? '₹' : '$'}${(price).toFixed(2)}`
                            }
                            
                            if (product.variants?.[0]?.prices?.[0]?.amount) {
                              const amount = typeof product.variants[0].prices[0].amount === 'number' 
                                ? product.variants[0].prices[0].amount 
                                : parseFloat(product.variants[0].prices[0].amount)
                              return `€${(amount).toFixed(2)}`
                            }
                            
                            return 'Price unavailable'
                          })()}
                        </p>
                      </div>
                    ))}
                    
                    {/* View All Card */}
                    <div className="flex-shrink-0 p-2 text-center transition-colors border-2 border-orange-300 border-dashed rounded-lg cursor-pointer mobile-card-width md:w-48 md:p-3 bg-gradient-to-br from-orange-100 to-orange-200 hover:border-orange-400">
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
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-6 md:py-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-full md:w-16 md:h-16 md:mb-4">
                      <svg className="w-6 h-6 text-gray-400 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                      </svg>
                    </div>
                    <p className="mb-2 text-sm text-gray-500 md:text-base">No products available</p>
                    <p className="text-xs text-gray-400 md:text-sm">Check back soon for new arrivals!</p>
                  </div>
                </div>
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