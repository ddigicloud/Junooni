"use server"

import { getAuthHeaders } from "@lib/data/cookies" // your existing helper

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

export async function confirmTransfer(token: string) {
  const res = await fetch(`${BACKEND_URL}/store/transfer-confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
    },
    body: JSON.stringify({ token }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || "Transfer failed")
  }

  return data
}

export async function retriggerTransferEmail() {
  // No authToken needed — use existing auth cookies/headers
  const headers = await getAuthHeaders()

  const res = await fetch(`${BACKEND_URL}/store/transfer-confirm/resend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
      ...headers, // spreads Authorization or cookie header
    },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || "Could not resend email")
  }

  return data
}