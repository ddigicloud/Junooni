// Create: src/api/admin/debug/workflow/route.ts
// This will test the workflow manually with real order data

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { processVendorPayoutWorkflow } from "../../../workflows/payout/process-vendor-payout"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { orderId } = req.body
  
  if (!orderId) {
    return res.status(400).json({ error: "orderId is required" })
  }

  try {
    console.log(`🧪 [MANUAL-WORKFLOW] Testing workflow for order: ${orderId}`)
    
    const orderModuleService = req.scope.resolve("orderModuleService")
    const productModuleService = req.scope.resolve("productModuleService")
    const payoutService = req.scope.resolve("payout")
    
    // Step 1: Get order details
    console.log(`📦 [MANUAL-WORKFLOW] Retrieving order...`)
    const order = await orderModuleService.retrieveOrder(orderId, {
      relations: ["items", "items.product", "items.variant"],
    })
    
    console.log(`📦 [MANUAL-WORKFLOW] Order found:`, {
      id: order.id,
      total: order.total,
      status: order.status,
      itemCount: order.items?.length
    })
    
    if (!order.items?.length) {
      return res.status(400).json({ error: "Order has no items" })
    }
    
    // Step 2: Check vendor balances BEFORE processing
    console.log(`💰 [MANUAL-WORKFLOW] Checking vendor balances BEFORE...`)
    const vendorBalancesBefore = new Map()
    
    for (const item of order.items) {
      const product = await productModuleService.retrieveProduct(item.product_id)
      const vendorId = product.metadata?.vendor_id as string
      if (vendorId && !vendorBalancesBefore.has(vendorId)) {
        const balance = await payoutService.getBalance(vendorId)
        vendorBalancesBefore.set(vendorId, balance)
        console.log(`💰 [MANUAL-WORKFLOW] Vendor ${vendorId} balance BEFORE: ${balance}`)
      }
    }
    
    // Step 3: Prepare workflow items (same logic as subscriber)
    console.log(`🔧 [MANUAL-WORKFLOW] Preparing workflow items...`)
    const workflowItems = []
    
    for (const item of order.items) {
      const product = await productModuleService.retrieveProduct(item.product_id)
      
      console.log(`🔍 [MANUAL-WORKFLOW] Item ${item.id} product metadata:`, product.metadata)
      
      const vendorId = product.metadata?.vendor_id as string
      if (!vendorId) {
        console.log(`⚠️ [MANUAL-WORKFLOW] No vendor_id for item ${item.id}, skipping`)
        continue
      }
      
      const costPrice = product.metadata?.cost_price ? parseFloat(product.metadata.cost_price as string) : 0
      const productCost = product.metadata?.product_cost ? parseFloat(product.metadata.product_cost as string) : 0
      const fulfillmentType = (product.metadata?.fulfillment_type as any) || "creator_fulfillment"
      
      // More lenient validation
      if (fulfillmentType === "junooni_fulfillment" && !productCost && !costPrice) {
        console.log(`⚠️ [MANUAL-WORKFLOW] Junooni item ${item.id} missing cost data, skipping`)
        continue
      }
      
      workflowItems.push({
        id: item.id,
        vendorId,
        quantity: item.quantity,
        costPrice,
        productCost: fulfillmentType === "junooni_fulfillment" ? (productCost || costPrice) : undefined,
        fulfillmentType,
        lineItemTotal: item.total || 0,
      })
    }
    
    console.log(`📋 [MANUAL-WORKFLOW] Prepared ${workflowItems.length} workflow items:`, workflowItems)
    
    if (workflowItems.length === 0) {
      return res.status(400).json({ 
        error: "No eligible items for payout",
        debug: {
          totalItems: order.items.length,
          workflowItems: 0,
          orderItems: order.items.map(item => ({
            id: item.id,
            product_id: item.product_id,
            total: item.total
          }))
        }
      })
    }
    
    // Step 4: Execute workflow
    console.log(`🚀 [MANUAL-WORKFLOW] Executing workflow...`)
    const workflowInput = {
      orderId: order.id,
      orderTotal: order.total || 0,
      items: workflowItems,
    }
    
    console.log(`📤 [MANUAL-WORKFLOW] Workflow input:`, JSON.stringify(workflowInput, null, 2))
    
    const { result } = await processVendorPayoutWorkflow.run({
      input: workflowInput,
      container: req.scope,
    })
    
    console.log(`✅ [MANUAL-WORKFLOW] Workflow completed:`, result)
    
    // Step 5: Check vendor balances AFTER processing
    console.log(`💰 [MANUAL-WORKFLOW] Checking vendor balances AFTER...`)
    const vendorBalancesAfter = new Map()
    const balanceChanges = []
    
    for (const [vendorId, balanceBefore] of vendorBalancesBefore) {
      const balanceAfter = await payoutService.getBalance(vendorId)
      vendorBalancesAfter.set(vendorId, balanceAfter)
      const change = balanceAfter - balanceBefore
      
      console.log(`💰 [MANUAL-WORKFLOW] Vendor ${vendorId}: ${balanceBefore} → ${balanceAfter} (change: +${change})`)
      
      balanceChanges.push({
        vendorId,
        balanceBefore,
        balanceAfter,
        change
      })
    }
    
    // Step 6: Get payout records created
    console.log(`📊 [MANUAL-WORKFLOW] Checking payout records...`)
    const payoutRecords = await payoutService.listPayouts({
      order_id: orderId
    })
    
    console.log(`📊 [MANUAL-WORKFLOW] Found ${payoutRecords.length} payout records for order`)
    
    res.json({
      success: true,
      orderId,
      workflowResult: result,
      balanceChanges,
      payoutRecords: payoutRecords.map(p => ({
        id: p.id,
        vendor_id: p.vendor_id,
        amount: p.amount,
        type: p.type,
        status: p.status,
        created_at: p.created_at
      })),
      summary: {
        totalOrderItems: order.items.length,
        eligibleWorkflowItems: workflowItems.length,
        payoutRecordsCreated: payoutRecords.length,
        vendorsProcessed: balanceChanges.length,
        totalBalanceIncrease: balanceChanges.reduce((sum, c) => sum + c.change, 0)
      },
      debug: {
        orderTotal: order.total,
        workflowItems,
        workflowInput
      }
    })
    
  } catch (error) {
    console.error(`❌ [MANUAL-WORKFLOW] Error:`, error)
    res.status(500).json({
      error: error.message,
      stack: error.stack,
      type: error.constructor.name
    })
  }
}