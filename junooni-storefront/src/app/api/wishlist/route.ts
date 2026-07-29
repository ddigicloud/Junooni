import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

const getMedusaHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
  "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
})

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const res = await fetch(`${MEDUSA_URL}/store/customers/me/wishlists`, {
    method: "GET",
    headers: getMedusaHeaders(token),
  })

  if (res.status === 404) {
    return NextResponse.json({ wishlist: null })
  }

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { variant_id } = body
  const headers = getMedusaHeaders(token)

  // Step 1: check if wishlist exists
  const getRes = await fetch(`${MEDUSA_URL}/store/customers/me/wishlists`, {
    method: "GET",
    headers,
  })

  // Step 2: create wishlist if it doesn't exist
  if (getRes.status === 404) {
    console.log("[/api/wishlist POST] no wishlist found, creating one...")
    const createRes = await fetch(`${MEDUSA_URL}/store/customers/me/wishlists`, {
      method: "POST",
      headers,
    })
    const createData = await createRes.json()
    console.log("[/api/wishlist POST] created wishlist:", createData)

    if (!createRes.ok) {
      return NextResponse.json(
        { error: "Failed to create wishlist", details: createData },
        { status: 500 }
      )
    }
  }

  // Step 3: add item to wishlist
  if (!variant_id) {
    return NextResponse.json({ error: "variant_id is required" }, { status: 400 })
  }

  const addRes = await fetch(`${MEDUSA_URL}/store/customers/me/wishlists/items`, {
    method: "POST",
    headers,
    body: JSON.stringify({ variant_id }),
  })

  const addData = await addRes.json()
  console.log("[/api/wishlist POST] add item result:", addRes.status, addData)
  return NextResponse.json(addData, { status: addRes.status })
}

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { item_id } = await req.json()
  const headers = getMedusaHeaders(token)

  const res = await fetch(
    `${MEDUSA_URL}/store/customers/me/wishlists/items/${item_id}`,
    { method: "DELETE", headers }
  )

  const data = await res.json().catch(() => ({ success: true }))
  return NextResponse.json(data, { status: res.status })
}