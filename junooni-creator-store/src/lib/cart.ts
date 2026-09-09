"use server"

import { sdk } from "@/lib/medusa"
import {
  getCartId, setCartId, removeCartId,
  getAuthHeaders, getCacheOptions,
} from "@/lib/cookies"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

async function getIndiaRegion() {
  const { regions } = await sdk.client.fetch<{ regions: any[] }>("/store/regions")
  const india = regions.find((r: any) =>
    r.countries?.some((c: any) => c.iso_2 === "in")
  )
  if (!india) throw new Error("India region not found")
  return india
}

// ── All functions now require handle param ────────────────────────────────────

export async function retrieveCart(handle: string, cartId?: string) {
  const id = cartId || (await getCartId(handle))
  if (!id) return null

  const authHeaders = await getAuthHeaders()

  return sdk.client
    .fetch<{ cart: any }>(`/store/carts/${id}`, {
      method: "GET",
      query: {
        fields:
          "*items,*region,*items.product,*items.variant,*items.variant.product,*items.variant.product.images,*items.thumbnail,+items.total,+items.variant_id,*promotions,+shipping_methods.name",
      },
      headers: authHeaders,
      cache: "no-store",
    })
    .then(({ cart }) => cart)
    .catch(() => null)
}

export async function getOrCreateCart(handle: string) {
  let cart = await retrieveCart(handle)
  if (cart) return cart

  const region = await getIndiaRegion()
  const authHeaders = await getAuthHeaders()

  const { cart: newCart } = await sdk.store.cart.create(
    { region_id: region.id }, {}, authHeaders
  )
  await setCartId(newCart.id, handle)
  revalidateTag("creator-carts")
  return newCart
}

export async function addToCart({
  handle,
  variantId,
  quantity = 1,
}: {
  handle: string
  variantId: string
  quantity?: number
}) {
  if (!variantId) throw new Error("Missing variant ID")
  if (!handle) throw new Error("Missing store handle")

  const cart = await getOrCreateCart(handle)
  const authHeaders = await getAuthHeaders()

  await sdk.store.cart
    .createLineItem(cart.id, { variant_id: variantId, quantity }, {}, authHeaders)
    .then(async () => {
      revalidateTag("creator-carts")
      revalidateTag("creator-fulfillment")
    })
}

export async function updateLineItem({
  handle,
  lineId,
  quantity,
}: {
  handle: string
  lineId: string
  quantity: number
}) {
  const cartId = await getCartId(handle)
  if (!cartId) throw new Error("No cart found")
  const authHeaders = await getAuthHeaders()

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, authHeaders)
    .then(async () => {
      revalidateTag("creator-carts")
      revalidateTag("creator-fulfillment")
    })
}

export async function deleteLineItem(handle: string, lineId: string) {
  const cartId = await getCartId(handle)
  if (!cartId) throw new Error("No cart found")
  const authHeaders = await getAuthHeaders()

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, authHeaders)
    .then(async () => {
      revalidateTag("creator-carts")
      revalidateTag("creator-fulfillment")
    })
}

export async function updateCart(handle: string, data: Record<string, any>) {
  const cartId = await getCartId(handle)
  if (!cartId) throw new Error("No cart found")
  const authHeaders = await getAuthHeaders()

  return sdk.store.cart
    .update(cartId, data, {}, authHeaders)
    .then(async ({ cart }) => {
      revalidateTag("creator-carts")
      return cart
    })
}

export async function setAddresses(
  handle: string,
  currentState: unknown,
  formData: FormData
): Promise<string | null> {
  try {
    const shippingAddress = {
      first_name:   formData.get("first_name") as string,
      last_name:    formData.get("last_name") as string,
      address_1:    formData.get("address_1") as string,
      address_2:    (formData.get("address_2") as string) || "",
      city:         formData.get("city") as string,
      province:     formData.get("province") as string,
      postal_code:  formData.get("postal_code") as string,
      country_code: "in",
      phone:        formData.get("phone") as string,
    }

    await updateCart(handle, {
      email:            formData.get("email"),
      shipping_address: shippingAddress,
      billing_address:  shippingAddress,
    })
    return null
  } catch (e: any) {
    return e.message
  }
}

export async function setShippingMethod({
  handle,
  cartId,
  shippingMethodId,
}: {
  handle: string
  cartId: string
  shippingMethodId: string
}) {
  const authHeaders = await getAuthHeaders()
  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, authHeaders)
    .then(async () => { revalidateTag("creator-carts") })
}

export async function listCartShippingMethods(handle: string, cartId: string) {
  const authHeaders = await getAuthHeaders()
  const next = await getCacheOptions("fulfillment")

  return sdk.client
    .fetch<{ shipping_options: any[] }>("/store/shipping-options", {
      method: "GET",
      query: { cart_id: cartId },
      headers: authHeaders,
      next,
      cache: "force-cache",
    })
    .then(({ shipping_options }) => shipping_options)
    .catch(() => [])
}

export async function listCartPaymentMethods(regionId: string) {
  const authHeaders = await getAuthHeaders()
  const next = await getCacheOptions("payment_providers")

  return sdk.client
    .fetch<{ payment_providers: any[] }>("/store/payment-providers", {
      method: "GET",
      query: { region_id: regionId },
      headers: authHeaders,
      next,
    })
    .then(({ payment_providers }) =>
      payment_providers.sort((a, b) => (a.id > b.id ? 1 : -1))
    )
    .catch(() => [])
}

export async function initiatePaymentSession(
  cart: any,
  data: { provider_id: string }
) {
  const authHeaders = await getAuthHeaders()
  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, authHeaders)
    .then(async (resp) => {
      revalidateTag("creator-carts")
      return resp
    })
}

export async function placeOrder(handle: string) {
  const cartId = await getCartId(handle)
  if (!cartId) throw new Error("No cart found")
  const authHeaders = await getAuthHeaders()

  const result = await sdk.store.cart
    .complete(cartId, {}, authHeaders)
    .then(async (res) => {
      revalidateTag("creator-carts")
      return res
    })

  if (result.type === "order" && result.order) {
    const orderId = result.order.id
    await removeCartId(handle)
    revalidateTag("creator-carts")
    redirect(`/order/${orderId}`)
  }

  throw new Error("Order placement failed")
}

export async function addCodFee(handle: string) {
  const cartId = await getCartId(handle)
  if (!cartId) return

  const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
  const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

  await fetch(`${BACKEND}/store/carts/cod-fee`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": PUB_KEY,
    },
    body: JSON.stringify({ cart_id: cartId }),
  })

  revalidateTag("creator-carts")
}

export async function removeCodFee(handle: string) {
  const cartId = await getCartId(handle)
  if (!cartId) return

  const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000"
  const PUB_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

  await fetch(`${BACKEND}/store/carts/cod-fee?cart_id=${cartId}`, {
    method: "DELETE",
    headers: {
      "x-publishable-api-key": PUB_KEY,
    },
  })

  revalidateTag("creator-carts")
}