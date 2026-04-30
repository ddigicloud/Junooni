/**
 * StoreTypeModal.tsx
 * src/features/dashboard/components/StoreTypeModal.tsx
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Globe, Check, ArrowRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StorePreference {
  sell_on_marketplace: boolean
  sell_on_own_store: boolean
}

interface StoreTypeModalProps {
  vendorId: string
  currentPreference?: StorePreference
  onComplete: (pref: StorePreference) => void
  onSkip?: () => void
}

const BRAND = { primary: "#e65100", secondary: "#ac1900" }

export default function StoreTypeModal({
  vendorId,
  currentPreference,
  onComplete,
  onSkip,
}: StoreTypeModalProps) {
  const [pref, setPref] = useState<StorePreference>(
    currentPreference ?? { sell_on_marketplace: false, sell_on_own_store: false }
  )
  const [isSaving, setIsSaving] = useState(false)

  const isInitialChoice = !currentPreference
  const nothingSelected = !pref.sell_on_marketplace && !pref.sell_on_own_store
  const bothSelected = pref.sell_on_marketplace && pref.sell_on_own_store
  const toggle = (key: keyof StorePreference) => setPref(p => ({ ...p, [key]: !p[key] }))

  const handleConfirm = async () => {
    if (nothingSelected) return
    setIsSaving(true)
    try {
      const token = localStorage.getItem("vendorToken")
      await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/vendors/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sell_on_marketplace: pref.sell_on_marketplace, sell_on_own_store: pref.sell_on_own_store }),
      })
      onComplete(pref)
    } catch {
      onComplete(pref)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div className="w-full overflow-y-auto max-h-[90vh] bg-white shadow-2xl rounded-2xl"
        style={{ maxWidth: 560, border: "1px solid rgba(0,0,0,0.08)" }}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase mb-1.5" style={{ color: BRAND.primary }}>
                Store setup
              </p>
              <h2 className="text-xl font-bold leading-snug text-gray-900">
                Where do you want to sell?
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Pick one or both. Change anytime from settings.
              </p>
            </div>
            {(!isInitialChoice || onSkip) && (
              <button
                onClick={onSkip}
                className="ml-4 mt-0.5 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 sm:px-6 py-4">
          {/* Marketplace */}
          <button
            onClick={() => toggle("sell_on_marketplace")}
            className={cn(
              "relative text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-150 group",
              pref.sell_on_marketplace
                ? "border-orange-400 bg-orange-50/60 shadow-sm"
                : "border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/20"
            )}
          >
            {/* Selected check */}
            <div className={cn(
              "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
              pref.sell_on_marketplace ? "bg-[#e65100] border-[#e65100]" : "border-gray-300 bg-white"
            )}>
              {pref.sell_on_marketplace && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </div>

            {/* Icon */}
            <div className="flex items-center justify-center mb-3 rounded-lg w-9 h-9" style={{ background: "#fff0e8" }}>
              <ShoppingBag className="w-4.5 h-4.5" style={{ color: BRAND.primary, width: 18, height: 18 }} />
            </div>

            <p className="text-sm font-semibold text-gray-900 mb-0.5 pr-6">Junooni marketplace</p>
            {/* <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2" style={{ background: BRAND.primary, color: "white" }}>
              Most popular
            </span> */}
            <p className="mb-3 text-xs leading-relaxed text-gray-500">
              List your merch on junooni.com. Fans discover you through the platform.
            </p>

            <div className="space-y-1.5 border-t border-gray-100 pt-3">
              {["Instant setup, live today", "Built-in fan discovery", "Shared platform traffic"].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full shrink-0" style={{ background: BRAND.primary }} />
                  <span className="text-[11px] text-gray-500">{f}</span>
                </div>
              ))}
            </div>
          </button>

          {/* Own store */}
          <button
            onClick={() => toggle("sell_on_own_store")}
            className={cn(
              "relative text-left p-4 rounded-xl border-2 transition-all duration-150 group",
              pref.sell_on_own_store
                ? "border-emerald-400 bg-emerald-50/60 shadow-sm"
                : "border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/20"
            )}
          >
            {/* Selected check */}
            <div className={cn(
              "absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
              pref.sell_on_own_store ? "bg-emerald-500 border-emerald-500" : "border-gray-300 bg-white"
            )}>
              {pref.sell_on_own_store && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </div>

            {/* Icon */}
            <div className="flex items-center justify-center mb-3 rounded-lg w-9 h-9" style={{ background: "#e8f5e9" }}>
              <Globe className="w-4.5 h-4.5 text-emerald-600" style={{ width: 18, height: 18 }} />
            </div>

            <p className="text-sm font-semibold text-gray-900 mb-0.5 pr-6">Your own store</p>
            {/* <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2" style={{ background: "#e8f5e9", color: "#166534" }}>
              Fourthwall-style
            </span> */}
            <p className="mb-3 text-xs leading-relaxed text-gray-500">
              Branded site at your own domain. JUNOONI handles fulfillment invisibly.
            </p>

            <div className="space-y-1.5 border-t border-gray-100 pt-3">
              {["Custom domain (yourname.com)", "100% your branding & colors", "Full page builder included"].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full shrink-0 bg-emerald-500" />
                  <span className="text-[11px] text-gray-500">{f}</span>
                </div>
              ))}
            </div>
          </button>
        </div>

        {/* ── Context note ── */}
        {bothSelected && (
          <div className="mx-6 mb-3 px-3 py-2.5 rounded-lg text-xs font-medium text-amber-800 bg-amber-50 border border-amber-100">
            Both selected — merch will appear on junooni.com AND your branded storefront simultaneously.
          </div>
        )}
        {!bothSelected && pref.sell_on_own_store && (
          <div className="mx-6 mb-3 px-3 py-2.5 rounded-lg text-xs text-blue-700 bg-blue-50 border border-blue-100">
            Our team will help configure your domain and branded theme after you confirm.
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex flex-col gap-2 px-6 pt-2 pb-6">
          <Button
            disabled={nothingSelected || isSaving}
            onClick={handleConfirm}
            className="w-full text-sm font-semibold transition-all h-11 rounded-xl"
            style={!nothingSelected ? {
              background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)`,
              color: "white",
              boxShadow: "0 2px 12px rgba(230,81,0,0.3)",
            } : {}}
          >
            {isSaving ? "Saving..." : (
              <span className="flex items-center gap-2">
                Confirm and continue
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>

          {isInitialChoice && onSkip && (
            <button
              onClick={onSkip}
              className="py-1 text-xs text-center text-gray-400 transition-colors hover:text-gray-600"
            >
              Decide later
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Store mode badge ──────────────────────────────────────────────────────────

export function StoreModeBadge({
  pref,
  onChangeClick,
}: {
  pref: StorePreference
  onChangeClick: () => void
}) {
  if (!pref.sell_on_marketplace && !pref.sell_on_own_store) return null

  const both = pref.sell_on_marketplace && pref.sell_on_own_store
  const label = both ? "Both stores" : pref.sell_on_marketplace ? "Marketplace" : "Own store"
  const Icon = pref.sell_on_own_store && !pref.sell_on_marketplace ? Globe : ShoppingBag

  return (
    <button
      onClick={onChangeClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all hover:shadow-sm text-xs font-medium"
      style={{ borderColor: "#fde0cc", background: "#fff5f0", color: "#e65100" }}
      title="Click to change store settings"
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}