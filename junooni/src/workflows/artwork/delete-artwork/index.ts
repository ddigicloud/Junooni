import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import deleteArtworkStep from "./steps/delete-artwork"

export type DeleteArtworkWorkflow = {
  id: string
}

export const deleteArtworkWorkflow = createWorkflow(
  "delete-vendor-artwork",
  (input: DeleteArtworkWorkflow) => {
    const result = deleteArtworkStep(input)
    return new WorkflowResponse(result)
  }
)