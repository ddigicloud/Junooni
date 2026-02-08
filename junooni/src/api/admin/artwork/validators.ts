import { z } from "zod"

// For POST (create) - artwork
export const PostAdminCreateArtworkType = z.object({
  name: z.string(),
  description: z.string(),
  medias: z.array(z.object({
    file_id: z.string(),
    mime_type: z.string(),
    filename: z.string(),
    file_type: z.string(),
    file_description: z.string(),
  })).optional(),
})

// For PUT (update) - artwork
export const PutAdminUpdateArtworkType = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
})

// For POST/PUT artwork media
export const ArtworkMediaType = z.object({
  fileId: z.string().optional(),
  mimeType: z.string().optional(),
  filename: z.string().optional(),
  file_type: z.string().optional(),
  file_description: z.string().optional(),
})