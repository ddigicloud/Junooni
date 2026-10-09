import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createOrderShipmentWorkflow } from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MedusaError } from "@medusajs/utils"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  // Extract both order ID and fulfillment ID from params
  const { id: orderId, fulfillmentid: fulfillmentId } = req.params

  // Use req.body and add validation
  const requestBody = (req.body || {}) as any
  
  // Validate required fields
  if (!requestBody.labels || !Array.isArray(requestBody.labels) || requestBody.labels.length === 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Labels array is required and must contain at least one label"
    )
  }

  // Validate each label
  // In backend route validation (around line 22)
for (const label of requestBody.labels) {
  if (!label.tracking_number) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Each label must have a tracking_number"
    )
  }
  
  // ✅ STRICTER VALIDATION
  if (!label.tracking_url || 
      typeof label.tracking_url !== 'string' || 
      label.tracking_url.trim() === '' ||
      label.tracking_url === '#' ||
      !label.tracking_url.startsWith('http')) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Each label must have a valid tracking_url starting with http:// or https://"
    )
  }
}

  const {
    labels
  }: {
    labels: {
      tracking_number: string
      tracking_url: string  // ✅ Now required
      label_url?: string
      carrier?: string
    }[]
  } = requestBody

  console.log(`🚢 Processing shipment request for fulfillment ${fulfillmentId} in order ${orderId}:`, {
    labels: labels.map(label => ({
      tracking_number: label.tracking_number,
      tracking_url: label.tracking_url,
      has_label_url: !!label.label_url,
      carrier: label.carrier || 'unknown'
    }))
  })

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  try {
    // First, get the fulfillment details to validate vendor access
    const {
      data: [fulfillment],
    } = await query.graph({
      entity: "fulfillment",
      fields: [
        "id",
        "metadata",
        "shipped_at",
        "packed_at",
        "items.id",
        "items.item_id",
        "items.line_item_id",
        "items.quantity"
      ],
      filters: {
        id: [fulfillmentId],
      },
    })

    if (!fulfillment) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Fulfillment ${fulfillmentId} not found`
      )
    }

    console.log(`📦 Found fulfillment ${fulfillmentId} for order ${orderId}`)

    // Check if fulfillment is already shipped
    if (fulfillment.shipped_at) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This fulfillment has already been shipped"
      )
    }

    // Get vendor admin and validate access to the order
    const {
      data: [vendorAdmin],
    } = await query.graph({
      entity: "vendor_admin",
      fields: ["id", "vendor.id", "vendor.orders.id"],
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

    // Verify the fulfillment belongs to this vendor
    const fulfillmentVendorId = fulfillment.metadata?.vendor_id
    if (fulfillmentVendorId && fulfillmentVendorId !== vendorAdmin.vendor.id) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "You don't have permission to ship this fulfillment"
      )
    }

    console.log(`✅ Vendor access validated for fulfillment ${fulfillmentId}`)

    // Prepare shipment data for each label - use line_item_id
    const shipmentItems = fulfillment.items?.map(item => ({
      id: item.line_item_id,
      quantity: item.quantity
    })) || []

    if (shipmentItems.length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No items found in fulfillment to ship"
      )
    }

    console.log(`📋 Creating shipment for ${shipmentItems.length} items:`, {
      items: shipmentItems.map(item => ({ id: item.id, quantity: item.quantity }))
    })

    // ✅ FIXED: Only use vendor-provided data, no URL generation
    const { result: shipment } = await createOrderShipmentWorkflow(
      req.scope
    ).run({
      input: {
        order_id: orderId,
        fulfillment_id: fulfillmentId,
        items: shipmentItems,
        labels: labels.map(label => {
          // ✅ Build label object with only provided fields
          const labelData: any = {
            tracking_number: label.tracking_number.trim(),
            tracking_url: label.tracking_url.trim() // ✅ Required from vendor
          };
          
          // Only add label_url if provided and not empty
          if (label.label_url && label.label_url.trim() !== '') {
            labelData.label_url = label.label_url.trim();
          }
          
          console.log(`📋 Creating label with data:`, labelData);
          return labelData;
        }),
        metadata: {
          vendor_id: vendorAdmin.vendor.id,
          vendor_admin_id: req.auth_context.actor_id,
          shipment_source: "vendor_portal",
          created_at: new Date().toISOString(),
          labels_count: labels.length,
          shipped_by: "vendor",
          carrier: labels[0]?.carrier // Store carrier info in metadata
        },
      },
    })

    console.log(`✅ Shipment created successfully:`, {
      shipment_id: shipment?.id,
      fulfillment_id: fulfillmentId,
      order_id: orderId,
      tracking_numbers: labels.map(l => l.tracking_number),
      tracking_urls: labels.map(l => l.tracking_url)
    })

    res.status(201).json({ 
      shipment,
      message: "Shipment created successfully",
      details: {
        fulfillment_id: fulfillmentId,
        order_id: orderId,
        labels_created: labels.length,
        tracking_numbers: labels.map(l => l.tracking_number),
        tracking_urls: labels.map(l => l.tracking_url)
      }
    })

  } catch (error) {
    console.error(`❌ Error creating shipment for fulfillment ${fulfillmentId}:`, error)
    
    // Better error handling with specific error types
    if (error instanceof MedusaError) {
      throw error
    }
    
    // Handle specific workflow errors
    if (error.message?.includes('not found')) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Fulfillment ${fulfillmentId} not found or cannot be shipped`
      )
    }
    
    if (error.message?.includes('already shipped')) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This fulfillment has already been shipped"
      )
    }
    
    if (error.message?.includes('not fulfilled')) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Fulfillment must be completed before creating shipment"
      )
    }
    
    if (error.message?.includes('invalid tracking')) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Invalid tracking number or URL format"
      )
    }

    if (error.message?.includes('insufficient quantity')) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Insufficient quantity to ship the requested items"
      )
    }

    // Handle validation errors specifically
    if (error.message?.includes('required') && error.message?.includes('undefined')) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Missing required field in shipment data: ${error.message}`
      )
    }
    
    // Generic error fallback
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Failed to create shipment: ${error.message || 'Unknown error'}`
    )
  }
}