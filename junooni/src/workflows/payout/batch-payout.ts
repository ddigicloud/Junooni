import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
// import { PAYOUT_MODULE } from "../index"

// Use string constant directly - no need to import
const PAYOUT_MODULE = "payout"

export interface BatchPayoutWorkflowInput {
  period?: string // e.g., "2025-W03", if not provided, will be auto-generated
  paymentMethod: "bank_transfer" | "paypal" | "stripe" | "manual"
  dryRun?: boolean // If true, only calculate but don't process
  vendorIds?: string[] // If provided, only process these vendors
  minimumAmount?: number // Override minimum payout amount
}

// Step to identify eligible vendors for batch payout
export const identifyEligibleVendorsStep = createStep(
  "identify-eligible-vendors",
  async function (
    input: {
      vendorIds?: string[]
      minimumAmount?: number
      dryRun?: boolean
    },
    { container }
  ) {
    const payoutModuleService = container.resolve(PAYOUT_MODULE)
    
    let eligibleVendors = await payoutModuleService.getEligibleVendors()
    
    // Filter by specific vendor IDs if provided
    if (input.vendorIds && input.vendorIds.length > 0) {
      eligibleVendors = eligibleVendors.filter(vendor => 
        input.vendorIds!.includes(vendor.vendor_id)
      )
    }
    
    // Apply custom minimum amount if provided
    if (input.minimumAmount && input.minimumAmount > 0) {
      eligibleVendors = eligibleVendors.filter(vendor => 
        vendor.current_balance >= input.minimumAmount
      )
    }

    if (eligibleVendors.length === 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "No vendors are eligible for payout with the specified criteria"
      )
    }

    const totalAmount = eligibleVendors.reduce((sum, vendor) => sum + vendor.current_balance, 0)
    
    return new StepResponse({
      eligibleVendors,
      totalVendors: eligibleVendors.length,
      totalAmount,
      isDryRun: input.dryRun || false,
    })
  }
)

// Step to create batch record
export const createBatchRecordStep = createStep(
  "create-batch-record",
  async function (
    input: {
      period?: string
      paymentMethod: "bank_transfer" | "paypal" | "stripe" | "manual"
      totalVendors: number
      totalAmount: number
      isDryRun: boolean
    },
    { container }
  ) {
    if (input.isDryRun) {
      // For dry runs, return mock batch data
      return new StepResponse({
        batchId: `DRY_RUN_${Date.now()}`,
        batchReference: `DRY_RUN_BATCH_${input.period || "MANUAL"}_${Date.now()}`,
        isDryRun: true,
      })
    }

    const payoutModuleService = container.resolve(PAYOUT_MODULE)
    
    // Generate period if not provided
    const period = input.period || getCurrentPayoutPeriod()
    
    const batch = await payoutModuleService.createBatch(period, input.paymentMethod)
    
    return new StepResponse({
      batchId: batch.id,
      batchReference: batch.batch_reference,
      period: batch.period,
      isDryRun: false,
    })
  }
)

// Step to process individual vendor payouts
export const processVendorPayoutsStep = createStep(
  "process-vendor-payouts",
  async function (
    input: {
      batchId: string
      eligibleVendors: any[]
      paymentMethod: "bank_transfer" | "paypal" | "stripe" | "manual"
      isDryRun: boolean
    },
    { container }
  ) {
    if (input.isDryRun) {
      // For dry runs, return simulated results
      return new StepResponse({
        successfulPayouts: input.eligibleVendors.length,
        failedPayouts: 0,
        totalProcessed: input.eligibleVendors.reduce((sum, vendor) => sum + vendor.current_balance, 0),
        results: input.eligibleVendors.map(vendor => ({
          vendorId: vendor.vendor_id,
          amount: vendor.current_balance,
          status: "simulated_success",
        })),
        isDryRun: true,
      })
    }

    const payoutModuleService = container.resolve(PAYOUT_MODULE)
    
    // Map payment methods between batch and individual payout processing
    let payoutPaymentMethod: "bank_transfer" | "paypal" | "razorpay" | "manual" = "manual"
    
    switch (input.paymentMethod) {
      case "stripe":
        payoutPaymentMethod = "razorpay"
        break
      case "bank_transfer":
        payoutPaymentMethod = "bank_transfer"
        break
      case "paypal":
        payoutPaymentMethod = "paypal"
        break
      case "manual":
        payoutPaymentMethod = "manual"
        break
    }

    const results: Array<{
      vendorId: string
      amount: number
      status: "success" | "failed"
      error?: string
    }> = []

    let successfulPayouts = 0
    let failedPayouts = 0
    let totalProcessed = 0

    for (const vendor of input.eligibleVendors) {
      try {
        await payoutModuleService.processPayout(
          vendor.vendor_id,
          vendor.current_balance,
          payoutPaymentMethod,
          `Batch payout - ${input.batchId}`
        )
        
        results.push({
          vendorId: vendor.vendor_id,
          amount: vendor.current_balance,
          status: "success",
        })
        
        successfulPayouts++
        totalProcessed += vendor.current_balance
      } catch (error) {
        console.error(`Failed to process payout for vendor ${vendor.vendor_id}:`, error)
        
        results.push({
          vendorId: vendor.vendor_id,
          amount: vendor.current_balance,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        })
        
        failedPayouts++
      }
    }

    return new StepResponse({
      successfulPayouts,
      failedPayouts,
      totalProcessed,
      results,
      isDryRun: false,
    })
  }
)

