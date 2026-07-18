import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const vendor_id = searchParams.get("vendor_id")
  const region_id = searchParams.get("region_id")

  console.log(`[/api/vendor-products] CALLED | vendor_id=${vendor_id}`)

  if (!vendor_id) {
    return NextResponse.json({ products: [] })
  }

  try {
    const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
    const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

    // ← FIXED: use /vendors/ not /store/vendors/
    const url = new URL(`${MEDUSA_URL}/vendors/${vendor_id}/products`)
    if (region_id) url.searchParams.set("region_id", region_id)
    url.searchParams.set(
      "fields",
      "id,title,handle,thumbnail,status,created_at,+metadata,images.id,images.url,variants.id,variants.title,variants.prices.amount,variants.prices.currency_code,vendor.id,vendor.name,vendor.handle,vendor.verified"
    )

    console.log(`[/api/vendor-products] fetching: ${url.toString()}`)
    const start = Date.now()

    const res = await fetch(url.toString(), {
      headers: {
        "x-publishable-api-key": API_KEY,
        "Content-Type": "application/json",
      },
    })

    console.log(`[/api/vendor-products] status=${res.status} in ${Date.now() - start}ms`)

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`[/api/vendor-products] error: ${errorText}`)
      return NextResponse.json({ products: [] })
    }

    const data = await res.json()
    const published = (data?.products ?? []).filter((p: any) => p.status === "published")
    console.log(`[/api/vendor-products] returning ${published.length} published products`)

    return NextResponse.json({ products: published })
  } catch (err) {
    console.error("[/api/vendor-products] ERROR:", err)
    return NextResponse.json({ products: [] }, { status: 500 })
  }
}