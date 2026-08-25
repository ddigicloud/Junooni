// import {
//     AuthenticatedMedusaRequest,
//     MedusaResponse
//   } from "@medusajs/framework/http"
//   import { batchProductVariantsWorkflow } from "@medusajs/medusa/core-flows"
//   import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
  
//   export const config = {
//     validate: false, // 👈 this disables default Zod validation
//   }
  
//   export const POST = async (
//     req: AuthenticatedMedusaRequest,
//     res: MedusaResponse
//   ) => {
//     const productId = req.params.id
  
//     const { create = [], update = [], delete: deleteIds = [] } = req.body as {
//       create?: any[]
//       update?: any[]
//       delete?: string[]
//     }
  
//     if (!req.auth_context || req.auth_context.actor_type !== "vendor") {
//       return res.status(401).json({ message: "Authentication required" })
//     }
  
//     const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  
//     const { data: [vendorAdmin] } = await query.graph({
//       entity: "vendor_admin",
//       fields: ["vendor.products.id"],
//       filters: {
//         id: [req.auth_context.actor_id],
//       },
//     })
  
//     const ownedProductIds = vendorAdmin?.vendor?.products?.map((p) => p?.id) || []
  
//     if (!ownedProductIds.includes(productId)) {
//       return res.status(403).json({ message: "Not authorized to modify this product" })
//     }
  
//     const { result } = await batchProductVariantsWorkflow(req.scope).run({
//       input: {
//         create: create.map((v) => ({ ...v, product_id: productId })),
//         update,
//         delete: deleteIds,
//       },
//     })
  
//     res.json(result)
//   }
  





import {
  AuthenticatedMedusaRequest,
  MedusaResponse
} from "@medusajs/framework/http"
import { batchProductVariantsWorkflow } from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const config = {
  validate: false,
}

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const productId = req.params.id

  const { create = [], update = [], delete: deleteIds = [] } = req.body as {
    create?: any[]
    update?: any[]
    delete?: string[] | { id: string }[]
  }

  if (!req.auth_context || req.auth_context.actor_type !== "vendor") {
    return res.status(401).json({ message: "Authentication required" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [vendorAdmin] } = await query.graph({
    entity: "vendor_admin",
    fields: ["vendor.products.id"],
    filters: {
      id: [req.auth_context.actor_id],
    },
  })

  const ownedProductIds = vendorAdmin?.vendor?.products?.map((p) => p?.id) || []

  if (!ownedProductIds.includes(productId)) {
    return res.status(403).json({ message: "Not authorized to modify this product" })
  }

  const normalizedDeletes = deleteIds.map((item: string | { id: string }) =>
    typeof item === "string" ? { id: item } : item
  )

  const { result } = await batchProductVariantsWorkflow(req.scope).run({
    input: {
      // CREATE: keep options — needed to link variant to option values
      create: create.map((v) => ({ ...v, product_id: productId })),

      // UPDATE: strip options — re-sending them triggers Medusa's
      // duplicate-option-combination check and returns 400
      update: update.map((v) => {
        const { options, ...rest } = v
        return { ...rest, product_id: productId }
      }),

      // DELETE: normalized to { id: string }[] shape
      delete: normalizedDeletes,
    },
  })

  res.json(result)
}