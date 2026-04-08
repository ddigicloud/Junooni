"use client"

import {
  createContext, useContext, useState, useEffect,
  useCallback, type ReactNode,
} from "react"
import { retrieveCart } from "@/lib/cart"

interface CartContextType {
  cart: any | null
  cartCount: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  refreshCart: () => Promise<void>
  clearCart: () => void
}

const CartContext = createContext<CartContextType>({
  cart: null, cartCount: 0, isOpen: false,
  openCart: () => {}, closeCart: () => {},
  refreshCart: async () => {}, clearCart: () => {},
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<any | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const refreshCart = useCallback(async () => {
    try {
      const c = await retrieveCart()
      setCart(c)
    } catch {
      setCart(null)
    }
  }, [])

  const clearCart = useCallback(() => {
    setCart(null)
  }, [])

  useEffect(() => { refreshCart() }, [refreshCart])

  const cartCount =
    cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) ?? 0

  return (
    <CartContext.Provider value={{
      cart, cartCount, isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      refreshCart,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)