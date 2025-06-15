import type {
    MedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework/http"
  import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
  import { Modules } from "@medusajs/framework/utils"
  
  export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
  ) => {
    const { id } = req.params
    
    // Option 1: Using Query
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    
    const { data: [product] } = await query.graph(
      {
        entity: "product",
        fields: ["*", "variants.*","categories.*","vendor.*","collection.*"], // Add any other fields you need
        filters: {
          id: id,
        },
      },
      { throwIfKeyNotFound: true }
    )
    
        
    res.json({
      product: product,
    })
  }