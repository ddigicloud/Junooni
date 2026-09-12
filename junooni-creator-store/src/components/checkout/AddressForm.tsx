"use client"

import { useTransition, useCallback } from "react"
import { useFormState } from "react-dom"
import { useRouter, useSearchParams } from "next/navigation"
import { setAddresses } from "@/lib/cart"
import { Loader2, MapPin, CheckCircle2, ArrowRight } from "lucide-react"

function getInputClass(isDark: boolean) {
  return isDark
    ? "w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all"
    : "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all"
}

function Field({
  label, name, type = "text", placeholder, required, defaultValue,
  brandPrimary, isDark = false, minLength, pattern, title,
}: {
  label: string; name: string; type?: string; placeholder?: string
  required?: boolean; defaultValue?: string; brandPrimary: string; isDark?: boolean
  minLength?: number; pattern?: string; title?: string
}) {
  return (
    <div>
      <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${isDark ? "text-white/50" : "text-gray-600"}`}>
        {label} {required && <span style={{ color: brandPrimary }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        className={getInputClass(isDark)}
        minLength={minLength}
        pattern={pattern}
        title={title}
      />
    </div>
  )
}

export default function AddressForm({
  cart, handle, brandPrimary = "#e65100", isDark = false, btnTextColor, btnBorderRadius,
}: {
  cart: any; handle: string; brandPrimary?: string; isDark?: boolean
  btnTextColor?: string; btnBorderRadius?: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // useActionState replaces deprecated useFormState
  const boundSetAddresses = useCallback(async (state: unknown, formData: FormData) => {
    const isPreview = new URLSearchParams(window.location.search).get("__preview") === "1"

    if (isPreview) {
      router.push(`/${handle}/checkout?step=delivery&__preview=1`)
      return null
    }

    const err = await setAddresses(handle, state, formData)
    if (!err) {
      router.push(`/${handle}/checkout?step=delivery`)
    }
    return err
    // router intentionally omitted — Next.js router reference is stable
    // but including it causes unnecessary re-creation of the action
  }, [handle]) // eslint-disable-line react-hooks/exhaustive-deps

  const [message, formAction] = useFormState(boundSetAddresses, null)

  const addr = cart?.shipping_address
  const hasAddress = !!addr?.first_name && !!addr?.address_1 && !!addr?.city

  const isEditing = searchParams.get("step") === "address"
  const showForm = !hasAddress || isEditing

  if (!showForm) {
    return (
      <div className={`p-6 border shadow-sm rounded-2xl ${isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full"
              style={{ background: `${brandPrimary}20` }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: brandPrimary }} />
            </div>
            <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Shipping Address
            </h2>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: `var(--checkout-btn-bg, ${brandPrimary})`,
                color: `var(--checkout-btn-text, #ffffff)`,
                borderRadius: `var(--checkout-btn-radius, 50px)`,
              }}
            >
              Done
            </span>
          </div>
          <button
            onClick={() => router.push(`/${handle}/checkout?step=address`)}
            className="text-sm font-medium underline underline-offset-2"
            style={{ color: brandPrimary }}
          >
            Edit
          </button>
        </div>

        <div className={`grid grid-cols-1 gap-4 mb-5 text-sm sm:grid-cols-2 ${isDark ? "text-white/50" : "text-gray-600"}`}>
          <div>
            <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
              {addr.first_name} {addr.last_name}
            </p>
            <p>{addr.address_1}</p>
            <p>{addr.city}, {addr.province} {addr.postal_code}</p>
          </div>
          <div>
            <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Contact</p>
            <p>{addr.phone}</p>
            <p>{cart.email}</p>
          </div>
        </div>

        <button
          onClick={() => router.push(`/${handle}/checkout?step=delivery`)}
          className="flex items-center justify-center w-full gap-2 py-3 text-sm font-semibold transition-all hover:opacity-90"
          style={{
            background: `linear-gradient(135deg, ${brandPrimary} 0%, var(--brand-secondary, #ac1900) 100%)`,
            color: btnTextColor ?? "#ffffff",
            borderRadius: `${btnBorderRadius ?? 12}px`,
          }}
        >
          Continue to Shipping <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      className={`overflow-hidden border-2 shadow-sm rounded-2xl w-full min-w-0 ${isDark ? "bg-gray-900" : "bg-white"}`}
      style={{ borderColor: brandPrimary }}
    >
      <div className={`flex items-center gap-3 px-6 py-4 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
          style={{
            background: `var(--checkout-btn-bg, ${brandPrimary})`,
            color: `var(--checkout-btn-text, #ffffff)`,
          }}
        >
          <MapPin className="w-4 h-4 text-white" />
        </div>
        <h2 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
          Shipping Address
        </h2>
        {hasAddress && (
          <button
            onClick={() => router.push(`/${handle}/checkout?step=delivery`)}
            className="ml-auto text-sm text-gray-400 transition-colors hover:text-gray-600"
          >
            Cancel
          </button>
        )}
      </div>

      <form action={formAction} className="p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="First name" name="first_name" placeholder="Rahul" required
            brandPrimary={brandPrimary} defaultValue={addr?.first_name} isDark={isDark}
            minLength={2} pattern="[A-Za-z\s\-']+" title="At least 2 letters" />
          <Field label="Last name" name="last_name" placeholder="Sharma" required
            brandPrimary={brandPrimary} defaultValue={addr?.last_name} isDark={isDark}
            minLength={2} pattern="[A-Za-z\s\-']+" title="At least 2 letters" />
        </div>

        {/* isDark now passed consistently to all fields */}
        <Field label="Email" name="email" type="email" placeholder="rahul@example.com" required
          brandPrimary={brandPrimary} defaultValue={cart?.email} isDark={isDark} />

        <Field label="Phone" name="phone" type="tel" placeholder="+91 98765 43210" required
          brandPrimary={brandPrimary} defaultValue={addr?.phone} isDark={isDark}
          pattern="[+]?[0-9\s\-]{8,15}" title="Valid phone number (8–15 digits)" />

        <Field label="Address" name="address_1" placeholder="House no, Street, Area" required
          brandPrimary={brandPrimary} defaultValue={addr?.address_1} isDark={isDark}
          minLength={10} title="Enter a full address (min 10 characters)" />

        <Field label="Apartment / Floor (optional)" name="address_2" placeholder="Apt, Suite, Floor"
          brandPrimary={brandPrimary} defaultValue={addr?.address_2} isDark={isDark} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="City" name="city" placeholder="Mumbai" required
            brandPrimary={brandPrimary} defaultValue={addr?.city} isDark={isDark}
            minLength={2} pattern="[A-Za-z\s\-]+" title="Valid city name" />
          <Field label="State" name="province" placeholder="Maharashtra" required
            brandPrimary={brandPrimary} defaultValue={addr?.province} isDark={isDark}
            minLength={2} pattern="[A-Za-z\s]+" title="Valid state name" />
          <Field label="Pincode" name="postal_code" placeholder="400001" required
            brandPrimary={brandPrimary} defaultValue={addr?.postal_code} isDark={isDark}
            pattern="[1-9][0-9]{5}" title="6-digit Indian pincode (no leading zero)" />
        </div>

        <label className="flex items-center gap-3 py-1 cursor-pointer">
          <input
            type="checkbox"
            name="same_as_billing"
            defaultChecked
            className="w-4 h-4 rounded"
            style={{ accentColor: brandPrimary }}
          />
          <span className={`text-sm ${isDark ? "text-white/50" : "text-gray-600"}`}>
            Billing address same as shipping
          </span>
        </label>

        {message && (
          <p className="px-4 py-3 text-sm text-red-600 border border-red-100 bg-red-50 rounded-xl">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
          style={{
            background: brandPrimary,
            color: btnTextColor ?? "#ffffff",
            borderRadius: `${btnBorderRadius ?? 12}px`,
          }}
        >
          {isPending
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            : hasAddress ? <>Save changes</> : <>Continue to Shipping</>
          }
        </button>
      </form>
    </div>
  )
}