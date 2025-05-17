import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { z } from "zod"

export const CheckHandleSchema = z.object({
  handle: z.string(),
})

type CheckHandleBody = z.infer<typeof CheckHandleSchema>

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { handle } = CheckHandleSchema.parse(req.body) as CheckHandleBody
  if (!handle) {
    return res.status(400).json({ error: "Handle is required" })
  }

  // Use the Query interface to check for existing vendor with the handle
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: vendors } = await query.graph({
    entity: "vendor",
    fields: ["id"],
    filters: { handle },
  })

  const isUnique = vendors.length === 0
  res.json({ isUnique })
}