// import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
// import { PAYOUT_MODULE } from "../../../../modules/payout"
// import PayoutModuleService from "../../../../modules/payout/service"
// import { createPayoutWorkflow } from "../../../../workflows/payout/create-payout/create-payout"

// export async function GET(
//   req: MedusaRequest,
//   res: MedusaResponse
// ) {
//   const payoutModuleService: PayoutModuleService = req.scope.resolve(
//     PAYOUT_MODULE
//   )
//  const { id } = req.params
//   const payout = await payoutModuleService.getVendorPayout(id)

//   res.json({
//     payout
//   })
// }


// export async function POST(
//   req: MedusaRequest,
//   res: MedusaResponse
// ) {

//   const { id } = req.params
//   const { result } = await createPayoutWorkflow(req.scope)
//     .run({
//       input: {
//         vendor_id: id,
//         // Ensure this value is provided in the request body
//       }
//     })

//   res.json({
//     Payout: result.payout
//   })
// }

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAYOUT_MODULE } from "../../../../modules/payout"
import PayoutModuleService from "../../../../modules/payout/service"
import { createPayoutWorkflow } from "../../../../workflows/payout/create-payout/create-payout"

// Helper to safely parse bigNumber fields
const parseBigNumber = (value: any): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  if (typeof value === 'object' && value.value !== undefined) return parseFloat(value.value) || 0
  return 0
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const payoutModuleService: PayoutModuleService = req.scope.resolve(PAYOUT_MODULE)
  const { id } = req.params
  const payout = await payoutModuleService.getVendorPayout(id)

  if (!payout) {
    return res.status(404).json({ payout: null })
  }

  // Parse all bigNumber fields to plain floats
  const parsedPayout = {
    ...payout,
    payout_total: parseBigNumber(payout.payout_total),
    current_balance: parseBigNumber(payout.current_balance),
    pending_balance: parseBigNumber(payout.pending_balance),
    total_earned: parseBigNumber(payout.total_earned),
    total_paid: parseBigNumber(payout.total_paid),
    total_pending_payout: parseBigNumber(payout.total_pending_payout),
    avg_order_value: parseBigNumber(payout.avg_order_value),
  }

  res.json({ payout: parsedPayout })
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const { result } = await createPayoutWorkflow(req.scope)
    .run({
      input: {
        vendor_id: id,
      }
    })

  res.json({ Payout: result.payout })
}