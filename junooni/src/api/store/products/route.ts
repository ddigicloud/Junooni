import type {
    MedusaRequest,
    MedusaResponse,
  } from "@medusajs/framework/http"
  import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
  
  export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
  ) => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    
    // Extract query parameters
    /*const { handle, id, region_id, ...filters } = req.query
    
   
    const productFilters = {
      ...filters
    }
   
    if (handle) {
      productFilters.handle = handle
    } else if (id) {
      productFilters.id = id
    }
    */ 
    // Query products with vendor information
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["*", "variants.*", "vendor.*", "options.*", "images.*"],
      /*filters: productFilters,
      context: {
        region_id,
      }*/
    })
    
    res.json({
      products
    })
  }