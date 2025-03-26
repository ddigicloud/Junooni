import { InferTypeOf } from "@medusajs/framework/types"
import { Follow} from "../../../modules/follow/models/follow"
import { createStep } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

type ValidateVendorFollowStepInput = {
  vendor_id: string
  follow: InferTypeOf<typeof Follow>
}

export const validateVendorFollowStep = createStep(
  "validate-creator-in-followlist",
  async ({ 
    vendor_id, 
   follow
  }: ValidateVendorFollowStepInput , { container }) => {
    // validate whether creator is in follow list
    const isInFollowList = follow.creators?.some((creator) => creator.vendor_id === vendor_id)

    if (isInFollowList) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Creator is already in followlist",
      )
    }

    // validate that the variant is available in the specified sales channel
   /* const query = container.resolve("query")
    const { data } = await query.graph({
      entity: "vendor",
      fields: ["vendor.*"],
      filters: {
        id: vendor_id
      }
    })*/

   
   
  }
)