"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import StepIndicator from "@/components/checkout/StepIndicator"
import AddressForm from "@/components/checkout/AddressForm"
import ShippingForm from "@/components/checkout/ShippingForm"
import PaymentForm from "@/components/checkout/PaymentForm"
import ReviewForm from "@/components/checkout/ReviewForm"

interface Props {
  vendor: any
  initialStore: any
  cart: any
  handle: string
  step: string
  shippingMethods: any[]
  paymentMethods: any[]
  previewProduct?: any
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(amount)
}

const MOCK_CART = {
  items: [],
  subtotal: 0,
  shipping_total: 0,
  tax_total: 0,
  total: 0,
  shipping_address: null,
  shipping_methods: [],
  payment_collection: null,
}

export default function CheckoutPageClient({
  vendor, initialStore, cart, handle, step, shippingMethods, paymentMethods, previewProduct,
}: Props) {
  const [store, setStore] = useState(initialStore)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)

  const previewCart = previewProduct ? {
  ...MOCK_CART,
  items: [{
    id: "preview_item",
    title: previewProduct.title,
    thumbnail: previewProduct.thumbnail ?? null,
    quantity: 1,
    unit_price: previewProduct.variants?.[0]?.calculated_price?.calculated_amount
      ?? previewProduct.variants?.[0]?.prices?.[0]?.amount
      ?? 49900,
    variant: {
      title: previewProduct.variants?.[0]?.title !== "Default Title"
        ? previewProduct.variants?.[0]?.title
        : null,
    },
  }],
  subtotal: previewProduct.variants?.[0]?.calculated_price?.calculated_amount
    ?? previewProduct.variants?.[0]?.prices?.[0]?.amount
    ?? 49900,
  total: previewProduct.variants?.[0]?.calculated_price?.calculated_amount
    ?? previewProduct.variants?.[0]?.prices?.[0]?.amount
    ?? 49900,
} : MOCK_CART

