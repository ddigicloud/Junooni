'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Heart, Trash, X } from 'lucide-react'
import { wishlistAddItem, wishlistItems, ItemDelete } from '@lib/data/wishlist-client'
// import { wishlistAddItem, wishlistItems, ItemDelete } from '@lib/data/customer'
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

export interface WishlistButtonProps {
  variantId: string | undefined;
  alwaysVisible?: boolean; // Add this prop
  isWishlistPage?: boolean; // Prop to determine if we're on the wishlist page
  onRemove?: (variantId: string) => void; // Callback for when an item is removed
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ variantId, isWishlistPage = false,  alwaysVisible = false, onRemove }) => {
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

  // Function specifically for adding/removing on product pages
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

  // Function specifically for removing from wishlist page
  const removeFromWishlist = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!wishlistItemId || isLoading || !variantId) return;
    
    // Call onRemove BEFORE the API call to hide immediately
    if (onRemove) {
      onRemove(variantId);
    }
    
    setIsLoading(true);
    
    try {
      const deleteResult = await ItemDelete(wishlistItemId);
      
      if (!deleteResult || deleteResult === "please login") {
        router.push('/account');
        return;
      }
      
      // Item was successfully removed
      setIsInWishlist(false);
      setWishlistItemId(null);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [wishlistItemId, isLoading, router, onRemove, variantId]);

  // Determine which button styling to use based on context
   const getButtonClassNames = () => {
    if (isWishlistPage) {
      return "absolute z-10 p-2 transition-all duration-300 bg-[#f8f8fa] rounded-full shadow-md right-3 top-3 hover:bg-gray-50";
    }
    
    // Check if always visible
    if (alwaysVisible) {
      return "absolute z-10 p-2 transition-all duration-300 bg-white rounded-full shadow-md opacity-100 right-3 top-3 hover:bg-gray-50";
    }
    
    return "absolute z-10 p-2 transition-all duration-300 bg-white rounded-full shadow-md opacity-0 right-3 top-3 group-hover:opacity-100 hover:bg-gray-50";
  };

  // Choose which handler to use based on context
  const handleClick = isWishlistPage ? removeFromWishlist : toggleWishlist;

  return (
    <button
      className={getButtonClassNames()}
      aria-label={isWishlistPage ? "Remove from wishlist" : (isInWishlist ? "Remove from wishlist" : "Add to wishlist")}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isWishlistPage ? (
        <X 
          className="w-5 h-5 text-gray-700 transition-all scale-75 rounded hover:text-red-500 hover:scale-100 hover:bg-gray-100"
        />
      ) : (
        <Heart
          className={`w-5 h-5 transition-all ${
            isInWishlist
              ? "text-red-500 fill-red-500"
              : "text-gray-700 hover:text-red-500 hover:fill-red-500"
          }`}
        />
      )}
    </button>
  )
}

export default WishlistButton