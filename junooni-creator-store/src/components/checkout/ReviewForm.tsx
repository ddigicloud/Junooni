"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { placeOrder } from "@/lib/cart"
import { Loader2, ShieldCheck } from "lucide-react"

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(amount)
}

// Load Razorpay script
const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

export default function ReviewForm({
  cart, handle, brandPrimary = "#e65100",
}: {
  cart: any; handle: string; brandPrimary?: string
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const activeSession = cart?.payment_collection?.payment_sessions?.find(
    (s: any) => s.status === "pending"
  )

  const isRazorpay = activeSession?.provider_id?.includes("razorpay")
  const isCOD = activeSession?.provider_id === "pp_system_default"

  const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
  const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

  // ── Authorize payment with Medusa after Razorpay success ──────────────────
  const authorizePayment = async (razorpayResponse: any) => {
    const res = await fetch(`${BACKEND_URL}/store/razorpay/authorize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUB_KEY,
      },
      body: JSON.stringify({
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
        collection_id: cart.payment_collection?.id,
        session_id: activeSession?.id,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Authorization failed: ${res.status}`)
    }
    return res.json()
  }

  // ── Handle Pay Now ────────────────────────────────────────────────────────
  const handlePlaceOrder = () => {
    setError(null)

    if (isCOD) {
      // COD: just complete the cart directly
      startTransition(async () => {
        try {
          await placeOrder(handle)
        } catch (e: any) {
          setError(e.message)
        }
      })
      return
    }

    if (isRazorpay) {
      setIsProcessing(true)

      loadRazorpayScript().then(loaded => {
        if (!loaded) {
          setError("Failed to load Razorpay. Please refresh and try again.")
          setIsProcessing(false)
          return
        }

        // Get Razorpay order ID from session data (same as storefront)
        const razorpayOrderId = activeSession?.data?.id
        if (!razorpayOrderId) {
          setError("Payment session not properly initialized. Please go back and re-select payment method.")
          setIsProcessing(false)
          return
        }

        const options: any = {
          // key comes from session.data.key_id (set by Medusa Razorpay plugin)
          key: activeSession?.data?.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: activeSession?.data?.amount,
          currency: activeSession?.data?.currency || "INR",
          name: "JUNOONI",
          image: "https://studio.junooni.com/assets/junooni-favicon-BskTzyxn.png",
          description: "Creator Merchandise",
          order_id: razorpayOrderId,
          prefill: {
            name: `${cart.shipping_address?.first_name ?? ""} ${cart.shipping_address?.last_name ?? ""}`.trim(),
            email: cart.email ?? "",
            contact: cart.shipping_address?.phone ?? cart.billing_address?.phone ?? "",
          },
          theme: { color: brandPrimary },

          handler: async (response: any) => {
            try {
              setError(null)
              // Step 1: Authorize with Medusa (same as storefront PaymentButton)
              await authorizePayment(response)
              // Step 2: Complete the cart / place order
              await placeOrder(handle)
            } catch (e: any) {
              setError(e.message || "Order placement failed")
              setIsProcessing(false)
            }
          },

          modal: {
            ondismiss: () => {
              setIsProcessing(false)
            },
          },
        }

        try {
          const rzp = new (window as any).Razorpay(options)
          rzp.on("payment.failed", (response: any) => {
            setError(`Payment failed: ${response.error?.description ?? "Unknown error"}`)
            setIsProcessing(false)
          })
          rzp.open()
        } catch (e: any) {
          setError("Failed to open Razorpay. Please try again.")
          setIsProcessing(false)
        }
      })
      return
    }

    // Fallback for other providers
    startTransition(async () => {
      try {
        await placeOrder(handle)
      } catch (e: any) {
        setError(e.message)
      }
    })
  }

  const loading = isPending || isProcessing

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: brandPrimary }}>
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">Review & Place Order</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Items */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Order Items</p>
          <div className="space-y-3">
            {cart?.items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {item.thumbnail && (
                    <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                  {item.variant?.title && item.variant.title !== "Default Title" && (
                    <p className="text-xs text-gray-400">{item.variant.title}</p>
                  )}
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold shrink-0" style={{ color: brandPrimary }}>
                  {formatPrice((item.unit_price ?? 0) * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span><span>{formatPrice(cart?.subtotal ?? 0)}</span>
          </div>
          {(cart?.shipping_total ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span><span>{formatPrice(cart.shipping_total)}</span>
            </div>
          )}
          {(cart?.shipping_total ?? 0) === 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span><span className="text-green-600 font-medium">Free</span>
            </div>
          )}
          {(cart?.tax_total ?? 0) > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax</span><span>{formatPrice(cart.tax_total)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span style={{ color: brandPrimary }}>{formatPrice(cart?.total ?? 0)}</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Payment:{" "}
          {isRazorpay
            ? "💳 Card / UPI / Netbanking via Razorpay"
            : isCOD
            ? "💵 Cash on Delivery"
            : activeSession?.provider_id ?? "—"
          }
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-bold text-base transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isRazorpay ? "Opening payment..." : "Placing order..."}
            </>
          ) : (
            isRazorpay ? "Pay Now" : isCOD ? "Place Order" : "Pay Now"
          )}
        </button>

        <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Secure checkout · Powered by Razorpay
        </p>
      </div>
    </div>
  )
}