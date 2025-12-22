// import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
// import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// /**
//  * Step to fetch complete order with all necessary relationships
//  * Using remoteQuery which is more stable than query.graph
//  */
// export const getOrderStep = createStep(
//   "get-order-step",
//   async (orderId: string, { container }) => {
//     console.log("🔍 Fetching order:", orderId)
    
//     try {
//       // Use remoteQuery instead of query.graph
//       const remoteQuery = container.resolve(ContainerRegistrationKeys.REMOTE_QUERY)
      
//       console.log("✅ RemoteQuery resolved")

//       // Fetch order with remoteQuery (more stable approach)
//       const orders = await remoteQuery({
//         entryPoint: "order",
//         fields: [
//           "id",
//           "display_id",
//           "email",
//           "total",
//           "subtotal",
//           "shipping_total",
//           "tax_total",
//           "currency_code",
//           "metadata",
//           "items.*",
//           "items.variant_id",
//           "items.product_id",
//           "items.metadata",
//           "shipping_address.*",
//           "billing_address.*",
//           "payment_collections",
         
//         ],
//         variables: {
//           filters: {
//             id: orderId,
//           },
//         },
//       })

//       if (!orders || orders.length === 0) {
//         throw new Error(`Order ${orderId} not found`)
//       }

//       const order = orders[0]

//       console.log("✅ Fetched order:", {
//         id: order.id,
//         display_id: order.display_id,
//         email: order.email,
//         items_count: order.items?.length || 0,
//       })

//       return new StepResponse(order)
//     } catch (error) {
//       console.error("❌ Error in getOrderStep:", error)
//       throw error
//     }
//   }
// )

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Step to fetch complete order with all necessary relationships
 * Using RemoteQuery for better relation handling
 */
export const getOrderStep = createStep(
  "get-order-step",
  async (orderId: string, { container }) => {
    console.log("🔍 Fetching order:", orderId)
    
    try {
      const remoteQuery = container.resolve(ContainerRegistrationKeys.REMOTE_QUERY)
      
      console.log("✅ RemoteQuery resolved")

      // Fetch order with remoteQuery
      const orders = await remoteQuery({
        entryPoint: "order",
        fields: [
          "id",
          "display_id",
          "email",
          "total",
          "subtotal",
          "currency_code",
          "metadata",
          "payment_status",
          "items.*",
          "items.variant.*",
          "items.product.*",
          "items.metadata",
          "shipping_address.*",
          "billing_address.*",
          "payment_collections.*",
          "payment_collections.payments.*",
          "payment_collections.payment_sessions.*",
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
        has_payment_collections: !!order.payment_collections,
        payment_collections_count: order.payment_collections?.length || 0,
      })

      // Debug payment collections
      if (order.payment_collections && order.payment_collections.length > 0) {
        const paymentCollection = order.payment_collections[0]
        const payments = paymentCollection.payments || []
        const sessions = paymentCollection.payment_sessions || []
        
        console.log("💳 Payment collection found:")
        console.log(`   - Collection ID: ${paymentCollection.id}`)
        console.log(`   - Status: ${paymentCollection.status}`)
        console.log(`   - Completed payments: ${payments.length}`)
        console.log(`   - Payment sessions: ${sessions.length}`)
        
        const allPayments = [...payments, ...sessions]
        allPayments.forEach((payment: any, idx: number) => {
          console.log(`   - Payment ${idx + 1}:`)
          console.log(`     • Provider: ${payment.provider_id}`)
          console.log(`     • Amount: ${payment.amount}`)
        })
      } else {
        console.log("⚠️ No payment_collections found")
      }

      return new StepResponse(order)
    } catch (error) {
      console.error("❌ Error in getOrderStep:", error)
      throw error
    }
  }
)