import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const getMedusaHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
  "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
})

const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const res = await fetch(`${MEDUSA_URL}/store/customers/me/follow`, {
    method: "GET",
    headers: getMedusaHeaders(token),
  })

  // 404 just means no follow record yet — return empty instead of error
  if (res.status === 404) {
    return NextResponse.json({ follow: null })
  }

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { vendor_id } = await req.json()
  const headers = getMedusaHeaders(token)

  // Step 1: check if follow record exists
  console.log("[/api/follow POST] checking for existing follow record...")
  const getRes = await fetch(`${MEDUSA_URL}/store/customers/me/follow`, {
    method: "GET",
    headers,
  })

  // Step 2: if no follow record exists (404), create one first
  if (getRes.status === 404) {
    console.log("[/api/follow POST] no follow record found, creating one...")
    const createRes = await fetch(`${MEDUSA_URL}/store/customers/me/follow`, {
      method: "POST",
      headers,
    })

    const createData = await createRes.json()
    console.log("[/api/follow POST] created follow record:", createData)

    if (!createRes.ok) {
      console.error("[/api/follow POST] failed to create follow record:", createData)
      return NextResponse.json(
        { error: "Failed to create follow record", details: createData },
        { status: 500 }
      )
    }
  } else {
    const existingData = await getRes.json()
    console.log("[/api/follow POST] existing follow record found:", existingData)
  }

  // Step 3: add vendor to follow list
  console.log("[/api/follow POST] adding vendor to follow list, vendor_id:", vendor_id)
  const addRes = await fetch(`${MEDUSA_URL}/store/customers/me/follow/lists`, {
    method: "POST",
    headers,
    body: JSON.stringify({ vendor_id }),
  })

  const addData = await addRes.json()
  console.log("[/api/follow POST] add to list result:", addRes.status, addData)

  return NextResponse.json(addData, { status: addRes.status })
}

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("_medusa_jwt")?.value

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { follow_list_id } = await req.json()
  const headers = getMedusaHeaders(token)

  const res = await fetch(
    `${MEDUSA_URL}/store/customers/me/follow/lists/${follow_list_id}`,
    {
      method: "DELETE",
      headers,
    }
  )

  const data = await res.json().catch(() => ({ success: true }))
  console.log("[/api/follow DELETE] status:", res.status)
  return NextResponse.json(data, { status: res.status })
}