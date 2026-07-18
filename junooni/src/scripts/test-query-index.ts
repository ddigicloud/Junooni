// src/scripts/test-query-index.ts
// Run: npx medusa exec src/scripts/test-query-index.ts

export default async function testQueryIndex({ container }: { container: any }) {
  const query = container.resolve("query")

  const VENDOR_ID = "01KJ50176GDA5B0W7228VZNSR8" // meenalhandle vendor ID

  console.log("\n🧪 TEST 1: query.index — filter by vendor id")
  const test1Start = Date.now()
  try {
    const { data: products1 } = await query.index({
      entity: "product",
      fields: ["id", "title", "status"],
      filters: {
        vendor: { id: VENDOR_ID },
      },
    })
    console.log(`  ✓ DONE in ${Date.now() - test1Start}ms | count=${products1?.length}`)
    products1?.slice(0, 3).forEach((p: any) => console.log(`  → ${p.id} | ${p.title} | ${p.status}`))
  } catch (e: any) {
    console.log(`  ✗ ERROR in ${Date.now() - test1Start}ms:`, e.message)
  }

  console.log("\n🧪 TEST 2: query.index — filter by vendor id + status published")
  const test2Start = Date.now()
  try {
    const { data: products2 } = await query.index({
      entity: "product",
      fields: ["id", "title", "status"],
      filters: {
        status: "published",
        vendor: { id: VENDOR_ID },
      },
    })
    console.log(`  ✓ DONE in ${Date.now() - test2Start}ms | count=${products2?.length}`)
    products2?.slice(0, 3).forEach((p: any) => console.log(`  → ${p.id} | ${p.title} | ${p.status}`))
  } catch (e: any) {
    console.log(`  ✗ ERROR in ${Date.now() - test2Start}ms:`, e.message)
  }

  console.log("\n🧪 TEST 3: query.index — all products (no filter) to confirm index speed")
  const test3Start = Date.now()
  try {
    const { data: products3 } = await query.index({
      entity: "product",
      fields: ["id", "status"],
    })
    console.log(`  ✓ DONE in ${Date.now() - test3Start}ms | count=${products3?.length}`)
  } catch (e: any) {
    console.log(`  ✗ ERROR in ${Date.now() - test3Start}ms:`, e.message)
  }

  console.log("\n🧪 TEST 4: query.index — filter by vendor using different syntax")
  const test4Start = Date.now()
  try {
    const { data: products4 } = await query.index({
      entity: "product",
      fields: ["id", "title", "status"],
      filters: {
        vendors: { id: VENDOR_ID }, // plural
      },
    })
    console.log(`  ✓ DONE in ${Date.now() - test4Start}ms | count=${products4?.length}`)
  } catch (e: any) {
    console.log(`  ✗ ERROR in ${Date.now() - test4Start}ms:`, e.message)
  }

  console.log("\n✅ Done\n")
}