const activeCart = (cart?.items?.length > 0) ? cart : previewCart

  useEffect(() => {
    window.parent?.postMessage({ type: "IFRAME_READY" }, "*")
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "STORE_UPDATE" && e.data.store) {
        setStore(e.data.store)
        setSelectedSectionId(e.data.selectedId ?? null)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  useEffect(() => {
  const isPreview = new URLSearchParams(window.location.search).get("__preview") === "1"
    if (!isPreview) return

    document.cookie = `_creator_cart_id_${handle}=; max-age=0; path=/;`
  }, [handle])

  const checkoutSettings: any = store?.checkout_settings ?? {}
  const brandPrimary   = checkoutSettings.accent_color || store?.primary_color || "#e65100"
  const brandSecondary = store?.secondary_color ?? "#ac1900"
  const isDark = store?.template === "bold"

  const logoSizePx = checkoutSettings.logo_size === "small" ? 24
    : checkoutSettings.logo_size === "large" ? 44
    : 32
  const showBackLink  = checkoutSettings.show_back_link !== false
  const showTrustNote = checkoutSettings.show_trust_note !== false
  const trustNoteText = checkoutSettings.trust_note || "🔒 Secure checkout · SSL encrypted"

  const brandStyles = {
    "--brand-primary":   brandPrimary,
    "--brand-secondary": brandSecondary,
  } as React.CSSProperties

  const fontClass =
    store?.font === "poppins"       ? "font-poppins" :
    store?.font === "playfair"      ? "font-playfair" :
    store?.font === "dm-sans"       ? "font-dm-sans" :
    store?.font === "space-grotesk" ? "font-space-grotesk" :
    store?.font === "nunito"        ? "font-nunito" :
    store?.font === "raleway"       ? "font-raleway" :
    store?.font === "montserrat"    ? "font-montserrat" :
    "font-inter"

  const checkoutSections: any[] = (store?.sections?.page_layouts?.checkout?.sections ?? [])
    .filter((s: any) => !s.hidden)

  const logoMarkInner = (store as any)?.store_logo ? (
    <Image
      src={(store as any).store_logo}
      alt={vendor.name}
      width={logoSizePx * 4}
      height={logoSizePx}
      className="object-contain w-auto"
      style={{ height: logoSizePx }}
    />
  ) : vendor.logo ? (
    <div className="overflow-hidden rounded-full" style={{ width: logoSizePx, height: logoSizePx }}>
      <Image src={vendor.logo} alt={vendor.name} width={logoSizePx} height={logoSizePx} className="object-cover" />
    </div>
  ) : (
    <div
      className="flex items-center justify-center font-bold text-white rounded-full"
      style={{ background: brandPrimary, width: logoSizePx, height: logoSizePx }}
    >
      {vendor.name[0]?.toUpperCase()}
    </div>
  )

  const logoMark = (
    <Link href={`/${handle}`} className="block transition-opacity hover:opacity-80">
      {logoMarkInner}
    </Link>
  )

  const isPreviewMode = typeof window !== "undefined" 
  ? new URLSearchParams(window.location.search).get("__preview") === "1"
  : false

// Override completion checks in preview mode
const addressComplete = isPreviewMode || (
  !!activeCart.shipping_address?.first_name &&
  !!activeCart.shipping_address?.address_1 &&
  !!activeCart.shipping_address?.city
)

const shippingComplete = isPreviewMode || (
  !!activeCart.shipping_methods?.length &&
  !!activeCart.shipping_methods[0]?.shipping_option_id
)

const paymentComplete = isPreviewMode || (
  !!activeCart.payment_collection?.payment_sessions?.find(
    (s: any) => s.status === "pending"
  )
)

  return (
    <div style={brandStyles} className={`min-h-screen ${isDark ? "bg-gray-950" : "bg-gray-50"} ${fontClass}`}>
      <header className={`${isDark ? "bg-black/80 border-white/10" : "bg-white/90 border-gray-100"} backdrop-blur-md border-b sticky top-0 z-30`}>
        <div className="grid items-center h-16 max-w-6xl grid-cols-3 px-4 mx-auto sm:px-6">
          <div className="min-w-0 justify-self-start">
            {checkoutSettings.logo_position === "left" ? (
              <div className="flex items-center gap-3">
                <Link
                  href={`/`}
                  aria-label="Back to store"
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors shrink-0 ${
                    isDark ? "text-white/60 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                {logoMark}
              </div>
            ) : (
              <Link
                href={`/`}
                aria-label="Back to store"
                className={`flex items-center gap-1.5 text-sm whitespace-nowrap transition-colors ${
                  isDark ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                {showBackLink && <span>Back to store</span>}
              </Link>
            )}
          </div>

          <div className="justify-self-center">
            {checkoutSettings.logo_position !== "left" && logoMark}
          </div>

          {/* <span className={`text-sm font-medium justify-self-end whitespace-nowrap ${isDark ? "text-white/60" : "text-gray-500"}`}>
            Checkout
          </span> */}
        </div>
      </header>

      {checkoutSettings.banner_text && (
        <div className="px-4 py-2 text-sm font-medium text-center text-white" style={{ background: brandPrimary }}>
          {checkoutSettings.banner_text}
        </div>
      )}

      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6">
        <div className="mb-8">
          <StepIndicator currentStep={step} brandPrimary={brandPrimary} />
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="min-w-0 space-y-4">
            <AddressForm cart={activeCart} handle={handle} brandPrimary={brandPrimary} isDark={isDark} />

            {(step === "delivery" || step === "payment" || step === "review") && addressComplete && (
              <ShippingForm
                cart={activeCart}
                shippingMethods={shippingMethods ?? []}
                handle={handle}
                brandPrimary={brandPrimary}
              />
            )}

            {(step === "payment" || step === "review") && shippingComplete && (
              <PaymentForm
                cart={activeCart}
                paymentMethods={paymentMethods ?? []}
                handle={handle}
                brandPrimary={brandPrimary}
              />
            )}

            {step === "review" && paymentComplete && (
              <ReviewForm cart={activeCart} handle={handle} brandPrimary={brandPrimary} />
            )}

            {/* ── Editor-added sections ── */}
            {checkoutSections.map((section: any) => (
              <div
                key={section.id}
                className={selectedSectionId === section.id ? "ring-2 ring-orange-400 rounded-xl" : undefined}
              >
                {section.type === "divider" && (
                  <div style={{
                    paddingTop: section.padding_top ?? 16,
                    paddingBottom: section.padding_bottom ?? 16,
                    backgroundColor: section.background_color ?? undefined,
                  }}>
                    <hr style={{
                      borderColor: section.color ?? "#e5e7eb",
                      borderTopWidth: section.thickness ?? 1,
                    }} />
                  </div>
                )}
                {section.type === "text" && section.text && (
                  <div
                    className={`prose prose-sm max-w-none ${isDark ? "prose-invert" : ""}`}
                    dangerouslySetInnerHTML={{ __html: section.text }}
                  />
                )}
                {section.type === "html" && section.html_content && (
                  <div dangerouslySetInnerHTML={{ __html: section.html_content }} />
                )}
              </div>
            ))}
          </div>

          {/* ── Order Summary ── */}
          <div className={`rounded-2xl border ${isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-white"} shadow-sm p-6 sticky top-24`}>
            <h3 className={`text-xs font-semibold uppercase tracking-widest mb-4 ${isDark ? "text-white/40" : "text-gray-400"}`}>
              Order Summary
            </h3>

            {activeCart.items?.length === 0 ? (
              <div className={`py-8 text-center text-sm ${isDark ? "text-white/30" : "text-gray-400"}`}>
                <p>No items in cart</p>
                <p className="mt-1 text-xs opacity-60">Add products to see your order summary</p>
              </div>
            ) : (
              <div className="mb-4 space-y-4">
                {activeCart.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative bg-gray-100 w-14 h-14 rounded-xl shrink-0 overflow">
                      {item.thumbnail ? (
                        <Image src={item.thumbnail} alt={item.title} fill className="object-cover rounded-xl" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-2xl">👕</div>
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
            )}

            <div className={`border-t ${isDark ? "border-white/10" : "border-gray-100"} pt-4 space-y-2.5`}>
              <div className={`flex justify-between text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>
                <span>Subtotal</span>
                <span>{formatPrice(activeCart.subtotal ?? 0)}</span>
              </div>
              {(activeCart.shipping_total ?? 0) > 0 && (
                <div className={`flex justify-between text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>
                  <span>Shipping</span>
                  <span>{formatPrice(activeCart.shipping_total)}</span>
                </div>
              )}
              {(activeCart.shipping_total ?? 0) === 0 && shippingComplete && (
                <div className={`flex justify-between text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
              )}
              {(activeCart.tax_total ?? 0) > 0 && (
                <div className={`flex justify-between text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>
                  <span>Tax</span>
                  <span>{formatPrice(activeCart.tax_total)}</span>
                </div>
              )}
              <div className={`flex justify-between text-base font-bold pt-2 border-t ${isDark ? "border-white/10 text-white" : "border-gray-100 text-gray-900"}`}>
                <span>Total</span>
                <span style={{ color: brandPrimary }}>{formatPrice(activeCart.total ?? 0)}</span>
              </div>
            </div>

            {showTrustNote && (
              <p className={`text-[11px] text-center mt-4 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                {trustNoteText}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}