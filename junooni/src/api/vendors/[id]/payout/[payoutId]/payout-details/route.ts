// import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
// import { PAYOUT_MODULE } from "../../../../../../modules/payout"
// import PayoutModuleService from "../../../../../../modules/payout/service"
// import { MedusaError } from "@medusajs/framework/utils"
// import { createPayoutDetailWorkflow } from "../../../../../../workflows/payout/create-payout-details/create-payout-details"
// import { PostStoreCreatePayoutDetail, GetStorePayoutDetails, PostStoreCreatePayoutDetailType, GetStorePayoutDetailsType } from "./validators"

// const parseBigNumber = (value: any): number => {
//   if (value === null || value === undefined) return 0
//   if (typeof value === 'number') return value
//   if (typeof value === 'string') return parseFloat(value) || 0
//   if (typeof value === 'object' && value.value !== undefined) return parseFloat(value.value) || 0
//   return 0
// }

// export async function GET(
//   req: AuthenticatedMedusaRequest,
//   res: MedusaResponse
// ) {
//   const payoutModuleService: PayoutModuleService = req.scope.resolve(
//     PAYOUT_MODULE
//   )

//   const { payoutId } = req.params

//   const validatedQuery = GetStorePayoutDetails.parse(req.query)

//   const payout = await payoutModuleService.retrievePayout(payoutId)
  
//   if (!payout) {
//     throw new MedusaError(
//       MedusaError.Types.NOT_FOUND,
//       `Payout with id ${payoutId} not found`
//     )
//   }

//   const payoutDetails = await payoutModuleService.getVendorPayoutDetails(
//     payout.vendor_id,
//     {
//       orderId: validatedQuery.order_id,
//       type: validatedQuery.type,
//       limit: validatedQuery.limit || 50,
//       offset: validatedQuery.offset || 0,
//     }
//   )

//   // Parse bigNumber fields in transactions
//   const parsedTransactions = payoutDetails.transactions.map(t => ({
//     ...t,
//     amount: parseBigNumber(t.amount),
//     tax_amount: parseBigNumber(t.tax_amount),
//     tds_amount: parseBigNumber(t.tds_amount),
//     tds_percentage: parseBigNumber(t.tds_percentage),
//     cost_price: parseBigNumber(t.cost_price),
//     commission_rate: parseBigNumber(t.commission_rate),
//     selling_price: parseBigNumber(t.selling_price),
//   }))

//   // Parse bigNumber fields in summary
//   const parsedSummary = {
//     totalEarnings: parseBigNumber(payoutDetails.summary.totalEarnings),
//     totalPaid: parseBigNumber(payoutDetails.summary.totalPaid),
//     currentBalance: parseBigNumber(payoutDetails.summary.currentBalance),
//     totalOrders: payoutDetails.summary.totalOrders,
//     totalTransactions: payoutDetails.summary.totalTransactions,
//   }

//   // Return transactions at root level so frontend can find data.transactions directly
//   res.json({
//     transactions: parsedTransactions,
//     summary: parsedSummary,
//     account: payoutDetails.account,
//   })
// }

// export async function POST(
//   req: AuthenticatedMedusaRequest<PostStoreCreatePayoutDetailType>,
//   res: MedusaResponse
// ) {
//   const { id: payoutId } = req.params
  
//   const validatedBody = PostStoreCreatePayoutDetail.parse(req.body)

//   try {
//     const { result } = await createPayoutDetailWorkflow(req.scope).run({
//       input: {
//         payout_id: payoutId,
//         vendor_id: req.auth_context.actor_id,
//         type: validatedBody.type,
//         amount: validatedBody.amount,
//         reason: validatedBody.reason,
//         notes: validatedBody.notes,
//         order_id: validatedBody.order_id,
//         order_item_id: validatedBody.order_item_id,
//         product_id: validatedBody.product_id,
//       },
//     })

//     res.status(201).json({
//       payout_detail: result.payout_detail,
//       payout: result.payout,
//     })

//   } catch (error) {
//     if (error instanceof MedusaError) {
//       throw error
//     }
    
//     throw new MedusaError(
//       MedusaError.Types.UNEXPECTED_STATE,
//       `Failed to create payout detail: ${error instanceof Error ? error.message : "Unknown error"}`
//     )
//   }
// }

import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAYOUT_MODULE } from "../../../../../../modules/payout"
import PayoutModuleService from "../../../../../../modules/payout/service"
import { MedusaError } from "@medusajs/framework/utils"
import { createPayoutDetailWorkflow } from "../../../../../../workflows/payout/create-payout-details/create-payout-details"
import { PostStoreCreatePayoutDetail, GetStorePayoutDetails, PostStoreCreatePayoutDetailType, GetStorePayoutDetailsType } from "./validators"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const payoutModuleService: PayoutModuleService = req.scope.resolve(
    PAYOUT_MODULE
  )

  const { payoutId } = req.params

  // Validate query parameters
  const validatedQuery = GetStorePayoutDetails.parse(req.query)

  // First get the payout to get vendor_id
  const payout = await payoutModuleService.retrievePayout(payoutId)
  
  if (!payout) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Payout with id ${payoutId} not found`
    )
  }

  // Check if authenticated user has access to this payout
  // if (req.auth_context.actor_id !== payout.vendor_id) {
  //   throw new MedusaError(
  //     MedusaError.Types.NOT_ALLOWED,
  //     "Access denied to this payout account"
  //   )
  // }

  // Get payout details with filters
  const payoutDetails = await payoutModuleService.getVendorPayoutDetails(
    payout.vendor_id,
    {
      orderId: validatedQuery.order_id,
      type: validatedQuery.type,
      limit: validatedQuery.limit || 50,
      offset: validatedQuery.offset || 0,
    }
  )

  res.json({
    payout_details: payoutDetails,
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<PostStoreCreatePayoutDetailType>,
  res: MedusaResponse
) {
  const { id: payoutId } = req.params
  
  // Validate request body
  const validatedBody = PostStoreCreatePayoutDetail.parse(req.body)

  try {
    // Use workflow to create payout detail
    const { result } = await createPayoutDetailWorkflow(req.scope).run({
      input: {
        payout_id: payoutId,
        vendor_id: req.auth_context.actor_id,
        type: validatedBody.type,
        amount: validatedBody.amount,
        reason: validatedBody.reason,
        notes: validatedBody.notes,
        order_id: validatedBody.order_id,
        order_item_id: validatedBody.order_item_id,
        product_id: validatedBody.product_id,
      },
    })

    res.status(201).json({
      payout_detail: result.payout_detail,
      payout: result.payout,
    })

  } catch (error) {
    if (error instanceof MedusaError) {
      throw error
    }
    
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Failed to create payout detail: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}