"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setShippingMethod } from "@/lib/cart"
import { Truck, CheckCircle2, Loader2, ArrowRight } from "lucide-react"

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(amount)
}

export default function ShippingForm({
  cart, shippingMethods, handle, brandPrimary = "#e65100", isDark = false, btnTextColor, btnBorderRadius,
}: {
  cart: any; shippingMethods: any[]; handle: string; brandPrimary?: string; isDark?: boolean; btnTextColor?: string; btnBorderRadius?: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<string>(
    cart?.shipping_methods?.[0]?.shipping_option_id ?? ""
  )
  const [isPending, startTransition] = useTransition()

  const hasShipping = !!cart?.shipping_methods?.length && !!cart.shipping_methods[0]?.shipping_option_id

  // Show selector if: no method yet, OR user clicked Edit (step=delivery)
  const isEditing = searchParams.get("step") === "delivery"
  const showSelector = !hasShipping || isEditing

  const handleContinue = () => {
  if (!selected) return
  const isPreview = new URLSearchParams(window.location.search).get("__preview") === "1"
  
  // In preview mode, skip cart mutation
  if (isPreview) {
    router.push(`/${handle}/checkout?step=payment&__preview=1`)
    return
  }

  startTransition(async () => {
    await setShippingMethod({ cartId: cart.id, shippingMethodId: selected })
    router.push(`/${handle}/checkout?step=payment`)
  })
}

  // ── Completed / summary view ─────────────────────────────────────────────────
  if (!showSelector) {
    const method = cart.shipping_methods[0]
    return (
      <div className={`rounded-2xl border shadow-sm p-6 ${isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: `${brandPrimary}20` }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: brandPrimary }} />
            </div>
            <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Shipping Method</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
              style={{
                background: `var(--checkout-btn-bg, ${brandPrimary})`,
                color: `var(--checkout-btn-text, #ffffff)`,
                borderRadius: `var(--checkout-btn-radius, 50px)`,
              }}>Done</span>
          </div>
          <button
            onClick={() => router.push(`/${handle}/checkout?step=delivery`)}
            className="text-sm font-medium underline underline-offset-2"
            style={{ color: brandPrimary }}
          >
            Edit
          </button>
        </div>
        <p className={`text-sm mb-5 ${isDark ? "text-white/50" : "text-gray-600"}`}>
          {method.name ?? "Standard Shipping"} —{" "}
          {method.amount ? formatPrice(method.amount) : "Free"}
        </p>
        <button
          onClick={() => router.push(`/${handle}/checkout?step=payment`)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}
        >
          Continue to Payment <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // ── Selector / edit view ─────────────────────────────────────────────────────
  return (
   <div className={`rounded-2xl border-2 shadow-sm overflow-hidden ${isDark ? "bg-gray-900" : "bg-white"}`}
      style={{ borderColor: brandPrimary }}>
      <div className={`flex items-center gap-3 px-6 py-4 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: `var(--checkout-btn-bg, ${brandPrimary})`,
            color: `var(--checkout-btn-text, #ffffff)`,
            borderRadius: `var(--checkout-btn-radius, 50px)`,
          }}>
          <Truck className="w-4 h-4 text-white" />
        </div>
        <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Shipping Method</h2>
        {hasShipping && (
          <button
            onClick={() => router.push(`/${handle}/checkout?step=payment`)}
            className="ml-auto text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        {!shippingMethods?.length ? (
          <div className="py-8 text-center text-sm text-gray-500">
            <Truck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            No shipping methods available. Contact the store.
          </div>
        ) : (
          <div className="space-y-3">
            {shippingMethods.map((method: any) => {
              const isSelected = selected === method.id
              return (
                <label key={method.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? isDark ? "bg-white/10" : "bg-orange-50"
                      : isDark ? "border-white/10 hover:border-white/20" : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={isSelected ? { borderColor: brandPrimary } : {}}
                >
                  <input type="radio" name="shipping_method" value={method.id}
                    checked={isSelected} onChange={() => setSelected(method.id)}
                    className="w-4 h-4 " style={{ accentColor: brandPrimary }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{method.name}</p>
                  </div>
                  <p className="text-sm font-semibold shrink-0" style={{ color: brandPrimary }}>
                    {method.amount ? formatPrice(method.amount) : "Free"}
                  </p>
                </label>
              )
            })}
          </div>
        )}

        <button onClick={handleContinue} disabled={!selected || isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: brandPrimary,
            color: btnTextColor ?? "#ffffff",
            borderRadius: `${btnBorderRadius ?? 12}px`,
          }}
        >
          {isPending
            ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
            : hasShipping ? <>Save & Continue to Payment</> : <>Continue to Payment <ArrowRight className="w-4 h-4" /></>
          }
        </button>
      </div>
    </div>
  )
}