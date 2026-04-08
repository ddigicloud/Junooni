"use client"

import { useEffect } from "react"
import Link from "next/link"
import { CheckCircle2, ArrowRight, Package } from "lucide-react"
import { useCart } from "@/context/CartContext"

interface Props {
  params: { handle: string; orderId: string }
}

export default function OrderConfirmationPage({ params }: Props) {
  const { handle, orderId } = params
  const { clearCart } = useCart()

  // Clear cart state when order confirmation page loads
  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h1>
        <p className="text-gray-500 text-sm mb-3">
          Thank you for your order. You will receive a confirmation email shortly.
        </p>

        {orderId && orderId !== "confirmed" && (
          <div className="inline-block text-xs text-gray-400 font-mono bg-gray-100 px-3 py-2 rounded-lg mb-6">
            Order ID: {orderId}
          </div>
        )}

        <div className="space-y-3 mb-8 p-5 rounded-2xl border border-gray-100 bg-white text-left shadow-sm">
          {[
            { icon: "📦", text: "Your order is being processed" },
            { icon: "✉️", text: "Confirmation email sent to your inbox" },
            { icon: "🚚", text: "Tracking info will be sent once shipped" },
            { icon: "💬", text: "Questions? Contact the creator" },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm text-gray-700">{item.text}</span>
            </div>
          ))}
        </div>

        <Link
          href={`/${handle}`}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: "linear-gradient(135deg, #e65100 0%, #ac1900 100%)" }}
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}