// src/api/admin/test-workflow/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const PAYOUT_MODULE = "payout"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const vendorId = "01JN475VCB34HJ702Q242JCDEZ"
  
  console.log("🧪 === TESTING WORKFLOW COMPONENTS ===")
  
  let testResults = {
    step1_payout_service: null,
    step2_workflow_import: null,
    step3_workflow_steps: null,
    step4_full_workflow: null,
    step5_direct_service_call: null
  }
  
  try {
    // STEP 1: Test payout service directly
    console.log("🔧 STEP 1: Testing payout service...")
    try {
      const payoutModuleService = req.scope.resolve(PAYOUT_MODULE)
      
      // Test basic service methods
      const allPayouts = await payoutModuleService.listPayouts({})
      console.log("✅ Payout service accessible, total records:", allPayouts.length)
      
      testResults.step1_payout_service = {
        success: true,
        service_available: true,
        total_records: allPayouts.length,
        methods_available: Object.getOwnPropertyNames(Object.getPrototypeOf(payoutModuleService))
      }
      
    } catch (error) {
      console.error("❌ Payout service error:", error.message)
      testResults.step1_payout_service = {
        success: false,
        error: error.message
      }
    }
    
    // STEP 2: Test workflow import
    console.log("\n📦 STEP 2: Testing workflow import...")
    try {
      const workflowModule = await import("../../workflows/payout/process-vendor-payout.js")
      console.log("✅ Workflow imported successfully")
      
      testResults.step2_workflow_import = {
        success: true,
        has_workflow: !!workflowModule.processVendorPayoutWorkflow,
        has_default_export: !!workflowModule.default,
        workflow_type: typeof workflowModule.processVendorPayoutWorkflow
      }
      
    } catch (error) {
      console.error("❌ Workflow import failed:", error.message)
      testResults.step2_workflow_import = {
        success: false,
        error: error.message
      }
      
      // Try alternative import paths
      try {
        console.log("🔄 Trying alternative import path...")
        const altWorkflow = await import("../../workflows/payout/process-vendor-payout.js")
        testResults.step2_workflow_import.alternative_import = {
          success: true,
          path: "modules/payout/workflows/"
        }
      } catch (altError) {
        testResults.step2_workflow_import.alternative_import = {
          success: false,
          error: altError.message
        }
      }
    }
    
    // STEP 3: Test individual workflow steps
    console.log("\n⚙️ STEP 3: Testing workflow steps...")
    try {
      const stepsModule = await import("../../workflows/payout/steps/index.js")
      
      console.log("🧪 Testing validation step...")
      const validationInput = {
        orderId: "test_order_001",
        orderTotal: 5000,
        items: [{
          id: "test_item_001",
          vendorId: vendorId,
          quantity: 1,
          costPrice: 5000,
          fulfillmentType: "creator_fulfillment" as const,
          lineItemTotal: 5000
        }]
      }
      
      // Test validation step
      const validationResult = await stepsModule.validateOrderForPayoutStep.invoke(validationInput)
      console.log("✅ Validation step passed")
      
      // Test grouping step
      const groupingResult = await stepsModule.groupItemsByVendorStep.invoke(validationInput.items)
      console.log("✅ Grouping step passed, groups:", groupingResult.length)
      
      // Test calculation step
      const calculationResult = await stepsModule.calculateVendorPayoutsStep.invoke({
        vendorGroups: groupingResult,
        orderId: validationInput.orderId
      })
      console.log("✅ Calculation step passed, payouts:", calculationResult.length)
      
      testResults.step3_workflow_steps = {
        success: true,
        validation_passed: true,
        grouping_passed: true,
        calculation_passed: true,
        calculated_earnings: calculationResult[0]?.totalEarnings || 0
      }
      
    } catch (error) {
      console.error("❌ Workflow steps failed:", error.message)
      testResults.step3_workflow_steps = {
        success: false,
        error: error.message
      }
    }
    
    // STEP 4: Test full workflow
    console.log("\n🚀 STEP 4: Testing full workflow...")
    try {
      const { processVendorPayoutWorkflow } = await import("../../workflows/payout/process-vendor-payout.js")
      
      const workflowInput = {
        orderId: "test_workflow_" + Date.now(),
        orderTotal: 5000,
        items: [{
          id: "test_item_001",
          vendorId: vendorId,
          quantity: 1,
          costPrice: 5000,
          fulfillmentType: "creator_fulfillment" as const,
          lineItemTotal: 5000
        }]
      }
      
      console.log("🎯 Executing full workflow with input:", workflowInput)
      
      const { result } = await processVendorPayoutWorkflow.run({
        input: workflowInput,
        container: req.scope,
      })
      
      console.log("✅ Full workflow completed successfully!")
      console.log("📊 Workflow result:", result)
      
      testResults.step4_full_workflow = {
        success: true,
        result: result,
        input_used: workflowInput
      }
      
    } catch (error) {
      console.error("❌ Full workflow failed:", error.message)
      testResults.step4_full_workflow = {
        success: false,
        error: error.message,
        stack: error.stack
      }
    }
    
    // STEP 5: Test direct service call
    console.log("\n🎯 STEP 5: Testing direct service call...")
    try {
      const payoutModuleService = req.scope.resolve(PAYOUT_MODULE)
      
      console.log("🔧 Calling addEarnings directly...")
      const directResult = await payoutModuleService.addEarnings(
        vendorId,
        4950, // 5000 - 1% TDS
        "test_direct_" + Date.now(),
        "creator_fulfillment"
      )
      
      console.log("✅ Direct service call successful!")
      console.log("📊 Direct result:", directResult)
      
      testResults.step5_direct_service_call = {
        success: true,
        result: directResult
      }
      
    } catch (error) {
      console.error("❌ Direct service call failed:", error.message)
      testResults.step5_direct_service_call = {
        success: false,
        error: error.message
      }
    }
    
    // FINAL CHECK: Verify if records were created
    console.log("\n🔍 FINAL CHECK: Verifying payout records...")
    try {
      const payoutModuleService = req.scope.resolve(PAYOUT_MODULE)
      const allPayouts = await payoutModuleService.listPayouts({})
      const vendorPayouts = await payoutModuleService.listPayouts({ vendor_id: vendorId })
      
      console.log("📊 Total payouts in system:", allPayouts.length)
      console.log("📊 Vendor payouts:", vendorPayouts.length)
      
      testResults.final_check = {
        total_payouts: allPayouts.length,
        vendor_payouts: vendorPayouts.length,
        recent_payouts: vendorPayouts.slice(0, 3)
      }
      
    } catch (error) {
      console.error("❌ Final check failed:", error.message)
      testResults.final_check = {
        error: error.message
      }
    }
    
    console.log("🧪 === WORKFLOW TESTING COMPLETED ===")
    
    res.json({
      success: true,
      test_results: testResults,
      summary: generateSummary(testResults)
    })
    
  } catch (error) {
    console.error("💥 Main test error:", error)
    res.json({
      success: false,
      error: error.message,
      test_results: testResults
    })
  }
}

function generateSummary(testResults: any) {
  const summary = {
    service_working: testResults.step1_payout_service?.success || false,
    workflow_importable: testResults.step2_workflow_import?.success || false,
    steps_working: testResults.step3_workflow_steps?.success || false,
    full_workflow_working: testResults.step4_full_workflow?.success || false,
    direct_service_working: testResults.step5_direct_service_call?.success || false,
    records_created: (testResults.final_check?.vendor_payouts || 0) > 0
  }
  
  const issues = []
  if (!summary.service_working) issues.push("Payout service not accessible")
  if (!summary.workflow_importable) issues.push("Workflow import failed")
  if (!summary.steps_working) issues.push("Workflow steps failing")
  if (!summary.full_workflow_working) issues.push("Full workflow execution failed")
  if (!summary.direct_service_working) issues.push("Direct service calls failing")
  if (!summary.records_created) issues.push("No payout records being created")
  
  return {
    overall_status: issues.length === 0 ? "All tests passed" : "Issues found",
    issues: issues,
    next_action: issues.length === 0 ? "Check subscriber triggering" : "Fix workflow issues first"
  }
}