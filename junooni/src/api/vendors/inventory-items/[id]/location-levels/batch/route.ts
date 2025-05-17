import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { batchInventoryItemLevelsWorkflow } from "@medusajs/medusa/core-flows"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id: inventory_item_id } = req.params
  const { create = [], update = [], delete: toDelete = [] } = req.body as {
    create?: any[]
    update?: any[]
    delete?: string[]
  }

  // Inject inventory_item_id into each create/update item if not already present
  const createWithId = create.map((entry) => ({
    inventory_item_id,
    ...entry,
  }))

  const updateWithId = update.map((entry) => ({
    inventory_item_id,
    ...entry,
  }))

  const { result } = await batchInventoryItemLevelsWorkflow(req.scope).run({
    input: {
      create: createWithId,
      update: updateWithId,
      delete: toDelete,
    },
  })

  res.status(200).json(result)
}
