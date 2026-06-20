// "use client"

// import { useState, useTransition } from "react"
// import Image from "next/image"
// import { placeOrder } from "@/lib/cart"
// import { Loader2, ShieldCheck } from "lucide-react"

// function formatPrice(amount: number) {
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency", currency: "INR", maximumFractionDigits: 0,
//   }).format(amount)
// }

// // Load Razorpay script
// const loadRazorpayScript = (): Promise<boolean> =>
//   new Promise((resolve) => {
//     if ((window as any).Razorpay) { resolve(true); return }
//     const script = document.createElement("script")
//     script.src = "https://checkout.razorpay.com/v1/checkout.js"
//     script.onload = () => resolve(true)
//     script.onerror = () => resolve(false)
//     document.body.appendChild(script)
//   })

// export default function ReviewForm({
//   cart, handle, brandPrimary = "#e65100",
// }: {
//   cart: any; handle: string; brandPrimary?: string
// }) {
//   const [isPending, startTransition] = useTransition()
//   const [error, setError] = useState<string | null>(null)
//   const [isProcessing, setIsProcessing] = useState(false)

//   const activeSession = cart?.payment_collection?.payment_sessions?.find(
//     (s: any) => s.status === "pending"
//   )

//   const isRazorpay = activeSession?.provider_id?.includes("razorpay")
//   const isCOD = activeSession?.provider_id === "pp_system_default"

//   const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
//   const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

//   // ── Authorize payment with Medusa after Razorpay success ──────────────────
//   const authorizePayment = async (razorpayResponse: any) => {
//     const res = await fetch(`${BACKEND_URL}/store/razorpay/authorize`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-publishable-api-key": PUB_KEY,
//       },
//       body: JSON.stringify({
//         razorpay_payment_id: razorpayResponse.razorpay_payment_id,
//         razorpay_order_id: razorpayResponse.razorpay_order_id,
//         razorpay_signature: razorpayResponse.razorpay_signature,
//         collection_id: cart.payment_collection?.id,
//         session_id: activeSession?.id,
//       }),
//     })
//     if (!res.ok) {
//       const err = await res.json().catch(() => ({}))
//       throw new Error(err.error || `Authorization failed: ${res.status}`)
//     }
//     return res.json()
//   }

//   // ── Handle Pay Now ────────────────────────────────────────────────────────
//   const handlePlaceOrder = () => {
//     setError(null)

//     if (isCOD) {
//       // COD: just complete the cart directly
//       startTransition(async () => {
//         try {
//           await placeOrder(handle)
//         } catch (e: any) {
//           setError(e.message)
//         }
//       })
//       return
//     }

//     if (isRazorpay) {
//       setIsProcessing(true)

//       loadRazorpayScript().then(loaded => {
//         if (!loaded) {
//           setError("Failed to load Razorpay. Please refresh and try again.")
//           setIsProcessing(false)
//           return
//         }

//         // Get Razorpay order ID from session data (same as storefront)
//         const razorpayOrderId = activeSession?.data?.id
//         if (!razorpayOrderId) {
//           setError("Payment session not properly initialized. Please go back and re-select payment method.")
//           setIsProcessing(false)
//           return
//         }

//         const options: any = {
//           // key comes from session.data.key_id (set by Medusa Razorpay plugin)
//           key: activeSession?.data?.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
//           amount: activeSession?.data?.amount,
//           currency: activeSession?.data?.currency || "INR",
//           name: "JUNOONI",
//           image: "https://studio.junooni.com/assets/junooni-favicon-BskTzyxn.png",
//           description: "Creator Merchandise",
//           order_id: razorpayOrderId,
//           prefill: {
//             name: `${cart.shipping_address?.first_name ?? ""} ${cart.shipping_address?.last_name ?? ""}`.trim(),
//             email: cart.email ?? "",
//             contact: cart.shipping_address?.phone ?? cart.billing_address?.phone ?? "",
//           },
//           theme: { color: brandPrimary },

//           handler: async (response: any) => {
//             try {
//               setError(null)
//               // Step 1: Authorize with Medusa (same as storefront PaymentButton)
//               await authorizePayment(response)
//               // Step 2: Complete the cart / place order
//               await placeOrder(handle)
//             } catch (e: any) {
//               setError(e.message || "Order placement failed")
//               setIsProcessing(false)
//             }
//           },

//           modal: {
//             ondismiss: () => {
//               setIsProcessing(false)
//             },
//           },
//         }

//         try {
//           const rzp = new (window as any).Razorpay(options)
//           rzp.on("payment.failed", (response: any) => {
//             setError(`Payment failed: ${response.error?.description ?? "Unknown error"}`)
//             setIsProcessing(false)
//           })
//           rzp.open()
//         } catch (e: any) {
//           setError("Failed to open Razorpay. Please try again.")
//           setIsProcessing(false)
//         }
//       })
//       return
//     }

//     // Fallback for other providers
//     startTransition(async () => {
//       try {
//         await placeOrder(handle)
//       } catch (e: any) {
//         setError(e.message)
//       }
//     })
//   }

//   const loading = isPending || isProcessing

//   return (
//     <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
//       <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
//         <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ background: brandPrimary }}>
//           <ShieldCheck className="w-4 h-4 text-white" />
//         </div>
//         <h2 className="text-base font-semibold text-gray-900">Review & Place Order</h2>
//       </div>

