"use client"

import { useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { deleteLineItem, updateLineItem } from "@/lib/cart"

function formatPrice(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CartDrawer({
  handle,
  brandPrimary = "#e65100",
}: {
  handle: string
  brandPrimary?: string
}) {
  const { cart, cartCount, isOpen, closeCart, refreshCart } = useCart()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [closeCart])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const handleDelete = (lineId: string) => {
    startTransition(async () => {
      await deleteLineItem(lineId)
      await refreshCart()
    })
  }

  const handleQuantity = (lineId: string, quantity: number) => {
    if (quantity < 1) return
    startTransition(async () => {
      await updateLineItem({ lineId, quantity })
      await refreshCart()
    })
  }

  const handleCheckout = () => {
    closeCart()
    router.push(`/${handle}/checkout?step=address`)
  }

  const subtotal = cart?.subtotal ?? 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" style={{ color: brandPrimary }} />
                <h2 className="text-lg font-semibold text-gray-900">
                  Cart
                  {cartCount > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      ({cartCount} {cartCount === 1 ? "item" : "items"})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {!cart?.items?.length ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `${brandPrimary}15` }}>
                    <ShoppingBag className="w-8 h-8" style={{ color: brandPrimary }} />
                  </div>
                  <p className="text-gray-900 font-medium">Your cart is empty</p>
                  <p className="text-sm text-gray-400">Add some products to get started</p>
                  <button onClick={closeCart} className="mt-2 text-sm font-medium underline underline-offset-2" style={{ color: brandPrimary }}>
                    Continue shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {cart.items.map((item: any) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        className="flex gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-3"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                          {item.thumbnail ? (
                            <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{item.title}</p>
                          {item.variant?.title && item.variant.title !== "Default Title" && (
                            <p className="text-xs text-gray-400">{item.variant.title}</p>
                          )}
                          <p className="text-sm font-semibold" style={{ color: brandPrimary }}>
                            {formatPrice(item.unit_price ?? 0)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1">
                              <button
                                onClick={() => handleQuantity(item.id, item.quantity - 1)}
                                disabled={isPending || item.quantity <= 1}
                                className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantity(item.id, item.quantity + 1)}
                                disabled={isPending}
                                className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={isPending}
                              className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-auto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart?.items?.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-5 space-y-4 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-gray-400">Shipping and taxes calculated at checkout</p>
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}
                >
                  Checkout <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={closeCart} className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors py-1">
                  Continue shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
