import {
    AuthenticatedMedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework/http"
  import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
  
  export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
  ) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const collectionId = req.query.collection_id
    
    if (!collectionId) {
      return res.status(400).json({
        message: "collection_id is required",
      })
    }
  
    // Retrieve products in the collection with their vendor information
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["*", "vendor.*"],
      filters: {
        collection_id: [collectionId],
      },
    })
  
    res.json({
      products,
    })
  }