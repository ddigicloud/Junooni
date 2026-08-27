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
import { Modules } from "@medusajs/framework/utils"

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
    delete?: { id: string }[]
  }

  if (!req.auth_context || req.auth_context.actor_type !== "vendor") {
    return res.status(401).json({ message: "Authentication required" })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [vendorAdmin] } = await query.graph({
    entity: "vendor_admin",
    fields: ["vendor.products.id"],
    filters: { id: [req.auth_context.actor_id] },
  })

  const ownedProductIds = vendorAdmin?.vendor?.products?.map((p) => p?.id) || []
  if (!ownedProductIds.includes(productId)) {
    return res.status(403).json({ message: "Not authorized to modify this product" })
  }

  // Fetch existing variants with their option values
  const { data: existingVariants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "options.id", "options.value", "options.option_id"],
    filters: { product_id: productId },
  })

  console.log("Existing variants from DB:", existingVariants.map(v => ({
    id: v.id,
    options: v.options
  })))

  // Normalize option value to plain string
  const toStr = (val: any): string => {
    if (typeof val === 'string') return val.toLowerCase().trim()
    if (val && typeof val === 'object') {
      return String(val.value ?? val.label ?? val.name ?? '').toLowerCase().trim()
    }
    return String(val ?? '').toLowerCase().trim()
  }

  // Build map: sorted values key → existing variant
  const existingVariantMap = new Map<string, any>()
  for (const ev of existingVariants || []) {
    const key = (ev.options || [])
      .map((o: any) => toStr(o.value))
      .sort()
      .join('|')
    if (key) existingVariantMap.set(key, ev)
  }

  console.log("Existing variant map:", Object.fromEntries(
    Array.from(existingVariantMap.entries()).map(([k, v]) => [k, v.id])
  ))

  // Get product module service to update option values directly
  const productModuleService = req.scope.resolve(Modules.PRODUCT)

  const normalizeOptions = (options: any[]) =>
    (options || []).map((o: any) => ({
      option_id: String(o.option_id ?? ''),
      value: toStr(o.value)
    }))

  const finalCreate: any[] = []
  const finalUpdate: any[] = []

  // Handle "create" operations — check if variant exists with ANY option values
  // If existing variant found (even with different values) → update option values then update variant
  for (const v of create) {
    const normalizedOpts = normalizeOptions(v.options || [])
    const incomingKey = normalizedOpts.map((o: any) => o.value).sort().join('|')

    // First check: exact match
    let existingVariant = existingVariantMap.get(incomingKey)

    // Second check: if only 1 existing variant and 1 incoming variant,
    // treat it as an update to that variant (option values changed)
    if (!existingVariant && existingVariants.length === 1 && create.length === 1) {
      existingVariant = existingVariants[0]
      console.log(`🔄 Single variant — treating as option value update: ${existingVariant.id}`)
    }

    if (existingVariant) {
      // Update the option values on the existing variant directly
      try {
        for (const newOpt of normalizedOpts) {
          const existingOptVal = (existingVariant.options || []).find(
            (o: any) => o.option_id === newOpt.option_id
          )
          if (existingOptVal && toStr(existingOptVal.value) !== newOpt.value) {
            console.log(`✏️ Updating option value ${existingOptVal.id}: "${existingOptVal.value}" → "${newOpt.value}"`)
            await productModuleService.updateProductOptionValues(
              existingOptVal.id,
              { value: newOpt.value }
            )
          }
        }
      } catch (err) {
        console.error("Failed to update option values:", err)
      }

      // Now update the variant itself (without options)
      const { options, ...rest } = v
      finalUpdate.push({ ...rest, id: existingVariant.id, product_id: productId })
    } else {
      // Genuinely new combination
      finalCreate.push({
        ...v,
        product_id: productId,
        options: normalizedOpts
      })
    }
  }

  // Handle original updates — strip options
  for (const v of update) {
    const { options, ...rest } = v
    finalUpdate.push({ ...rest, product_id: productId })
  }

  // Only delete variants NOT being updated
  const updatedIds = new Set(finalUpdate.map((v) => v.id))
  const finalDelete = (deleteIds || [])
    .map((item: any) => typeof item === 'string' ? { id: item } : item)
    .filter((item: any) => !updatedIds.has(item.id))

  console.log("📦 Final batch:", {
    create: finalCreate.length,
    update: finalUpdate.length,
    delete: finalDelete.length,
    updatedIds: Array.from(updatedIds),
    deletedIds: finalDelete.map((d: any) => d.id),
  })

  const { result } = await batchProductVariantsWorkflow(req.scope).run({
    input: {
      create: finalCreate.length > 0 ? finalCreate : undefined,
      update: finalUpdate.length > 0 ? finalUpdate : undefined,
      delete: finalDelete.length > 0 ? finalDelete : undefined,
    },
  })

  // After deleting variants, remove orphaned option values
  // (values that no longer appear in any remaining variant)
  if (finalDelete.length > 0) {
    try {
      const productModuleService = req.scope.resolve(Modules.PRODUCT)

      // Get the product with its current options and remaining variants
      const [product] = await productModuleService.listProducts(
        { id: [productId] },
        { relations: ["options", "options.values", "variants", "variants.options"] }
      )

      if (product) {
        // Collect all option values still used by remaining variants
        const usedOptionValueIds = new Set<string>()
        for (const variant of product.variants || []) {
          for (const optVal of variant.options || []) {
            if (optVal.id) usedOptionValueIds.add(optVal.id)
          }
        }

        // Find option values that are now orphaned
        const orphanedValueIds: string[] = []
        for (const option of product.options || []) {
          for (const val of option.values || []) {
            if (!usedOptionValueIds.has(val.id)) {
              orphanedValueIds.push(val.id)
              console.log(`🗑️ Orphaned option value: ${val.value} (${val.id})`)
            }
          }
        }

        // Delete orphaned option values
        if (orphanedValueIds.length > 0) {
          await productModuleService.deleteProductOptionValues(orphanedValueIds)
          console.log(`✅ Deleted ${orphanedValueIds.length} orphaned option values`)
        }
      }
    } catch (err) {
      console.error('⚠️ Failed to clean up orphaned option values (non-fatal):', err)
    }
  }

  res.json(result)
}