import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
// import { getStorefrontData } from "@/lib/api"
import { retrieveCart, listCartShippingMethods, listCartPaymentMethods } from "@/lib/cart"
import CheckoutPageClient from "./CheckoutpageClient"
// Add to imports at top
import { getStorefrontData, getStoreProducts } from "@/lib/api"

interface Props {
  params: { handle: string }
  searchParams: { step?: string; __preview?: string }
}

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

  const isEditorPreview =
    headers().get("x-vendor-preview") === "1" ||
    searchParams.__preview === "1"

  const [data, cart] = await Promise.all([
    getStorefrontData(handle),
    retrieveCart(handle),
  ])

  if (!data) notFound()

  if (!isEditorPreview && (!cart || !cart.items?.length)) {
    redirect(`/${handle}`)
  }

  const { vendor, store } = data

  // Replace the previewProduct fetch block with this:
  let previewProduct = null
  if (isEditorPreview) {
    // Try to fetch real product first
    const productsData = await getStoreProducts(handle, 1)
    previewProduct = productsData?.products?.[0] ?? null

    // If no real products, use a fake one for preview
    if (!previewProduct) {
      previewProduct = {
        title: "Classic Creator Tee",
        thumbnail: "https://placehold.co/200x200/f3f4f6/9ca3af?text=👕",
        variants: [{
          title: "Black / M",
          calculated_price: { calculated_amount: 699 },
          prices: [{ amount: 699 }],
        }],
      }
    }
  }

  const [shippingMethods, paymentMethods] = await Promise.all([
    listCartShippingMethods(handle, cart?.id ?? ""),
    listCartPaymentMethods(cart?.region?.id ?? ""),
  ])

  return (
    <CheckoutPageClient
      vendor={vendor}
      initialStore={store}
      cart={cart}
      handle={handle}
      step={step}
      shippingMethods={shippingMethods ?? []}
      paymentMethods={paymentMethods ?? []}
      previewProduct={previewProduct}
    />
  )
}