//       <div className="p-6 space-y-6">
//         {/* Items */}
//         <div>
//           <p className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">Order Items</p>
//           <div className="space-y-3">
//             {cart?.items?.map((item: any) => (
//               <div key={item.id} className="flex items-center gap-3">
//                 <div className="relative w-12 h-12 overflow-hidden bg-gray-100 rounded-lg shrink-0">
//                   {item.thumbnail && (
//                     <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
//                   )}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
//                   {item.variant?.title && item.variant.title !== "Default Title" && (
//                     <p className="text-xs text-gray-400">{item.variant.title}</p>
//                   )}
//                   <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
//                 </div>
//                 <p className="text-sm font-semibold shrink-0" style={{ color: brandPrimary }}>
//                   {formatPrice((item.unit_price ?? 0) * item.quantity)}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Totals */}
//         <div className="pt-4 space-y-2 border-t border-gray-100">
//           <div className="flex justify-between text-sm text-gray-600">
//             <span>Subtotal</span><span>{formatPrice(cart?.subtotal ?? 0)}</span>
//           </div>
//           {(cart?.shipping_total ?? 0) > 0 && (
//             <div className="flex justify-between text-sm text-gray-600">
//               <span>Shipping</span><span>{formatPrice(cart.shipping_total)}</span>
//             </div>
//           )}
//           {(cart?.shipping_total ?? 0) === 0 && (
//             <div className="flex justify-between text-sm text-gray-600">
//               <span>Shipping</span><span className="font-medium text-green-600">Free</span>
//             </div>
//           )}
//           {(cart?.tax_total ?? 0) > 0 && (
//             <div className="flex justify-between text-sm text-gray-600">
//               <span>Tax</span><span>{formatPrice(cart.tax_total)}</span>
//             </div>
//           )}
//           <div className="flex justify-between pt-2 text-base font-bold text-gray-900 border-t border-gray-100">
//             <span>Total</span>
//             <span style={{ color: brandPrimary }}>{formatPrice(cart?.total ?? 0)}</span>
//           </div>
//         </div>

//         {/* Payment method */}
//         <div className="px-4 py-3 text-sm text-gray-600 rounded-xl bg-gray-50">
//           Payment:{" "}
//           {isRazorpay
//             ? "💳 Card / UPI / Netbanking via Razorpay"
//             : isCOD
//             ? "💵 Cash on Delivery"
//             : activeSession?.provider_id ?? "—"
//           }
//         </div>

//         {/* Error */}
//         {error && (
//           <p className="px-4 py-3 text-sm text-red-600 border border-red-100 bg-red-50 rounded-xl">
//             {error}
//           </p>
//         )}

//         {/* CTA */}
//         <button
//           onClick={handlePlaceOrder}
//           disabled={loading}
//           className="flex items-center justify-center w-full gap-2 py-4 text-base font-bold text-white transition-all rounded-xl hover:opacity-90 disabled:opacity-60"
//           style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}
//         >
//           {loading ? (
//             <>
//               <Loader2 className="w-5 h-5 animate-spin" />
//               {isRazorpay ? "Opening payment..." : "Placing order..."}
//             </>
//           ) : (
//             isRazorpay ? "Pay Now" : isCOD ? "Place Order" : "Pay Now"
//           )}
//         </button>

//         <p className="flex items-center justify-center gap-1 text-xs text-center text-gray-400">
//           <ShieldCheck className="w-3.5 h-3.5" />
//           Secure checkout · Powered by Razorpay
//         </p>
//       </div>
//     </div>
//   )
// }

"use client"

import { useState, useTransition } from "react"
import { placeOrder } from "@/lib/cart"
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react"

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

  const handlePlaceOrder = () => {
    setError(null)

    if (isCOD) {
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

        const razorpayOrderId = activeSession?.data?.id
        if (!razorpayOrderId) {
          setError("Payment session not properly initialized. Please go back and re-select payment method.")
          setIsProcessing(false)
          return
        }

        const options: any = {
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
              await authorizePayment(response)
              await placeOrder(handle)
            } catch (e: any) {
              setError(e.message || "Order placement failed")
              setIsProcessing(false)
            }
          },
          modal: {
            ondismiss: () => { setIsProcessing(false) },
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
    <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full"
          style={{ background: brandPrimary }}
        >
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">Review & Place Order</h2>
      </div>

      {/* Body */}
      <div className="flex flex-col items-center gap-6 p-8">
        {/* Almost there banner */}
        <div
          className="flex items-center w-full gap-3 px-4 py-3 rounded-xl"
          style={{ background: `${brandPrimary}18` }}
        >
          <div
            className="flex items-center justify-center rounded-full w-7 h-7 shrink-0"
            style={{ background: brandPrimary }}
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Almost there!</p>
            <p className="text-xs text-gray-500">Review your order details before completing your purchase</p>
          </div>
        </div>

        {/* Big checkmark */}
        <div
          className="flex items-center justify-center w-20 h-20 mt-2 rounded-full"
          style={{ background: brandPrimary }}
        >
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-1 text-center">
          <h3 className="text-xl font-bold text-gray-900">Complete Your Purchase</h3>
          {activeSession && (
            <p className="text-sm text-gray-400">
              {isRazorpay
                ? "You'll be redirected to Razorpay to complete payment"
                : isCOD
                ? "Pay cash when your order arrives"
                : activeSession.provider_id}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="w-full px-4 py-3 text-sm text-red-600 border border-red-100 bg-red-50 rounded-xl">
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="flex items-center justify-center w-full gap-2 py-4 text-base font-bold text-white transition-all rounded-xl hover:opacity-90 disabled:opacity-60"
          style={{ background: loading ? "#666" : `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}
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

        <p className="flex items-center justify-center gap-1 text-xs text-center text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Your payment information is secure and encrypted
        </p>
      </div>
    </div>
  )
}