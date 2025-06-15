// api/admin/search/index/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { typesenseService } from "../../../../../lib/typesense"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    console.log("🚀 Starting product indexing for Typesense...")
    
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    
    // Get all published products with their relationships
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title", 
        "description",
        "handle",
        "thumbnail",
        "status",
        "created_at",
        "collection.id",
        "collection.title",
        "vendor.id",
        "vendor.name",
        "variants.id",
        "variants.prices.amount",
        "variants.prices.currency_code",
        "variants.calculated_price.calculated_amount",
        "variants.calculated_price.currency_code"
      ],
      filters: {
        status: "published"
      }
    })
    
    console.log(`📦 Found ${products.length} products to index`)
    
    // Index products in Typesense
    const result = await typesenseService.indexProducts(products)
    
    console.log("🎉 Indexing completed successfully!")
    
    res.json({
      success: true,
      message: "Products indexed successfully",
      count: result.count,
      timestamp: new Date().toISOString(),
    })
    
  } catch (error) {
    console.error("❌ Indexing Error:", error)
    res.status(500).json({ 
      success: false,
      error: "Indexing failed",
      message: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}

// GET endpoint to check indexing status
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const stats = await typesenseService.getStats()
    
    res.json({
      success: true,
      stats,
      endpoints: {
        search: "/api/store/products/search",
        reindex: "/api/admin/search/index",
      },
      timestamp: new Date().toISOString(),
    })
    
  } catch (error) {
    console.error("❌ Status Check Error:", error)
    res.status(500).json({ 
      success: false,
      error: "Failed to get index status",
      message: error.message,
    })
  }
}