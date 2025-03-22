'use client'

import React from 'react'
import { Heart } from 'lucide-react'
import { wishlistAddItem } from '@lib/data/customer'

interface WishlistButtonProps {
  variantId: string | undefined
}

 

const WishlistButton: React.FC<WishlistButtonProps> =  ({ variantId }) => {
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Add wishlist implementation here
    console.log("Adding to wishlist:", variantId)

    await wishlistAddItem(variantId)


  }

  return (
    <button 
      className="absolute z-10 p-2 transition-all duration-300 bg-white rounded-full shadow-md opacity-0 right-3 top-3 group-hover:opacity-100 hover:bg-gray-50"
      aria-label="Add to wishlist"
      onClick={handleClick}
    >
      <Heart className="w-5 h-5 text-gray-700 transition-all hover:text-black hover:fill-current" />
    </button>
  )
}

export default WishlistButton