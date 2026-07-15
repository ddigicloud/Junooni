"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { initiatePaymentSession } from "@/lib/cart"
import { CreditCard, CheckCircle2, Loader2, ArrowRight } from "lucide-react"

const PROVIDER_LABELS: Record<string, { label: string; desc: string; icon: string }> = {
  "pp_razorpay_razorpay": {
    label: "Card / UPI / Netbanking",
    desc: "Pay securely via Razorpay — all UPI apps, cards & netbanking",
    icon: "💳",
  },
  "pp_system_default": {
    label: "Cash on Delivery",
    desc: "Pay when your order arrives",
    icon: "💵",
  },
}

function getProviderLabel(id: string) {
  return PROVIDER_LABELS[id] ?? {
    label: id.replace("pp_", "").replace(/_/g, " "),
    desc: "Secure payment",
    icon: "💳",
  }
}

export default function PaymentForm({
  cart, paymentMethods, handle, brandPrimary = "#e65100", isDark = false,
}: {
  cart: any; paymentMethods: any[]; handle: string; brandPrimary?: string; isDark?: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isPreview = searchParams.get("__preview") === "1"
  const activeSession = cart?.payment_collection?.payment_sessions?.find(
    (s: any) => s.status === "pending"
  )
  const [selected, setSelected] = useState<string>(
    activeSession?.provider_id ?? paymentMethods?.[0]?.id ?? ""
  )
  const [isPending, startTransition] = useTransition()

  const hasPayment = !!activeSession
  const isEditing = searchParams.get("step") === "payment"
  const showSelector = !hasPayment || isEditing

  const handleContinue = () => {
  if (!selected) return
  
  const isPreview = new URLSearchParams(window.location.search).get("__preview") === "1"
  if (isPreview) {
    router.push(`/${handle}/checkout?step=review&__preview=1`)
    return
  }

  startTransition(async () => {
    await initiatePaymentSession(cart, { provider_id: selected })
    router.push(`/${handle}/checkout?step=review`)
  })
}

  // ── Completed / summary view ─────────────────────────────────────────────────
  if (!showSelector) {
    const info = getProviderLabel(activeSession.provider_id)
    return (
      <div className={`rounded-2xl border ${isDark ? "border-white/10" : "border-gray-100"} ${isDark ? "bg-gray-900" : "bg-white"} shadow-sm p-6`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: `${brandPrimary}20` }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: brandPrimary }} />
            </div>
            <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Payment</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
              style={{ background: brandPrimary }}>Done</span>
          </div>
          <button
            onClick={() => router.push(`/${handle}/checkout?step=payment${isPreview ? "&__preview=1" : ""}`)}
            className="text-sm font-medium underline underline-offset-2"
            style={{ color: brandPrimary }}
          >
            Edit
          </button>
        </div>
        <p className={`text-sm ${isDark ? "text-white/50" : "text-gray-600"} ml-11 mb-4`}>{info.icon} {info.label}</p>
        <button
          onClick={() => router.push(`/${handle}/checkout?step=review${isPreview ? "&__preview=1" : ""}`)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}
        >
          Continue to Review <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // ── Selector / edit view ─────────────────────────────────────────────────────
  return (
    <div className={`rounded-2xl border-2 ${isDark ? "bg-gray-900" : "bg-white"} shadow-sm overflow-hidden`}
      style={{ borderColor: brandPrimary }}>
      <div className={`flex items-center gap-3 px-6 py-4 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: brandPrimary }}>
          <CreditCard className="w-4 h-4 text-white" />
        </div>
        <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Payment</h2>
        {hasPayment && (
          <button
            onClick={() => router.push(`/${handle}/checkout?step=review`)}
            className={`ml-auto text-sm ${isDark ? "text-white/50" : "text-gray-400"} hover:${isDark ? "text-white" : "text-gray-600"} transition-colors`}
          >
            Cancel
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        <p className={`text-xs ${isDark ? "text-white/50" : "text-gray-400"} flex items-center gap-1.5`}>
          <span>🔒</span> Your payment info is secure and encrypted
        </p>

        <div className="space-y-3">
          {paymentMethods?.map((method: any) => {
            const info = getProviderLabel(method.id)
            const isSelected = selected === method.id
            return (
              <label key={method.id}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected ? "bg-orange-50" : "border-gray-200 hover:border-gray-300"
                }`}
                style={isSelected ? { borderColor: brandPrimary } : {}}
              >
                <input type="radio" name="payment_method" value={method.id}
                  checked={isSelected} onChange={() => setSelected(method.id)}
                  className="w-4 h-4 mt-0.5" style={{ accentColor: brandPrimary }}
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${
                    isSelected || !isDark ? "text-gray-900" : "text-white"
                  }`}>
                    {info.icon} {info.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    isSelected || !isDark ? "text-gray-500" : "text-white/50"
                  }`}>
                    {info.desc}
                  </p>
                </div>
              </label>
            )
          })}
        </div>

        <button onClick={handleContinue} disabled={!selected || isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}
        >
          {isPending
            ? <><Loader2 className="w-4 h-4 animate-spin" />Setting up payment...</>
            : hasPayment ? <>Save & Continue to Review</> : <>Continue to Review</>
          }
        </button>
      </div>
    </div>
  )
}