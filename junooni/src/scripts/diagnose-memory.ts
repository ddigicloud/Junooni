// src/scripts/diagnose-memory.ts
// Run: npx medusa exec src/scripts/diagnose-memory.ts

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function diagnoseMemory({ container }: ExecArgs) {
  const pgClient = container.resolve(ContainerRegistrationKeys.PG_CONNECTION)

  const MB = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + " MB"
  const heap = () => process.memoryUsage()

  function printHeap(label: string, before: NodeJS.MemoryUsage, after: NodeJS.MemoryUsage) {
    const delta = after.heapUsed - before.heapUsed
    const sign = delta >= 0 ? "+" : ""
    console.log(`\n✅ [${label}]`)
    console.log(`   heapUsed : ${MB(before.heapUsed)} → ${MB(after.heapUsed)} (${sign}${MB(delta)})`)
    console.log(`   rss      : ${MB(before.rss)} → ${MB(after.rss)}`)
    console.log(`   external : ${MB(before.external)} → ${MB(after.external)}`)
  }

  console.log("\n========================================")
  console.log("  JUNOONI Memory Diagnostics")
  console.log("========================================")
  console.log(`📊 Baseline heap: ${MB(heap().heapUsed)}`)

  // ─────────────────────────────────────────
  // TEST 1: Raw vendor count
  // ─────────────────────────────────────────
  console.log("\n🔵 TEST 1: Raw vendor fetch (no joins)")
  let b = heap()
  let t = Date.now()
  const vendors = await pgClient.raw(`SELECT id, handle, plan FROM vendor LIMIT 100`)
  let a = heap()
  console.log(`   Duration : ${Date.now() - t}ms`)
  console.log(`   Row count: ${vendors.rows.length}`)
  printHeap("Raw vendor SELECT", b, a)

  // ─────────────────────────────────────────
  // TEST 2: attachPlanFields simulation — N+1 query pattern
  // This is what your current code likely does
  // ─────────────────────────────────────────
  console.log("\n🔵 TEST 2: N+1 pattern (current attachPlanFields behaviour)")
  b = heap()
  t = Date.now()
  const vendorIds = vendors.rows.map((v: any) => v.id)
  const planResults: any[] = []
  for (const id of vendorIds) {
    // Simulating one DB round-trip per vendor
    const r = await pgClient.raw(
      `SELECT id, plan, plan_billing_cycle, plan_activated_at FROM vendor WHERE id = ?`,
      [id]
    )
    planResults.push(r.rows[0])
  }
  a = heap()
  console.log(`   Duration    : ${Date.now() - t}ms`)
  console.log(`   Queries ran : ${vendorIds.length}`)
  printHeap("N+1 per-vendor plan fetch", b, a)

  // ─────────────────────────────────────────
  // TEST 3: Batched query — what it SHOULD be
  // ─────────────────────────────────────────
  console.log("\n🔵 TEST 3: Batched query (fixed version)")
  b = heap()
  t = Date.now()
  const batchResult = await pgClient.raw(
    `SELECT id, plan, plan_billing_cycle, plan_activated_at FROM vendor WHERE id = ANY(?)`,
    [vendorIds]
  )
  a = heap()
  console.log(`   Duration    : ${Date.now() - t}ms`)
  console.log(`   Queries ran : 1`)
  console.log(`   Rows back   : ${batchResult.rows.length}`)
  printHeap("Batched plan fetch", b, a)

  // ─────────────────────────────────────────
  // TEST 4: Full vendor object size in memory
  // ─────────────────────────────────────────
  console.log("\n🔵 TEST 4: Full vendor row size (SELECT *)")
  b = heap()
  t = Date.now()
  const fullVendors = await pgClient.raw(`SELECT * FROM vendor LIMIT 100`)
  a = heap()
  const sampleSize = JSON.stringify(fullVendors.rows[0]).length
  console.log(`   Duration         : ${Date.now() - t}ms`)
  console.log(`   Rows             : ${fullVendors.rows.length}`)
  console.log(`   Single row JSON  : ${sampleSize} chars`)
  console.log(`   Est. all rows    : ~${(sampleSize * fullVendors.rows.length / 1024).toFixed(1)} KB in memory`)
  printHeap("SELECT * vendor", b, a)

  // ─────────────────────────────────────────
  // TEST 5: Product reviews per vendor (the other suspect)
  // ─────────────────────────────────────────
  console.log("\n🔵 TEST 5: Product reviews fetch (per-vendor simulation)")
  b = heap()
  t = Date.now()

  // Get a few product IDs first
  const products = await pgClient.raw(
    `SELECT id FROM product LIMIT 10`
  )
  const productIds = products.rows.map((p: any) => p.id)
  console.log(`   Found ${productIds.length} products to test with`)

  const reviewResults: any[] = []
  for (const pid of productIds) {
    const r = await pgClient.raw(
      `SELECT id, rating, created_at FROM product_review WHERE product_id = ? ORDER BY created_at DESC LIMIT 50`,
      [pid]
    )
    reviewResults.push({ product_id: pid, reviews: r.rows })
  }
  a = heap()
  const totalReviews = reviewResults.reduce((sum, r) => sum + r.reviews.length, 0)
  console.log(`   Duration      : ${Date.now() - t}ms`)
  console.log(`   Total reviews : ${totalReviews}`)
  printHeap("Per-product review fetch", b, a)

  // ─────────────────────────────────────────
  // TEST 6: Concurrent simulation
  // ─────────────────────────────────────────
  console.log("\n🔵 TEST 6: 5x concurrent full vendor fetches (prod simulation)")
  b = heap()
  t = Date.now()
  await Promise.all(
    Array(5).fill(null).map(() =>
      pgClient.raw(`SELECT * FROM vendor`)
    )
  )
  a = heap()
  console.log(`   Duration : ${Date.now() - t}ms`)
  printHeap("5x concurrent SELECT * vendor", b, a)

  // ─────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────
  console.log("\n========================================")
  console.log("  SUMMARY")
  console.log("========================================")
  console.log(`📊 Final heap: ${MB(heap().heapUsed)}`)
  console.log(`
🎯 Key findings to look at:
   - TEST 2 vs TEST 3 duration gap = cost of N+1 in attachPlanFields
   - TEST 4 single row size = how much data per vendor object
   - TEST 5 duration = review fetch overhead per product
   - TEST 6 duration = concurrent query contention on prod DB
  `)
  console.log("✅ Done. Paste output back for analysis.")
}