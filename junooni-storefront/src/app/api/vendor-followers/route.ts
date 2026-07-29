import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const vendor_id = searchParams.get("vendor_id")

  if (!vendor_id) return NextResponse.json({ count: 0, follow: [] })

  try {
    const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
    const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

    const res = await fetch(
      `${MEDUSA_URL}/vendors/${vendor_id}/followers?fields=*`,
      {
        headers: {
          "x-publishable-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    )

    if (!res.ok) return NextResponse.json({ count: 0, follow: [] })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error("[vendor-followers API] ERROR:", err)
    return NextResponse.json({ count: 0, follow: [] }, { status: 500 })
  }
}