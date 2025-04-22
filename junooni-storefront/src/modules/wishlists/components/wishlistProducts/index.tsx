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
interface ProductVariant {
  id: string;
  title: string;
  prices: {
    amount: number;
    currency_code: string;
  }[];
}

interface ProductTag {
  id: string;
  value: string;
}

interface Product {
  id: string;
  title: string;
  handle: string;
  thumbnail: string;
  images?: any[];
  variants: ProductVariant[];
  tags?: ProductTag[];
  vendor?: {
    name: string;
  };
  metadata?: Record<string, string>;
}

interface WishlistItem {
  id: string;
  product_variant_id: string;
  product_variant: {
    product_id: string;
  };
  product: Product;
}

interface WishlistResponse {
  wishlist: {
    id: string;
    items: WishlistItem[];
  };
}

interface VariantData {
  product: Product;
}

interface EnhancedWishlistItem extends WishlistItem {
  variantData?: VariantData;
}

// Skeleton component for wishlist products
const WishlistSkeleton = () => {
  return (
    <ul className="w-full max-w-[90%] py-8 mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <li key={index} className="flex-shrink-0">
          <div className="relative flex flex-col h-full">
            {/* Product image skeleton */}
            <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-[4/5] mb-4 animate-pulse">
              {/* Tag placeholder */}
              <div className="absolute z-10 flex flex-wrap gap-2 left-3 top-3">
                <div className="h-5 bg-gray-300 rounded w-14 animate-pulse"></div>
              </div>
            </div>
            
            {/* Product info skeleton */}
            <div className="flex-grow">
              {/* Vendor name skeleton */}
              <div className="w-20 h-3 mb-1 bg-gray-200 rounded animate-pulse"></div>
              
              {/* Product title and price skeleton */}
              <div className="flex items-start justify-between mb-2">
                <div className="w-3/4 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              {/* Second line of title */}
              <div className="w-1/2 h-5 mb-2 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Color options skeleton */}
            <div className="pt-3 mt-auto">
              <ul className="flex items-center gap-x-1">
                {Array.from({ length: 3 }).map((_, colorIndex) => (
                  <li key={colorIndex}>
                    <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

// Export the WishlistProducts component so it can be used in other components
export const WishlistProducts = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [removedVariantIds, setRemovedVariantIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  // First fetch only the wishlist items
  useEffect(() => {
    const fetchWishlistItems = async () => {
      setIsLoadingItems(true);
      try {
        const response = await wishlistItems();
        
        if (!response || response === "please login") {
          router.push('/account');
          return;
        }
        
        const data = response as WishlistResponse;
        if (data && data.wishlist && data.wishlist.items) {
          setItems(data.wishlist.items);
        }

      } catch (error) {
        console.error('Error fetching wishlist items:', error);
      } finally {
        setIsLoadingItems(false);
      }
    };

    fetchWishlistItems();
  }, [router]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await ItemDelete(itemId);
      // Update state to remove the item
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
    }
  };

  // Function to handle removal from the WishlistButton component
  const handleVariantRemove = (variantId: string) => {
    setRemovedVariantIds(prev => {
      const newSet = new Set(prev);
      newSet.add(variantId);
      return newSet;
    });
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        // Delete all items one by one
        const deletePromises = items.map(item => ItemDelete(item.id));
        await Promise.all(deletePromises);
        setItems([]);
      } catch (error) {
        console.error('Error clearing wishlist:', error);
      }
    }
  };

  const formatPrice = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
    }).format(amount / 100); // Assuming the amount is in cents
  };

  // Then fetch the product details once we have the items
  useEffect(() => {
    const fetchAllVariants = async () => {
      // Only proceed if we have items and aren't already loading
      if (items.length === 0) {
        return;
      }
      
      setIsLoadingProducts(true);
      
      try {
        const results = await Promise.all(
          items.map(async (item) => {
            const fetchData = await matchItemWithVariant(item.product_variant.product_id);
            return { ...item, variantData: fetchData } as EnhancedWishlistItem;
          })
        );
  
        // Extracting product data safely
        const data = results
          .map((variant) => variant.variantData?.product ? { ...variant.variantData.product } : null)
          .filter((product): product is Product => product !== null);
  
        setProducts(data);
      } catch (error) {
        console.error("Error fetching variants:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
  
    if (items.length > 0) {
      fetchAllVariants();
    }
  }, [items]); // Runs when `items` changes

  // Determine if we're in a loading state
  const isLoading = isLoadingItems || isLoadingProducts;

  // Handle loading state
  if (isLoading) {
    return <WishlistSkeleton />;
  }

  // Handle empty wishlist state - only show after loading is complete
  if (items.length === 0 && !isLoading) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-lg font-medium text-gray-600">Your wishlist is empty</p>
        <button
          className="px-6 py-2 mt-4 text-sm font-medium text-white transition-colors bg-[#e65100] rounded hover:bg-[#d84315]"
          onClick={() => router.push('/products')}
        >
          Browse Products
        </button>
      </div>
    );
  }

  // Filter out removed products
  const visibleProducts = products.filter(product => {
    const variantId = product.variants?.[0]?.id;
    return variantId && !removedVariantIds.has(variantId);
  });

  // If all products have been removed but we haven't refreshed the items list yet
  if (visibleProducts.length === 0 && !isLoading) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-lg font-medium text-gray-600">Your wishlist is empty</p>
        <button
          className="px-6 py-2 mt-4 text-sm font-medium text-white transition-colors bg-[#e65100] rounded hover:bg-[#d84315]"
          onClick={() => router.push('/products')}
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <>
      <ul className="w-full max-w-[90%] py-8 mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visibleProducts.map((product) => (
          <li key={product.id} className="flex-shrink-0">
            <div data-testid="product-wrapper" className="relative flex flex-col h-full group">
              {/* Wrap entire card with a link while maintaining relative positioning */}
              <LocalizedClientLink 
                href={`/products/${product.handle}`} 
                className="absolute inset-0 z-10 w-full h-full"
                aria-label={`View ${product.title} details`}
              >
                <span className="sr-only">View product details</span>
              </LocalizedClientLink>
              
              {/* Product image container with overlay effects */}
              <div className="relative overflow-hidden rounded-lg bg-gray-50 aspect-[4/5] mb-4">
                {/* Wishlist button - placed in higher z-index with pointer-events enabled */}
                <div className="absolute top-0 right-0 z-20">
                  <div className="pointer-events-auto">
                    <WishlistButton 
                      isWishlistPage={true} 
                      variantId={product.variants?.[0]?.id} 
                      onRemove={handleVariantRemove}
                    />
                  </div>
                </div>
                
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
              </div>
              
              {/* Product info section - now uses pointer-events-none to let clicks pass through to the card link */}
              <div className="flex-grow pointer-events-none">
                {/* Vendor name */}
                <div className="mb-1 text-xs text-gray-500">
                  By {product.vendor ? product.vendor.name : "Junooni"}
                </div>
                
                {/* Product title and price - removed the nested link since the whole card is now clickable */}
                <div className="flex items-start justify-between mb-2">
                  <Text 
                    className="pr-2 text-base font-medium leading-tight line-clamp-2" 
                    data-testid="product-title"
                  >
                    {product.title}
                  </Text>
                  <div className="font-semibold text-gray-900 whitespace-nowrap">
                    {product.variants?.[0]?.prices && (
                      <PreviewPrice 
                        prices={product.variants[0].prices} 
                        product={product}
                        variant={product.variants[0]}
                      />
                    )}
                  </div>
                </div>
              
                {/* Color options - with pointer-events-none to allow clicks to pass through */}
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
            </div>
          </li>
        ))}
      </ul>
      
      {/* Footer Actions */}
      {visibleProducts.length > 0 && (
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
  );
};