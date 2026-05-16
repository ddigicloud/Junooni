"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "@/context/CartContext"

export default function CartIconButton({ brandPrimary = "#e65100", iconColor }: { brandPrimary?: string; iconColor?: string }) {
  const { cartCount, openCart } = useCart()
  return (
    <button
      onClick={openCart}
      className="relative p-2 transition-colors rounded-full"
      aria-label="Open cart"
    >
      <ShoppingCart className="w-5 h-5" style={{ color: iconColor ?? "#6b7280" }} />
      {cartCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
          style={{ background: brandPrimary }}
        >
          {cartCount > 9 ? "9+" : cartCount}
        </span>
      )}
    </button>
  )
}
