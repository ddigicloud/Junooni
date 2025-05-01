import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"

export const SearchSchema = z.object({
  query: z.string(),
})

type SearchRequest = z.infer<typeof SearchSchema>

export async function POST(
  req: MedusaRequest<SearchRequest>,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  
  const { query: searchTerm } = req.validatedBody
  
  const { data: products } = await query.graph({
    entity: "product",
    q: searchTerm,
    fields: ["id", "title", "description", "handle"], // Add relevant fields
    ...req.queryConfig,
  })
  
  res.json({
    hits: products,
    nbHits: products.length,
    query: searchTerm,
  })
}