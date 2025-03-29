'use client'

import { assets } from '@assets/assets'
import { wishlistItems, ItemDelete, matchItemWithVariant } from '@lib/data/customer'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import PreviewPrice from "@modules/products/components/product-price"
import WishlistButton from "@modules/wishlists/components/wishlist-button"

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

// Export the WishlistProducts component so it can be used in other components
export const WishlistProducts = () => {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [products, setProducts] = useState([])
  const router = useRouter()

  useEffect(() => {
    const fetchWishlistItems = async () => {
      setIsLoading(true)
      try {
        const response = await wishlistItems()
        
        if (!response || response === "please login") {
          router.push('/account')
          return
        }
        
        const data = response as WishlistResponse
        if (data && data.wishlist && data.wishlist.items) {
          setItems(data.wishlist.items)
        }

      } catch (error) {
        console.error('Error fetching wishlist items:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWishlistItems()
  }, [router])

  const handleRemoveItem = async (itemId: string) => {
    try {
      await ItemDelete(itemId)
      // Update state to remove the item
      setItems(prevItems => prevItems.filter(item => item.id !== itemId))
    } catch (error) {
      console.error('Error removing item from wishlist:', error)
    }
  }

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        // Delete all items one by one
        const deletePromises = items.map(item => ItemDelete(item.id))
        await Promise.all(deletePromises)
        setItems([])
      } catch (error) {
        console.error('Error clearing wishlist:', error)
      }
    }
  }

  const formatPrice = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
    }).format(amount / 100) // Assuming the amount is in cents
  }

  useEffect(() => {
    const fetchAllVariants = async () => {
      try {
        const results = await Promise.all(
          items.map(async (item) => {
            const fetchData = await matchItemWithVariant(item.product_variant.product_id);
            return { ...item, variantData: fetchData }; // Keep original item with fetched data
          })
        );
  
        // Extracting product data safely
        const data = results.map((variant) =>
          variant.variantData?.product ? { ...variant.variantData.product } : null
        ).filter(Boolean); // Removes any null values
  
        setProducts(data);
      } catch (error) {
        console.error("Error fetching variants:", error);
      }
    };
  
    if (items.length > 0) {
      fetchAllVariants();
    }
  }, [items]); // Runs when `items` changes

  if (isLoading) {
    return <div className="py-10 text-center">Loading your wishlist...</div>
  }

  if (items.length === 0 && !isLoading) {
    return <div className="py-10 text-center">Your wishlist is empty</div>
  }

  return (
    <>
      <ul className="w-full max-w-[90%] py-8 mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.id} className="flex-shrink-0">
            <div data-testid="product-wrapper" className="relative flex flex-col h-full group">
              {/* Product image container with overlay effects */}
              <div className="relative overflow-hidden rounded-lg bg-gray-50 aspect-[4/5] mb-4">
                <WishlistButton isWishlistPage={true} variantId={product.variants?.[0]?.id} />
                
                {/* Product tags */}
                <div className="absolute z-10 flex flex-wrap gap-2 left-3 top-3 max-w-[85%]">
                  {product.tags?.map((tag) => (
                    <span 
                      key={tag.id} 
                      className="px-2 py-1 text-xs font-medium text-white rounded bg-[#e65100] whitespace-nowrap"
                    >
                      {tag.value}
                    </span>
                  ))}
                </div>
                
                {/* Image container with transform effect */}
                <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
                  <Thumbnail
                    thumbnail={product.thumbnail}
                    images={product.images}
                    size="full"
                  />
                </div>
                
                {/* Quick add overlay */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-2 transition-all translate-y-full opacity-0 bg-white/90 group-hover:translate-y-0 group-hover:opacity-100">
                  <LocalizedClientLink href={`/products/${product.handle}`}>
                    <span className="text-sm font-medium">Quick view</span>
                  </LocalizedClientLink>
                </div>
              </div>
              
              {/* Product info section */}
              <div className="flex-grow">
                {/* Vendor name */}
                <div className="mb-1 text-xs text-gray-500">
                  By {product.vendor ? product.vendor.name : "Junooni"}
                </div>
                
                {/* Product title and price */}
                <div className="flex items-start justify-between mb-2">
                  <LocalizedClientLink href={`/products/${product.handle}`}>
                    <Text 
                      className="pr-2 text-base font-medium leading-tight line-clamp-2" 
                      data-testid="product-title"
                    >
                      {product.title}
                    </Text>
                  </LocalizedClientLink>
                  <div className="font-semibold text-gray-900 whitespace-nowrap">
                    {product.variants?.[0]?.prices && (
                      <PreviewPrice prices={product.variants[0].prices} />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Color options */}
              {product.metadata && Object.entries(product.metadata).length > 0 && (
                <div className="pt-3 mt-auto">
                  <ul className="flex items-center gap-x-1">
                    {Object.entries(product.metadata).map(([key, value], index) => (
                      <li key={index}>
                        <div 
                          className="w-6 h-6 transition-transform border border-gray-200 rounded-full shadow-sm cursor-pointer hover:scale-110" 
                          style={{ backgroundColor: `${value}` }}
                          title={key}
                        ></div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
      
      {/* Footer Actions */}
      {items.length > 0 && (
        <div className="max-w-6xl px-4 mx-auto mb-12">
          <div className="flex flex-col items-center justify-between p-4 mt-8 bg-gray-100 rounded sm:flex-row">
            <button
              className="flex items-center mb-4 font-medium text-gray-700 transition-colors hover:text-gray-900 sm:mb-0"
              onClick={() => router.push('/products')}
            >
              <span className="mr-2">←</span>
              <span>CONTINUE SHOPPING</span>
            </button>
            <button
              className="flex items-center font-medium text-gray-700 transition-colors hover:text-red-600"
              onClick={handleClearWishlist}
            >
              <span className="mr-2">🗑️</span>
              <span>CLEAR WISHLIST</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
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