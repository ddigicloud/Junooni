// src/scripts/find-product-culprit.ts
// Run: npx medusa exec src/scripts/find-product-culprit.ts
//
// This script replays exactly what the admin products list does,
// step by step, measuring heap after each join/expand until it
// finds the one that blows up memory or crashes.

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function findProductCulprit({ container }: ExecArgs) {
  const pgClient = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)
  const query    = container.resolve(ContainerRegistrationKeys.QUERY)

  // ─── helpers ──────────────────────────────────────────────────────────────
  const MB = (b: number) => (b / 1024 / 1024).toFixed(1) + "MB"
  const KB = (b: number) => (b / 1024).toFixed(1) + "KB"
  const mem = () => process.memoryUsage()
  const heapMB = () => Math.round(mem().heapUsed / 1024 / 1024)
  const rssMB  = () => Math.round(mem().rss / 1024 / 1024)

  const SEPARATOR = "─".repeat(60)

  function printDelta(label: string, before: NodeJS.MemoryUsage, after: NodeJS.MemoryUsage, ms: number, payloadBytes = 0) {
    const deltaHeap = after.heapUsed - before.heapUsed
    const deltaRss  = after.rss - before.rss
    const sign = (n: number) => n >= 0 ? "+" : ""
    const flag = after.heapUsed > 500 * 1024 * 1024 ? " 🔴 DANGER" :
                 after.heapUsed > 300 * 1024 * 1024 ? " 🟡 HIGH"   : " ✅"
    console.log(`${flag} [${label}]`)
    console.log(`   time     : ${ms}ms`)
    console.log(`   heap     : ${MB(before.heapUsed)} → ${MB(after.heapUsed)} (${sign(deltaHeap)}${MB(deltaHeap)})`)
    console.log(`   rss      : ${MB(before.rss)} → ${MB(after.rss)} (${sign(deltaRss)}${MB(deltaRss)})`)
    if (payloadBytes) console.log(`   payload  : ${KB(payloadBytes)} KB serialized`)
  }

  async function step<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
    console.log(`\n${SEPARATOR}`)
    console.log(`▶  ${label}`)
    console.log(`   heap before: ${heapMB()}MB | rss: ${rssMB()}MB`)
    const b = mem()
    const t = Date.now()
    let result: T | null = null
    try {
      result = await fn()
      const a = mem()
      const payload = JSON.stringify(result).length
      printDelta(label, b, a, Date.now() - t, payload)
    } catch (e: any) {
      const a = mem()
      console.log(`   💥 CRASHED: ${e.message}`)
      console.log(`   stack: ${e.stack?.split("\n").slice(0, 5).join("\n           ")}`)
      console.log(`   heap at crash: ${MB(a.heapUsed)} | rss: ${MB(a.rss)}`)
    }
    return result
  }

  // ─── START ────────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(60))
  console.log("  JUNOONI PRODUCT CULPRIT FINDER")
  console.log("  Replaying admin /products route step by step")
  console.log("═".repeat(60))
  console.log(`Baseline — heap: ${heapMB()}MB | rss: ${rssMB()}MB`)

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 1: Raw DB counts — no memory cost, just facts
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n\n━━━ PHASE 1: RAW COUNTS (facts, no memory cost) ━━━")

  const counts = await pgClient.raw(`
    SELECT
      (SELECT COUNT(*) FROM product)                  AS products,
      (SELECT COUNT(*) FROM product WHERE status='published') AS published,
      (SELECT COUNT(*) FROM product WHERE status='draft')     AS draft,
      (SELECT COUNT(*) FROM product_variant)          AS variants,
      (SELECT COUNT(*) FROM product_option)           AS options,
      (SELECT COUNT(*) FROM product_option_value)     AS option_values,
      (SELECT COUNT(*) FROM product_image)            AS images,
      (SELECT COUNT(*) FROM price)                    AS prices,
      (SELECT COUNT(*) FROM inventory_item)           AS inventory_items,
      (SELECT COUNT(*) FROM inventory_level)          AS inventory_levels,
      (SELECT COUNT(*) FROM product_sales_channel)    AS product_sc_links
  `)
  const c = counts.rows[0]
  console.log(`
  products        : ${c.products} (published: ${c.published}, draft: ${c.draft})
  variants        : ${c.variants}
  options         : ${c.options}
  option_values   : ${c.option_values}
  images          : ${c.images}
  prices          : ${c.prices}
  inventory_items : ${c.inventory_items}
  inventory_levels: ${c.inventory_levels}
  product_sc_links: ${c.product_sc_links}
  avg variants/product: ${(parseInt(c.variants) / parseInt(c.products)).toFixed(1)}
  `)

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 2: Per-product variant counts — find the monster products
  // ──────────────────────────────────────────────────────────────────────────
  console.log("━━━ PHASE 2: VARIANT DISTRIBUTION (which products are huge) ━━━")

  const variantDist = await pgClient.raw(`
    SELECT
      p.id,
      p.title,
      p.status,
      COUNT(pv.id) as variant_count,
      COUNT(pi.id) as image_count,
      COUNT(po.id) as option_count,
      pg_size_pretty(
        length(p.description::text)
        + length(p.metadata::text)
      ) as text_size
    FROM product p
    LEFT JOIN product_variant pv ON pv.product_id = p.id
    LEFT JOIN product_image   pi ON pi.product_id = p.id
    LEFT JOIN product_option  po ON po.product_id = p.id
    GROUP BY p.id, p.title, p.status
    ORDER BY variant_count DESC
    LIMIT 20
  `)
  console.log("\n  Top 20 products by variant count:")
  console.log("  variants | images | options | status   | title")
  console.log("  " + "─".repeat(70))
  variantDist.rows.forEach((r: any) => {
    const flag = parseInt(r.variant_count) > 100 ? " ← 🔴 HUGE" :
                 parseInt(r.variant_count) > 50  ? " ← 🟡 LARGE" : ""
    console.log(`  ${String(r.variant_count).padStart(8)} | ${String(r.image_count).padStart(6)} | ${String(r.option_count).padStart(7)} | ${String(r.status).padEnd(8)} | ${r.title.substring(0,50)}${flag}`)
  })

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 3: Exact payload size per product (what Medusa serializes)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n\n━━━ PHASE 3: PAYLOAD SIZE PER PRODUCT (admin query simulation) ━━━")

  const payloadSizes = await pgClient.raw(`
    SELECT
      p.id,
      p.title,
      COUNT(DISTINCT pv.id)  as variants,
      COUNT(DISTINCT pi.id)  as images,
      COUNT(DISTINCT pov.id) as option_values,
      COUNT(DISTINCT pr.id)  as prices,
      (
        length(p.title::text) +
        length(COALESCE(p.description,'')) +
        length(COALESCE(p.metadata::text,'{}')) +
        (SELECT SUM(length(COALESCE(pv2.metadata::text,'{}')) + length(COALESCE(pv2.title,'')))
         FROM product_variant pv2 WHERE pv2.product_id = p.id)
      ) as approx_text_bytes
    FROM product p
    LEFT JOIN product_variant      pv  ON pv.product_id = p.id
    LEFT JOIN product_image        pi  ON pi.product_id = p.id
    LEFT JOIN product_option_value pov ON pov.variant_id = pv.id
    LEFT JOIN price                pr  ON pr.variant_id = pv.id
    GROUP BY p.id, p.title
    ORDER BY (COUNT(DISTINCT pv.id) * COUNT(DISTINCT pov.id)) DESC
    LIMIT 20
  `)
  console.log("\n  variants × option_values = explosion factor | product title")
  console.log("  " + "─".repeat(80))
  payloadSizes.rows.forEach((r: any) => {
    const explosion = parseInt(r.variants) * parseInt(r.option_values)
    const flag = explosion > 5000 ? " 🔴 MEMORY BOMB" :
                 explosion > 1000 ? " 🟡 LARGE"       : ""
    console.log(`  v:${String(r.variants).padStart(4)} × ov:${String(r.option_values).padStart(5)} = ${String(explosion).padStart(7)} | ~${(parseInt(r.approx_text_bytes||0)/1024).toFixed(0)}KB text | ${r.title.substring(0,40)}${flag}`)
  })

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 4: Step-by-step Medusa query.graph simulation
  // This is what the admin list route actually calls
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n\n━━━ PHASE 4: MEDUSA query.graph STEP-BY-STEP ━━━")
  console.log("  (each step adds one more relation — find which one explodes)\n")

  // Step 4a: bare products only
  await step("4a: query.graph — id,title,status only (baseline)", async () => {
    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "title", "status", "handle"],
      pagination: { skip: 0, take: 50 },
    })
    console.log(`   returned: ${data.length} products`)
    return data
  })

  // Step 4b: add sales_channels
  await step("4b: query.graph — + sales_channels", async () => {
    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "title", "status", "sales_channels.id", "sales_channels.name"],
      pagination: { skip: 0, take: 50 },
    })
    console.log(`   returned: ${data.length} products`)
    return data
  })

  // Step 4c: add variants (IDs only)
  await step("4c: query.graph — + variants (id only)", async () => {
    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "title", "status", "sales_channels.id", "variants.id"],
      pagination: { skip: 0, take: 50 },
    })
    const totalVariants = (data as any[]).reduce((s, p) => s + (p.variants?.length || 0), 0)
    console.log(`   returned: ${data.length} products, ${totalVariants} variant refs`)
    return data
  })

  // Step 4d: add variants full expand
  await step("4d: query.graph — + variants FULL (*variants)", async () => {
    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "title", "status", "sales_channels.id", "*variants"],
      pagination: { skip: 0, take: 50 },
    })
    const totalVariants = (data as any[]).reduce((s, p) => s + (p.variants?.length || 0), 0)
    console.log(`   returned: ${data.length} products, ${totalVariants} full variants`)
    return data
  })

  // Step 4e: add prices on variants
  await step("4e: query.graph — + variants.prices", async () => {
    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "title", "status", "*variants", "variants.prices.*"],
      pagination: { skip: 0, take: 50 },
    })
    const totalPrices = (data as any[]).reduce((s, p) =>
      s + (p.variants || []).reduce((sv: number, v: any) => sv + (v.prices?.length || 0), 0), 0)
    console.log(`   returned: ${data.length} products, ${totalPrices} prices`)
    return data
  })

  // Step 4f: add inventory
  await step("4f: query.graph — + inventory_items", async () => {
    const { data } = await query.graph({
      entity: "product",
      fields: [
        "id", "title", "status", "*variants", "variants.prices.*",
        "variants.inventory_items.inventory.location_levels.*"
      ],
      pagination: { skip: 0, take: 50 },
    })
    console.log(`   returned: ${data.length} products`)
    return data
  })

  // Step 4g: the full wildcard — EXACTLY what admin uses
  await step("4g: query.graph — FULL WILDCARD (what admin actually sends)", async () => {
    const { data } = await query.graph({
      entity: "product",
      fields: [
        "id", "title", "handle", "status", "thumbnail",
        "collection.title",
        "*sales_channels",
        "*variants",
        "variants.prices.*",
        "variants.options.*",
      ],
      pagination: { skip: 0, take: 50 },
    })
    const totalVariants = (data as any[]).reduce((s, p) => s + (p.variants?.length || 0), 0)
    console.log(`   returned: ${data.length} products, ${totalVariants} variants`)
    return data
  })

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 5: Stress test — ALL products, no limit (what admin page 2 does)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n\n━━━ PHASE 5: NO PAGINATION STRESS (limit=200) ━━━")

  await step("5a: ALL products, minimal fields, limit=200", async () => {
    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "title", "status"],
      pagination: { skip: 0, take: 200 },
    })
    console.log(`   returned: ${data.length}`)
    return data
  })

  await step("5b: ALL products, full wildcard, limit=200 (THE REAL ADMIN QUERY)", async () => {
    const { data } = await query.graph({
      entity: "product",
      fields: [
        "id", "title", "handle", "status", "thumbnail",
        "collection.title", "*sales_channels", "*variants",
        "variants.prices.*", "variants.options.*",
      ],
      pagination: { skip: 0, take: 200 },
    })
    const totalVariants = (data as any[]).reduce((s, p) => s + (p.variants?.length || 0), 0)
    const payload = JSON.stringify(data).length
    console.log(`   returned: ${data.length} products, ${totalVariants} variants`)
    console.log(`   payload : ${(payload / 1024 / 1024).toFixed(2)}MB serialized`)
    return data
  })

  // ──────────────────────────────────────────────────────────────────────────
  // PHASE 6: Metadata inspection — bloated metadata kills memory silently
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n\n━━━ PHASE 6: METADATA BLOAT INSPECTION ━━━")

  const metaBloat = await pgClient.raw(`
    SELECT
      'product' as source,
      id,
      title,
      length(metadata::text) as metadata_bytes,
      LEFT(metadata::text, 500) as metadata_preview
    FROM product
    WHERE metadata IS NOT NULL AND metadata != '{}'::jsonb
    ORDER BY length(metadata::text) DESC
    LIMIT 5

    UNION ALL

    SELECT
      'variant' as source,
      pv.id,
      pv.title,
      length(pv.metadata::text) as metadata_bytes,
      LEFT(pv.metadata::text, 500) as metadata_preview
    FROM product_variant pv
    WHERE pv.metadata IS NOT NULL AND pv.metadata != '{}'::jsonb
    ORDER BY length(pv.metadata::text) DESC
    LIMIT 5
  `)
  console.log("\n  Largest metadata blobs:")
  metaBloat.rows.forEach((r: any) => {
    console.log(`\n  [${r.source}] "${r.title}" — ${r.metadata_bytes} bytes`)
    console.log(`  preview: ${r.metadata_preview}`)
  })

  // ──────────────────────────────────────────────────────────────────────────
  // FINAL SUMMARY
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n\n" + "═".repeat(60))
  console.log("  CULPRIT SUMMARY")
  console.log("═".repeat(60))
  console.log(`
  Match results against this checklist:

  🔴 If Phase 4d (full *variants) caused big heap spike
     → FIX: change admin fields to variants.id only for list view

  🔴 If Phase 4e (variants.prices) caused spike
     → FIX: remove price expansion from list view query

  🔴 If Phase 4f (inventory) caused spike
     → FIX: never load inventory on list view, only detail view

  🔴 If Phase 5b heap > 500MB or crashed
     → FIX: admin list query limit is too high OR no pagination

  🔴 If Phase 6 shows metadata > 10KB per product/variant
     → FIX: metadata blob is being loaded unnecessarily on every query

  🟡 If PHASE 2 shows products with > 100 variants
     → These alone cause cartesian explosion with option_values

  Post the full output and I'll give exact file + line to fix.
  `)
  console.log("Final heap:", heapMB() + "MB | rss:", rssMB() + "MB")
  console.log("✅ Done.")
}