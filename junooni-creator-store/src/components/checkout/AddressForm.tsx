"use client"

import { useFormState } from "react-dom"
import { useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setAddresses } from "@/lib/cart"
import { Loader2, MapPin, CheckCircle2, ArrowRight } from "lucide-react"

const INPUT_CLASS =
  "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all"

function Field({ label, name, type = "text", placeholder, required, defaultValue, brandPrimary }: {
  label: string; name: string; type?: string; placeholder?: string
  required?: boolean; defaultValue?: string; brandPrimary: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
        {label} {required && <span style={{ color: brandPrimary }}>*</span>}
      </label>
      <input type={type} name={name} placeholder={placeholder} required={required}
        defaultValue={defaultValue} className={INPUT_CLASS} />
    </div>
  )
}

export default function AddressForm({
  cart, handle, brandPrimary = "#e65100", isDark = false,
}: {
  cart: any; handle: string; brandPrimary?: string; isDark?: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [message, formAction] = useFormState(
    async (state: unknown, formData: FormData) => {
      const err = await setAddresses(state, formData)
      if (!err) {
        window.location.href = `/${handle}/checkout?step=delivery`
      }
      return err
    },
    null
  )

  const addr = cart?.shipping_address
  const hasAddress = !!addr?.first_name && !!addr?.address_1 && !!addr?.city

  // Show form if: no address yet, OR user clicked Edit (step=address in URL)
  const isEditing = searchParams.get("step") === "address"
  const showForm = !hasAddress || isEditing

  // ── Completed / summary view ─────────────────────────────────────────────────
  if (!showForm) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: `${brandPrimary}20` }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: brandPrimary }} />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Shipping Address</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
              style={{ background: brandPrimary }}>Done</span>
          </div>
          <button
            onClick={() => router.push(`/${handle}/checkout?step=address`)}
            className="text-sm font-medium underline underline-offset-2"
            style={{ color: brandPrimary }}
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 mb-5">
          <div>
            <p className="font-medium text-gray-900">{addr.first_name} {addr.last_name}</p>
            <p>{addr.address_1}</p>
            <p>{addr.city}, {addr.province} {addr.postal_code}</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Contact</p>
            <p>{addr.phone}</p>
            <p>{cart.email}</p>
          </div>
        </div>

        <button
          onClick={() => router.push(`/${handle}/checkout?step=delivery`)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}
        >
          Continue to Shipping <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // ── Edit / entry form ────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border-2 bg-white shadow-sm overflow-hidden"
      style={{ borderColor: brandPrimary }}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: brandPrimary }}>
          <MapPin className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">Shipping Address</h2>
        {hasAddress && (
          <button
            onClick={() => router.push(`/${handle}/checkout?step=delivery`)}
            className="ml-auto text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <form action={formAction} className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First name" name="first_name" placeholder="Rahul" required brandPrimary={brandPrimary} defaultValue={addr?.first_name} />
          <Field label="Last name" name="last_name" placeholder="Sharma" required brandPrimary={brandPrimary} defaultValue={addr?.last_name} />
        </div>
        <Field label="Email" name="email" type="email" placeholder="rahul@example.com" required brandPrimary={brandPrimary} defaultValue={cart?.email} />
        <Field label="Phone" name="phone" type="tel" placeholder="+91 98765 43210" required brandPrimary={brandPrimary} defaultValue={addr?.phone} />
        <Field label="Address" name="address_1" placeholder="House no, Street, Area" required brandPrimary={brandPrimary} defaultValue={addr?.address_1} />
        <Field label="Apartment / Floor (optional)" name="address_2" placeholder="Apt, Suite, Floor" brandPrimary={brandPrimary} defaultValue={addr?.address_2} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="City" name="city" placeholder="Mumbai" required brandPrimary={brandPrimary} defaultValue={addr?.city} />
          <Field label="State" name="province" placeholder="Maharashtra" required brandPrimary={brandPrimary} defaultValue={addr?.province} />
          <Field label="Pincode" name="postal_code" placeholder="400001" required brandPrimary={brandPrimary} defaultValue={addr?.postal_code} />
        </div>

        <label className="flex items-center gap-3 cursor-pointer py-1">
          <input type="checkbox" name="same_as_billing" defaultChecked className="w-4 h-4 rounded accent-orange-500" />
          <span className="text-sm text-gray-600">Billing address same as shipping</span>
        </label>

        {message && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-100">{message}</p>
        )}

        <button type="submit" disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${brandPrimary} 0%, #ac1900 100%)` }}
        >
          {isPending
            ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
            : hasAddress ? <>Save changes</> : <>Continue to Shipping</>
          }
        </button>
      </form>
    </div>
  )
}