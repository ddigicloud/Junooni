import { NextRequest, NextResponse } from "next/server"
import { listProductsForStore } from "@lib/data/products"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const offset = parseInt(searchParams.get("offset") || "0")
  const limit = parseInt(searchParams.get("limit") || "100")
  const countryCode = searchParams.get("countryCode") || "in"

  try {
    const { products, count } = await listProductsForStore({ offset, limit, countryCode })
    return NextResponse.json({ products, count })
  } catch (e) {
    return NextResponse.json({ products: [], count: 0 }, { status: 500 })
  }
}