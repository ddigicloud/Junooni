import { z } from "zod"

export const PostStoreCreateFollowList = z.object({
  vendor_id: z.string(),
})