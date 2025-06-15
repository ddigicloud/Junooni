"use client"

import React, { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { wishlistItems, wishlistAddItem, ItemDelete } from '@lib/data/customer'
import { useRouter } from 'next/navigation'

interface InlineWishlistButtonProps {
  variantId: string | undefined
}

const InlineWishlistButton: React.FC<InlineWishlistButtonProps> = ({ variantId }) => {
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null)
  const router = useRouter()

  // Check wishlist status
  useEffect(() => {
    let isMounted = true;
    
    const checkWishlistStatus = async () => {
      if (!variantId) return;
      
      try {
        const res = await wishlistItems();
        if (!isMounted) return;
        
        if (!res || res === "please login") {
          setIsInWishlist(false);
          setWishlistItemId(null);
          return;
        }
        
        const typedRes = res as any;
        if (typedRes.wishlist && typedRes.wishlist.items) {
          const existingItem = typedRes.wishlist.items.find(
            (item: any) => item.product_variant_id === variantId
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
    
    return () => {
      isMounted = false;
    };
  }, [variantId]);

  const toggleWishlist = async (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!variantId || isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (isInWishlist && wishlistItemId) {
        const deleteResult = await ItemDelete(wishlistItemId);
        
        if (!deleteResult || deleteResult === "please login") {
          router.push('/account');
          return;
        }
        
        setIsInWishlist(false);
        setWishlistItemId(null);
      } else {
        const addResult = await wishlistAddItem(variantId);
        
        if (!addResult || addResult === "please login") {
          router.push('/account');
          return;
        }
        
        setIsInWishlist(true);
        
        const updatedWishlist = await wishlistItems() as any;
        if (updatedWishlist && updatedWishlist.wishlist) {
          const newItem = updatedWishlist.wishlist.items.find(
            (item: any) => item.product_variant_id === variantId
          );
          if (newItem) {
            setWishlistItemId(newItem.id);
          }
        }
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Heart
      onClick={toggleWishlist}
      className={`w-5 h-5 cursor-pointer transition-all ${
        isInWishlist
          ? "text-red-500 fill-red-500"
          : "text-gray-700 hover:text-red-500 hover:fill-red-500"
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    />
  )
}

// ADD THIS DEFAULT EXPORT
export default InlineWishlistButton