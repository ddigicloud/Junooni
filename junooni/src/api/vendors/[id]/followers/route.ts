// import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

// export async function GET(
//   req: MedusaRequest,
//   res: MedusaResponse
// ) {
//   const { id } = req.params

//   if (!id) {
//     return res.status(400).json({ error: "Vendor ID is required" })
//   }

//   const query = req.scope.resolve("query")

//   try {
//     const { data } = await query.graph({
//       entity: "follow_list",
//       fields: ["*", "follow.customer.*"],
//       filters: {
//         vendor_id: id
//       }
//     })

//     // ← FIXED: return empty array instead of throwing NOT_FOUND
//     return res.json({
//       count: data?.length ?? 0,
//       follow: data ?? []
//     })

//   } catch (error) {
//     console.error("❌ Error in followers route:", error)
//     // ← return empty on error instead of throwing — prevents Follow button from hanging
//     return res.json({ count: 0, follow: [] })
//   }
// }




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
    // Step 1: get all follow_list entries for this vendor
    const { data: followListEntries } = await query.graph({
      entity: "follow_list",
      fields: ["id", "vendor_id", "follow_id", "follow.*"],
      filters: {
        vendor_id: id,
      },
    })

    console.log(`[followers route] follow_list entries:`, followListEntries)

    if (!followListEntries?.length) {
      return res.json({ count: 0, follow: [] })
    }

    // Step 2: extract follow IDs and fetch customers via the link
    const followIds = followListEntries.map((entry) => entry.follow?.id).filter(Boolean)

    console.log(`[followers route] follow IDs:`, followIds)

    if (!followIds.length) {
      return res.json({ count: 0, follow: [] })
    }

    const { data: followsWithCustomers } = await query.graph({
      entity: "follow",
      fields: ["id", "customer_id", "customer.*"],
      filters: {
        id: followIds,
      },
    })

    console.log(`[followers route] follows with customers:`, followsWithCustomers)

    // Step 3: merge back into the shape frontend expects
    // Frontend reads: item.follow.customer_id and item.follow.customer
    const follow = followListEntries.map((entry) => {
      const followData = followsWithCustomers.find(
        (f) => f.id === entry.follow?.id
      )
      return {
        ...entry,
        follow: {
          ...entry.follow,
          customer_id: followData?.customer_id,
          customer: followData?.customer ?? null,
        },
      }
    })

    return res.json({
      count: follow.length,
      follow,
    })

  } catch (error) {
    console.error("❌ Error in followers route:", error)
    return res.json({ count: 0, follow: [] })
  }
}