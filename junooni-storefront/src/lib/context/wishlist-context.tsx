"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { wishlistItems, wishlistAddItem, ItemDelete } from "@lib/data/wishlist-client"

interface WishlistItem {
  id: string
  product_variant_id: string
}

interface WishlistContextType {
  // Map of variantId → wishlistItemId (null if not in wishlist)
  wishlistMap: Record<string, string>
  isLoading: boolean
  isLoggedIn: boolean
  addToWishlist: (variantId: string) => Promise<void>
  removeFromWishlist: (variantId: string) => Promise<void>
  isInWishlist: (variantId: string) => boolean
  totalCount: number
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistMap: {},
  isLoading: true,
  isLoggedIn: false,
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  isInWishlist: () => false,
  totalCount: 0,
})

export const useWishlist = () => useContext(WishlistContext)

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  // variantId → wishlistItemId
  const [wishlistMap, setWishlistMap] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const fetchedRef = useRef(false)

  // Fetch ONCE on mount — never per-card
  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    const fetchWishlist = async () => {
      try {
        const res = await wishlistItems()

        if (!res || res === "please login") {
          setIsLoggedIn(false)
          setWishlistMap({})
          return
        }

        setIsLoggedIn(true)
        const items: WishlistItem[] = res?.wishlist?.items ?? []

        // Build variantId → wishlistItemId map
        const map: Record<string, string> = {}
        items.forEach((item) => {
          map[item.product_variant_id] = item.id
        })
        setWishlistMap(map)
      } catch {
        setWishlistMap({})
      } finally {
        setIsLoading(false)
      }
    }

    fetchWishlist()
  }, [])

  const isInWishlist = useCallback(
    (variantId: string) => !!wishlistMap[variantId],
    [wishlistMap]
  )

  const addToWishlist = useCallback(async (variantId: string) => {
    try {
      const result = await wishlistAddItem(variantId)
      if (!result || result === "please login") return

      // Get updated item id from response or re-fetch
      const updated = await wishlistItems()
      if (!updated || updated === "please login") return

      const items: WishlistItem[] = updated?.wishlist?.items ?? []
      const newItem = items.find((i) => i.product_variant_id === variantId)
      if (newItem) {
        setWishlistMap((prev) => ({ ...prev, [variantId]: newItem.id }))
      }
    } catch {}
  }, [])

  const removeFromWishlist = useCallback(async (variantId: string) => {
    const itemId = wishlistMap[variantId]
    if (!itemId) return

    try {
      await ItemDelete(itemId)
      setWishlistMap((prev) => {
        const next = { ...prev }
        delete next[variantId]
        return next
      })
    } catch {}
  }, [wishlistMap])

  const totalCount = Object.keys(wishlistMap).length

  return (
    <WishlistContext.Provider
      value={{
        wishlistMap,
        isLoading,
        isLoggedIn,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        totalCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}