// Step to finalize batch processing
export const finalizeBatchStep = createStep(
  "finalize-batch",
  async function (
    input: {
      batchId: string
      successfulPayouts: number
      failedPayouts: number
      isDryRun: boolean
    },
    { container }
  ) {
    if (input.isDryRun) {
      return new StepResponse({
        message: "Dry run completed successfully",
        batchId: input.batchId,
      })
    }

    const payoutModuleService = container.resolve(PAYOUT_MODULE)
    
    const finalStatus = input.failedPayouts === 0 ? "completed" : 
                       input.successfulPayouts === 0 ? "failed" : "partially_failed"

    const updatedBatch = await payoutModuleService.updatePayoutBatches({
      id: input.batchId,
      status: finalStatus,
      successful_payouts: input.successfulPayouts,
      failed_payouts: input.failedPayouts,
      completed_at: new Date(),
    })

    return new StepResponse({
      batchId: input.batchId,
      status: finalStatus,
      batch: updatedBatch,
    })
  }
)

export const batchPayoutWorkflow = createWorkflow(
  "batch-payout-processing",
  function (input: BatchPayoutWorkflowInput) {
    // Step 1: Identify eligible vendors
    const vendorSelection = identifyEligibleVendorsStep({
      vendorIds: input.vendorIds,
      minimumAmount: input.minimumAmount,
      dryRun: input.dryRun,
    })

    // Step 2: Create batch record
    const batchCreation = createBatchRecordStep({
      period: input.period,
      paymentMethod: input.paymentMethod,
      totalVendors: vendorSelection.totalVendors,
      totalAmount: vendorSelection.totalAmount,
      isDryRun: vendorSelection.isDryRun,
    })

    // Step 3: Process individual payouts
    const payoutProcessing = processVendorPayoutsStep({
      batchId: batchCreation.batchId,
      eligibleVendors: vendorSelection.eligibleVendors,
      paymentMethod: input.paymentMethod,
      isDryRun: vendorSelection.isDryRun,
    })

    // Step 4: Finalize batch
    const batchFinalization = finalizeBatchStep({
      batchId: batchCreation.batchId,
      successfulPayouts: payoutProcessing.successfulPayouts,
      failedPayouts: payoutProcessing.failedPayouts,
      isDryRun: vendorSelection.isDryRun,
    })

    return new WorkflowResponse({
      batchId: batchCreation.batchId,
      batchReference: batchCreation.batchReference,
      summary: {
        totalVendors: vendorSelection.totalVendors,
        totalAmount: vendorSelection.totalAmount,
        successfulPayouts: payoutProcessing.successfulPayouts,
        failedPayouts: payoutProcessing.failedPayouts,
        totalProcessed: payoutProcessing.totalProcessed,
      },
      results: payoutProcessing.results,
      finalStatus: batchFinalization.status,
      isDryRun: vendorSelection.isDryRun,
    })
  }
)

// Helper function to generate current payout period
function getCurrentPayoutPeriod(): string {
  const now = new Date()
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`
}

export default batchPayoutWorkflow