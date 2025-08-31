import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PAYOUT_MODULE } from "../../../../modules/payout"
import PayoutModuleService from "../../../../modules/payout/service"
import { createPayoutWorkflow } from "../../../../workflows/payout/create-payout/create-payout"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const payoutModuleService: PayoutModuleService = req.scope.resolve(
    PAYOUT_MODULE
  )
 const { id } = req.params
  const payout = await payoutModuleService.getVendorPayout(id)

  res.json({
    payout
  })
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
        // Ensure this value is provided in the request body
      }
    })

  res.json({
    Payout: result.payout
  })
}
