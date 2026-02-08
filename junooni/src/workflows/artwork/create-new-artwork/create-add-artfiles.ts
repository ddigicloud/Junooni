import { 
  createWorkflow,
  transform,
  WorkflowResponse
} from "@medusajs/framework/workflows-sdk"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import createArtworkMediasStep from "../create-new-artwork/steps/create-artwork-media"

export type UploadAndLinkArtworkMediasInput = {
  vendor_artwork_id: string
  files: Array<{
    filename: string
    mimeType: string
    content: string
    access: "public" | "private"
  }>
}

export const createArtworkMediasWorkflow = createWorkflow(
  "upload-and-link-artwork-medias",
  (input: UploadAndLinkArtworkMediasInput) => {
    // Step 1: Upload files using Medusa's workflow as a step
    const uploadedFiles = uploadFilesWorkflow.runAsStep({
      input: {
        files: input.files,
      },
    })

    // Step 2: Create artwork media records with transformed data
    const { vendor_artwork_media } = createArtworkMediasStep(
      transform(
        { uploadedFiles, input },
        ({ uploadedFiles, input }) => ({
          medias: uploadedFiles.map((file: any, index: number) => ({
            fileId: file.key || file.id || file.url,
            mimeType: input.files[index].mimeType,
            filename: input.files[index].filename,
            vendor_artwork_id: input.vendor_artwork_id,
            file_type: input.files[index].mimeType.split('/')[0],
            file_description: '',
          }))
        })
      )
    )

    return new WorkflowResponse({
      vendor_artwork_media,
      uploaded_files: uploadedFiles,
    })
  }
)

export default createArtworkMediasWorkflow