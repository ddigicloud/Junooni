// 'use client'

// import { assets } from '@assets/assets'
// import Image from 'next/image'
// import { useState, useEffect, useRef } from 'react';
// import React from 'react'
// import { useRouter } from 'next/navigation'
// import { Heart } from 'lucide-react'
// import { wishlistItems } from '@lib/data/customer'
// import { WishlistProducts } from '../wishlistProducts'

// // Define TypeScript interfaces for products
// interface WishlistItem {
//   id: string
//   product_variant_id: string
//   product_variant: {
//     product_id: string
//   }
//   product: {
//     id: string
//     title: string
//     handle: string
//     thumbnail: string
//     variants: {
//       id: string
//       title: string
//       prices: {
//         amount: number
//         currency_code: string
//       }[]
//     }[]
//   }
// }

// interface WishlistResponse {
//   wishlist: {
//     id: string
//     items: WishlistItem[]
//   }
// }

// const Wishlist = () => {
//   const bannerImage = assets.wishlisthero
//   const router = useRouter()
//   const productsRef = useRef(null);
//   // State for wishlist items count
//   const [itemsCount, setItemsCount] = useState<number>(0)
//   const [isLoadingCount, setIsLoadingCount] = useState<boolean>(true)
  
//   // Fetch wishlist items count
//   useEffect(() => {
//     const fetchWishlistCount = async () => {
//       setIsLoadingCount(true)
//       try {
//         const response = await wishlistItems()
//         if (!response || response === "please login") {
//           setItemsCount(0)
//           return
//         }
//         const data = response as WishlistResponse
//         if (data?.wishlist?.items) {
//           setItemsCount(data.wishlist.items.length)
//         }
//       } catch (error) {
//         console.error("Error fetching wishlist count:", error)
//         setItemsCount(0)
//       } finally {
//         setIsLoadingCount(false)
//       }
//     }

//     fetchWishlistCount()
//   }, [])
  
//   // Auto-scroll effect after page load
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (productsRef.current) {
//         // Scroll to products section with smooth animation
//         productsRef.current.scrollIntoView({ 
//           behavior: 'smooth',
//           block: 'start'
//         });
//       }
//     }, 3000); // 3 seconds delay before scrolling
    
//     return () => clearTimeout(timer); // Cleanup on unmount
//   }, []);

//   return (
//     <div className="min-h-screen mt-16 bg-white">
//       {/* Banner Section */}
//       <div className="relative overflow-hidden py-28">
//         {/* Background Image with Enhanced Effects */}
//         <div className="absolute inset-0 z-0 relative">
//           <img
//             src={bannerImage.src}
//             alt="Wishlist Banner"
//             className="object-cover object-center transition-transform transform scale-105 duration-10000 hover:scale-100"
//           />
//         </div>
        
//         {/* Content area with enhanced typography and layout */}
        
        
//         {/* Decorative elements */}
//         <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/5 to-transparent"></div>
//         <div className="absolute w-full h-20 transform -translate-x-1/2 bg-white rounded-full -bottom-10 left-1/2 blur-3xl opacity-20"></div>
//       </div>
      
//       {/* Wishlist Products Section */}
//       <div className="" ref={productsRef}>
//         <WishlistProducts />
//       </div>
//     </div>
//   )
// }

// export default Wishlist

'use client'

import { assets } from '@assets/assets'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react';
import React from 'react'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingBag, Sparkles } from 'lucide-react'
import { wishlistItems } from '@lib/data/customer'
import { WishlistProducts } from '../wishlistProducts'

// Define TypeScript interfaces for products
interface WishlistItem {
  id: string
  product_variant_id: string
  product_variant: {
    product_id: string
  }
  product: {
    id: string
    title: string
    handle: string
    thumbnail: string
    variants: {
      id: string
      title: string
      prices: {
        amount: number
        currency_code: string
      }[]
    }[]
  }
}

interface WishlistResponse {
  wishlist: {
    id: string
    items: WishlistItem[]
  }
}

const Wishlist = () => {
  const bannerImage = assets.wishlisthero
  const router = useRouter()
  const productsRef = useRef(null);
  
  // State for wishlist items count
  const [itemsCount, setItemsCount] = useState<number>(0)
  const [isLoadingCount, setIsLoadingCount] = useState<boolean>(true)
  
  // Fetch wishlist items count
  useEffect(() => {
    const fetchWishlistCount = async () => {
      setIsLoadingCount(true)
      try {
        const response = await wishlistItems()
        if (!response || response === "please login") {
          setItemsCount(0)
          return
        }
        const data = response as WishlistResponse
        if (data?.wishlist?.items) {
          setItemsCount(data.wishlist.items.length)
        }
      } catch (error) {
        console.error("Error fetching wishlist count:", error)
        setItemsCount(0)
      } finally {
        setIsLoadingCount(false)
      }
    }

    fetchWishlistCount()
  }, [])
  
  // Auto-scroll effect after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (productsRef.current) {
        productsRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen mt-16">
      {/* Hero Banner Section - Fixed Height */}
      <div className="relative h-[400px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={bannerImage.src}
            alt="Wishlist Banner"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 z-[1]"></div>
        
        {/* Content Container */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center px-4 max-w-4xl mx-auto">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-white backdrop-blur-sm rounded-full border-2 border-[#ffffff]">
              <Heart className="w-10 h-10 text-[#e65100] fill-[#e65100]" />
            </div>
            
            {/* Heading */}
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              My Wishlist
            </h1>
            
            {/* Subheading with Count */}
            <div className="flex items-center justify-center gap-3 text-white/90">
              {isLoadingCount ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <p className="text-lg md:text-xl font-medium">
                    {itemsCount === 0 
                      ? "Start adding your favorite items" 
                      : `${itemsCount} ${itemsCount === 1 ? 'item' : 'items'} saved for later`
                    }
                  </p>
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </div>

            {/* CTA Buttons */}
            {itemsCount === 0 && (
              <div className="mt-8">
                <button
                  onClick={() => router.push('/store')}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white text-orange-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0 z-[2]">
          <svg 
            viewBox="0 0 1440 80" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path 
              d="M0 80L60 70C120 60 240 40 360 33.3C480 26.7 600 33.3 720 40C840 46.7 960 53.3 1080 50C1200 46.7 1320 33.3 1380 26.7L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" 
              fill="rgb(249 250 251)"
            />
          </svg>
        </div>
      </div>
      
      {/* Main Content Section */}
      <div className="relative -mt-1">
        {/* Stats Bar (if items exist) */}
        {itemsCount > 0 && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-orange-500 fill-orange-500" />
                  <span className="text-gray-700 font-medium">
                    {itemsCount} {itemsCount === 1 ? 'Item' : 'Items'} in Wishlist
                  </span>
                </div>
                <button 
                  onClick={() => router.push('/store')}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  Continue Shopping →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="bg-gray-50 py-8" ref={productsRef}>
          <WishlistProducts />
        </div>
      </div>
    </div>
  )
}

export default Wishlist