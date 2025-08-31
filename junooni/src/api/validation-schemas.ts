import { z } from "zod"
import { 
  AdminCreateProduct,
} from "@medusajs/medusa/api/admin/products/validators"

export const createVendorArtworkSchema = z.object({
  name: z.string(),
  description: z.string(),
  medias: z.array(z.object({
    file_id: z.string(),
    mime_type: z.string(),
    filename: z.string(),
    file_type: z.string(),
    file_description: z.string(),
  }))

})

  