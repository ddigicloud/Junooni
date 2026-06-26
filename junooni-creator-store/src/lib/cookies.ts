"use server"

import { cookies, headers } from "next/headers"

function cartCookieName(handle: string): string {
  return `_creator_cart_id_${handle}`
}

export async function getCartId(handle: string): Promise<string | undefined> {
  if (!handle) return undefined
  return (await cookies()).get(cartCookieName(handle))?.value
}

export async function setCartId(cartId: string, handle: string) {
  if (!handle) return
  ;(await cookies()).set(cartCookieName(handle), cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export async function removeCartId(handle: string) {
  if (!handle) return
  ;(await cookies()).delete(cartCookieName(handle))
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  return {}
}

export async function getCacheOptions(tag: string) {
  return { tags: [`creator-${tag}`] }
}