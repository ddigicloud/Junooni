import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const vendor_id = searchParams.get("vendor_id")
  const region_id = searchParams.get("region_id")

  if (!vendor_id) {
    return NextResponse.json({ products: [] })
  }

  try {
    const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
    const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
    console.log(`[vendor-products API] MEDUSA_URL=${process.env.MEDUSA_BACKEND_URL}`)
    console.log(`[vendor-products API] API_KEY=${process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY?.slice(0, 10)}...`)

    // Use the vendor-scoped endpoint directly — same one that works server-side
    const url = new URL(`${MEDUSA_URL}/store/vendors/${vendor_id}/products`)
    if (region_id) url.searchParams.set("region_id", region_id)
    url.searchParams.set(
      "fields",
      "*variants.calculated_price,+metadata,*images,*categories,*collection,*vendor"
    )

    console.log(`[vendor-products API] fetching: ${url.toString()}`)

    const res = await fetch(url.toString(), {
      headers: {
        "x-publishable-api-key": API_KEY,
        "Content-Type": "application/json",
      },
    })

    console.log(`[vendor-products API] status=${res.status}`)

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`[vendor-products API] error: ${errorText}`)
      return NextResponse.json({ products: [] })
    }

    const data = await res.json()
    console.log(`[vendor-products API] products=${data?.products?.length ?? 0}`)

    return NextResponse.json({ products: data?.products ?? [] })
  } catch (err) {
    console.error("[vendor-products API] ERROR:", err)
    return NextResponse.json({ products: [] }, { status: 500 })
  }
}