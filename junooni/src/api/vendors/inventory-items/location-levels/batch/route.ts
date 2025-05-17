import type {
    MedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework/http"
  import { batchInventoryItemLevelsWorkflow } from "@medusajs/medusa/core-flows"
  
  export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
  ) => {
    const { create = [], update = [], delete: toDelete = [] } = req.body as {
      create?: any[]
      update?: any[]
      delete?: string[]
    }
    
  
    const { result } = await batchInventoryItemLevelsWorkflow(req.scope).run({
      input: {
        create,
        update,
        delete: toDelete,
      },
    })
  
    res.status(200).json(result)
  }
  