import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { headers } from "next/headers"
import { getStorefrontData } from "@/lib/api"
import { retrieveCart, listCartShippingMethods, listCartPaymentMethods } from "@/lib/cart"
import StepIndicator from "@/components/checkout/StepIndicator"
import AddressForm from "@/components/checkout/AddressForm"
import ShippingForm from "@/components/checkout/ShippingForm"
import PaymentForm from "@/components/checkout/PaymentForm"
import ReviewForm from "@/components/checkout/ReviewForm"

interface Props {
  params: { handle: string }
  searchParams: { step?: string }
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(amount)
}

// Resolve handle from middleware header or URL param
function resolveHandle(paramHandle: string): string {
  try {
    return headers().get("x-handle") ?? paramHandle
  } catch {
    return paramHandle
  }
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const handle = resolveHandle(params.handle)
  const step = searchParams.step ?? "address"

  console.log(`[checkout] handle=${handle} step=${step}`)

  // ✅ Pass handle to retrieveCart so it reads the correct per-store cookie
  const [data, cart] = await Promise.all([
    getStorefrontData(handle),
    retrieveCart(handle),   // ← FIX: was retrieveCart() with no handle
  ])

  console.log(`[checkout] cart=${cart?.id ?? "null"} items=${cart?.items?.length ?? 0}`)

  if (!data) notFound()
  if (!cart || !cart.items?.length) {
    console.log(`[checkout] no cart or empty cart — redirecting to /${handle}`)
    redirect(`/${handle}`)
  }

  const { vendor, store } = data
  const brandPrimary   = store?.primary_color   ?? "#e65100"
  const brandSecondary = store?.secondary_color ?? "#ac1900"
  const isDark = store?.template === "bold"

  const brandStyles = {
    "--brand-primary":   brandPrimary,
    "--brand-secondary": brandSecondary,
  } as React.CSSProperties

  const [shippingMethods, paymentMethods] = await Promise.all([
    listCartShippingMethods(handle, cart.id),  // ✅ pass handle
    listCartPaymentMethods(cart.region?.id ?? ""),
  ])

  const addressComplete =
    !!cart.shipping_address?.first_name &&
    !!cart.shipping_address?.address_1 &&
    !!cart.shipping_address?.city

  const shippingComplete =
    !!cart.shipping_methods?.length &&
    !!cart.shipping_methods[0]?.shipping_option_id

  const paymentComplete = !!cart.payment_collection?.payment_sessions?.find(
    (s: any) => s.status === "pending"
  )

  return (
    <div style={brandStyles} className={`min-h-screen ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
      {/* Header */}
      <header className={`${isDark ? "bg-black/80 border-white/10" : "bg-white/90 border-gray-100"} backdrop-blur-md border-b sticky top-0 z-30`}>
        <div className="flex items-center justify-between h-16 max-w-6xl px-4 mx-auto sm:px-6">
          <Link
            href={`/${handle}`}
            className={`text-sm ${isDark ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-900"} transition-colors`}
          >
            ← Back to store
          </Link>
          {vendor.logo && (
            <div className="absolute -translate-x-1/2 left-1/2">
              <div className="w-8 h-8 overflow-hidden rounded-full">
                <Image src={vendor.logo} alt={vendor.name} width={32} height={32} className="object-cover" />
              </div>
            </div>
          )}
          <span className={`text-sm font-medium ${isDark ? "text-white/60" : "text-gray-500"}`}>
            Checkout
          </span>
        </div>
      </header>

      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6">
        <div className="mb-8">
          <StepIndicator currentStep={step} brandPrimary={brandPrimary} />
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Left: form steps */}
          <div className="min-w-0 space-y-4">
            <AddressForm cart={cart} handle={handle} brandPrimary={brandPrimary} isDark={isDark} />

            {(step === "delivery" || step === "payment" || step === "review") && addressComplete && (
              <ShippingForm
                cart={cart}
                shippingMethods={shippingMethods ?? []}
                handle={handle}
                brandPrimary={brandPrimary}
              />
            )}

            {(step === "payment" || step === "review") && shippingComplete && (
              <PaymentForm
                cart={cart}
                paymentMethods={paymentMethods ?? []}
                handle={handle}
                brandPrimary={brandPrimary}
              />
            )}

            {step === "review" && paymentComplete && (
              <ReviewForm cart={cart} handle={handle} brandPrimary={brandPrimary} />
            )}
          </div>

          {/* Right: order summary */}
          <div className={`rounded-2xl border ${isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-white"} shadow-sm p-6 sticky top-24`}>
            <h3 className={`text-xs font-semibold uppercase tracking-widest mb-4 ${isDark ? "text-white/40" : "text-gray-400"}`}>
              Order Summary
            </h3>

            <div className="mb-4 space-y-4">
              {cart.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative overflow-hidden bg-gray-100 w-14 h-14 rounded-xl shrink-0">
                    {item.thumbnail && (
                      <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                    )}
                    <div
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                      style={{ background: brandPrimary }}
                    >
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                      {item.title}
                    </p>
                    {item.variant?.title && item.variant.title !== "Default Title" && (
                      <p className="text-xs text-gray-400">{item.variant.title}</p>
                    )}
                  </div>
                  <p className={`text-sm font-semibold shrink-0 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {formatPrice((item.unit_price ?? 0) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className={`border-t ${isDark ? "border-white/10" : "border-gray-100"} pt-4 space-y-2.5`}>
              <div className={`flex justify-between text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal ?? 0)}</span>
              </div>
              {(cart.shipping_total ?? 0) > 0 && (
                <div className={`flex justify-between text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>
                  <span>Shipping</span>
                  <span>{formatPrice(cart.shipping_total)}</span>
                </div>
              )}
              {(cart.shipping_total ?? 0) === 0 && shippingComplete && (
                <div className={`flex justify-between text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
              )}
              {(cart.tax_total ?? 0) > 0 && (
                <div className={`flex justify-between text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>
                  <span>Tax</span>
                  <span>{formatPrice(cart.tax_total)}</span>
                </div>
              )}
              <div className={`flex justify-between text-base font-bold pt-2 border-t ${isDark ? "border-white/10 text-white" : "border-gray-100 text-gray-900"}`}>
                <span>Total</span>
                <span style={{ color: brandPrimary }}>{formatPrice(cart.total ?? 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}