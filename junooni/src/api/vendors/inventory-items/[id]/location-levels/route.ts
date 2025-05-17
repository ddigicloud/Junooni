import {
    MedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework"
  import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
  
  export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
  ) => {
    const { id: inventoryItemId } = req.params
  
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  
    const { data: inventory_levels = [] } = await query.graph({
      entity: "inventory_level",
      filters: {
        inventory_item_id: inventoryItemId,
      },
      fields: [
        "id",
        "inventory_item_id",
        "location_id",
        "stocked_quantity",
        "reserved_quantity",
        "available_quantity",
        "incoming_quantity"
      ],
    })
  
    res.status(200).json({
      inventory_levels,
      count: inventory_levels.length,
      limit: 0,
      offset: 0,
    })
  }
  