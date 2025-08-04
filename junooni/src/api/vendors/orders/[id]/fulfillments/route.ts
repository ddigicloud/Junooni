import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createOrderFulfillmentWorkflow } from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MedusaError } from "@medusajs/utils"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id: orderId } = req.params


  // ✅ FIXED: Use req.body instead of req.validatedBody and add validation
  const requestBody = req.body || {}
  
  // Validate required fields
  if (!requestBody.items || !Array.isArray(requestBody.items) || requestBody.items.length === 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Items array is required and must contain at least one item"
    )
  }

  if (!requestBody.location_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Location ID is required"
    )
  }

  // Validate each item
  for (const item of requestBody.items) {
    if (!item.id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Each item must have an ID"
      )
    }
    if (!item.quantity || item.quantity <= 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Each item must have a quantity greater than 0"
      )
    }
  }

  const {
    items,
    location_id,
    metadata = {},
    additional_data = {},
  }: {
    items: { id: string; quantity: number }[]
    location_id: string
    metadata?: Record<string, any>
    additional_data?: Record<string, any>
  } = requestBody

  console.log(`🚀 Processing fulfillment request for order ${orderId}:`, {
    items: items.map(item => ({ id: item.id, quantity: item.quantity })),
    location_id,
    metadata,
    additional_data
  })

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // ✅ Get vendor admin and validate access to the order
  const {
    data: [vendorAdmin],
  } = await query.graph({
    entity: "vendor_admin",
    fields: ["vendor.orders.id"],
    filters: {
      id: [req.auth_context.actor_id],
    },
  })

  if (!vendorAdmin) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Vendor admin not found"
    )
  }

  const vendorOrderIds = vendorAdmin?.vendor?.orders?.map((o) => o.id) || []

  if (!vendorOrderIds.includes(orderId)) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Order not found or not accessible to this vendor"
    )
  }

  try {
    console.log(`📦 Creating fulfillment for order ${orderId}...`)
    
    // ✅ Create the fulfillment using Medusa's workflow
    const { result: fulfillment } = await createOrderFulfillmentWorkflow(
      req.scope
    ).run({
      input: {
        order_id: orderId,
        items,
        location_id,
        metadata: {
          ...metadata,
          vendor_id: vendorAdmin.vendor.id,
          vendor_admin_id: req.auth_context.actor_id,
          fulfillment_source: "vendor_portal",
          created_at: new Date().toISOString()
        },
        additional_data: {
          ...additional_data,
          vendor_confirmation: true,
          confirmed_by: req.auth_context.actor_id
        },
      },
    })

    console.log(`✅ Fulfillment created successfully:`, {
      fulfillment_id: fulfillment?.id,
      order_id: orderId,
      items_count: items.length
    })

    res.status(201).json({ 
      fulfillment,
      message: "Fulfillment created successfully",
      details: {
        order_id: orderId,
        items_fulfilled: items.length,
        location_id
      }
    })

  } catch (error) {
    console.error(`❌ Error creating fulfillment for order ${orderId}:`, error)
    
    // ✅ Better error handling with specific error types
    if (error instanceof MedusaError) {
      throw error
    }
    
    // Handle specific workflow errors
    if (error.message?.includes('not found')) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Order ${orderId} not found or cannot be fulfilled`
      )
    }
    
    if (error.message?.includes('already fulfilled')) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Some items in this order have already been fulfilled"
      )
    }
    
    if (error.message?.includes('insufficient inventory')) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Insufficient inventory to fulfill the requested quantities"
      )
    }
    
    // Generic error fallback
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Failed to create fulfillment: ${error.message || 'Unknown error'}`
    )
  }
}