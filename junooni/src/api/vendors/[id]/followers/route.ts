import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params

  if (!id) {
    return res.status(400).json({ error: "Vendor ID is required" })
  }

  const query = req.scope.resolve("query")

  try {
    const { data } = await query.graph({
      entity: "follow_list",
      fields: ["*", "follow.customer.*"],
      filters: {
        vendor_id: id
      }
    })

    // ← FIXED: return empty array instead of throwing NOT_FOUND
    return res.json({
      count: data?.length ?? 0,
      follow: data ?? []
    })

  } catch (error) {
    console.error("❌ Error in followers route:", error)
    // ← return empty on error instead of throwing — prevents Follow button from hanging
    return res.json({ count: 0, follow: [] })
  }
}