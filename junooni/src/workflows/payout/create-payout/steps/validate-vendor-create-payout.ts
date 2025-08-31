import { MedusaError } from "@medusajs/framework/utils"
import { createStep } from "@medusajs/framework/workflows-sdk"

type ValidateVendorCreatePayoutStepInput = {
  vendor_id: string
}

export const validateVendorCreatePayoutStep = createStep(
  "validate-vendor-create-payout",
  async ({ vendor_id }: ValidateVendorCreatePayoutStepInput, { container }) => {
    const query = container.resolve("query")

    const { data } = await query.graph({
      entity: "payout",
      fields: ["*"],
      filters: {
        vendor_id: vendor_id
      }
    })

    if (data.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Vendor already has a payout",
      )
    }

    // check that vendor exists
    const { data: vendors } = await query.graph({
      entity: "vendor",
      fields: ["*"],
      filters: {
        id: vendor_id
      }
    })

    if (vendors.length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Specified vendor was not found",
      )
    }
  },
)