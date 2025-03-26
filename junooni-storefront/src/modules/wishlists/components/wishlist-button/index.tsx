'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { wishlistAddItem, wishlistItems, ItemDelete } from '@lib/data/customer'
import { useRouter } from 'next/navigation'

// Define interfaces for API response types
interface WishlistItem {
  id: string;
  product_variant_id: string;
}

interface WishlistResponse {
  wishlist: {
    items: WishlistItem[];
  };
}

interface WishlistButtonProps {
  variantId: string | undefined
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ variantId }) => {
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null)
  const router = useRouter()

  // Fetch wishlist status only once on mount and when variantId changes
  useEffect(() => {
    let isMounted = true;
    
    const checkWishlistStatus = async () => {
      if (!variantId) return;
      
      try {
        const res = await wishlistItems();
        
        // If component unmounted during async operation, don't update state
        if (!isMounted) return;
        
        // Handle unauthenticated user
        if (!res || res === "please login") {
          setIsInWishlist(false);
          setWishlistItemId(null);
          return;
        }
        
        // Process response
        const typedRes = res as WishlistResponse;
        if (typedRes.wishlist && typedRes.wishlist.items) {
          const existingItem = typedRes.wishlist.items.find(
            (item: WishlistItem) => item.product_variant_id === variantId
          );
          
          if (existingItem) {
            setIsInWishlist(true);
            setWishlistItemId(existingItem.id);
          } else {
            setIsInWishlist(false);
            setWishlistItemId(null);
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsInWishlist(false);
          setWishlistItemId(null);
        }
      }
    };

    checkWishlistStatus();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [variantId]);

  // Memoized toggle function to reduce rerenders
  const toggleWishlist = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!variantId || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Handle removal if item is in wishlist
      if (isInWishlist && wishlistItemId) {
        const deleteResult = await ItemDelete(wishlistItemId);
        
        if (!deleteResult || deleteResult === "please login") {
          router.push('/account');
          return;
        }
        
        setIsInWishlist(false);
        setWishlistItemId(null);
      } 
      // Handle addition if item is not in wishlist
      else {
        const addResult = await wishlistAddItem(variantId);
        
        if (!addResult || addResult === "please login") {
          router.push('/account');
          return;
        }
        
        // Update local state optimistically
        setIsInWishlist(true);
        
        // Get the updated wishlist to store the new item ID
        const updatedWishlist = await wishlistItems() as WishlistResponse;
        if (updatedWishlist && updatedWishlist.wishlist) {
          const newItem = updatedWishlist.wishlist.items.find(
            (item) => item.product_variant_id === variantId
          );
          if (newItem) {
            setWishlistItemId(newItem.id);
          }
        }
      }
    } catch (error) {
      // Revert optimistic update in case of error
      if (isInWishlist) {
        setIsInWishlist(true);
      } else {
        setIsInWishlist(false);
        setWishlistItemId(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [variantId, isInWishlist, wishlistItemId, isLoading, router]);

  return (
    <button
      className="absolute z-10 p-2 transition-all duration-300 bg-white rounded-full shadow-md opacity-0 right-3 top-3 group-hover:opacity-100 hover:bg-gray-50"
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      onClick={toggleWishlist}
      disabled={isLoading}
    >
      <Heart
        className={`w-5 h-5 transition-all ${
          isInWishlist
            ? "text-red-500 fill-red-500"
            : "text-gray-700 hover:text-red-500 hover:fill-red-500"
        }`}
      />
    </button>
  )
}

export default WishlistButton