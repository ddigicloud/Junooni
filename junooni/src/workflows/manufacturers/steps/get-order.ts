import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Step to fetch complete order with all necessary relationships
 * Using remoteQuery which is more stable than query.graph
 */
export const getOrderStep = createStep(
  "get-order-step",
  async (orderId: string, { container }) => {
    console.log("🔍 Fetching order:", orderId)
    
    try {
      // Use remoteQuery instead of query.graph
      const remoteQuery = container.resolve(ContainerRegistrationKeys.REMOTE_QUERY)
      
      console.log("✅ RemoteQuery resolved")

      // Fetch order with remoteQuery (more stable approach)
      const orders = await remoteQuery({
        entryPoint: "order",
        fields: [
          "id",
          "display_id",
          "email",
          "total",
          "subtotal",
          "shipping_total",
          "tax_total",
          "currency_code",
          "metadata",
          "items.*",
          "items.variant_id",
          "items.product_id",
          "items.metadata",
          "shipping_address.*",
          "billing_address.*",
        ],
        variables: {
          filters: {
            id: orderId,
          },
        },
      })

      if (!orders || orders.length === 0) {
        throw new Error(`Order ${orderId} not found`)
      }

      const order = orders[0]

      console.log("✅ Fetched order:", {
        id: order.id,
        display_id: order.display_id,
        email: order.email,
        items_count: order.items?.length || 0,
      })

      return new StepResponse(order)
    } catch (error) {
      console.error("❌ Error in getOrderStep:", error)
      throw error
    }
  }
)