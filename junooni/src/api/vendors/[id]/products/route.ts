// import {
//     AuthenticatedMedusaRequest,
//     MedusaResponse,
//      MedusaRequest,
//   } from "@medusajs/framework/http";
//   import { ContainerRegistrationKeys, ProductStatus } from "@medusajs/framework/utils";
//   import MarketplaceModuleService from "../../../../modules/marketplace/service";
//   import { MARKETPLACE_MODULE } from "../../../../modules/marketplace";
  
//   import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
//   import {
//     CreateProductWorkflowInputDTO,
//     IProductModuleService,
//     ISalesChannelModuleService,
//   } from "@medusajs/framework/types";
//   import { Modules } from "@medusajs/framework/utils";
  
//   export const GET = async (
//      req: MedusaRequest,
//     res: MedusaResponse
//   ) => {
//       const { id: vendorId } = req.params
//     const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
//     const marketplaceModuleService: MarketplaceModuleService =
//       req.scope.resolve(MARKETPLACE_MODULE);
  
//     /*const vendorAdmin = await marketplaceModuleService.retrieveVendorAdmin(
//       vendorId,
//       {
//         relations: ["vendor"],
//       }
//     )*/
  
//     const {
//       data: [vendor],
//     } = await query.graph({
//       entity: "vendor",
//       fields: ["products.*", "products.variants.*","products.options.*","products.variants.options.*","products.variants.prices.*", "products.tags.*"],
//       filters: {
//         id: vendorId,
//       },
//     })
  
//     res.json({
//       products: vendor.products,
//     })
//   }
  

// src/api/vendors/[id]/products/route.ts
// src/api/vendors/[id]/products/route.ts
import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { id: vendorId } = req.params
  const query = req.scope.resolve("query")
  const total = Date.now()

  console.log(`[vendors/${vendorId}/products] ROUTE HIT`)

  // ── Cache check ────────────────────────────────────────────────────────
  let cache: any = null
  try { cache = req.scope.resolve("cache") } catch {}
  const cacheKey = `vendor-products-published-${vendorId}`

  if (cache) {
    try {
      const cached = await cache.get(cacheKey)
      if (cached) {
        console.log(`[vendors/${vendorId}/products] CACHE HIT in ${Date.now() - total}ms`)
        return res.json(cached)
      }
      console.log(`[vendors/${vendorId}/products] cache MISS`)
    } catch {}
  }

  // ── Fetch only indexed fields ──────────────────────────────────────────
  const indexStart = Date.now()
  const { data: rawProducts } = await query.index({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "thumbnail",
      "status",
      "created_at",
      "metadata", 
      "variants.id",
      "variants.thumbnail",        // ← full blob, we slim it below
      "vendor.id",
      "vendor.name",
      "vendor.handle",
      "vendor.verified",
    ],
    filters: {
      status: "published",
      vendor: { id: vendorId },
    },
  })
  console.log(`[vendors/${vendorId}/products] query.index DONE in ${Date.now() - indexStart}ms | products=${rawProducts?.length}`)

  // ── Slim metadata — only keep what listing page needs ─────────────────
  const products = (rawProducts ?? []).map((p: any) => ({
    ...p,
    metadata: p.metadata ? {
      color_hex_values: p.metadata.color_hex_values ?? null,
    } : null,
  }))

  const response = { products }

  // ── Cache for 5 minutes ────────────────────────────────────────────────
  if (cache) {
    try {
      await cache.set(cacheKey, response, 60 * 5)
      console.log(`[vendors/${vendorId}/products] CACHED for 5 mins`)
    } catch {}
  }

  console.log(`[vendors/${vendorId}/products] TOTAL ${Date.now() - total}ms`)
  res.json(response)
}