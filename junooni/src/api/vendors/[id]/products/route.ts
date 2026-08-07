// // src/api/vendors/[id]/products/route.ts
// // src/api/vendors/[id]/products/route.ts
// import {
//   MedusaRequest,
//   MedusaResponse,
// } from "@medusajs/framework/http"

// export const GET = async (
//   req: MedusaRequest,
//   res: MedusaResponse
// ) => {
//   const { id: vendorId } = req.params
//   const query = req.scope.resolve("query")
//   const total = Date.now()

//   console.log(`[vendors/${vendorId}/products] ROUTE HIT`)

//   // ── Cache check ────────────────────────────────────────────────────────
//   let cache: any = null
//   try { cache = req.scope.resolve("cache") } catch {}
//   const cacheKey = `vendor-products-published-${vendorId}`

//   if (cache) {
//     try {
//       const cached = await cache.get(cacheKey)
//       if (cached) {
//         console.log(`[vendors/${vendorId}/products] CACHE HIT in ${Date.now() - total}ms`)
//         return res.json(cached)
//       }
//       console.log(`[vendors/${vendorId}/products] cache MISS`)
//     } catch {}
//   }

//   // ── Fetch only indexed fields ──────────────────────────────────────────
//   const indexStart = Date.now()
//   const { data: rawProducts } = await query.index({
//     entity: "product",
//     fields: [
//       "id",
//       "title",
//       "handle",
//       "thumbnail",
//       "status",
//       "created_at",
//       "metadata", 
//       "variants.id",
//       "variants.thumbnail",        // ← full blob, we slim it below
//       "vendor.id",
//       "vendor.name",
//       "vendor.handle",
//       "vendor.verified",
//     ],
//     filters: {
//       status: "published",
//       vendor: { id: vendorId },
//     },
//   })
//   console.log(`[vendors/${vendorId}/products] query.index DONE in ${Date.now() - indexStart}ms | products=${rawProducts?.length}`)

//   // ── Slim metadata — only keep what listing page needs ─────────────────
//   const products = (rawProducts ?? []).map((p: any) => ({
//     ...p,
//     metadata: p.metadata ? {
//       color_hex_values: p.metadata.color_hex_values ?? null,
//     } : null,
//   }))

//   const response = { products }

//   // ── Cache for 5 minutes ────────────────────────────────────────────────
//   if (cache) {
//     try {
//       await cache.set(cacheKey, response, 60 * 5)
//       console.log(`[vendors/${vendorId}/products] CACHED for 5 mins`)
//     } catch {}
//   }

//   console.log(`[vendors/${vendorId}/products] TOTAL ${Date.now() - total}ms`)
//   res.json(response)
// }









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
      "variants.thumbnail",
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

  // ── Fetch prices for all products in ONE batch query ───────────────────
  const pricesMap: Record<string, any[]> = {}

  if ((rawProducts ?? []).length > 0) {
    const productIds = rawProducts.map((p: any) => p.id)
    const priceStart = Date.now()

    try {
      const { data: variantsWithPrices } = await query.graph({
        entity: "product_variant",
        fields: ["id", "product_id", "prices.id", "prices.amount", "prices.currency_code"],
        filters: { product_id: productIds },
      })

      for (const v of variantsWithPrices ?? []) {
        if (!pricesMap[v.product_id]) pricesMap[v.product_id] = []
        pricesMap[v.product_id].push(v)
      }
      console.log(`[vendors/${vendorId}/products] prices batch DONE in ${Date.now() - priceStart}ms`)
    } catch (e) {
      console.error(`[vendors/${vendorId}/products] prices batch ERROR:`, e)
      // Non-fatal — products still returned, just without prices
    }
  }

  // ── Merge prices + slim metadata ───────────────────────────────────────
  const products = (rawProducts ?? []).map((p: any) => {
    const variantsWithPrices = pricesMap[p.id] ?? []

    const mergedVariants = (p.variants ?? []).map((v: any) => {
      const priceVariant = variantsWithPrices.find((pv: any) => pv.id === v.id)
      return {
        ...v,
        prices: priceVariant?.prices ?? [],
      }
    })

    return {
      ...p,
      variants: mergedVariants,
      metadata: p.metadata ? {
        color_hex_values: p.metadata.color_hex_values ?? null,
      } : null,
    }
  })

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