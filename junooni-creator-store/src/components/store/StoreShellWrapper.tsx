"use client"

import { useState, useEffect } from "react"
import { CartProvider } from "@/context/CartContext"
import CartDrawer from "@/components/cart/CartDrawer"
import StoreEditorBridge from "@/components/store/StoreEditorBridge"

export default function StoreShellWrapper({
  handle,
  brandPrimary: initialBrandPrimary = "#e65100",
  children,
}: {
  handle: string
  brandPrimary?: string
  children: React.ReactNode
}) {
  const [brandPrimary, setBrandPrimary] = useState(initialBrandPrimary)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "STORE_UPDATE" && e.data.store?.primary_color) {
        setBrandPrimary(e.data.store.primary_color)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  return (
    <CartProvider handle={handle}>
      <StoreEditorBridge />
      {children}
      <CartDrawer handle={handle} brandPrimary={brandPrimary} />
    </CartProvider>
  )
}