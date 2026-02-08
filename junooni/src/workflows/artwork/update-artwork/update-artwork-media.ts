import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import updateArtworkMediaStep from "./steps/update-artwork-media"

export type UpdateArtworkMediaWorkflowInput = {
  id: string
  fileId?: string
  mimeType?: string
  filename?: string
  file_type?: string
  file_description?: string
}

export const updateArtworkMediaWorkflow = createWorkflow(
  "update-vendor-artwork-media",
  (input: UpdateArtworkMediaWorkflowInput) => {
    const artworkMedia = updateArtworkMediaStep(input)
    return new WorkflowResponse(artworkMedia)
  }
)