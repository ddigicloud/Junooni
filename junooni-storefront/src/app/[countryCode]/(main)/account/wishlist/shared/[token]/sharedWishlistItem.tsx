"use client"

import React, { useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button, Heading, Text } from "@medusajs/ui"
import { useRouter } from "next/navigation"
import { getPricesForVariant } from "@lib/util/get-product-price"
import toast from 'react-hot-toast' // Or your preferred toast solution

type SharedWishlistItemProps = {
  item: any
}

const SharedWishlistItem = ({ item }: SharedWishlistItemProps) => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  // Cart functionality - you'll need to implement your own cart add logic
  const handleAddToCart = () => {
    startTransition(async () => {
      try {
        // Call your cart add function here
        // Example:
        // await addItemToCart({
        //   variantId: item.variant_id,
        //   quantity: 1
        // });
        
        toast.success("Added to cart")
      } catch (error) {
        console.error("Error adding to cart:", error)
        toast.error("Failed to add to cart")
      }
    })
  }

  const thumbnail = item.variant.product.thumbnail
  const title = item.variant.product.title
  
  // Use your price formatting
  const prices = getPricesForVariant(item.variant)

  return (
    <div className="flex flex-col overflow-hidden border rounded-lg">
      <div className="flex items-center p-4">
        <div className="relative w-16 h-16 mr-4 overflow-hidden rounded">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-200">
              No image
            </div>
          )}
        </div>
        <div className="flex-1">
          <Link href={`/products/${item.variant.product.handle}`}>
            <Heading className="mb-1 text-base font-medium">{title}</Heading>
          </Link>
          {item.variant.title !== "Default Variant" && (
            <Text className="mb-1 text-sm text-gray-500">
              {item.variant.title}
            </Text>
          )}
          {prices && (
            <div>
              <Text className="font-medium">
                {prices.calculated_price}
              </Text>
              {prices.percentage_diff > 0 && (
                <Text className="ml-2 text-sm text-gray-500 line-through">
                  {prices.original_price}
                </Text>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between p-4 border-t">
        <Link href={`/products/${item.variant.product.handle}`} passHref>
          <Button variant="secondary">View Product</Button>
        </Link>
        <Button onClick={handleAddToCart} disabled={isPending}>
          Add to Cart
        </Button>
      </div>
    </div>
  )
}

export default SharedWishlistItem