"use server"

import { cookies } from "next/headers"

export async function getCartId(): Promise<string | undefined> {
  return (await cookies()).get("_creator_cart_id")?.value
}

export async function setCartId(cartId: string) {
  ;(await cookies()).set("_creator_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export async function removeCartId() {
  ;(await cookies()).delete("_creator_cart_id")
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  // Creator store is public (no customer auth required for cart)
  return {}
}

export async function getCacheOptions(tag: string) {
  return { tags: [`creator-${tag}`] }
}
