// src/scripts/diagnose-memory-v3.ts
// Run: npx medusa exec src/scripts/diagnose-memory-v3.ts

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function diagnoseMemoryV3({ container }: ExecArgs) {
  const pgClient = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const MB = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + " MB"
  const heap = () => process.memoryUsage()

  function printHeap(label: string, before: NodeJS.MemoryUsage, after: NodeJS.MemoryUsage, durationMs: number) {
    const delta = after.heapUsed - before.heapUsed
    const sign = delta >= 0 ? "+" : ""
    console.log(`✅ [${label}]`)
    console.log(`   duration : ${durationMs}ms`)
    console.log(`   heapUsed : ${MB(before.heapUsed)} → ${MB(after.heapUsed)} (${sign}${MB(delta)})`)
    console.log(`   rss      : ${MB(before.rss)} → ${MB(after.rss)}`)
  }

  async function test(label: string, fn: () => Promise<any>) {
    console.log(`\n🔵 ${label}`)
    const b = heap()
    const t = Date.now()
    let result: any
    try {
      result = await fn()
    } catch (e: any) {
      console.log(`   ❌ FAILED: ${e.message}`)
      return null
    }
    const a = heap()
    printHeap(label, b, a, Date.now() - t)
    return result
  }

  console.log("\n========================================")
  console.log("  JUNOONI Memory Diagnostics v3")
  console.log("========================================")
  console.log(`📊 Baseline heap: ${MB(heap().heapUsed)}\n`)

  // ─────────────────────────────────────────
  // BLOCK A: Table inventory
  // ─────────────────────────────────────────
  console.log("━━━ BLOCK A: DB inventory ━━━━━━━━━━━━━━")

  await test("All table sizes", async () => {
    const r = await pgClient.raw(`
      SELECT
        tablename,
        pg_size_pretty(pg_total_relation_size(quote_ident(tablename))) AS size,
        (SELECT COUNT(*) FROM information_schema.columns
         WHERE table_name = t.tablename AND table_schema = 'public') AS col_count
      FROM pg_tables t
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(quote_ident(tablename)) DESC
      LIMIT 20
    `)
    console.log("   Top 20 tables by size:")
    r.rows.forEach((row: any) =>
      console.log(`   ${row.size.padStart(10)}  cols:${row.col_count}  ${row.tablename}`)
    )
    return r
  })

  // ─────────────────────────────────────────
  // BLOCK B: Products — the main suspect
  // ─────────────────────────────────────────
  console.log("\n━━━ BLOCK B: Products ━━━━━━━━━━━━━━━━━━")

  const products = await test("SELECT * FROM product", async () => {
    const r = await pgClient.raw(`SELECT * FROM product`)
    const singleSize = JSON.stringify(r.rows[0] || {}).length
    const totalSize = JSON.stringify(r.rows).length
    console.log(`   count       : ${r.rows.length}`)
    console.log(`   single row  : ${singleSize} chars`)
    console.log(`   all rows    : ${(totalSize / 1024).toFixed(1)} KB`)
    console.log(`   metadata sample: ${JSON.stringify(r.rows[0]?.metadata || {}).substring(0, 200)}`)
    return r.rows
  })

  await test("SELECT * FROM product_variant", async () => {
    const r = await pgClient.raw(`SELECT * FROM product_variant`)
    const singleSize = JSON.stringify(r.rows[0] || {}).length
    const totalSize = JSON.stringify(r.rows).length
    console.log(`   count       : ${r.rows.length}`)
    console.log(`   single row  : ${singleSize} chars`)
    console.log(`   all rows    : ${(totalSize / 1024).toFixed(1)} KB`)
    return r.rows
  })

  await test("product_option + product_option_value", async () => {
    const opts = await pgClient.raw(`SELECT COUNT(*) as c FROM product_option`)
    const vals = await pgClient.raw(`SELECT COUNT(*) as c FROM product_option_value`)
    console.log(`   options       : ${opts.rows[0].c}`)
    console.log(`   option_values : ${vals.rows[0].c}`)
    return { opts, vals }
  })

  await test("product_image count + avg images per product", async () => {
    const r = await pgClient.raw(`
      SELECT COUNT(*) as total_images,
             COUNT(DISTINCT product_id) as products_with_images,
             ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT product_id), 0), 1) as avg_per_product
      FROM product_image
    `)
    console.log(`   total images       : ${r.rows[0].total_images}`)
    console.log(`   products w/ images : ${r.rows[0].products_with_images}`)
    console.log(`   avg per product    : ${r.rows[0].avg_per_product}`)
    return r
  })

  // ─────────────────────────────────────────
  // BLOCK C: The /store/products API simulation
  // What Medusa actually does when storefront hits /store/products
  // ─────────────────────────────────────────
  console.log("\n━━━ BLOCK C: /store/products simulation ━━")

  await test("/store/products minimal fields (what it SHOULD do)", async () => {
    const r = await pgClient.raw(`
      SELECT p.id, p.title, p.handle, p.status, p.thumbnail, p.metadata
      FROM product p
      WHERE p.status = 'published'
      LIMIT 100
    `)
    const size = JSON.stringify(r.rows).length
    console.log(`   rows : ${r.rows.length}`)
    console.log(`   size : ${(size / 1024).toFixed(1)} KB`)
    return r
  })

  await test("/store/products with variants JOIN (what it ACTUALLY does)", async () => {
    const r = await pgClient.raw(`
      SELECT
        p.id, p.title, p.handle, p.status, p.thumbnail, p.metadata,
        p.description, p.subtitle, p.collection_id, p.type_id,
        pv.id as variant_id, pv.title as variant_title,
        pv.sku, pv.inventory_quantity, pv.metadata as variant_metadata,
        pv.calculated_price
      FROM product p
      LEFT JOIN product_variant pv ON pv.product_id = p.id
      WHERE p.status = 'published'
    `)
    const size = JSON.stringify(r.rows).length
    console.log(`   total rows (product × variants) : ${r.rows.length}`)
    console.log(`   total payload size              : ${(size / 1024).toFixed(1)} KB`)
    console.log(`   single row size                 : ${JSON.stringify(r.rows[0] || {}).length} chars`)
    return r
  })

  await test("/store/products with ALL joins (worst case)", async () => {
    const r = await pgClient.raw(`
      SELECT
        p.*,
        pv.id as variant_id, pv.title as v_title, pv.sku, pv.metadata as v_meta,
        pi.url as image_url,
        po.title as option_title,
        pov.value as option_value
      FROM product p
      LEFT JOIN product_variant pv ON pv.product_id = p.id
      LEFT JOIN product_image pi ON pi.product_id = p.id
      LEFT JOIN product_option po ON po.product_id = p.id
      LEFT JOIN product_option_value pov ON pov.variant_id = pv.id
      WHERE p.status = 'published'
    `)
    const size = JSON.stringify(r.rows).length
    console.log(`   total rows (exploded) : ${r.rows.length}`)
    console.log(`   total payload size    : ${(size / 1024).toFixed(1)} KB`)
    console.log(`   ⚠️  this is what a wildcard fields= query pulls`)
    return r
  })

  // ─────────────────────────────────────────
  // BLOCK D: Collections — 11 second suspect
  // ─────────────────────────────────────────
  console.log("\n━━━ BLOCK D: Collections (11s suspect) ━━━")

  await test("SELECT * FROM product_collection", async () => {
    const r = await pgClient.raw(`SELECT * FROM product_collection`)
    const size = JSON.stringify(r.rows).length
    console.log(`   count : ${r.rows.length}`)
    console.log(`   size  : ${(size / 1024).toFixed(1)} KB`)
    console.log(`   metadata sample: ${JSON.stringify(r.rows[0]?.metadata || {}).substring(0, 300)}`)
    return r
  })

  await test("Collections + products JOIN", async () => {
    const r = await pgClient.raw(`
      SELECT c.id, c.handle, c.title, c.metadata,
             COUNT(p.id) as product_count
      FROM product_collection c
      LEFT JOIN product p ON p.collection_id = c.id
      GROUP BY c.id
    `)
    console.log(`   collections     : ${r.rows.length}`)
    r.rows.forEach((row: any) =>
      console.log(`   "${row.title}" → ${row.product_count} products | metadata: ${JSON.stringify(row.metadata || {}).substring(0, 100)}`)
    )
    return r
  })

  // ─────────────────────────────────────────
  // BLOCK E: Index engine
  // ─────────────────────────────────────────
  console.log("\n━━━ BLOCK E: Medusa index engine ━━━━━━━━")

  await test("index_data table", async () => {
    const r = await pgClient.raw(`
      SELECT
        COUNT(*) as total_rows,
        pg_size_pretty(pg_total_relation_size('index_data')) as table_size,
        COUNT(DISTINCT entity_id) as unique_entities
      FROM index_data
    `)
    console.log(`   rows     : ${r.rows[0].total_rows}`)
    console.log(`   size     : ${r.rows[0].table_size}`)
    console.log(`   entities : ${r.rows[0].unique_entities}`)
    return r
  })

  // ─────────────────────────────────────────
  // BLOCK F: Concurrent stress test
  // ─────────────────────────────────────────
  console.log("\n━━━ BLOCK F: Concurrent stress ━━━━━━━━━━")

  await test("5x concurrent product+variant fetch", async () => {
    const results = await Promise.all(
      Array(5).fill(null).map(() =>
        pgClient.raw(`
          SELECT p.id, p.title, p.metadata,
                 pv.id as vid, pv.title as vtitle, pv.metadata as vmeta
          FROM product p
          LEFT JOIN product_variant pv ON pv.product_id = p.id
          WHERE p.status = 'published'
        `)
      )
    )
    console.log(`   all 5 resolved | rows each: ${results[0].rows.length}`)
    return results
  })

  await test("5x concurrent collections fetch", async () => {
    const results = await Promise.all(
      Array(5).fill(null).map(() =>
        pgClient.raw(`SELECT * FROM product_collection`)
      )
    )
    console.log(`   all 5 resolved | collections each: ${results[0].rows.length}`)
    return results
  })

  // ─────────────────────────────────────────
  // BLOCK G: Slow query log
  // ─────────────────────────────────────────
  console.log("\n━━━ BLOCK G: Slowest queries (pg_stat_statements) ━━━")

  await test("Top 10 slowest queries", async () => {
    const r = await pgClient.raw(`
      SELECT
        round(mean_exec_time::numeric, 1) as avg_ms,
        round(max_exec_time::numeric, 1)  as max_ms,
        calls,
        left(query, 150) as query_preview
      FROM pg_stat_statements
      ORDER BY mean_exec_time DESC
      LIMIT 10
    `)
    r.rows.forEach((row: any, i: number) => {
      console.log(`\n   [${i + 1}] avg:${row.avg_ms}ms  max:${row.max_ms}ms  calls:${row.calls}`)
      console.log(`        ${row.query_preview}`)
    })
    return r
  })

  // ─────────────────────────────────────────
  // FINAL
  // ─────────────────────────────────────────
  console.log("\n========================================")
  console.log("  FINAL SUMMARY")
  console.log("========================================")
  const final = heap()
  console.log(`📊 Final heap: ${MB(final.heapUsed)}`)
  console.log(`
🎯 Key things to match against your 11s collections call:
   BLOCK B → how big is your product+variant payload
   BLOCK C → worst-case wildcard join size
   BLOCK D → collections metadata size — likely the 11s culprit
   BLOCK E → index_data size — background memory pressure
   BLOCK G → pg_stat_statements will show the exact slow query
  `)
  console.log("✅ Done. Paste full output.")
}