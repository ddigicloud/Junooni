import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import deleteArtworkMediaStep from "./steps/delete-artwork-media"

export type DeleteArtworkMediaWorkflow = {
  id: string
}

export const deleteArtworkMediaWorkflow = createWorkflow(
  "delete-vendor-artwork-media",
  (input: DeleteArtworkMediaWorkflow) => {
    const result = deleteArtworkMediaStep(input)
    return new WorkflowResponse(result)
  }
)
