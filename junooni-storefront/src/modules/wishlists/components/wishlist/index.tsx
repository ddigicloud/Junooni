'use client'

import { assets } from '@assets/assets'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react';
import React from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
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
  const bannerImage = assets.wishlistBanner
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
        // Scroll to products section with smooth animation
        productsRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 3000); // 3 seconds delay before scrolling
    
    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  return (
    <div className="min-h-screen mt-16 bg-white">
      {/* Banner Section */}
      <div className="relative overflow-hidden py-28">
        {/* Background Image with Enhanced Effects */}
        <div className="absolute inset-0 z-0">
          <Image
            src={bannerImage}
            alt="Wishlist Banner"
            fill
            priority
            className="object-cover object-center transition-transform transform scale-105 duration-10000 hover:scale-100"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          {/* Multiple overlay layers for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-60"></div>
          <div className="absolute inset-0 bg-black opacity-30"></div>
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay" 
               style={{ backgroundImage: 'url("/patterns/dot-pattern.png")', backgroundSize: '30px 30px' }}></div>
        </div>
        
        {/* Content area with enhanced typography and layout */}
        <div className="relative z-10 max-w-6xl px-4 mx-auto">
          <div className="flex flex-col items-center">
            {/* Optional breadcrumb */}
            <div className="mb-6 text-sm tracking-wide text-white/80">
              <span className="transition-colors cursor-pointer hover:text-white">Home</span>
              <span className="mx-2">›</span>
              <span className="font-medium text-white">My Wishlist</span>
            </div>
            
            {/* Icon + Title Combination */}
            <div className="flex items-center justify-center mb-4 space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm">
                <Heart className="w-4 h-4 text-white" fill="white" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                My Wishlist
              </h1>
            </div>
            
            {/* Enhanced subtitle with actual item count */}
            <div className="max-w-xl mx-auto mt-3 text-lg font-light leading-relaxed text-center text-white/90">
              <p className="mb-2">
                Browse your favorite items and add them to your cart when you're ready to purchase.
              </p>
              <div className="text-sm font-medium text-white/80">
                {isLoadingCount ? (
                  // Loading state
                  <span className="inline-flex items-center justify-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 mr-2 text-xs font-semibold rounded-full bg-white/20 animate-pulse">
                      <span className="block w-3 h-3 rounded bg-white/50"></span>
                    </span>
                    loading items...
                  </span>
                ) : (
                  // Actual count
                  <span className="inline-flex items-center justify-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 mr-2 text-xs font-semibold rounded-full bg-white/20">
                      {itemsCount}
                    </span>
                    {itemsCount === 0 ? 'No items' : itemsCount === 1 ? 'item' : 'items'} in your wishlist
                  </span>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex mt-8 space-x-4">
              <button className="px-6 py-2.5 bg-white text-gray-900 font-medium rounded-full hover:bg-white/90 transition-colors focus:ring-2 focus:ring-white/50 focus:outline-none">
                Shop Now
              </button>
              <button className="px-6 py-2.5 bg-transparent border border-white/40 text-white font-medium rounded-full hover:bg-white/10 transition-colors focus:ring-2 focus:ring-white/30 focus:outline-none">
                Clear All
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/5 to-transparent"></div>
        <div className="absolute w-full h-20 transform -translate-x-1/2 bg-white rounded-full -bottom-10 left-1/2 blur-3xl opacity-20"></div>
      </div>
      
      {/* Wishlist Products Section */}
      <div className="" ref={productsRef}>
        <WishlistProducts />
      </div>
    </div>
  )
}

export default Wishlist