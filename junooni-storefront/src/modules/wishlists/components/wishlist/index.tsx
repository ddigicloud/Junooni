'use client'

import { assets } from '@assets/assets'
import Image from 'next/image'
import React from 'react'
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
  
  return (
    <div className="min-h-screen mt-16 bg-white">
      {/* Banner Section */}
      <div className="relative py-24 bg-gray-800">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={bannerImage}
            alt="Wishlist Banner"
            fill
            priority
            className="object-cover object-center"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl px-4 mx-auto">
          <h1 className="text-4xl font-bold text-center text-white">My Wishlist</h1>
          <p className="max-w-xl mx-auto mt-4 text-center text-white text-opacity-90">
            Browse your favorite items and add them to your cart when you're ready to purchase.
          </p>
        </div>
      </div>
      
      {/* Wishlist Products Section */}
      <div className="">
        <WishlistProducts />
      </div>
    </div>
  )
}

export default Wishlist