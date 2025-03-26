import { MedusaError } from "@medusajs/framework/utils"
import { createStep } from "@medusajs/framework/workflows-sdk"

type ValidateCustomerCreateFollowStepInput = {
  customer_id: string
}

export const validateCustomerCreateFollowStep = createStep(
  "validate-customer-create-follow",
  async ({ customer_id }: ValidateCustomerCreateFollowStepInput, { container }) => {
    const query = container.resolve("query")

    const { data } = await query.graph({
      entity: "follow",
      fields: ["*"],
      filters: {
        customer_id: customer_id
      }
    })

    if (data.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Customer already has a follows",
      )
    }

    // check that customer exists
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["*"],
      filters: {
        id: customer_id
      }
    })

    if (customers.length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Specified customer was not found",
      )
    }
  },
)