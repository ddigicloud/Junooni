import {
  AuthenticatedMedusaRequest,
  MedusaResponse
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params
  const { sku, title } = req.body as { sku?: string; title?: string }

  if (!req.auth_context || req.auth_context.actor_type !== "vendor") {
    return res.status(401).json({ message: "Authentication required" })
  }

  try {
    const inventoryService = req.scope.resolve(Modules.INVENTORY)

    // Medusa v2: updateInventoryItems expects ({ id, ...fields })
    const updated = await inventoryService.updateInventoryItems({
      id,
      ...(sku !== undefined && { sku }),
      ...(title !== undefined && { title }),
    })

    res.json({ inventory_item: updated })
  } catch (err: any) {
    console.error("Failed to update inventory item:", err)
    res.status(500).json({ message: err?.message || "Failed to update inventory item" })
  }
}